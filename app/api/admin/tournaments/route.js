import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { parseTournamentInput } from "@/lib/tournamentValidation";
import { geocodePincode } from "@/lib/geocode";

/**
 * This route is NOT covered by middleware.js's admin host/session gate —
 * that matcher explicitly excludes /api/*. So the session check happens
 * here, the same way middleware.js does it.
 */
export async function POST(request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { data, error: validationError } = parseTournamentInput(body);
  if (!data) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  // Admin-added tournaments don't need self-review — default to live unless
  // the form explicitly picked a different status.
  const status = data.status || "live";

  // The "Auto-fill details" button (see admin/TournamentForm.jsx) resolves
  // precise coordinates from the pasted Google Maps venue link client-side —
  // far more accurate than a pincode's postal-area centroid. Pincode
  // geocoding only kicks in as a fallback if that's somehow missing.
  const { latitude, longitude, ...rest } = data;
  const coords =
    latitude != null && longitude != null
      ? { latitude, longitude }
      : await geocodePincode(rest.pincode);

  const { error } = await supabaseAdmin()
    .from("tournaments")
    .insert({
      ...rest,
      latitude: coords?.latitude ?? null,
      longitude: coords?.longitude ?? null,
      status,
      reviewed_at: status === "live" ? new Date().toISOString() : null,
    });

  if (error) {
    console.error("Failed to insert tournament:", error);
    return NextResponse.json(
      { error: "Couldn't save the tournament. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
