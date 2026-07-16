import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";
import { computeRazorpayCharge, RAZORPAY_CATEGORY, RAZORPAY_FEE_PERCENT } from "@/lib/expenses";
import ExpenseMonthFilter from "@/components/admin/ExpenseMonthFilter";

const MONTH_RE = /^\d{4}-\d{2}$/;

function formatMoney(n) {
  return `₹${Math.round(Number(n) || 0).toLocaleString("en-IN")}`;
}

function currentMonthStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthBounds(monthStr) {
  const [year, month] = monthStr.split("-").map(Number);
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);
  return { startIso: start.toISOString(), endIso: end.toISOString() };
}

async function getMonthSummary(monthStr) {
  const db = supabaseAdmin();
  const { startIso, endIso } = monthBounds(monthStr);

  const [{ data: tournaments }, { data: expenses }] = await Promise.all([
    db
      .from("tournaments")
      .select("promotion_total")
      .in("status", ["live", "completed"])
      .gte("created_at", startIso)
      .lt("created_at", endIso),
    db
      .from("expenses")
      .select("amount, category")
      .gte("expense_date", startIso.slice(0, 10))
      .lt("expense_date", endIso.slice(0, 10)),
  ]);

  const income = (tournaments || []).reduce((sum, t) => sum + Number(t.promotion_total || 0), 0);
  const manualExpenses = (expenses || [])
    .filter((e) => e.category !== RAZORPAY_CATEGORY)
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const razorpayCharge = computeRazorpayCharge(income);
  const netProfit = income - manualExpenses - razorpayCharge;

  return { income, manualExpenses, razorpayCharge, netProfit };
}

export default async function AdminExpensesPage({ searchParams }) {
  const month = MONTH_RE.test(searchParams?.month) ? searchParams.month : currentMonthStr();

  const db = supabaseAdmin();
  const { startIso, endIso } = monthBounds(month);

  const [{ data: expenses }, summary] = await Promise.all([
    db
      .from("expenses")
      .select("*")
      .gte("expense_date", startIso.slice(0, 10))
      .lt("expense_date", endIso.slice(0, 10))
      .order("expense_date", { ascending: false }),
    getMonthSummary(month),
  ]);

  return (
    <>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Expenses</h1>
        <div className="admin-page-header-actions">
          <ExpenseMonthFilter month={month} />
          <Link href="/admin/expenses/new" className="btn btn-primary admin-add-btn">
            + Add expense
          </Link>
        </div>
      </div>

      <div className="admin-card-grid">
        <div className="admin-card admin-card-income">
          <h3>Income</h3>
          <div className="stat">{formatMoney(summary.income)}</div>
          <p className="admin-card-hint">Live + completed tournament packages</p>
        </div>
        <div className="admin-card admin-card-expense">
          <h3>Manual expenses</h3>
          <div className="stat">{formatMoney(summary.manualExpenses)}</div>
        </div>
        <div className="admin-card admin-card-expense">
          <h3>Razorpay charges</h3>
          <div className="stat">{formatMoney(summary.razorpayCharge)}</div>
          <p className="admin-card-hint">Auto — {RAZORPAY_FEE_PERCENT}% of income</p>
        </div>
        <div className={`admin-card ${summary.netProfit >= 0 ? "admin-card-profit" : "admin-card-loss"}`}>
          <h3>Net profit</h3>
          <div className="stat">{formatMoney(summary.netProfit)}</div>
        </div>
      </div>

      {!expenses?.length ? (
        <div className="admin-placeholder">No expenses logged for this month.</div>
      ) : (
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id}>
                  <td>
                    <strong>{expense.title}</strong>
                    {expense.notes && <div className="admin-row-sub">{expense.notes}</div>}
                  </td>
                  <td>{expense.category}</td>
                  <td>{formatMoney(expense.amount)}</td>
                  <td>{expense.expense_date}</td>
                  <td className="admin-row-actions">
                    <Link href={`/admin/expenses/${expense.id}/edit`} className="admin-btn">
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
