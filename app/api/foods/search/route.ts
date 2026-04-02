import { prisma } from "@/lib/prisma";
import { foodSeeds } from "@/lib/food-seeds";
import {
  isFatSecretConfigured,
  searchFoodsFatSecret,
} from "@/lib/fatsecret";

export const dynamic = "force-dynamic";

async function ensureSeedFoods() {
  const count = await prisma.foodCatalogItem.count();
  if (count === 0) {
    await prisma.foodCatalogItem.createMany({ data: [...foodSeeds] });
    return;
  }
  const existing = await prisma.foodCatalogItem.findMany({
    select: { name: true },
  });
  const names = new Set(existing.map((e: { name: string }) => e.name));
  const missing = foodSeeds.filter((s) => !names.has(s.name));
  if (missing.length > 0) {
    await prisma.foodCatalogItem.createMany({ data: [...missing] });
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
  type CatalogRow = (typeof all)[number];

  const foods = all.filter(
    (f: CatalogRow) =>
      f.name.toLowerCase().includes(q) ||
      (f.brand?.toLowerCase().includes(q) ?? false)
  );

  return foods.slice(0, cap).map((food: CatalogRow) => ({
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
          "[foods/search] FatSecret rejected this server IP (code 21). Add Vercel/static egress or use FatSecret proxy: https://platform.fatsecret.com"
        );
      }
      const local = await searchLocalCatalog(query, safeLimit);
      const body = local.map((item: (typeof local)[number]) => ({
        ...item,
        source: "local_fallback" as const,
      }));
      const warning = ipBlocked ? "fatsecret-ip-blocked" : "fatsecret-unavailable";
      return Response.json(body, {
        headers: {
          "X-Food-Search-Warning": warning,
        },
      });
    }
  }

  const local = await searchLocalCatalog(query, safeLimit);
  return Response.json(local);
}
