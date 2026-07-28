import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwnerSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { ADMIN_SECTIONS } from "@/lib/permissions";

const LABEL_BY_KEY = Object.fromEntries(ADMIN_SECTIONS.map((s) => [s.key, s.label]));

export default async function AdminPanelPage() {
  // Belt-and-suspenders on top of middleware.js's OWNER_ONLY_PREFIXES gate —
  // worker accounts must never be able to view or manage each other's
  // access, even if a future change to the middleware matcher missed this.
  const session = await requireOwnerSession();
  if (!session) {
    notFound();
  }

  const { data: workers } = await supabaseAdmin()
    .from("admin_workers")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Admin Panel</h1>
        <div className="admin-page-header-actions">
          <Link href="/admin/admin-panel/new" className="btn btn-primary admin-add-btn">
            + Add worker
          </Link>
        </div>
      </div>

      {!workers?.length ? (
        <div className="admin-placeholder">
          No worker accounts yet. Add one to give someone restricted access
          to specific admin tabs.
        </div>
      ) : (
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Tab access</th>
                <th>Status</th>
                <th>Added</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {workers.map((worker) => (
                <tr key={worker.id}>
                  <td>{worker.email}</td>
                  <td>
                    {worker.permissions?.length
                      ? worker.permissions.map((key) => LABEL_BY_KEY[key] || key).join(", ")
                      : "—"}
                  </td>
                  <td>{worker.active ? "Active" : "Disabled"}</td>
                  <td>{new Date(worker.created_at).toLocaleDateString("en-IN")}</td>
                  <td className="admin-row-actions">
                    <Link href={`/admin/admin-panel/${worker.id}/edit`} className="admin-btn">
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
