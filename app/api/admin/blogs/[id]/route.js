import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { parseBlogInput } from "@/lib/blogs";

/**
 * This route is NOT covered by middleware.js's admin host/session gate —
 * that matcher explicitly excludes /api/*. So the session check happens
 * here, the same way middleware.js does it.
 */
export async function PATCH(request, { params }) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;
  const body = await request.json().catch(() => null);

  const { data, error: validationError } = parseBlogInput(body?.fields || {});
  if (!data) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const db = supabaseAdmin();

  // Only stamp published_at the first time a post goes live, so re-saving
  // an already-published post doesn't bump it back to the top of the feed.
  let published_at = null;
  if (data.status === "published") {
    const { data: existing } = await db
      .from("blogs")
      .select("published_at")
      .eq("id", id)
      .maybeSingle();
    published_at = existing?.published_at || new Date().toISOString();
  }

  const { error } = await db
    .from("blogs")
    .update({ ...data, published_at, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "That slug is already in use. Please choose another." },
        { status: 400 }
      );
    }
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
  const { error } = await supabaseAdmin().from("blogs").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
