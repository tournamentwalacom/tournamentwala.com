/** Remembers where the user was when they started signing in, so they land
 * back on the same page (e.g. the tournament they were registering for)
 * even when the OAuth / email-confirmation redirect falls back to the Site
 * URL and loses the ?next= param. Browser-only; every access is guarded
 * because storage can be blocked (private mode, disabled site data). */

const KEY = "tw_auth_return";
const MAX_AGE_MS = 30 * 60 * 1000;

/** Only same-origin relative paths — never "//evil.com" or "https://…". */
export function safeNextPath(next, fallback = "/") {
  if (typeof next !== "string") return fallback;
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return fallback;
  }
  return next;
}

export function saveReturnPath(path) {
  try {
    window.localStorage.setItem(
      KEY,
      JSON.stringify({ path: safeNextPath(path), at: Date.now() })
    );
  } catch {
    // storage unavailable — the ?next= param is still the primary path
  }
}

export function consumeReturnPath() {
  try {
    const raw = window.localStorage.getItem(KEY);
    window.localStorage.removeItem(KEY);
    if (!raw) return null;
    const { path, at } = JSON.parse(raw);
    if (!at || Date.now() - at > MAX_AGE_MS) return null;
    return safeNextPath(path, null);
  } catch {
    return null;
  }
}
