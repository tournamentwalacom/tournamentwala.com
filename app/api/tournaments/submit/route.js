import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { parseTournamentInput } from "@/lib/tournamentValidation";
import { resolvePromotionSelections } from "@/lib/promotionPackages";
import { getCurrentUser } from "@/lib/supabaseServer";
import { geocodePincode } from "@/lib/geocode";

export async function POST(request) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json(
      { error: "Please sign in to post a tournament." },
      { status: 401 }
    );
  }

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

  // Cached once here so /explore-tournaments can sort by distance without
  // geocoding on every page view. Never blocks the submission on failure.
  const coords = await geocodePincode(row.pincode);

  const { error } = await db.from("tournaments").insert({
    ...row,
    latitude: coords?.latitude ?? null,
    longitude: coords?.longitude ?? null,
    status: "pending",
    promotions: selections,
    promotion_total: total,
    organizer_user_id: session.user.id,
  });

  if (error) {
    return NextResponse.json(
      { error: "Couldn't save your submission. Please try again." },
      { status: 500 }
    );
  }

  // Keep the organizer's profile in sync with whatever contact info they
  // just submitted, so the admin Organizers page and their own /profile
  // page always reflect the latest — never their poster/media uploads.
  await db
    .from("profiles")
    .update({
      full_name: row.organizer_name,
      phone: row.organizer_phone,
      updated_at: new Date().toISOString(),
    })
    .eq("id", session.user.id);

  return NextResponse.json({ ok: true }, { status: 201 });
}
