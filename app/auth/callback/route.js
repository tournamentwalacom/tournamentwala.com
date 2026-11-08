import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { safeNextPath } from "@/lib/authReturn";

/** Landing point for Google OAuth — exchanges the auth code for a session
 * cookie, then sends the user back to wherever they were headed
 * (defaults to the home page). */
export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  // Relative paths only, so ?next=https://evil.com can't bounce users off-site.
  const next = safeNextPath(url.searchParams.get("next"));
  const intent = url.searchParams.get("intent");

  if (code) {
    const supabase = createServerSupabaseClient();
    const {
      data: { session },
    } = await supabase.auth.exchangeCodeForSession(code);

    // Google sign-ins can't carry custom metadata through signInWithOAuth,
    // so handle_new_profile() (supabase/schema.sql) inserts signup_source as
    // null for them — fill it in here instead, once, right after the
    // profiles row is created. Only set if still null so a returning lead
    // signing in from a different page doesn't overwrite their original
    // intent.
    if (session?.user && intent) {
      await supabase
        .from("profiles")
        .update({ signup_source: intent })
        .eq("id", session.user.id)
        .is("signup_source", null);
    }
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
