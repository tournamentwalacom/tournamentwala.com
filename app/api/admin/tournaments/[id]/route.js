import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * This route is NOT covered by middleware.js's admin host/session gate —
 * that matcher explicitly excludes /api/*. So the session check happens
 * here, the same way middleware.js does it, or this endpoint would be
 * callable by anyone on the public domain without logging in.
 */
async function requireAdminSession() {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  return token ? await verifySessionToken(token) : null;
}

export async function PATCH(request, { params }) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;
  const body = await request.json().catch(() => null);
  const action = body?.action;

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
