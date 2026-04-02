import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { updateLogEntrySchema } from "@/lib/schemas";
import { getSessionUserId } from "@/lib/auth";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = updateLogEntrySchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const userId = await getSessionUserId(cookieStore);
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await prisma.foodLogEntry.findFirst({ where: { id, userId } });
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

  await prisma.foodLogEntry.update({
    where: { id },
    data: {
      mealType: parsed.data.meal ?? existing.mealType,
      name: parsed.data.name ?? existing.name,
      brand: parsed.data.brand ?? existing.brand,
      servingSize: parsed.data.servingSize ?? existing.servingSize,
      calories: parsed.data.calories ?? existing.calories,
      protein: parsed.data.protein ?? existing.protein,
      carbs: parsed.data.carbs ?? existing.carbs,
      fats: parsed.data.fats ?? existing.fats,
      sourceType: parsed.data.sourceType ?? existing.sourceType,
    },
  });

  return Response.json({ success: true });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const cookieStore = await cookies();
  const userId = await getSessionUserId(cookieStore);
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await prisma.foodLogEntry.findFirst({ where: { id, userId } });
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

  await prisma.foodLogEntry.delete({ where: { id } });
  return Response.json({ success: true });
}
