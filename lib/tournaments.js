import { supabase } from "@/lib/supabase";
import { todayIST } from "@/lib/istDate";

// Belt-and-braces alongside the daily cron sweep (lib/completeTournaments.js)
// that flips expired tournaments to "completed": this keeps a tournament
// whose date has already arrived from showing up publicly even in the
// window before that day's sweep has run.
function excludeExpired(query) {
  const today = todayIST();
  return query.or(
    `and(end_date.is.null,start_date.gt.${today}),end_date.gt.${today}`
  );
}

// Canonical sport choices for the submission form + Hero picker. Organizers
// can also pick "Other" and type a new sport — once approved, it shows up
// in getFilterFacets() on its own, no code change needed.
export const SPORT_OPTIONS = [
  "Cricket",
  "Badminton",
  "Football",
  "Kabaddi",
  "Table Tennis",
  "Chess",
  "Volleyball",
  "Basketball",
  "Carrom",
  "Pickleball",
  "Esports (BGMI / Valorant / Free Fire)",
];

export const TOURNAMENT_FORMATS = [
  "League",
  "Knockout",
  "League + Knockout",
  "Round Robin",
];

// Used to tag a submission for search/filters, and (Corporate/College/etc.)
// to brief our design team when they're creating a poster or reel for it.
export const TOURNAMENT_TYPE_TAGS = [
  "Corporate",
  "Open",
  "College",
  "School",
  "Box Cricket",
  "Turf Cricket",
  "Football",
];

export const GENDER_TAGS = [
  { value: "men", label: "Men" },
  { value: "women", label: "Women" },
  { value: "mixed", label: "Mixed" },
];

export const REGISTRATION_STATUSES = [
  { value: "open", label: "Open" },
  { value: "closing_soon", label: "Closing Soon" },
  { value: "closed", label: "Closed" },
];

export const ENTRY_FEE_UNITS = [
  { value: "team", label: "per team" },
  { value: "pair", label: "per pair" },
  { value: "player", label: "per player" },
  { value: "squad", label: "per squad" },
];

const CITY_SUGGESTIONS = [
  "Bengaluru",
  "Mumbai",
  "Delhi NCR",
  "Pune",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Ahmedabad",
  "Jaipur",
  "Kochi",
];

export function getCitySuggestions() {
  return CITY_SUGGESTIONS;
}

// Used for the generated hero background on a tournament's detail page when
// the organizer hasn't supplied an image_url.
export const SPORT_ICONS = {
  Cricket: "🏏",
  Badminton: "🏸",
  Football: "⚽",
  Kabaddi: "🤼",
  "Table Tennis": "🏓",
  Chess: "♟️",
  Volleyball: "🏐",
  Basketball: "🏀",
  Carrom: "🎯",
  Pickleball: "🥒",
  "Esports (BGMI / Valorant / Free Fire)": "🎮",
};

export function getSportIcon(sport) {
  return SPORT_ICONS[sport] || "🏆";
}

function countBy(rows, key) {
  const counts = new Map();
  for (const row of rows) {
    const value = row[key];
    if (!value) continue;
    counts.set(value, (counts.get(value) || 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

/** Distinct sports/cities among live tournaments, with counts — this is what
 * makes the navbar dropdowns grow on their own as new tournaments go live. */
export async function getFilterFacets() {
  const { data, error } = await excludeExpired(
    supabase.from("tournaments").select("sport, city").eq("status", "live")
  );

  if (error || !data) {
    return { sports: [], cities: [] };
  }

  return {
    sports: countBy(data, "sport"),
    cities: countBy(data, "city"),
  };
}

export async function getTournamentById(id) {
  const { data } = await excludeExpired(
    supabase.from("tournaments").select("*").eq("id", id).eq("status", "live")
  ).maybeSingle();

  return data || null;
}

export async function getTournamentBySeq(seq) {
  const { data } = await excludeExpired(
    supabase
      .from("tournaments")
      .select("*")
      .eq("seq", seq)
      .eq("status", "live")
  ).maybeSingle();

  return data || null;
}

function slugifyPart(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** SEO-friendly tournament URL slug, e.g. "hell-in-a-cell-matrixx-turf-42".
 * Only the trailing number is used for lookup (see getTournamentBySeq) —
 * the name/organizer text is cosmetic, so it's safe even if they change. */
export function getTournamentSlug(tournament) {
  const parts = [tournament.name, tournament.organizer_name]
    .map(slugifyPart)
    .filter(Boolean);
  return `${parts.join("-")}-${tournament.seq}`;
}

/** Pulls the trailing number back out of a slug like
 * "hell-in-a-cell-matrixx-turf-42" -> 42. Returns null if there isn't one. */
export function getSeqFromSlug(slug) {
  const match = /-(\d+)$/.exec(slug || "");
  return match ? Number(match[1]) : null;
}

/** tel: href for the Register button. */
export function getRegisterPhoneHref(tournament) {
  return `tel:${tournament.organizer_phone.replace(/[^+\d]/g, "")}`;
}

export function getTournamentDescription(tournament) {
  if (tournament.description) return tournament.description;

  const fee = formatEntryFee(tournament);
  const prize = formatPrize(tournament);
  const formatBit = tournament.format ? ` ${tournament.format} format,` : "";

  return `${tournament.name} brings together teams and players in ${tournament.city} for a${formatBit} ${tournament.sport.toLowerCase()} competition at ${tournament.venue}. Entry is ${fee}, and the winning side takes a share of the ${prize} prize pool. Call the organizer using the Register button below to lock in your spot — slots go fast once a tournament starts filling up.`;
}

export async function getLiveTournaments({ sport, city } = {}) {
  let query = excludeExpired(
    supabase.from("tournaments").select("*").eq("status", "live")
  ).order("start_date", { ascending: true });

  if (sport) query = query.eq("sport", sport);
  if (city) query = query.eq("city", city);

  const { data, error } = await query;
  if (error || !data) return [];
  return data;
}

/** Live tournaments the admin has flagged with the "Announcement" checkbox —
 * these are what the homepage announcement bar (LiveTicker) shows. */
export async function getAnnouncedTournaments() {
  const { data, error } = await excludeExpired(
    supabase
      .from("tournaments")
      .select("*")
      .eq("status", "live")
      .eq("announce", true)
  ).order("start_date", { ascending: true });

  if (error || !data) return [];
  return data;
}

/** Whole days between today (IST) and a tournament's start_date — 0 on the
 * day it starts, negative once it's underway (multi-day events still pass
 * excludeExpired until their end_date). */
export function getDaysLeft(tournament) {
  const today = new Date(`${todayIST()}T00:00:00`);
  const start = new Date(`${tournament.start_date}T00:00:00`);
  return Math.round((start - today) / 86400000);
}

/** "3 days left" / "starts tomorrow" / "starts today" / "underway" — used by
 * the homepage announcement bar. */
export function formatDaysLeft(tournament) {
  const days = getDaysLeft(tournament);
  if (days > 1) return `${days} days left`;
  if (days === 1) return "starts tomorrow";
  if (days === 0) return "starts today";
  return "underway";
}

const WEEKDAY = { weekday: "short" };
const DAY_MONTH = { day: "numeric", month: "short" };

export function formatDateRange(tournament) {
  if (tournament.date_note) return tournament.date_note;

  const start = new Date(`${tournament.start_date}T00:00:00`);
  const end = tournament.end_date
    ? new Date(`${tournament.end_date}T00:00:00`)
    : null;

  if (!end || end.getTime() === start.getTime()) {
    const dow = start.toLocaleDateString("en-IN", WEEKDAY);
    const day = start.toLocaleDateString("en-IN", DAY_MONTH);
    return `${dow} · ${day}`;
  }

  const startDow = start.toLocaleDateString("en-IN", WEEKDAY);
  const endDow = end.toLocaleDateString("en-IN", WEEKDAY);
  const sameMonth = start.getMonth() === end.getMonth();

  if (sameMonth) {
    const month = start.toLocaleDateString("en-IN", { month: "short" });
    return `${startDow}–${endDow} · ${start.getDate()}–${end.getDate()} ${month}`;
  }

  const startLabel = start.toLocaleDateString("en-IN", DAY_MONTH);
  const endLabel = end.toLocaleDateString("en-IN", DAY_MONTH);
  return `${startDow} ${startLabel} – ${endDow} ${endLabel}`;
}

export function formatEntryFee(tournament) {
  const amount = Number(tournament.entry_fee_amount || 0).toLocaleString(
    "en-IN"
  );
  const unitLabel =
    ENTRY_FEE_UNITS.find((u) => u.value === tournament.entry_fee_unit)
      ?.label ?? `per ${tournament.entry_fee_unit}`;
  return `₹${amount} / ${unitLabel.replace("per ", "")}`;
}

export function formatPrize(tournament) {
  return `₹${Number(tournament.prize_pool || 0).toLocaleString("en-IN")}`;
}

function formatMoney(amount) {
  return `₹${Number(amount).toLocaleString("en-IN")}`;
}

export function formatAdvance(tournament) {
  return tournament.advance_amount ? formatMoney(tournament.advance_amount) : null;
}

export function formatFirstPrize(tournament) {
  return tournament.first_prize ? formatMoney(tournament.first_prize) : null;
}

export function formatSecondPrize(tournament) {
  return tournament.second_prize ? formatMoney(tournament.second_prize) : null;
}

/** "14:30" (24h, from an <input type="time">) -> "2:30 PM". Falls back to
 * whatever was stored if it isn't in that shape. */
export function formatStartTime(tournament) {
  const raw = tournament.start_time;
  if (!raw) return null;

  const match = /^(\d{1,2}):(\d{2})/.exec(raw);
  if (!match) return raw;

  const hour24 = Number(match[1]);
  const minute = match[2];
  const period = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 || 12;
  return `${hour12}:${minute} ${period}`;
}

/** Rules are stored as free text, one rule per line — split into a clean
 * bullet list for display, dropping blank lines. */
export function getRulesList(tournament) {
  if (!tournament.rules) return [];
  return tournament.rules
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

// Shown in the portrait image slot on a tournament's detail page whenever
// the organizer hasn't supplied their own image_url.
export const PLACEHOLDER_TOURNAMENT_IMAGE =
  "/images/tournament-images/hell%20in%20a%20cell.jpeg";
