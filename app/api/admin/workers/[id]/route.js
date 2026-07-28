import { NextResponse } from "next/server";
import { requireOwnerSession } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { supabaseAdmin } from "@/lib/supabase";
import { ADMIN_PERMISSION_KEYS } from "@/lib/permissions";

/**
 * This route is NOT covered by middleware.js's admin host/session gate —
 * that matcher explicitly excludes /api/*. So the session check happens
 * here, the same way middleware.js does it. Worker management is
 * owner-only (requireOwnerSession, not just requireAdminSession).
 */
export async function PATCH(request, { params }) {
  const session = await requireOwnerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;
  const body = await request.json().catch(() => null);
  const fields = body?.fields || {};

  const update = { updated_at: new Date().toISOString() };

  if (Array.isArray(fields.permissions)) {
    update.permissions = fields.permissions.filter((key) => ADMIN_PERMISSION_KEYS.includes(key));
  }
  if (typeof fields.active === "boolean") {
    update.active = fields.active;
  }
  if (typeof fields.password === "string" && fields.password) {
    if (fields.password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }
    update.password_hash = hashPassword(fields.password);
  }

  const { error } = await supabaseAdmin().from("admin_workers").update(update).eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request, { params }) {
  const session = await requireOwnerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;
  const { error } = await supabaseAdmin().from("admin_workers").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
