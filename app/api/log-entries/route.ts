import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { createLogEntrySchema } from "@/lib/schemas";
import { getSessionUserId } from "@/lib/auth";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const userId = await getSessionUserId(cookieStore);
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(request.url);
  const date = url.searchParams.get("date");

  const dateStart = date ? new Date(`${date}T00:00:00`) : new Date();
  const dateEnd = new Date(dateStart);
  dateEnd.setDate(dateEnd.getDate() + 1);

  const entries = await prisma.foodLogEntry.findMany({
    where: {
      userId,
      loggedAt: { gte: dateStart, lt: dateEnd },
    },
    orderBy: { loggedAt: "asc" },
  });

  return Response.json(
    entries.map((entry) => ({
      id: entry.id,
      name: entry.name,
      brand: entry.brand ?? undefined,
      calories: entry.calories,
      protein: entry.protein,
      carbs: entry.carbs,
      fats: entry.fats,
      servingSize: entry.servingSize,
      meal: entry.mealType,
      time: entry.loggedAt.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    }))
  );
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = createLogEntrySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const userId = await getSessionUserId(cookieStore);
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const payload = parsed.data;

  const entry = await prisma.foodLogEntry.create({
    data: {
      userId,
      mealType: payload.meal,
      name: payload.name,
      brand: payload.brand,
      servingSize: payload.servingSize,
      calories: payload.calories,
      protein: payload.protein,
      carbs: payload.carbs,
      fats: payload.fats,
      sourceType: payload.sourceType ?? "manual",
    },
  });

  return Response.json({
    id: entry.id,
    name: entry.name,
    brand: entry.brand ?? undefined,
    calories: entry.calories,
    protein: entry.protein,
    carbs: entry.carbs,
    fats: entry.fats,
    servingSize: entry.servingSize,
    meal: entry.mealType,
    time: entry.loggedAt.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
  });
}
