/**
 * FatSecret Platform API (OAuth 2.0 client credentials).
 * Docs: https://platform.fatsecret.com/docs/guides/authentication/oauth2
 *
 * Set FATSECRET_CLIENT_ID and FATSECRET_CLIENT_SECRET in env (server-only).
 */

const TOKEN_URL = "https://oauth.fatsecret.com/connect/token";
const FOODS_SEARCH_V1 = "https://platform.fatsecret.com/rest/foods/search/v1";
const REST_SERVER_API = "https://platform.fatsecret.com/rest/server.api";

type TokenResponse = {
  access_token: string;
  expires_in: number;
  token_type?: string;
};

let tokenCache: { token: string; expiresAtMs: number } | null = null;

export function isFatSecretConfigured(): boolean {
  return Boolean(
    process.env.FATSECRET_CLIENT_ID?.trim() &&
      process.env.FATSECRET_CLIENT_SECRET?.trim()
  );
}

async function getAccessToken(): Promise<string> {
  const clientId = process.env.FATSECRET_CLIENT_ID?.trim();
  const clientSecret = process.env.FATSECRET_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    throw new Error("FatSecret credentials are not configured");
  }

  const now = Date.now();
  if (tokenCache && tokenCache.expiresAtMs > now + 60_000) {
    return tokenCache.token;
  }

  const scope = process.env.FATSECRET_SCOPE?.trim() || "basic";
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      scope,
    }).toString(),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`FatSecret token request failed (${res.status}): ${text}`);
  }

  const data = JSON.parse(text) as TokenResponse;
  if (!data.access_token || !data.expires_in) {
    throw new Error("FatSecret token response missing access_token or expires_in");
  }

  tokenCache = {
    token: data.access_token,
    expiresAtMs: now + data.expires_in * 1000,
  };
  return data.access_token;
}

export type FatSecretFoodHit = {
  id: string;
  name: string;
  brand?: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  servingSize: string;
};

type FatSecretFoodRow = {
  food_id?: string | number;
  food_name?: string;
  brand_name?: string;
  food_description?: string;
};

type FoodsBlock = {
  food?: FatSecretFoodRow | FatSecretFoodRow[];
  max_results?: string;
  page_number?: string;
  total_results?: string;
};

/** Top-level or nested under `response` (FatSecret often wraps JSON this way). */
type FatSecretSearchJson = {
  foods?: FoodsBlock;
  response?: { foods?: FoodsBlock; error?: { code?: string; message?: string } };
  error?: { code?: string; message?: string };
};

function normalizeFoodList(
  food: FatSecretFoodRow | FatSecretFoodRow[] | undefined
): FatSecretFoodRow[] {
  if (!food) return [];
  return Array.isArray(food) ? food : [food];
}

/**
 * Parses summary lines like:
 * "Per 100g - Calories: 22kcal | Fat: 0.34g | Carbs: 3.28g | Protein: 3.09g"
 */
export function parseFatSecretFoodDescription(description: string): {
  servingSize: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
} {
  const servingMatch = description.match(/^Per\s+(.+?)\s*-\s*/i);
  const servingSize = servingMatch?.[1]?.trim() || "1 serving";

  const cal =
    description.match(/Calories:\s*([\d.]+)\s*kcal/i) ??
    description.match(/Calories:\s*([\d.]+)/i);
  const fat =
    description.match(/\|\s*Fat:\s*([\d.]+)\s*g/i) ??
    description.match(/Fat:\s*([\d.]+)\s*g/i);
  const carbs =
    description.match(/\|\s*Carbs:\s*([\d.]+)\s*g/i) ??
    description.match(/Carbs:\s*([\d.]+)\s*g/i);
  const protein =
    description.match(/\|\s*Protein:\s*([\d.]+)\s*g/i) ??
    description.match(/Protein:\s*([\d.]+)\s*g/i);

  return {
    servingSize,
    calories: cal?.[1] ? parseFloat(cal[1]) : 0,
    fats: fat?.[1] ? parseFloat(fat[1]) : 0,
    carbs: carbs?.[1] ? parseFloat(carbs[1]) : 0,
    protein: protein?.[1] ? parseFloat(protein[1]) : 0,
  };
}

function extractFoodsBlock(json: FatSecretSearchJson): FoodsBlock | undefined {
  if (json.error) {
    throw new Error(
      `FatSecret API error: ${json.error.code ?? "?"} ${json.error.message ?? ""}`
    );
  }
  if (json.response?.error) {
    const e = json.response.error;
    throw new Error(`FatSecret API error: ${e.code ?? "?"} ${e.message ?? ""}`);
  }
  return json.foods ?? json.response?.foods;
}

async function parseSearchResponse(text: string): Promise<FatSecretFoodHit[]> {
  let json: FatSecretSearchJson;
  try {
    json = JSON.parse(text) as FatSecretSearchJson;
  } catch {
    throw new Error(
      `FatSecret returned non-JSON (first 200 chars): ${text.slice(0, 200)}`
    );
  }

  const foodsBlock = extractFoodsBlock(json);
  const rows = normalizeFoodList(foodsBlock?.food);
  return rows.map((row) => {
    const desc = row.food_description ?? "";
    const parsed = parseFatSecretFoodDescription(desc);
    const brand = row.brand_name?.trim();
    const name = (row.food_name ?? "Food").trim();
    return {
      id: `fs:${row.food_id != null ? String(row.food_id) : name}`,
      name,
      brand: brand || undefined,
      calories: parsed.calories,
      protein: parsed.protein,
      carbs: parsed.carbs,
      fats: parsed.fats,
      servingSize: parsed.servingSize,
    };
  });
}

export async function searchFoodsFatSecret(
  searchExpression: string,
  maxResults: number
): Promise<FatSecretFoodHit[]> {
  const token = await getAccessToken();
  const capped = Math.min(Math.max(1, maxResults), 50);

  const url = new URL(FOODS_SEARCH_V1);
  url.searchParams.set("search_expression", searchExpression);
  url.searchParams.set("max_results", String(capped));
  url.searchParams.set("format", "json");

  const authHeaders: HeadersInit = {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  };

  let res = await fetch(url.toString(), {
    method: "GET",
    headers: authHeaders,
  });

  let text = await res.text();

  if (!res.ok || !text.trim()) {
    const body = new URLSearchParams({
      method: "foods.search",
      search_expression: searchExpression,
      max_results: String(capped),
      format: "json",
    });
    res = await fetch(REST_SERVER_API, {
      method: "POST",
      headers: {
        ...authHeaders,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });
    text = await res.text();
  }

  if (!res.ok) {
    throw new Error(`FatSecret foods.search failed (${res.status}): ${text}`);
  }

  return parseSearchResponse(text);
}
