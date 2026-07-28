import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwnerSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import WorkerForm from "@/components/admin/WorkerForm";

export default async function EditWorkerPage({ params }) {
  const session = await requireOwnerSession();
  if (!session) {
    notFound();
  }

  const { id } = params;
  const { data: worker } = await supabaseAdmin()
    .from("admin_workers")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!worker) {
    notFound();
  }

  return (
    <div className="admin-form-page">
      <Link href="/admin/admin-panel" className="admin-form-back">
        ← Back to Admin Panel
      </Link>
      <h1 className="admin-page-title">Edit worker</h1>
      <WorkerForm mode="edit" initial={worker} />
    </div>
  );
}
