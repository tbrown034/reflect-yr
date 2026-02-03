import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const isDev = process.env.NODE_ENV === "development";
const LOG_PREFIX = "[Middleware]";

/**
 * Routes that require authentication
 * Users without a session will be redirected to home
 */
const PROTECTED_PAGE_ROUTES = ["/profile"];

/**
 * API routes that require authentication
 * These will return 401 if no session is present
 * Note: GET /api/lists/[id] handles its own auth for private lists
 */
const PROTECTED_API_ROUTES = ["/api/recommendations", "/api/roast"];

/**
 * API routes that require auth only for write operations (POST, PUT, DELETE)
 * GET requests are allowed for public access
 */
const PROTECTED_API_WRITE_ROUTES = ["/api/lists"];

/**
 * Routes that are always public - no auth check needed
 * Static files, auth endpoints, and public pages
 */
const PUBLIC_ROUTES = [
  "/",
  "/movies",
  "/tv",
  "/books",
  "/podcasts",
  "/anime",
  "/about",
  "/share",
  "/api/auth",
  "/api/search",
  "/api/lists/share",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  // Skip static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check if route is explicitly public
  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  if (isPublicRoute) {
    if (isDev) {
      console.log(`${LOG_PREFIX} ${method} ${pathname} - Public route`);
    }
    return NextResponse.next();
  }

  // Get session cookie using Better Auth helper
  const sessionCookie = getSessionCookie(request);

  if (isDev) {
    console.log(
      `${LOG_PREFIX} ${method} ${pathname} - Session: ${sessionCookie ? "present" : "none"}`
    );
  }

  // Check protected page routes
  const isProtectedPage = PROTECTED_PAGE_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedPage) {
    if (!sessionCookie) {
      if (isDev) {
        console.log(
          `${LOG_PREFIX} ${method} ${pathname} - Redirecting to home (no session)`
        );
      }
      const url = request.nextUrl.clone();
      url.pathname = "/";
      url.searchParams.set("authRequired", "true");
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Check protected API routes (all methods)
  const isProtectedApi = PROTECTED_API_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedApi) {
    if (!sessionCookie) {
      if (isDev) {
        console.log(
          `${LOG_PREFIX} ${method} ${pathname} - Returning 401 (no session)`
        );
      }
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // Check protected API write routes (POST, PUT, DELETE only)
  const isProtectedWriteRoute = PROTECTED_API_WRITE_ROUTES.some(
    (route) => pathname.startsWith(route) && !pathname.includes("/share/")
  );

  if (isProtectedWriteRoute && ["POST", "PUT", "DELETE"].includes(method)) {
    if (!sessionCookie) {
      if (isDev) {
        console.log(
          `${LOG_PREFIX} ${method} ${pathname} - Returning 401 (no session for write operation)`
        );
      }
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
  }

  // All other routes pass through
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
