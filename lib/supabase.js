import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Next.js patches global fetch in server components to cache requests by
// default, including ones made under the hood by supabase-js — without
// this, a page fetched once keeps serving stale tournament data forever,
// even after an admin adds/edits/approves one.
function noStoreFetch(input, init) {
  return fetch(input, { ...init, cache: "no-store" });
}

/** Browser/public-safe client. Respects Row Level Security. */
export const supabase = createClient(url, anonKey, {
  global: { fetch: noStoreFetch },
});

/**
 * Server-only client for use inside /admin API routes and server
 * components. Uses the service_role key, which bypasses Row Level
 * Security — never import this from a "use client" file.
 */
export function supabaseAdmin() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY env var is not set");
  }
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { fetch: noStoreFetch },
  });
}
