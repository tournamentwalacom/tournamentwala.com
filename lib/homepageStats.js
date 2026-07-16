import { supabaseAdmin } from "@/lib/supabase";

// Kept out of lib/tournaments.js on purpose: that module is imported by
// "use client" components (Hero, PostTournamentForm, ...) for its formatting
// helpers, and supabaseAdmin must never end up in a client bundle. This file
// is server-only, imported by app/page.jsx.

/** Live numbers for the homepage hero/organizer stats — counted across
 * "live" and "completed" tournaments only (pending/rejected/cancelled don't
 * count as "hosted"). Grows on its own as tournaments are approved/played,
 * no manual updates needed. Uses the service-role client because completed
 * tournaments aren't readable under the public RLS policy (status = 'live'
 * only), so the anon client would undercount once tournaments finish. */
export async function getHomepageStats() {
  const { data, error } = await supabaseAdmin()
    .from("tournaments")
    .select("prize_pool, total_teams")
    .in("status", ["live", "completed"]);

  if (error || !data) {
    return { tournamentsHosted: 0, prizesPaidOut: 0, totalTeams: 0 };
  }

  return {
    tournamentsHosted: data.length,
    prizesPaidOut: data.reduce((sum, t) => sum + Number(t.prize_pool || 0), 0),
    totalTeams: data.reduce((sum, t) => sum + Number(t.total_teams || 0), 0),
  };
}
