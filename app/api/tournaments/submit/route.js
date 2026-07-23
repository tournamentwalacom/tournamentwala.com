import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { parseTournamentInput } from "@/lib/tournamentValidation";
import { resolvePromotionSelections } from "@/lib/promotionPackages";
import { getCurrentUser } from "@/lib/supabaseServer";
import { geocodePincode } from "@/lib/geocode";
import { computeRazorpayCharge, RAZORPAY_CATEGORY } from "@/lib/expenses";
import { sendNotificationEmail, renderEmailLayout } from "@/lib/email";
import { razorpayClient } from "@/lib/razorpay";
import { checkRateLimit, clientIp } from "@/lib/rateLimit";

export async function POST(request) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json(
      { error: "Please sign in to post a tournament." },
      { status: 401 }
    );
  }

  const withinLimit = await checkRateLimit(supabaseAdmin(), {
    key: `tournament_submit:${clientIp(request)}`,
    limit: 15,
    windowSeconds: 60 * 60,
  });
  if (!withinLimit) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again later." },
      { status: 429 }
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

  // Paid add-ons must have gone through Razorpay Checkout first (see
  // /api/tournaments/create-order). Verify the signature proves this
  // payment_id genuinely belongs to this order_id, then re-check the order
  // itself with Razorpay so a stale/tampered `promotions` payload here can't
  // slip a smaller paid amount past a bigger cart than what create-order priced.
  let razorpayPayment = null;
  if (total > 0) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Payment is required for the selected add-ons." },
        { status: 400 }
      );
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });
    }

    try {
      const order = await razorpayClient().orders.fetch(razorpay_order_id);
      if (order.status !== "paid" || order.amount !== Math.round(total * 100)) {
        return NextResponse.json(
          { error: "Payment amount doesn't match your order. Please try again." },
          { status: 400 }
        );
      }
    } catch (err) {
      console.error("Failed to verify Razorpay order:", err);
      return NextResponse.json(
        { error: "Couldn't verify payment. Please try again." },
        { status: 500 }
      );
    }

    razorpayPayment = { razorpay_order_id, razorpay_payment_id };
  }

  const { data, error: validationError } = parseTournamentInput(body, {
    posterOptional: requiresBrief,
  });
  if (!data) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  // Organizer submissions always start in the review queue — only the
  // admin-facing routes can set status, "hot", or "announce" directly.
  const { hot, announce, status, latitude, longitude, ...row } = data;

  // The organizer's "Auto-fill details" button (see PostTournamentForm.jsx)
  // resolves precise coordinates from the pasted Google Maps venue link
  // client-side — far more accurate than a pincode's postal-area centroid.
  // Pincode geocoding only kicks in as a fallback if that's somehow missing.
  const coords =
    latitude != null && longitude != null
      ? { latitude, longitude }
      : await geocodePincode(row.pincode);

  const { error } = await db.from("tournaments").insert({
    ...row,
    latitude: coords?.latitude ?? null,
    longitude: coords?.longitude ?? null,
    status: "pending",
    promotions: selections,
    promotion_total: total,
    organizer_user_id: session.user.id,
    razorpay_order_id: razorpayPayment?.razorpay_order_id ?? null,
    razorpay_payment_id: razorpayPayment?.razorpay_payment_id ?? null,
  });

  if (error) {
    console.error("Failed to insert tournament submission:", error);
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
      notes: `Auto-logged for order by ${row.organizer_name} (₹${total} package total, Razorpay payment ${razorpayPayment.razorpay_payment_id}).`,
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
