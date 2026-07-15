import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Organizer-facing Supabase client for Server Components/Route Handlers —
 * bound to the visitor's own auth cookies, so it respects RLS as that user
 * (unlike lib/supabase.js's supabaseAdmin(), which is for the admin panel
 * only and bypasses RLS entirely).
 */
export function createServerSupabaseClient() {
  const cookieStore = cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component render, where cookies can't be
          // set — safe to ignore since middleware.js refreshes the session
          // on every request anyway.
        }
      },
    },
  });
}

/** Signed-in organizer + their profiles row, or null if not signed in. */
export async function getCurrentUser() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return { user, profile };
}
