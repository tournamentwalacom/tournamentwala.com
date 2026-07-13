import { supabaseAdmin } from "@/lib/supabase";

async function getLiveTournamentCount() {
  try {
    const { count, error } = await supabaseAdmin()
      .from("tournaments")
      .select("*", { count: "exact", head: true })
      .eq("status", "live");

    if (error) throw error;
    return count;
  } catch {
    return null;
  }
}

export default async function AdminDashboardPage() {
  const liveTournaments = await getLiveTournamentCount();

  return (
    <>
      <h1 className="admin-page-title">Overview</h1>
      <div className="admin-card-grid">
        <div className="admin-card">
          <h3>Live tournaments</h3>
          <div className="stat">{liveTournaments ?? "—"}</div>
        </div>
        <div className="admin-card">
          <h3>Registered users</h3>
          <div className="stat">—</div>
        </div>
        <div className="admin-card">
          <h3>Organizers</h3>
          <div className="stat">—</div>
        </div>
        <div className="admin-card">
          <h3>Pending payouts</h3>
          <div className="stat">—</div>
        </div>
      </div>
    </>
  );
}
