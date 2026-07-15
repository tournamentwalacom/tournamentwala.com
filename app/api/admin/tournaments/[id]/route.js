import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { parseTournamentInput } from "@/lib/tournamentValidation";
import { geocodePincode } from "@/lib/geocode";

/**
 * This route is NOT covered by middleware.js's admin host/session gate —
 * that matcher explicitly excludes /api/*. So the session check happens
 * here, the same way middleware.js does it, or this endpoint would be
 * callable by anyone on the public domain without logging in.
 */

export async function PATCH(request, { params }) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;
  const body = await request.json().catch(() => null);
  const action = body?.action;

  if (action === "update") {
    const { data, error: validationError } = parseTournamentInput(body?.fields || {});
    if (!data) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const status = data.status || "pending";

    // Re-geocode on every edit — cheap since edits are rare, and keeps
    // coordinates in sync if the organizer/admin changed the pincode.
    const coords = await geocodePincode(data.pincode);

    const { error } = await supabaseAdmin()
      .from("tournaments")
      .update({
        ...data,
        latitude: coords?.latitude ?? null,
        longitude: coords?.longitude ?? null,
        status,
      })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  }

  if (action !== "approve" && action !== "reject") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const update =
    action === "approve"
      ? { status: "live", reviewed_at: new Date().toISOString() }
      : {
          status: "rejected",
          reviewed_at: new Date().toISOString(),
          rejection_reason:
            typeof body?.rejection_reason === "string"
              ? body.rejection_reason.slice(0, 300)
              : null,
        };

  const { error } = await supabaseAdmin()
    .from("tournaments")
    .update(update)
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request, { params }) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;
  const { error } = await supabaseAdmin().from("tournaments").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
