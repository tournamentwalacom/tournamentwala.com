import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * This route is NOT covered by middleware.js's admin host/session gate —
 * that matcher explicitly excludes /api/*. So the session check happens
 * here, the same way middleware.js does it.
 */
export async function DELETE(request, { params }) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;
  const db = supabaseAdmin();

  // tournaments.organizer_user_id has no ON DELETE cascade/set-null, so
  // deleting the auth user while they still have tournaments would fail
  // the FK constraint. Detach their tournaments (organizer_name is stored
  // separately on each row, so the tournament data itself isn't lost).
  const { error: detachError } = await db
    .from("tournaments")
    .update({ organizer_user_id: null })
    .eq("organizer_user_id", id);

  if (detachError) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }

  // profiles.id references auth.users(id) on delete cascade, so deleting
  // the auth user also removes their profile row.
  const { error } = await db.auth.admin.deleteUser(id);

  if (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
