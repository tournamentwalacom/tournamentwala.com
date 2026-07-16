import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { parseDiscountInput } from "@/lib/promotionPackages";

/**
 * This route is NOT covered by middleware.js's admin host/session gate —
 * that matcher explicitly excludes /api/*. So the session check happens
 * here, the same way middleware.js does it, or this endpoint would be
 * callable by anyone on the public domain without logging in.
 */

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin()
    .from("promotion_discount")
    .select("message, percentage, is_active")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "Couldn't load discount settings." }, { status: 500 });
  }

  return NextResponse.json({
    discount: data || { message: null, percentage: 0, is_active: false },
  });
}

export async function PATCH(request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { data, error: validationError } = parseDiscountInput(body);
  if (!data) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const { error } = await supabaseAdmin()
    .from("promotion_discount")
    .upsert({ id: 1, ...data, updated_at: new Date().toISOString() });

  if (error) {
    return NextResponse.json({ error: "Couldn't save discount settings." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
