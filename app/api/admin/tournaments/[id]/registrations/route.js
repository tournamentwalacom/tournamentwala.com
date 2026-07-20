import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * This route is NOT covered by middleware.js's admin host/session gate —
 * that matcher explicitly excludes /api/*. So the session check happens
 * here, the same way middleware.js does it.
 */
export async function GET(request, { params }) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;
  const { data, error } = await supabaseAdmin()
    .from("registrations")
    .select("id, player_name, player_phone, city, pincode, sport, wants_updates, created_at")
    .eq("tournament_id", id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Couldn't load registered players" }, { status: 500 });
  }

  return NextResponse.json({ registrations: data });
}
