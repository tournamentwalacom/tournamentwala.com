import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { parseTournamentInput } from "@/lib/tournamentValidation";
import { resolvePromotionSelections } from "@/lib/promotionPackages";

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

  const { data, error: validationError } = parseTournamentInput(body);
  if (!data) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const db = supabaseAdmin();

  // The client only ever sends { package_id, quantity } — price/total are
  // always resolved here from the DB so a tampered request can't change
  // what gets charged/recorded.
  const { selections, total, error: promoError } = await resolvePromotionSelections(
    db,
    body.promotions
  );
  if (promoError) {
    return NextResponse.json({ error: promoError }, { status: 400 });
  }

  // Organizer submissions always start in the review queue — only the
  // admin-facing routes can set status, "hot", or "announce" directly.
  const { hot, announce, status, ...row } = data;

  const { error } = await db
    .from("tournaments")
    .insert({ ...row, status: "pending", promotions: selections, promotion_total: total });

  if (error) {
    return NextResponse.json(
      { error: "Couldn't save your submission. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
