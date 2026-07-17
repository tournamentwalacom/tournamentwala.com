import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

const PHONE_RE = /^[0-9+()\-\s]{7,20}$/;

function trimmed(value, maxLength) {
  if (typeof value !== "string") return null;
  const t = value.trim();
  if (!t || t.length > maxLength) return null;
  return t;
}

export async function POST(request) {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const full_name = trimmed(body.full_name, 80);
  const phone = trimmed(body.phone, 20);

  if (!full_name || !phone || !PHONE_RE.test(phone)) {
    return NextResponse.json(
      { error: "Please enter your name and a valid phone number." },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("profiles")
    .update({ full_name, phone, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json(
      { error: "Couldn't save your details. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
