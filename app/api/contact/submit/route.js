import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendNotificationEmail, renderEmailLayout } from "@/lib/email";
import { checkRateLimit, clientIp } from "@/lib/rateLimit";

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

  const db = supabaseAdmin();
  const withinLimit = await checkRateLimit(db, {
    key: `contact_submit:${clientIp(request)}`,
    limit: 15,
    windowSeconds: 60 * 60,
  });
  if (!withinLimit) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again later." },
      { status: 429 }
    );
  }

  const name = trimmed(body.name, 80);
  const email = trimmed(body.email, 120);
  const phone = trimmed(body.phone, 20);
  const message = trimmed(body.message, 2000);
  const reason = REASONS.has(body.reason) ? body.reason : "general";

  if (!name || !email || !EMAIL_RE.test(email) || !phone || !message) {
    return NextResponse.json(
      { error: "Please fill in all required fields correctly." },
      { status: 400 }
    );
  }

  const { error } = await db
    .from("contact_messages")
    .insert({ name, email, phone, reason, message });

  if (error) {
    return NextResponse.json(
      { error: "Couldn't send your message. Please try again." },
      { status: 500 }
    );
  }

  // Best-effort — a notification failure shouldn't fail the submission itself.
  await sendNotificationEmail({
    subject: `New contact enquiry: ${reason}`,
    html: renderEmailLayout({
      heading: "New contact enquiry",
      rows: [
        { label: "Name", value: name },
        { label: "Email", value: email },
        { label: "Phone", value: phone },
        { label: "Reason", value: reason },
        { label: "Message", value: message, multiline: true },
      ],
    }),
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
