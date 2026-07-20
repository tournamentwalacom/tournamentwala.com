"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabaseBrowser";

export default function AuthForm({ next = "/" }) {
  const router = useRouter();
  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("idle"); // idle | busy | error | check-email
  const [error, setError] = useState("");

  async function handleGoogle() {
    setError("");
    setStatus("busy");
    const supabase = createBrowserSupabaseClient();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (oauthError) {
      setError(oauthError.message);
      setStatus("error");
    }
    // On success the browser is redirected to Google, so no further
    // state change is needed here.
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setStatus("busy");

    const supabase = createBrowserSupabaseClient();

    if (mode === "signup") {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (signUpError) {
        setError(signUpError.message);
        setStatus("error");
        return;
      }
      setStatus("check-email");
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (signInError) {
      setError(signInError.message);
      setStatus("error");
      return;
    }

    router.push(next);
    router.refresh();
  }

  if (status === "check-email") {
    return (
      <div className="auth-card">
        <h3>Check your inbox</h3>
        <p className="post-intro">
          We&rsquo;ve sent a confirmation link to <strong>{email}</strong>.
          Click it, then come back here to sign in.
        </p>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            setStatus("idle");
            setMode("signin");
          }}
        >
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <div className="auth-card">
      <button
        type="button"
        className="btn btn-ghost auth-google-btn"
        onClick={handleGoogle}
        disabled={status === "busy"}
      >
        Continue with Google
      </button>

      <div className="auth-divider">
        <span>or</span>
      </div>

      <div className="auth-toggle" role="tablist" aria-label="Sign in or sign up">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "signin"}
          className={mode === "signin" ? "is-active" : ""}
          onClick={() => {
            setMode("signin");
            setError("");
          }}
        >
          Sign in
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "signup"}
          className={mode === "signup" ? "is-active" : ""}
          onClick={() => {
            setMode("signup");
            setError("");
          }}
        >
          Sign up
        </button>
      </div>

      <form className="post-form" onSubmit={handleSubmit}>
        {mode === "signup" && (
          <label className="post-field">
            Full name
            <input
              type="text"
              required
              maxLength={80}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </label>
        )}

        <label className="post-field">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label className="post-field">
          Password
          <input
            type="password"
            required
            minLength={6}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {error && <p className="post-error">{error}</p>}

        <button type="submit" className="btn btn-primary" disabled={status === "busy"}>
          {status === "busy"
            ? "Please wait…"
            : mode === "signup"
              ? "Sign up"
              : "Sign in"}
        </button>
      </form>
    </div>
  );
}
