import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";
import PendingTournamentsPanel from "@/components/admin/PendingTournamentsPanel";
import TournamentsSectionPanel from "@/components/admin/TournamentsSectionPanel";

export default async function AdminTournamentsPage() {
  const db = supabaseAdmin();

  const [{ data: pending }, { data: live }, { data: completed }, { data: other }] =
    await Promise.all([
      db
        .from("tournaments")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: true }),
      db
        .from("tournaments")
        .select("*")
        .eq("status", "live")
        .order("start_date", { ascending: true }),
      db
        .from("tournaments")
        .select("*")
        .eq("status", "completed")
        .order("start_date", { ascending: false }),
      db
        .from("tournaments")
        .select("*")
        .in("status", ["rejected", "cancelled"])
        .order("created_at", { ascending: false }),
    ]);

  const allIds = [
    ...(pending || []),
    ...(live || []),
    ...(completed || []),
    ...(other || []),
  ].map((t) => t.id);

  const playersCount = {};
  if (allIds.length) {
    const { data: allRegistrations } = await db
      .from("registrations")
      .select("tournament_id")
      .in("tournament_id", allIds);
    for (const r of allRegistrations || []) {
      playersCount[r.tournament_id] = (playersCount[r.tournament_id] || 0) + 1;
    }
  }

  return (
    <>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Tournaments</h1>
        <Link href="/admin/tournaments/new" className="btn btn-primary admin-add-btn">
          + Add tournament
        </Link>
      </div>

      <PendingTournamentsPanel tournaments={pending || []} playersCount={playersCount} />

      <TournamentsSectionPanel
        kind="live"
        title="Live"
        tournaments={live || []}
        playersCount={playersCount}
      />

      <TournamentsSectionPanel
        kind="completed"
        title="Completed"
        tournaments={completed || []}
        playersCount={playersCount}
      />

      <TournamentsSectionPanel
        kind="other"
        title="Rejected / cancelled"
        tournaments={other || []}
        playersCount={playersCount}
      />
    </>
  );
}
