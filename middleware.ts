import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Fast cookie check at the edge. Pages and API routes still verify the session
// (and the admin role) on the server; this just bounces signed-out visitors early.
export function middleware(request: NextRequest) {
  if (!getSessionCookie(request)) {
    const url = new URL("/auth/login", request.url);
    url.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*", "/account/:path*"] };
