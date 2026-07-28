import { NextResponse } from "next/server";
import {
  createSessionToken,
  SESSION_COOKIE_NAME,
  sessionCookieOptions,
} from "@/lib/auth";
import { verifyPassword } from "@/lib/password";
import { supabaseAdmin } from "@/lib/supabase";
import { checkRateLimit, clientIp } from "@/lib/rateLimit";

export async function POST(request) {
  const withinLimit = await checkRateLimit(supabaseAdmin(), {
    key: `admin_login:${clientIp(request)}`,
    limit: 5,
    windowSeconds: 15 * 60,
  });
  if (!withinLimit) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429 }
    );
  }

  const { email, password } = await request.json();

  if (typeof email !== "string" || typeof password !== "string") {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  }

  const isOwnerEmail =
    email.toLowerCase() === (process.env.ADMIN_EMAIL || "").toLowerCase();

  let role = null;

  if (isOwnerEmail) {
    if (verifyPassword(password, process.env.ADMIN_PASSWORD_HASH || "")) {
      role = "owner";
    }
  } else {
    const { data: worker } = await supabaseAdmin()
      .from("admin_workers")
      .select("password_hash, active")
      .eq("email", email.toLowerCase())
      .maybeSingle();

    if (worker?.active && verifyPassword(password, worker.password_hash)) {
      role = "worker";
    }
  }

  if (!role) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  }

  const token = await createSessionToken({ email: email.toLowerCase(), role });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, token, sessionCookieOptions);
  return response;
}
