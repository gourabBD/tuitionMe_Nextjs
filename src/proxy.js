import { NextResponse } from "next/server";

/**
 * Auth.js names its session cookie differently depending on whether the site
 * is served over HTTPS (where it gets the `__Secure-` prefix). Both are checked
 * so this works identically in local development and in production.
 */
const SESSION_COOKIES = ["authjs.session-token", "__Secure-authjs.session-token"];

/**
 * Routes that require a signed-in user.
 *
 * This is a *routing* convenience only — it saves a signed-out visitor from
 * loading a page that would be empty, and nothing more. It runs on the Edge
 * runtime, cannot reach MongoDB, and does not verify the token: it only sees
 * that a cookie is present. Every page and API route below still calls
 * `getSession()` and does its own ownership check; none of them trust this.
 */
const PROTECTED_PREFIXES = [
  "/addservice",
  "/manage",
  "/my-courses",
  "/myreview",
  "/myreviews",
  "/edit",
];

export function proxy(req) {
  const { pathname, search } = req.nextUrl;

  const needsAuth = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  if (!needsAuth) return NextResponse.next();

  const hasSession = SESSION_COOKIES.some((name) => req.cookies.has(name));
  if (hasSession) return NextResponse.next();

  const loginUrl = new URL("/login", req.url);
  // Only ever a same-site path, so this can't be turned into an open redirect.
  loginUrl.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    /*
     * Everything except Next's own assets, the API (which authenticates itself
     * and must return 401 rather than a redirect), and static files.
     */
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp)$).*)",
  ],
};
