import Link from "next/link";
import ExpenseForm from "@/components/admin/ExpenseForm";

export default function NewExpensePage() {
  return (
    <div className="admin-form-page">
      <Link href="/admin/expenses" className="admin-form-back">
        ← Back to expenses
      </Link>
      <h1 className="admin-page-title">Add expense</h1>
      <ExpenseForm mode="create" />
    </div>
  );
}
