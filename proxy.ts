import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

const PUBLIC_ROUTES = ["/signin", "/signup"];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = Boolean(req.auth);
  const isPublicRoute = PUBLIC_ROUTES.some((route) => nextUrl.pathname.startsWith(route));

  if (!isLoggedIn && !isPublicRoute) {
    const signInUrl = new URL("/signin", nextUrl);
    signInUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (isLoggedIn && isPublicRoute) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  // Exclude Next internals, static assets, AND Auth.js's own API routes
  // (api/auth/*) — those must always be reachable directly, unauthenticated,
  // or signIn()/signOut()/getSession() break, since they call these endpoints
  // themselves before a session exists.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth|.*\\.png$|.*\\.svg$).*)"],
};