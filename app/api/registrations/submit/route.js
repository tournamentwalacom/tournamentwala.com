import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendNotificationEmail, renderEmailLayout } from "@/lib/email";

const PHONE_RE = /^[6-9]\d{9}$/;

function trimmed(value, maxLength) {
  if (typeof value !== "string") return null;
  const t = value.trim();
  if (!t || t.length > maxLength) return null;
  return t;
}

function normalizePhone(value) {
  if (typeof value !== "string") return null;
  const digits = value.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "");
  return PHONE_RE.test(digits) ? digits : null;
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

  const tournamentId = trimmed(body.tournamentId, 100);
  const name = trimmed(body.name, 80);
  const phone = normalizePhone(body.phone);

  if (!tournamentId || !name || !phone) {
    return NextResponse.json(
      { error: "Please fill in your name and a valid phone number." },
      { status: 400 }
    );
  }

  const db = supabaseAdmin();

  // Tournament name/sport/city/pincode are looked up server-side rather than
  // trusted from the client, same reasoning as /api/tournaments/submit.
  const { data: tournament } = await db
    .from("tournaments")
    .select("id, name, sport, city, pincode")
    .eq("id", tournamentId)
    .maybeSingle();

  if (!tournament) {
    return NextResponse.json({ error: "Tournament not found." }, { status: 404 });
  }

  const { error } = await db.from("registrations").insert({
    tournament_id: tournament.id,
    tournament_name: tournament.name,
    sport: tournament.sport,
    city: tournament.city,
    pincode: tournament.pincode || null,
    player_name: name,
    player_phone: phone,
    wants_updates: body.wantsUpdates !== false,
  });

  if (error) {
    return NextResponse.json(
      { error: "Couldn't save your registration. Please try again." },
      { status: 500 }
    );
  }

  // Best-effort — a notification failure shouldn't fail the registration itself.
  await sendNotificationEmail({
    subject: `New registration: ${tournament.name}`,
    html: renderEmailLayout({
      heading: "New tournament registration",
      rows: [
        { label: "Player name", value: name },
        { label: "Phone", value: phone },
        { label: "Tournament", value: tournament.name },
        { label: "Sport", value: tournament.sport },
        { label: "City", value: tournament.city },
        { label: "Pincode", value: tournament.pincode },
        { label: "Wants updates", value: body.wantsUpdates !== false ? "Yes" : "No" },
      ],
    }),
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
