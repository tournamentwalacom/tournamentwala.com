import { supabase } from "@/lib/supabase";

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
  const { data, error } = await supabase
    .from("tournaments")
    .select("sport, city")
    .eq("status", "live");

  if (error || !data) {
    return { sports: [], cities: [] };
  }

  return {
    sports: countBy(data, "sport"),
    cities: countBy(data, "city"),
  };
}

export async function getLiveTournaments({ sport, city } = {}) {
  let query = supabase
    .from("tournaments")
    .select("*")
    .eq("status", "live")
    .order("start_date", { ascending: true });

  if (sport) query = query.eq("sport", sport);
  if (city) query = query.eq("city", city);

  const { data, error } = await query;
  if (error || !data) return [];
  return data;
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
