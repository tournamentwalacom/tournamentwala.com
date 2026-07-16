import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";
import { formatEntryFee, formatPrize } from "@/lib/tournaments";
import TournamentReviewRow from "@/components/admin/TournamentReviewRow";

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

  return (
    <>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Tournaments</h1>
        <Link href="/admin/tournaments/new" className="btn btn-primary admin-add-btn">
          + Add tournament
        </Link>
      </div>

      <h2 className="admin-section-title">
        Pending review {pending?.length ? `(${pending.length})` : ""}
      </h2>
      {!pending?.length ? (
        <div className="admin-placeholder">Nothing waiting on review.</div>
      ) : (
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tournament</th>
                <th>Venue</th>
                <th>Start date</th>
                <th>Organizer</th>
                <th>Promotions</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {pending.map((t) => (
                <TournamentReviewRow key={t.id} tournament={t} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="admin-section-title admin-section-title-spaced">
        Live {live?.length ? `(${live.length})` : ""}
      </h2>
      {!live?.length ? (
        <div className="admin-placeholder">No live tournaments yet.</div>
      ) : (
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tournament</th>
                <th>Sport</th>
                <th>City</th>
                <th>Entry</th>
                <th>Prize pool</th>
                <th>Action</th>
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
                  <td className="admin-row-actions">
                    <Link href={`/admin/tournaments/${t.id}/edit`} className="admin-btn">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="admin-section-title admin-section-title-spaced">
        Completed {completed?.length ? `(${completed.length})` : ""}
      </h2>
      {!completed?.length ? (
        <div className="admin-placeholder">No completed tournaments yet.</div>
      ) : (
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tournament</th>
                <th>Sport</th>
                <th>City</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {completed.map((t) => (
                <tr key={t.id}>
                  <td>{t.name}</td>
                  <td>{t.sport}</td>
                  <td>{t.city}</td>
                  <td>{t.start_date}</td>
                  <td className="admin-row-actions">
                    <Link href={`/admin/tournaments/${t.id}/edit`} className="admin-btn">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="admin-section-title admin-section-title-spaced">
        Rejected / cancelled {other?.length ? `(${other.length})` : ""}
      </h2>
      {!other?.length ? (
        <div className="admin-placeholder">No rejected or cancelled tournaments.</div>
      ) : (
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tournament</th>
                <th>Sport</th>
                <th>City</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {other.map((t) => (
                <tr key={t.id}>
                  <td>{t.name}</td>
                  <td>{t.sport}</td>
                  <td>{t.city}</td>
                  <td>{t.status}</td>
                  <td className="admin-row-actions">
                    <Link href={`/admin/tournaments/${t.id}/edit`} className="admin-btn">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
