import { NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

/**
 * Routes admin.tournamentwala.com (and admin.localhost in dev) to the
 * /admin section of this same app, blocks the main domain from reaching
 * /admin directly, and gates everything under /admin behind a valid
 * signed session cookie (except the login page itself).
 */
export async function middleware(request) {
  const url = request.nextUrl;
  const host = (request.headers.get("host") || "").split(":")[0];

  const isAdminHost = host === "admin.localhost" || host.startsWith("admin.");

  if (!isAdminHost) {
    if (url.pathname.startsWith("/admin")) {
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (!url.pathname.startsWith("/admin")) {
    url.pathname = `/admin${url.pathname === "/" ? "" : url.pathname}`;
  }

  const isLoginPage = url.pathname === "/admin/login";
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session && !isLoginPage) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    return NextResponse.redirect(loginUrl);
  }

  if (session && isLoginPage) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/admin";
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
