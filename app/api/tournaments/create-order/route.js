import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { resolvePromotionSelections } from "@/lib/promotionPackages";
import { getCurrentUser } from "@/lib/supabaseServer";
import { razorpayClient } from "@/lib/razorpay";

// Creates a Razorpay order for the organizer's currently-selected promotion
// add-ons, priced server-side (same trusted resolver /api/tournaments/submit
// uses) so the amount actually charged can never be influenced by the
// client. The returned order_id is later paid via Razorpay Checkout and
// verified again in /api/tournaments/submit before the tournament is saved.
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

  const db = supabaseAdmin();
  const { total, error: promoError } = await resolvePromotionSelections(db, body.promotions);
  if (promoError) {
    return NextResponse.json({ error: promoError }, { status: 400 });
  }
  if (total <= 0) {
    return NextResponse.json({ error: "Nothing to pay for." }, { status: 400 });
  }

  try {
    const order = await razorpayClient().orders.create({
      amount: Math.round(total * 100),
      currency: "INR",
      receipt: `tw_${session.user.id.slice(0, 8)}_${Date.now().toString(36)}`,
      notes: { organizer_user_id: session.user.id },
    });

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("Failed to create Razorpay order:", err);
    return NextResponse.json(
      { error: "Couldn't start payment. Please try again." },
      { status: 500 }
    );
  }
}
