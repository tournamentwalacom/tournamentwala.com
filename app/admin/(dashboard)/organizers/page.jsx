import { supabaseAdmin } from "@/lib/supabase";

const STATUS_LABELS = {
  pending: "Pending",
  live: "Live",
  rejected: "Rejected",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default async function AdminOrganizersPage() {
  const db = supabaseAdmin();

  const [{ data: profiles }, { data: tournaments }] = await Promise.all([
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

  return (
    <>
      <h1 className="admin-page-title">Organizers</h1>

      {!profiles?.length ? (
        <div className="admin-placeholder">No organizer accounts yet.</div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Organizer</th>
              <th>Phone</th>
              <th>Signed up</th>
              <th>Tournaments posted</th>
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
                  <td>{p.phone || "—"}</td>
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
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </>
  );
}
