import { NextResponse } from "next/server";
import { verifySessionToken, getWorkerPermissions, SESSION_COOKIE_NAME } from "@/lib/auth";
import { updateSupabaseSession } from "@/lib/supabaseMiddleware";
import { ADMIN_SECTIONS, ADMIN_PERMISSION_KEYS, sectionKeyForPath } from "@/lib/permissions";

const NO_ACCESS_PATH = "/admin/no-access";
const OWNER_ONLY_PREFIXES = ["/admin/admin-panel"];

function firstAllowedPath(permissions) {
  const section = ADMIN_SECTIONS.find((s) => permissions.includes(s.key));
  return section ? (section.exact ? "/admin" : section.path) : NO_ACCESS_PATH;
}

/**
 * Routes admin.tournamentwala.com (and admin.localhost in dev) to the
 * /admin section of this same app, blocks the main domain from reaching
 * /admin directly, and gates everything under /admin behind a valid
 * signed session cookie (except the login page itself). On the main
 * domain, also refreshes the separate organizer Supabase Auth session.
 *
 * For worker sessions (role: "worker"), this also enforces the per-tab
 * access granted from /admin/admin-panel: permissions are looked up fresh
 * from admin_workers on every request (never cached in the JWT) so an
 * owner editing/revoking a worker's access takes effect on their very next
 * navigation, and the allowed tab list is forwarded downstream via
 * headers so the sidebar/layout don't need a second DB round trip.
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
    return updateSupabaseSession(request);
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

  // The `role` fallback also covers sessions signed before this feature
  // shipped (their JWT only ever carried `email`) — without it, whoever's
  // already logged in as the owner would get locked out until they log
  // back in, since a role-less session would otherwise fall through to
  // the worker branch and find no matching admin_workers row.
  const isOwner =
    session?.role === "owner" ||
    (session &&
      !session.role &&
      session.email?.toLowerCase() === (process.env.ADMIN_EMAIL || "").toLowerCase());
  const permissions = session && !isOwner ? await getWorkerPermissions(session.email) : ADMIN_PERMISSION_KEYS;

  if (session && isLoginPage) {
    const dest = request.nextUrl.clone();
    dest.pathname = isOwner ? "/admin" : firstAllowedPath(permissions);
    return NextResponse.redirect(dest);
  }

  if (session && !isOwner && !isLoginPage) {
    const isOwnerOnlyPage = OWNER_ONLY_PREFIXES.some((p) => url.pathname.startsWith(p));
    const sectionKey = sectionKeyForPath(url.pathname);
    const isDenied =
      isOwnerOnlyPage || (sectionKey && !permissions.includes(sectionKey));

    if (isDenied && url.pathname !== NO_ACCESS_PATH) {
      const dest = request.nextUrl.clone();
      dest.pathname = NO_ACCESS_PATH;
      return NextResponse.redirect(dest);
    }
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-admin-role", isOwner ? "owner" : session ? "worker" : "");
  requestHeaders.set("x-admin-permissions", permissions.join(","));

  return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
