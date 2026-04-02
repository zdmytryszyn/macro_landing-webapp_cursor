import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";
import { goalsSchema } from "@/lib/schemas";

const DEFAULT_GOALS = {
  calories: 2200,
  protein: 150,
  carbs: 250,
  fats: 70,
};

export async function GET() {
  const cookieStore = await cookies();
  const userId = await getSessionUserId(cookieStore);
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const goals = await prisma.userGoal.findUnique({ where: { userId } });
  if (!goals) return Response.json(DEFAULT_GOALS);

  return Response.json({
    calories: goals.caloriesTarget,
    protein: goals.proteinTarget,
    carbs: goals.carbsTarget,
    fats: goals.fatsTarget,
  });
}

export async function PUT(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = goalsSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const userId = await getSessionUserId(cookieStore);
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const updatedGoals = await prisma.userGoal.upsert({
    where: { userId },
    update: {
      caloriesTarget: parsed.data.calories,
      proteinTarget: parsed.data.protein,
      carbsTarget: parsed.data.carbs,
      fatsTarget: parsed.data.fats,
    },
    create: {
      userId,
      caloriesTarget: parsed.data.calories,
      proteinTarget: parsed.data.protein,
      carbsTarget: parsed.data.carbs,
      fatsTarget: parsed.data.fats,
    },
  });

  return Response.json({
    calories: updatedGoals.caloriesTarget,
    protein: updatedGoals.proteinTarget,
    carbs: updatedGoals.carbsTarget,
    fats: updatedGoals.fatsTarget,
  });
}
