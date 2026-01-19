import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const isDev = process.env.NODE_ENV === "development";

export async function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const pathname = request.nextUrl.pathname;

  if (isDev) {
    console.log(`[Proxy] ${pathname}, session cookie: ${!!sessionCookie}`);
  }

  // Profile page handles both authenticated and unauthenticated states
  if (pathname.startsWith("/profile")) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*"],
};
