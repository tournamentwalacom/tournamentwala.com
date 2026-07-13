import { NextResponse } from "next/server";

/**
 * Routes admin.tournamentwala.com (and admin.localhost in dev) to the
 * /admin section of this same app, while keeping the main domain from
 * being able to reach /admin directly.
 */
export function middleware(request) {
  const url = request.nextUrl;
  const host = (request.headers.get("host") || "").split(":")[0];

  const isAdminHost = host === "admin.localhost" || host.startsWith("admin.");

  if (isAdminHost) {
    if (!url.pathname.startsWith("/admin")) {
      url.pathname = `/admin${url.pathname === "/" ? "" : url.pathname}`;
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  if (url.pathname.startsWith("/admin")) {
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
