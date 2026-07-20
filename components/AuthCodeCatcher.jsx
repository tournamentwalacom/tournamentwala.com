"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabaseBrowser";

/** Safety net for when Supabase's OAuth redirect falls back to the Site URL
 * (e.g. a Redirect URLs allow-list mismatch) instead of landing on
 * /auth/callback — picks up a stray ?code= on any page, finishes the
 * session exchange client-side, and sends the user on to the home page,
 * same as the real callback route would have. */
export default function AuthCodeCatcher() {
  const router = useRouter();

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");
    if (!code) return;

    createBrowserSupabaseClient()
      .auth.exchangeCodeForSession(code)
      .then(() => router.replace("/"));
  }, [router]);

  return null;
}
