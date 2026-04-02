import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";

const DEFAULT_GOALS = {
  calories: 2200,
  protein: 150,
  carbs: 250,
  fats: 70,
};

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const userId = await getSessionUserId(cookieStore);
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(request.url);
  const date = url.searchParams.get("date");

  const dateStart = date ? new Date(`${date}T00:00:00`) : new Date();
  const dateEnd = new Date(dateStart);
  dateEnd.setDate(dateEnd.getDate() + 1);

  const [goals, entries] = await Promise.all([
    prisma.userGoal.findUnique({ where: { userId } }),
    prisma.foodLogEntry.findMany({
      where: { userId, loggedAt: { gte: dateStart, lt: dateEnd } },
    }),
  ]);

  const totals = entries.reduce(
    (acc, entry) => ({
      calories: acc.calories + entry.calories,
      protein: acc.protein + entry.protein,
      carbs: acc.carbs + entry.carbs,
      fats: acc.fats + entry.fats,
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  const goalValues = goals
    ? {
        calories: goals.caloriesTarget,
        protein: goals.proteinTarget,
        carbs: goals.carbsTarget,
        fats: goals.fatsTarget,
      }
    : DEFAULT_GOALS;

  return Response.json({
    totals,
    goals: goalValues,
    progress: {
      calories: { current: totals.calories, goal: goalValues.calories, unit: "cal" },
      protein: { current: totals.protein, goal: goalValues.protein, unit: "g" },
      carbs: { current: totals.carbs, goal: goalValues.carbs, unit: "g" },
      fats: { current: totals.fats, goal: goalValues.fats, unit: "g" },
    },
  });
}
