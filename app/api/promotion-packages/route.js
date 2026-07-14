import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// Public, unauthenticated — this is what the post-tournament form fetches at
// runtime so package names/prices live in the DB, not in frontend JS. Only
// active rows and display fields are returned; promotion_packages itself has
// no anon-readable RLS policy.
export async function GET() {
  const { data, error } = await supabaseAdmin()
    .from("promotion_packages")
    .select(
      "id, name, description, price, price_unit, allow_quantity, requires_telegram_upload, requires_brief, is_free"
    )
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "Couldn't load promotion packages." }, { status: 500 });
  }

  return NextResponse.json({ packages: data });
}
