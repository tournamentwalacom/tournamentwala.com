import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { parseTournamentInput } from "@/lib/tournamentValidation";
import { geocodePincode } from "@/lib/geocode";
import { sendNotificationEmail, renderEmailLayout } from "@/lib/email";

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

    // The "Auto-fill details" button (see admin/TournamentForm.jsx) resolves
    // precise coordinates from the pasted Google Maps venue link client-side.
    // Only falls back to re-geocoding the pincode if the link/coords weren't
    // resent (e.g. an old row edited without touching the map link field).
    const { latitude, longitude, ...rest } = data;
    const coords =
      latitude != null && longitude != null
        ? { latitude, longitude }
        : await geocodePincode(rest.pincode);

    const { error } = await supabaseAdmin()
      .from("tournaments")
      .update({
        ...rest,
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

  if (action !== "approve" && action !== "reject" && action !== "unpublish") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const update =
    action === "approve"
      ? { status: "live", reviewed_at: new Date().toISOString() }
      : action === "unpublish"
      ? { status: "pending", reviewed_at: null }
      : {
          status: "rejected",
          reviewed_at: new Date().toISOString(),
          rejection_reason:
            typeof body?.rejection_reason === "string"
              ? body.rejection_reason.slice(0, 300)
              : null,
        };

  const { data: updated, error } = await supabaseAdmin()
    .from("tournaments")
    .update(update)
    .eq("id", id)
    .select("name, organizer_name")
    .single();

  if (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  // Best-effort — a notification failure shouldn't fail the approval itself.
  if (action === "approve") {
    await sendNotificationEmail({
      subject: `Tournament approved & live: ${updated.name}`,
      html: renderEmailLayout({
        heading: "Tournament approved & live",
        rows: [
          { label: "Name", value: updated.name },
          { label: "Organizer", value: updated.organizer_name },
        ],
      }),
    });
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
