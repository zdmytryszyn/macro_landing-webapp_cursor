import { prisma } from "@/lib/prisma";
import {
  isFatSecretConfigured,
  searchFoodsFatSecret,
} from "@/lib/fatsecret";

export const dynamic = "force-dynamic";

const seedFoods = [
  {
    name: "Chicken Breast",
    brand: "Generic",
    servingSize: "100g",
    calories: 165,
    protein: 31,
    carbs: 0,
    fats: 3.6,
  },
  {
    name: "Brown Rice",
    brand: "Generic",
    servingSize: "1 cup cooked",
    calories: 216,
    protein: 5,
    carbs: 45,
    fats: 1.8,
  },
  {
    name: "Greek Yogurt",
    brand: "Fage",
    servingSize: "170g",
    calories: 100,
    protein: 17,
    carbs: 6,
    fats: 0.7,
  },
  {
    name: "Avocado",
    brand: "Generic",
    servingSize: "1/2 medium",
    calories: 160,
    protein: 2,
    carbs: 9,
    fats: 15,
  },
  {
    name: "Salmon Fillet",
    brand: "Generic",
    servingSize: "100g",
    calories: 208,
    protein: 20,
    carbs: 0,
    fats: 13,
  },
  {
    name: "Banana",
    brand: "Generic",
    servingSize: "1 medium",
    calories: 105,
    protein: 1.3,
    carbs: 27,
    fats: 0.4,
  },
];

async function ensureSeedFoods() {
  const count = await prisma.foodCatalogItem.count();
  if (count === 0) {
    await prisma.foodCatalogItem.createMany({ data: seedFoods });
    return;
  }
  const existing = await prisma.foodCatalogItem.findMany({
    select: { name: true },
  });
  const names = new Set(existing.map((e: { name: string }) => e.name));
  const missing = seedFoods.filter((s) => !names.has(s.name));
  if (missing.length > 0) {
    await prisma.foodCatalogItem.createMany({ data: missing });
  }
}

function isFatSecretIpBlockedError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /Invalid IP|Invalid IP address|error:\s*21|\bcode[:\s]*21\b/i.test(
    msg
  );
}

async function searchLocalCatalog(query: string, limit: number) {
  await ensureSeedFoods();
  const q = query.trim().toLowerCase();
  const cap = Number.isFinite(limit) ? Math.max(1, Math.min(limit, 25)) : 10;

  const all = await prisma.foodCatalogItem.findMany({
    orderBy: { name: "asc" },
    take: 500,
  });

  const foods = all.filter(
    (f: FoodCatalogItem) =>
      f.name.toLowerCase().includes(q) ||
      (f.brand?.toLowerCase().includes(q) ?? false)
  );

  return foods.slice(0, cap).map((food: FoodCatalogItem) => ({
    id: food.id,
    name: food.name,
    brand: food.brand ?? undefined,
    calories: food.calories,
    protein: food.protein,
    carbs: food.carbs,
    fats: food.fats,
    servingSize: food.servingSize,
    source: "local" as const,
  }));
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q")?.trim() ?? "";
  const limit = Number(url.searchParams.get("limit") ?? "10");
  const safeLimit = Number.isFinite(limit)
    ? Math.max(1, Math.min(limit, 25))
    : 10;

  if (!query || query.length < 2) return Response.json([]);

  if (isFatSecretConfigured()) {
    try {
      const hits = await searchFoodsFatSecret(query, safeLimit);
      return Response.json(
        hits.map((h) => ({
          ...h,
          source: "fatsecret" as const,
        }))
      );
    } catch (err) {
      const ipBlocked = isFatSecretIpBlockedError(err);
      console.error("[foods/search] FatSecret error:", err);
      if (ipBlocked) {
        console.warn(
          "[foods/search] FatSecret rejected this server IP (code 21). Add your IP/CIDR in FatSecret Platform → your application → IP allowlist: https://platform.fatsecret.com"
        );
      }
      const local = await searchLocalCatalog(query, safeLimit);
      const body = local.map((item: (typeof local)[number]) => ({
        ...item,
        source: "local_fallback" as const,
      }));
      return Response.json(body, {
        headers: ipBlocked
          ? { "X-Food-Search-Warning": "fatsecret-ip-blocked" }
          : {},
      });
    }
  }

  const local = await searchLocalCatalog(query, safeLimit);
  return Response.json(local);
}
