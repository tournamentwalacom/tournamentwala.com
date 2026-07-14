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

// Shown on the homepage whenever the real "tournaments" table has no live
// rows yet (e.g. a fresh Supabase project) so the ticket layout isn't
// staring back at an empty state before organizers start posting.
export const FALLBACK_TOURNAMENTS = [
  {
    id: "sample-cricket",
    sport: "Cricket",
    tag: "Filling fast",
    hot: true,
    name: "Indiranagar Titans Cup",
    venue: "HAL Ground",
    city: "Bengaluru",
    format: "T10",
    date_note: "Sat–Sun · 19–20 Jul",
    start_time: "09:00",
    entry_fee_amount: 2500,
    entry_fee_unit: "team",
    advance_amount: 1000,
    prize_pool: 150000,
    first_prize: 100000,
    second_prize: 40000,
    description:
      "Indiranagar's marquee weekend T10 knockout is back for another season. Sixteen teams, one ground, two days of floodlit cricket — bring your squad of 11 (+3 subs) and battle it out on HAL Ground's freshly rolled turf pitch. Umpires, scorers and a live scoreboard are arranged by the organizer; teams just need to show up padded up and on time.",
    rules:
      "16 teams, single elimination knockout\nSquad of 11 + 3 substitutes\nTennis ball, T10 format (10 overs a side)\nMax 2 overs per bowler\nOne umpire-appointed match referee per game\nTeams must report 30 minutes before their slot",
    trophy_details:
      "Winning team gets the Titans Cup trophy plus 11 gold-plated winner medals. Runners-up receive the silver mini-cup and 11 medals. Player of the Series gets a custom bat.",
    other_contact: "Tournament WhatsApp group: shared after registration · Ground manager (matchday only): +91 98111 22233",
    organizer_name: "Titans Sports Club",
    organizer_phone: "+919876543210",
  },
  {
    id: "sample-badminton",
    sport: "Badminton",
    tag: "Doubles",
    name: "Bengaluru Smash Open",
    venue: "Kanteerava Indoor Stadium",
    city: "Bengaluru",
    format: "Doubles",
    date_note: "Sat · 26 Jul",
    entry_fee_amount: 800,
    entry_fee_unit: "pair",
    prize_pool: 40000,
  },
  {
    id: "sample-football",
    sport: "Football",
    name: "Pune Monsoon Cup",
    venue: "Balewadi Stadium",
    city: "Pune",
    format: "7-a-side",
    date_note: "Sat–Sun · 2–3 Aug",
    entry_fee_amount: 5000,
    entry_fee_unit: "team",
    prize_pool: 200000,
  },
  {
    id: "sample-football-2",
    sport: "Football",
    tag: "Filling fast",
    hot: true,
    name: "Bengaluru Turf League",
    venue: "Sports Village Turf",
    city: "Bengaluru",
    format: "5-a-side",
    date_note: "Sat · 9 Aug",
    entry_fee_amount: 3500,
    entry_fee_unit: "team",
    prize_pool: 80000,
  },
  {
    id: "sample-football-3",
    sport: "Football",
    name: "Chennai Coastal Cup",
    venue: "YMCA Nandanam Ground",
    city: "Chennai",
    format: "7-a-side",
    date_note: "Sun · 17 Aug",
    entry_fee_amount: 4000,
    entry_fee_unit: "team",
    prize_pool: 120000,
  },
  {
    id: "sample-football-4",
    sport: "Football",
    name: "Kochi Backwater Cup",
    venue: "Jawaharlal Nehru Stadium",
    city: "Kochi",
    format: "7-a-side",
    date_note: "Sat · 23 Aug",
    entry_fee_amount: 4500,
    entry_fee_unit: "team",
    prize_pool: 100000,
  },
  {
    id: "sample-kabaddi",
    sport: "Kabaddi",
    name: "Delhi Dangal League",
    venue: "Thyagaraj Sports Complex",
    city: "Delhi NCR",
    format: "Standard",
    date_note: "Sun · 20 Jul",
    entry_fee_amount: 3000,
    entry_fee_unit: "team",
    prize_pool: 100000,
  },
  {
    id: "sample-esports",
    sport: "Esports (BGMI / Valorant / Free Fire)",
    tag: "Hot",
    hot: true,
    name: "Hyderabad LAN Qualifiers",
    venue: "Hitech City Arena",
    city: "Hyderabad",
    format: "Squad",
    date_note: "Fri–Sun · 25–27 Jul",
    entry_fee_amount: 500,
    entry_fee_unit: "squad",
    prize_pool: 75000,
  },
  {
    id: "sample-esports-2",
    sport: "Esports (BGMI / Valorant / Free Fire)",
    name: "Delhi BGMI Showdown",
    venue: "Online · Live Finals in Delhi",
    city: "Delhi NCR",
    format: "Squad",
    date_note: "Sat · 9 Aug",
    entry_fee_amount: 400,
    entry_fee_unit: "squad",
    prize_pool: 60000,
  },
  {
    id: "sample-esports-3",
    sport: "Esports (BGMI / Valorant / Free Fire)",
    tag: "Filling fast",
    name: "Mumbai Mobile Masters",
    venue: "Online · Live Finals in Mumbai",
    city: "Mumbai",
    format: "Squad",
    date_note: "Sun · 24 Aug",
    entry_fee_amount: 600,
    entry_fee_unit: "squad",
    prize_pool: 90000,
  },
  {
    id: "sample-esports-4",
    sport: "Esports (BGMI / Valorant / Free Fire)",
    name: "Chennai Valorant Clash",
    venue: "Online · Live Finals in Chennai",
    city: "Chennai",
    format: "5v5",
    date_note: "Sat · 30 Aug",
    entry_fee_amount: 800,
    entry_fee_unit: "squad",
    prize_pool: 70000,
  },
  {
    id: "sample-pickleball-1",
    sport: "Pickleball",
    tag: "New",
    hot: true,
    name: "Bengaluru Pickle Slam",
    venue: "Smashers Pickleball Arena",
    city: "Bengaluru",
    format: "Doubles",
    date_note: "Sat · 2 Aug",
    entry_fee_amount: 1000,
    entry_fee_unit: "pair",
    prize_pool: 30000,
  },
  {
    id: "sample-pickleball-2",
    sport: "Pickleball",
    name: "Pune Paddle Open",
    venue: "Balewadi Sports Complex",
    city: "Pune",
    format: "Mixed Doubles",
    date_note: "Sun · 10 Aug",
    entry_fee_amount: 900,
    entry_fee_unit: "pair",
    prize_pool: 25000,
  },
  {
    id: "sample-pickleball-3",
    sport: "Pickleball",
    tag: "Filling fast",
    name: "Hyderabad Dink Fest",
    venue: "Gachibowli Indoor Stadium",
    city: "Hyderabad",
    format: "Doubles",
    date_note: "Sat · 16 Aug",
    entry_fee_amount: 1200,
    entry_fee_unit: "pair",
    prize_pool: 35000,
  },
  {
    id: "sample-pickleball-4",
    sport: "Pickleball",
    name: "Chennai Court Clash",
    venue: "SDAT Tennis Stadium",
    city: "Chennai",
    format: "Doubles",
    date_note: "Sun · 24 Aug",
    entry_fee_amount: 1000,
    entry_fee_unit: "pair",
    prize_pool: 28000,
  },
  {
    id: "sample-chess",
    sport: "Chess",
    name: "Mumbai Rapid Sunday",
    venue: "NSCI Dome",
    city: "Mumbai",
    format: "Rapid",
    date_note: "Sun · 27 Jul",
    entry_fee_amount: 300,
    entry_fee_unit: "player",
    prize_pool: 25000,
  },
];

// Used as the Register number for sample/demo tournaments (shown only when
// the live table has no rows yet) so the button has somewhere to go before
// any real organizer data exists. Clearly a placeholder, not a real line.
export const DEMO_ORGANIZER_PHONE = "+919000000000";

export async function getTournamentById(id) {
  const { data, error } = await supabase
    .from("tournaments")
    .select("*")
    .eq("id", id)
    .eq("status", "live")
    .maybeSingle();

  if (!error && data) return data;

  return FALLBACK_TOURNAMENTS.find((t) => t.id === id) || null;
}

/** tel: href for the Register button — the organizer's own number for real
 * listings, a placeholder for the sample tournaments. */
export function getRegisterPhoneHref(tournament) {
  const phone = tournament.organizer_phone || DEMO_ORGANIZER_PHONE;
  return `tel:${phone.replace(/[^+\d]/g, "")}`;
}

export function getTournamentDescription(tournament) {
  if (tournament.description) return tournament.description;

  const fee = formatEntryFee(tournament);
  const prize = formatPrize(tournament);
  const formatBit = tournament.format ? ` ${tournament.format} format,` : "";

  return `${tournament.name} brings together teams and players in ${tournament.city} for a${formatBit} ${tournament.sport.toLowerCase()} competition at ${tournament.venue}. Entry is ${fee}, and the winning side takes a share of the ${prize} prize pool. Call the organizer using the Register button below to lock in your spot — slots go fast once a tournament starts filling up.`;
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
