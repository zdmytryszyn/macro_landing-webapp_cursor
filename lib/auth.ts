import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

/** Return type of `cookies()` from `next/headers` (mutable set/delete in Route Handlers). */
export type AppCookieStore = Awaited<
  ReturnType<typeof import("next/headers").cookies>
>;

const SESSION_COOKIE = "session";
const ONE_WEEK_MS = 1000 * 60 * 60 * 24 * 7;

type SessionPayload = {
  userId: string;
  exp: number;
};

function getSessionSecret() {
  return process.env.SESSION_SECRET ?? "dev-only-session-secret-change-me";
}

async function signSession(payload: SessionPayload) {
  const key = new TextEncoder().encode(getSessionSecret());
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key);
}

export async function readSession(token?: string) {
  if (!token) return null;

  try {
    const key = new TextEncoder().encode(getSessionSecret());
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function setSessionCookie(
  cookieStore: AppCookieStore,
  userId: string
) {
  const expDate = new Date(Date.now() + ONE_WEEK_MS);
  const token = await signSession({
    userId,
    exp: Math.floor(expDate.getTime() / 1000),
  });

  cookieStore.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expDate,
  });
}

export function clearSessionCookie(cookieStore: AppCookieStore) {
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSessionUserId(cookieStore: AppCookieStore) {
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = await readSession(token);
  return session?.userId ?? null;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}
