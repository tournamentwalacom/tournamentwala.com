import { supabaseAdmin } from "@/lib/supabase";
import OrganizerRowActions from "@/components/admin/OrganizerRowActions";

const STATUS_LABELS = {
  pending: "Pending",
  live: "Live",
  rejected: "Rejected",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default async function AdminOrganizersPage() {
  const db = supabaseAdmin();

  const [{ data: allProfiles }, { data: tournaments }] = await Promise.all([
    db.from("profiles").select("*").order("created_at", { ascending: false }),
    db
      .from("tournaments")
      .select("id, name, status, organizer_user_id")
      .not("organizer_user_id", "is", null),
  ]);

  const tournamentsByOrganizer = new Map();
  for (const t of tournaments || []) {
    const list = tournamentsByOrganizer.get(t.organizer_user_id) || [];
    list.push(t);
    tournamentsByOrganizer.set(t.organizer_user_id, list);
  }

  // Only accounts that have actually posted a tournament count as organizers.
  const profiles = (allProfiles || []).filter((p) => tournamentsByOrganizer.has(p.id));

  return (
    <>
      <h1 className="admin-page-title">Organizers</h1>

      {!profiles?.length ? (
        <div className="admin-placeholder">No organizer accounts yet.</div>
      ) : (
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Organizer</th>
                <th>Phone</th>
                <th>Signed up</th>
                <th>Tournaments posted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((p) => {
                const posted = tournamentsByOrganizer.get(p.id) || [];
                return (
                  <tr key={p.id}>
                    <td>
                      {p.full_name || "—"}
                      <div className="admin-row-sub">{p.email}</div>
                    </td>
                    <td>
                      {p.phone ? (
                        <span className="admin-phone-cell">
                          {p.phone}
                          <a
                            href={`tel:${p.phone}`}
                            className="admin-phone-link"
                            aria-label={`Call ${p.phone}`}
                            title={`Call ${p.phone}`}
                          >
                            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                              <path
                                d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.9 21 3 13.1 3 3.9c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.1.4 0 .8-.2 1L6.6 10.8z"
                                stroke="currentColor"
                                strokeWidth="1.6"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </a>
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>{new Date(p.created_at).toLocaleDateString("en-IN")}</td>
                    <td>
                      {posted.length === 0 ? (
                        "—"
                      ) : (
                        <>
                          {posted.length}
                          {posted.map((t) => (
                            <div key={t.id} className="admin-row-sub">
                              {t.name} — {STATUS_LABELS[t.status] || t.status}
                            </div>
                          ))}
                        </>
                      )}
                    </td>
                    <td>
                      <OrganizerRowActions organizer={p} tournamentCount={posted.length} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
