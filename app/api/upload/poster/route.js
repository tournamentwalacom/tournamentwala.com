import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/supabaseServer";
import { requireAdminSession } from "@/lib/auth";
import { checkRateLimit, clientIp } from "@/lib/rateLimit";

// Used by both the public organizer submission form and the admin add/edit
// form — both of those pages already require the caller to be signed in
// (organizer or admin session) before this component is ever reached, so
// this route requires the same rather than accepting uploads from anyone.
const BUCKET = "tournament-posters";
const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

// Declared Content-Type is client-supplied and spoofable, so the real file
// signature is checked too — each entry's bytes must appear at the start of
// the file for that type to be accepted.
const MAGIC_BYTES = {
  "image/jpeg": [[0xff, 0xd8, 0xff]],
  "image/png": [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  // WEBP: "RIFF" .... "WEBP" — the middle 4 bytes are a file-size field, so
  // only the two fixed markers are checked.
  "image/webp": [[0x52, 0x49, 0x46, 0x46]],
};

function matchesMagicBytes(bytes, type) {
  const signatures = MAGIC_BYTES[type];
  return signatures.some((sig) => sig.every((byte, i) => bytes[i] === byte));
}

export async function POST(request) {
  const [organizer, admin] = await Promise.all([getCurrentUser(), requireAdminSession()]);
  if (!organizer && !admin) {
    return NextResponse.json({ error: "Please sign in to upload a file." }, { status: 401 });
  }

  const db = supabaseAdmin();
  const withinLimit = await checkRateLimit(db, {
    key: `poster_upload:${clientIp(request)}`,
    limit: 20,
    windowSeconds: 60 * 60,
  });
  if (!withinLimit) {
    return NextResponse.json(
      { error: "Too many uploads. Please try again later." },
      { status: 429 }
    );
  }

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

  const bytes = await file.arrayBuffer();
  const header = new Uint8Array(bytes.slice(0, 12));
  if (!matchesMagicBytes(header, file.type)) {
    return NextResponse.json(
      { error: "That file doesn't look like a valid image." },
      { status: 400 }
    );
  }

  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await db
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
  } = db.storage.from(BUCKET).getPublicUrl(path);

  return NextResponse.json({ url: publicUrl }, { status: 201 });
}
