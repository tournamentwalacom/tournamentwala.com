"use client";

import { useEffect } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabaseBrowser";
import { consumeReturnPath } from "@/lib/authReturn";

/** Safety net for when Supabase's OAuth / email-confirmation redirect falls
 * back to the Site URL (e.g. a Redirect URLs allow-list mismatch) instead of
 * landing on /auth/callback — picks up a stray ?code= on any page, finishes
 * the session exchange client-side, and sends the user back to the page they
 * started signing in from (saved by AuthForm), or the home page if unknown. */
export default function AuthCodeCatcher() {
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");
    if (!code) return;

    createBrowserSupabaseClient()
      .auth.exchangeCodeForSession(code)
      .finally(() => {
        // Full load so server components re-render with the new session.
        window.location.replace(consumeReturnPath() || "/");
      });
  }, []);

  return null;
}
