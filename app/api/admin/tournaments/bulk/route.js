import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { sendNotificationEmail, renderEmailLayout } from "@/lib/email";

/**
 * Bulk actions (approve/reject/unpublish/delete) for the admin tournaments
 * list. Not covered by middleware.js's admin gate (that matcher excludes
 * /api/*), so the session check is duplicated here — same as the
 * single-tournament route.
 */

export async function PATCH(request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const ids = Array.isArray(body?.ids)
    ? body.ids.filter((id) => typeof id === "string" && id)
    : [];
  const action = body?.action;

  if (!ids.length) {
    return NextResponse.json({ error: "No tournaments selected" }, { status: 400 });
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
    .in("id", ids)
    .select("name, organizer_name");

  if (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  // Best-effort — a notification failure shouldn't fail the approval itself.
  if (action === "approve") {
    await Promise.allSettled(
      (updated || []).map((t) =>
        sendNotificationEmail({
          subject: `Tournament approved & live: ${t.name}`,
          html: renderEmailLayout({
            heading: "Tournament approved & live",
            rows: [
              { label: "Name", value: t.name },
              { label: "Organizer", value: t.organizer_name },
            ],
          }),
        })
      )
    );
  }

  return NextResponse.json({ ok: true, count: updated?.length || 0 });
}

export async function DELETE(request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const ids = Array.isArray(body?.ids)
    ? body.ids.filter((id) => typeof id === "string" && id)
    : [];

  if (!ids.length) {
    return NextResponse.json({ error: "No tournaments selected" }, { status: 400 });
  }

  const { error } = await supabaseAdmin().from("tournaments").delete().in("id", ids);

  if (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
