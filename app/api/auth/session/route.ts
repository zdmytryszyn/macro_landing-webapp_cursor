import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";

export async function GET() {
  const cookieStore = await cookies();
  const userId = await getSessionUserId(cookieStore);
  if (!userId) return Response.json({ user: null });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, displayName: true },
  });

  return Response.json({ user: user ?? null });
}
