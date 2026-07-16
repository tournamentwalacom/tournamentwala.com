import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { applyDiscount, getActiveDiscount } from "@/lib/promotionPackages";

// Public, unauthenticated — this is what the post-tournament form fetches at
// runtime so package names/prices live in the DB, not in frontend JS. Only
// active rows and display fields are returned; promotion_packages itself has
// no anon-readable RLS policy.
//
// Also folds in the site-wide discount (see /admin/pricing): each paid
// package gets `original_price` (undiscounted) alongside `price`, which is
// already knocked down by the active percentage — same math the server uses
// to compute the real charge in resolvePromotionSelections, so the picker
// never shows a total it won't actually charge.
export async function GET() {
  const db = supabaseAdmin();
  const [{ data, error }, discount] = await Promise.all([
    db
      .from("promotion_packages")
      .select(
        "id, name, description, price, price_unit, allow_quantity, requires_telegram_upload, requires_brief, is_free"
      )
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    getActiveDiscount(db),
  ]);

  if (error) {
    return NextResponse.json({ error: "Couldn't load promotion packages." }, { status: 500 });
  }

  const packages = data.map((pkg) => {
    if (pkg.is_free || !discount.is_active || discount.percentage <= 0) return pkg;
    return {
      ...pkg,
      original_price: pkg.price,
      price: applyDiscount(pkg.price, discount.percentage),
    };
  });

  return NextResponse.json({
    packages,
    discount: {
      message: discount.message,
      percentage: discount.percentage,
      is_active: discount.is_active,
    },
  });
}
