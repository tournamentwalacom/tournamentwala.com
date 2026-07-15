import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Refreshes an organizer's Supabase Auth session cookie on every request
 * (standard @supabase/ssr middleware pattern) so it doesn't silently expire
 * between visits. Separate from the admin JWT cookie handled in middleware.js
 * — this only ever runs for non-admin-host requests.
 */
export async function updateSupabaseSession(request) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  await supabase.auth.getUser();

  return response;
}
