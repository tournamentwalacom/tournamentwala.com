// Shared between the public organizer submission route and the admin
// create/update routes so validation rules only live in one place.

const STATUSES = new Set(["pending", "live", "rejected", "completed", "cancelled"]);
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const PINCODE_RE = /^\d{6}$/;
const TIME_RE = /^\d{1,2}:\d{2}/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REGISTRATION_STATUSES = new Set(["open", "closing_soon", "closed"]);
const GENDER_TAGS = new Set(["men", "women", "mixed"]);
const BRIEF_MODES = new Set(["structured", "freeform"]);

function trimmed(value, maxLength) {
  if (typeof value !== "string") return null;
  const t = value.trim();
  if (!t || t.length > maxLength) return null;
  return t;
}

function trimmedUrl(value) {
  const t = trimmed(value, 500);
  if (!t) return null;
  try {
    const url = new URL(t);
    return url.protocol === "http:" || url.protocol === "https:" ? t : null;
  } catch {
    return null;
  }
}

function positiveNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

// Returns undefined on an invalid (non-empty, non-whole-number) input so the
// caller can tell "left blank" (null) apart from "typed something bad".
function optionalNonNegativeInt(value) {
  if (value === undefined || value === null || value === "") return null;
  const n = Number(value);
  return Number.isInteger(n) && n >= 0 ? n : undefined;
}

// The poster/reel brief fields below are all optional at the API level —
// the public form enforces its own "required" fields client-side depending
// on whether a brief is even needed (Poster Design / Reel Creation
// selected). Here we just make sure whatever was sent is well-formed,
// silently dropping (-> null) anything blank or malformed rather than
// rejecting the whole submission over an optional design-brief detail.
function optionalDate(value) {
  return typeof value === "string" && DATE_RE.test(value) ? value : null;
}

function optionalTime(value) {
  const t = trimmed(value, 20);
  return t && TIME_RE.test(t) ? t : null;
}

function optionalEmail(value) {
  const t = trimmed(value, 200);
  return t && EMAIL_RE.test(t) ? t : null;
}

function optionalEnum(value, allowed) {
  return typeof value === "string" && allowed.has(value) ? value : null;
}

function optionalPositiveNumber(value) {
  if (value === undefined || value === null || value === "") return null;
  return positiveNumber(value);
}

/**
 * Parses + validates a raw tournament payload (from a form/API body) into a
 * clean row shape ready for Supabase insert/update. Returns
 * { data, error } — data is null when error is set.
 */
export function parseTournamentInput(body) {
  const name = trimmed(body.name, 120);
  const sport = trimmed(body.sport, 60);
  const city = trimmed(body.city, 60);
  const venue = trimmed(body.venue, 160);
  const address = trimmed(body.address, 300);
  const pincode =
    typeof body.pincode === "string" && PINCODE_RE.test(body.pincode.trim())
      ? body.pincode.trim()
      : null;
  const format = trimmed(body.format, 160);
  const image_url = trimmedUrl(body.image_url);
  const organizer_name = trimmed(body.organizer_name, 80);
  const organizer_phone = trimmed(body.organizer_phone, 20);
  const instagram_id =
    typeof body.instagram_id === "string"
      ? trimmed(body.instagram_id.replace(/^@/, ""), 60)
      : null;
  const entry_fee_amount = positiveNumber(body.entry_fee_amount);
  const prize_pool = positiveNumber(body.prize_pool);
  const hot = Boolean(body.hot);
  const announce = Boolean(body.announce);
  const slots_left = optionalNonNegativeInt(body.slots_left);
  const status = STATUSES.has(body.status) ? body.status : null;

  const start_date =
    typeof body.start_date === "string" && DATE_RE.test(body.start_date)
      ? body.start_date
      : null;

  // Poster/reel design-brief fields (see PostTournamentForm's "9. Poster /
  // reel details" section) — only collected when the organizer selected a
  // package that needs one, and all optional here.
  const description = trimmed(body.description, 500);
  const banner_url = trimmedUrl(body.banner_url);
  const whatsapp_number = trimmed(body.whatsapp_number, 20);
  const organizer_email = optionalEmail(body.organizer_email);
  const organizer_website = trimmedUrl(body.organizer_website);
  const google_maps_link = trimmedUrl(body.google_maps_link);
  const end_date = optionalDate(body.end_date);
  const registration_last_date = optionalDate(body.registration_last_date);
  const reporting_time = optionalTime(body.reporting_time);
  const start_time = optionalTime(body.start_time);
  const team_size = trimmed(body.team_size, 40);
  const max_teams = optionalNonNegativeInt(body.max_teams);
  const ball_type = trimmed(body.ball_type, 60);
  const second_prize = optionalPositiveNumber(body.second_prize);
  const third_prize = optionalPositiveNumber(body.third_prize);
  const other_awards = trimmed(body.other_awards, 200);
  const registration_link = trimmedUrl(body.registration_link);
  const registration_qr_url = trimmedUrl(body.registration_qr_url);
  const registration_status = optionalEnum(body.registration_status, REGISTRATION_STATUSES);
  const tournament_type_tag = trimmed(body.tournament_type_tag, 60);
  const gender_tag = optionalEnum(body.gender_tag, GENDER_TAGS);
  const promo_brief_mode = optionalEnum(body.promo_brief_mode, BRIEF_MODES);
  const promo_brief_text = trimmed(body.promo_brief_text, 4000);

  if (
    !name ||
    !sport ||
    !city ||
    !venue ||
    !address ||
    !pincode ||
    !format ||
    !start_date ||
    !organizer_name ||
    !organizer_phone ||
    !instagram_id ||
    !image_url ||
    entry_fee_amount === null ||
    prize_pool === null ||
    slots_left === undefined ||
    max_teams === undefined
  ) {
    return { data: null, error: "Please fill in all required fields correctly." };
  }

  return {
    data: {
      name,
      sport,
      city,
      venue,
      address,
      pincode,
      format,
      image_url,
      entry_fee_amount,
      entry_fee_unit: "team",
      prize_pool,
      start_date,
      organizer_name,
      organizer_phone,
      instagram_id,
      hot,
      announce,
      slots_left,
      status,
      description,
      banner_url,
      whatsapp_number,
      organizer_email,
      organizer_website,
      google_maps_link,
      end_date,
      registration_last_date,
      reporting_time,
      start_time,
      team_size,
      max_teams,
      ball_type,
      second_prize,
      third_prize,
      other_awards,
      registration_link,
      registration_qr_url,
      registration_status,
      tournament_type_tag,
      gender_tag,
      promo_brief_mode,
      promo_brief_text,
    },
    error: null,
  };
}
