import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { authSchema } from "@/lib/schemas";
import { comparePassword, setSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = authSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user?.passwordHash) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const isValidPassword = await comparePassword(password, user.passwordHash);
  if (!isValidPassword) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const cookieStore = await cookies();
  await setSessionCookie(cookieStore, user.id);

  return Response.json({
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
    },
  });
}
