import { NextResponse } from "next/server";
import { requireOwnerSession } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { supabaseAdmin } from "@/lib/supabase";
import { ADMIN_PERMISSION_KEYS } from "@/lib/permissions";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * This route is NOT covered by middleware.js's admin host/session gate —
 * that matcher explicitly excludes /api/*. So the session check happens
 * here, the same way middleware.js does it. Worker management is
 * owner-only (requireOwnerSession, not just requireAdminSession), so a
 * worker account can never create or see other worker accounts.
 */
export async function POST(request) {
  const session = await requireOwnerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const permissions = Array.isArray(body.permissions)
    ? body.permissions.filter((key) => ADMIN_PERMISSION_KEYS.includes(key))
    : [];

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 }
    );
  }

  const { error } = await supabaseAdmin().from("admin_workers").insert({
    email,
    password_hash: hashPassword(password),
    permissions,
  });

  if (error) {
    const message = error.code === "23505" ? "A worker with that email already exists" : "Couldn't create the worker. Please try again.";
    return NextResponse.json({ error: message }, { status: error.code === "23505" ? 409 : 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
