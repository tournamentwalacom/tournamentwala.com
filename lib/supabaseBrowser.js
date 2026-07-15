import { createBrowserClient } from "@supabase/ssr";

/** Client-side Supabase client for the organizer auth form (Google OAuth,
 * email/password sign in/up/out) — "use client" components only. */
export function createBrowserSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
