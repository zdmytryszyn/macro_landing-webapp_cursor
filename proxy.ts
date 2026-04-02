import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { readSession } from "@/lib/auth";

const protectedPrefixes = ["/dashboard"];
const publicOnlyRoutes = ["/login", "/signup"];

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("session")?.value;
  const session = await readSession(token);
  const isAuthenticated = Boolean(session?.userId);

  const isProtected = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  );
  if (isProtected && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const isPublicOnly = publicOnlyRoutes.some((route) =>
    pathname.startsWith(route)
  );
  if (isPublicOnly && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
