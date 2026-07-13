import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const ENTRY_FEE_UNITS = new Set(["team", "pair", "player", "squad"]);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function trimmed(value, maxLength) {
  if (typeof value !== "string") return null;
  const t = value.trim();
  if (!t || t.length > maxLength) return null;
  return t;
}

function positiveNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : null;
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

  const name = trimmed(body.name, 120);
  const sport = trimmed(body.sport, 60);
  const city = trimmed(body.city, 60);
  const venue = trimmed(body.venue, 160);
  const format = body.format ? trimmed(body.format, 160) : null;
  const tag = body.tag ? trimmed(body.tag, 40) : null;
  const organizer_name = trimmed(body.organizer_name, 80);
  const organizer_email = trimmed(body.organizer_email, 120);
  const organizer_phone = trimmed(body.organizer_phone, 20);
  const entry_fee_amount = positiveNumber(body.entry_fee_amount);
  const prize_pool = positiveNumber(body.prize_pool);
  const entry_fee_unit = ENTRY_FEE_UNITS.has(body.entry_fee_unit)
    ? body.entry_fee_unit
    : "team";

  const start_date =
    typeof body.start_date === "string" && DATE_RE.test(body.start_date)
      ? body.start_date
      : null;
  const end_date =
    typeof body.end_date === "string" && DATE_RE.test(body.end_date)
      ? body.end_date
      : null;

  if (
    !name ||
    !sport ||
    !city ||
    !venue ||
    !start_date ||
    !organizer_name ||
    !organizer_email ||
    !EMAIL_RE.test(organizer_email) ||
    !organizer_phone ||
    entry_fee_amount === null ||
    prize_pool === null
  ) {
    return NextResponse.json(
      { error: "Please fill in all required fields correctly." },
      { status: 400 }
    );
  }

  if (end_date && end_date < start_date) {
    return NextResponse.json(
      { error: "End date can't be before the start date." },
      { status: 400 }
    );
  }

  const { error } = await supabaseAdmin()
    .from("tournaments")
    .insert({
      name,
      sport,
      city,
      venue,
      format,
      tag,
      entry_fee_amount,
      entry_fee_unit,
      prize_pool,
      start_date,
      end_date,
      organizer_name,
      organizer_email,
      organizer_phone,
      status: "pending",
    });

  if (error) {
    return NextResponse.json(
      { error: "Couldn't save your submission. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
