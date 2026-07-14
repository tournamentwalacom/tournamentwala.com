import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// Used by both the public organizer submission form and the admin add/edit
// form, so this stays unauthenticated like /api/tournaments/submit — the
// file itself never touches the tournaments table until the form it belongs
// to is submitted.
const BUCKET = "tournament-posters";
const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function POST(request) {
  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  }

  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    return NextResponse.json(
      { error: "Poster must be a JPEG, PNG, or WEBP image." },
      { status: 400 }
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Poster must be smaller than 8MB." },
      { status: 400 }
    );
  }

  const path = `${crypto.randomUUID()}.${ext}`;
  const bytes = await file.arrayBuffer();

  const { error } = await supabaseAdmin()
    .storage.from(BUCKET)
    .upload(path, bytes, { contentType: file.type });

  if (error) {
    return NextResponse.json(
      { error: "Couldn't upload the poster. Please try again." },
      { status: 500 }
    );
  }

  const {
    data: { publicUrl },
  } = supabaseAdmin().storage.from(BUCKET).getPublicUrl(path);

  return NextResponse.json({ url: publicUrl }, { status: 201 });
}
