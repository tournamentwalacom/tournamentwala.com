import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { parsePricingPackageInput } from "@/lib/promotionPackages";

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
  const { data, error: validationError } = parsePricingPackageInput(body?.fields || {});
  if (!data) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const { error } = await supabaseAdmin()
    .from("promotion_packages")
    .update({ ...data, updated_at: new Date().toISOString() })
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
  const { error } = await supabaseAdmin().from("promotion_packages").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
