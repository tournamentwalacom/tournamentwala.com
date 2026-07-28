import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwnerSession } from "@/lib/auth";
import WorkerForm from "@/components/admin/WorkerForm";

export default async function NewWorkerPage() {
  const session = await requireOwnerSession();
  if (!session) {
    notFound();
  }

  return (
    <div className="admin-form-page">
      <Link href="/admin/admin-panel" className="admin-form-back">
        ← Back to Admin Panel
      </Link>
      <h1 className="admin-page-title">Add worker</h1>
      <WorkerForm mode="create" />
    </div>
  );
}
