import { supabaseAdmin } from "@/lib/supabase";
import LeadRowActions from "@/components/admin/LeadRowActions";

export default async function AdminLeadsPage() {
  const db = supabaseAdmin();

  const [{ data: allProfiles }, { data: tournaments }, { data: registrations }] =
    await Promise.all([
      db.from("profiles").select("*").order("created_at", { ascending: false }),
      db
        .from("tournaments")
        .select("organizer_user_id")
        .not("organizer_user_id", "is", null),
      db
        .from("registrations")
        .select("user_id")
        .not("user_id", "is", null),
    ]);

  const organizerIds = new Set((tournaments || []).map((t) => t.organizer_user_id));
  const playerIds = new Set((registrations || []).map((r) => r.user_id));

  // Leads: accounts that signed in but never posted a tournament or
  // registered as a player — we only have their name/phone from sign-up.
  const leads = (allProfiles || []).filter(
    (p) => !organizerIds.has(p.id) && !playerIds.has(p.id)
  );

  return (
    <>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Leads</h1>
      </div>

      <div className="admin-card-grid">
        <div className="admin-card">
          <h3>Total leads</h3>
          <div className="stat">{leads.length}</div>
        </div>
      </div>

      {!leads.length ? (
        <div className="admin-placeholder">No leads yet.</div>
      ) : (
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Signed up</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((p) => (
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
                    <LeadRowActions lead={p} />
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
