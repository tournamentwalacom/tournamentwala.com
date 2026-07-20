import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * Not gated by middleware.js (its matcher excludes /api/*), so ownership is
 * verified here with the service-role client: an organizer may only see
 * registrations for tournaments they posted themselves, since the
 * "registrations" table's RLS only lets a player read their own rows.
 */
export async function GET(request, { params }) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;
  const db = supabaseAdmin();

  const { data: tournament } = await db
    .from("tournaments")
    .select("id, organizer_user_id")
    .eq("id", id)
    .maybeSingle();

  if (!tournament || tournament.organizer_user_id !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data, error } = await db
    .from("registrations")
    .select("id, player_name, player_phone, city, pincode, sport, wants_updates, created_at")
    .eq("tournament_id", id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Couldn't load registered players" }, { status: 500 });
  }

  return NextResponse.json({ registrations: data });
}
