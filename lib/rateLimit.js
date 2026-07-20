// Shared rate-limit helper backed by the rate_limit_hit() Postgres function
// (see supabase/schema.sql) — used across public POST routes since an
// in-memory counter isn't reliable on Vercel's stateless serverless
// functions.

/** Best-effort client IP from the header Vercel sets on every request. */
export function clientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded ? forwarded.split(",")[0].trim() : "unknown";
}

/**
 * Returns true if the request is within limit and should proceed.
 * Fails open (returns true) if the check itself errors, so a rate-limit
 * outage never takes down the routes it's protecting.
 */
export async function checkRateLimit(db, { key, limit, windowSeconds }) {
  const { data, error } = await db.rpc("rate_limit_hit", {
    p_key: key,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });

  if (error) {
    console.error("checkRateLimit: rate_limit_hit failed, failing open", error);
    return true;
  }

  return data === true;
}
