import { NextResponse } from "next/server";
import {
  createSessionToken,
  SESSION_COOKIE_NAME,
  sessionCookieOptions,
} from "@/lib/auth";
import { verifyPassword } from "@/lib/password";

export async function POST(request) {
  const { email, password } = await request.json();

  const validEmail =
    typeof email === "string" &&
    email.toLowerCase() === (process.env.ADMIN_EMAIL || "").toLowerCase();

  const validPassword =
    typeof password === "string" &&
    verifyPassword(password, process.env.ADMIN_PASSWORD_HASH || "");

  if (!validEmail || !validPassword) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  }

  const token = await createSessionToken(email);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, token, sessionCookieOptions);
  return response;
}
