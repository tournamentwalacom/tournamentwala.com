import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Browser/public-safe client. Respects Row Level Security. */
export const supabase = createClient(url, anonKey);

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
  });
}
