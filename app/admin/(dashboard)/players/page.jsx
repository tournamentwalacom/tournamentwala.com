import { supabaseAdmin } from "@/lib/supabase";
import PlayersList from "@/components/admin/PlayersList";

export default async function AdminPlayersPage() {
  const db = supabaseAdmin();
  const { data: registrations } = await db
    .from("registrations")
    .select("*")
    .order("created_at", { ascending: false });

  const all = registrations || [];

  return (
    <>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Players</h1>
      </div>

      <div className="admin-card-grid">
        <div className="admin-card">
          <h3>Total registrations</h3>
          <div className="stat">{all.length}</div>
        </div>
      </div>

      <PlayersList initialPlayers={all} />
    </>
  );
}
