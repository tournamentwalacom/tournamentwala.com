import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase";

export const SESSION_COOKIE_NAME = "tw_admin_session";
const SESSION_TTL = "7d";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET env var is not set");
  }
  return new TextEncoder().encode(secret);
}

/**
 * role is "owner" (the single env-var admin) or "worker" (a row in
 * admin_workers). The token only ever carries identity, never permissions —
 * those are looked up fresh from admin_workers on every request (see
 * getWorkerPermissions below) so an owner editing a worker's access takes
 * effect immediately instead of waiting out the 7-day token TTL.
 */
export async function createSessionToken({ email, role }) {
  return new SignJWT({ email, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_TTL)
    .sign(getSecretKey());
}

export async function verifySessionToken(token) {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload;
  } catch {
    return null;
  }
}

/**
 * Session check for API routes under /api/admin/*, which middleware.js's
 * matcher excludes — every such route calls this itself instead of relying
 * on middleware to have already gated the request.
 */
export async function requireAdminSession() {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  return token ? await verifySessionToken(token) : null;
}

/** requireAdminSession(), plus a check that the session belongs to the
 * owner (not a worker) — for routes/pages only the owner may use, like
 * managing worker accounts themselves. The `role`-less fallback mirrors
 * middleware.js: it covers sessions signed before this feature shipped,
 * whose JWT only ever carried `email`, so the real owner isn't locked out
 * of their own worker-management pages until they happen to log back in. */
export async function requireOwnerSession() {
  const session = await requireAdminSession();
  if (!session) return null;

  const isOwner =
    session.role === "owner" ||
    (!session.role &&
      session.email?.toLowerCase() === (process.env.ADMIN_EMAIL || "").toLowerCase());

  return isOwner ? session : null;
}

/** Fresh-from-the-DB permissions for a worker (active workers only — a
 * deactivated or deleted worker's still-valid JWT loses access immediately
 * since this is looked up on every request rather than cached in the
 * token). Returns [] if the worker doesn't exist or is inactive. */
export async function getWorkerPermissions(email) {
  const { data } = await supabaseAdmin()
    .from("admin_workers")
    .select("permissions, active")
    .eq("email", (email || "").toLowerCase())
    .maybeSingle();

  if (!data || !data.active) return [];
  return data.permissions || [];
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: SESSION_MAX_AGE_SECONDS,
};
