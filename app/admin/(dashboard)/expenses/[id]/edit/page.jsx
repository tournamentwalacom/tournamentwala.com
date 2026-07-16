import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import ExpenseForm from "@/components/admin/ExpenseForm";

export default async function EditExpensePage({ params }) {
  const { id } = params;
  const { data: expense } = await supabaseAdmin()
    .from("expenses")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!expense) {
    notFound();
  }

  return (
    <div className="admin-form-page">
      <Link href="/admin/expenses" className="admin-form-back">
        ← Back to expenses
      </Link>
      <h1 className="admin-page-title">Edit expense</h1>
      <ExpenseForm mode="edit" initial={expense} />
    </div>
  );
}
