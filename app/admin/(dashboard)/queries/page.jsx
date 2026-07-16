import { supabaseAdmin } from "@/lib/supabase";
import QueriesList from "@/components/admin/QueriesList";

export default async function AdminQueriesPage() {
  const db = supabaseAdmin();
  const { data: messages } = await db
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  const all = messages || [];
  const newCount = all.filter((m) => m.status === "new").length;

  return (
    <>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Queries</h1>
      </div>

      <div className="admin-card-grid">
        <div className="admin-card">
          <h3>Total queries</h3>
          <div className="stat">{all.length}</div>
        </div>
        <div className="admin-card admin-card-expense">
          <h3>New / unread</h3>
          <div className="stat">{newCount}</div>
        </div>
      </div>

      <QueriesList initialMessages={all} />
    </>
  );
}
