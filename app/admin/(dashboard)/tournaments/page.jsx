import { supabaseAdmin } from "@/lib/supabase";
import { formatEntryFee, formatPrize } from "@/lib/tournaments";
import TournamentReviewRow from "@/components/admin/TournamentReviewRow";

export default async function AdminTournamentsPage() {
  const db = supabaseAdmin();

  const [{ data: pending }, { data: live }] = await Promise.all([
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
  ]);

  return (
    <>
      <h1 className="admin-page-title">Tournaments</h1>

      <h2 className="admin-section-title">
        Pending review {pending?.length ? `(${pending.length})` : ""}
      </h2>
      {!pending?.length ? (
        <div className="admin-placeholder">Nothing waiting on review.</div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Tournament</th>
              <th>Venue</th>
              <th>Start date</th>
              <th>Organizer</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {pending.map((t) => (
              <TournamentReviewRow key={t.id} tournament={t} />
            ))}
          </tbody>
        </table>
      )}

      <h2 className="admin-section-title admin-section-title-spaced">
        Live {live?.length ? `(${live.length})` : ""}
      </h2>
      {!live?.length ? (
        <div className="admin-placeholder">No live tournaments yet.</div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Tournament</th>
              <th>Sport</th>
              <th>City</th>
              <th>Entry</th>
              <th>Prize pool</th>
            </tr>
          </thead>
          <tbody>
            {live.map((t) => (
              <tr key={t.id}>
                <td>{t.name}</td>
                <td>{t.sport}</td>
                <td>{t.city}</td>
                <td>{formatEntryFee(t)}</td>
                <td>{formatPrize(t)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
