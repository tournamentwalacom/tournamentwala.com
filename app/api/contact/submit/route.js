import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const REASONS = new Set(["general", "player", "organizer"]);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function trimmed(value, maxLength) {
  if (typeof value !== "string") return null;
  const t = value.trim();
  if (!t || t.length > maxLength) return null;
  return t;
}

export async function POST(request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Honeypot: bots fill every field, real users never see/touch this one.
  // Pretend success so the bot doesn't know to adjust and retry.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  const name = trimmed(body.name, 80);
  const email = trimmed(body.email, 120);
  const phone = body.phone ? trimmed(body.phone, 20) : null;
  const message = trimmed(body.message, 2000);
  const reason = REASONS.has(body.reason) ? body.reason : "general";

  if (!name || !email || !EMAIL_RE.test(email) || !message) {
    return NextResponse.json(
      { error: "Please fill in all required fields correctly." },
      { status: 400 }
    );
  }

  const { error } = await supabaseAdmin()
    .from("contact_messages")
    .insert({ name, email, phone, reason, message });

  if (error) {
    return NextResponse.json(
      { error: "Couldn't send your message. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
