import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

/** Landing point for Google OAuth — exchanges the auth code for a session
 * cookie, then sends the organizer back to wherever they were headed
 * (defaults to the post-tournament form). */
export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/post-tournament";

  if (code) {
    const supabase = createServerSupabaseClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
