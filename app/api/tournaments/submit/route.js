import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { parseTournamentInput } from "@/lib/tournamentValidation";
import { resolvePromotionSelections } from "@/lib/promotionPackages";
import { getCurrentUser } from "@/lib/supabaseServer";
import { geocodePincode } from "@/lib/geocode";
import { computeRazorpayCharge, RAZORPAY_CATEGORY } from "@/lib/expenses";
import { sendNotificationEmail, renderEmailLayout } from "@/lib/email";

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

  const db = supabaseAdmin();

  // The client only ever sends { package_id, quantity } — price/total are
  // always resolved here from the DB so a tampered request can't change
  // what gets charged/recorded. Resolved before validation because
  // requiresBrief (Poster Design / Reel Creation selected) determines
  // whether the main poster upload is actually required below.
  const { selections, total, requiresBrief, error: promoError } = await resolvePromotionSelections(
    db,
    body.promotions
  );
  if (promoError) {
    return NextResponse.json({ error: promoError }, { status: 400 });
  }

  const { data, error: validationError } = parseTournamentInput(body, {
    posterOptional: requiresBrief,
  });
  if (!data) {
    return NextResponse.json({ error: validationError }, { status: 400 });
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

  // Log this order's Razorpay charge as its own expense row so it's visible
  // in the ledger, not just folded into the live 2.5%-of-income figure.
  // Best-effort — a logging failure shouldn't fail the submission itself.
  if (total > 0) {
    const { error: expenseError } = await db.from("expenses").insert({
      title: `Razorpay charge — ${row.name}`,
      category: RAZORPAY_CATEGORY,
      amount: computeRazorpayCharge(total),
      expense_date: new Date().toISOString().slice(0, 10),
      notes: `Auto-logged for order by ${row.organizer_name} (₹${total} package total).`,
    });
    if (expenseError) {
      console.error("Failed to log Razorpay expense row:", expenseError);
    }
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

  // Best-effort — a notification failure shouldn't fail the submission itself.
  await sendNotificationEmail({
    subject: `New tournament request awaiting review: ${row.name}`,
    html: renderEmailLayout({
      heading: "New tournament request awaiting review",
      rows: [
        { label: "Name", value: row.name },
        { label: "Organizer", value: row.organizer_name },
        { label: "Phone", value: row.organizer_phone },
      ],
    }),
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
