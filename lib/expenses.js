// Validation for the admin Expenses CRUD, plus the shared Razorpay-charge
// calculation used by both /admin/expenses and /admin/analytics so the two
// pages can never disagree about what that line item is.

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function trimmed(value, maxLength) {
  if (typeof value !== "string") return null;
  const t = value.trim();
  if (!t || t.length > maxLength) return null;
  return t;
}

function nonNegativeNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Validates an admin create/update payload for an expense. Returns
 * { data, error } — data is null when error is set.
 */
export function parseExpenseInput(body) {
  const title = trimmed(body.title, 120);
  const category = trimmed(body.category, 40) || "Other";
  const amount = nonNegativeNumber(body.amount);
  const expense_date =
    typeof body.expense_date === "string" && DATE_RE.test(body.expense_date)
      ? body.expense_date
      : todayDate();
  const notes = typeof body.notes === "string" ? body.notes.trim().slice(0, 500) || null : null;

  if (!title || amount === null) {
    return { data: null, error: "Please fill in all required fields correctly." };
  }

  return {
    data: { title, category, amount, expense_date, notes },
    error: null,
  };
}

/** Percentage Razorpay is assumed to charge on every order's total. */
export const RAZORPAY_FEE_PERCENT = 2.5;

/**
 * Computes the Razorpay processing charge on a given income figure. This is
 * never stored — always derived live from tournament totals so it can't go
 * stale (see the "expenses" table comment in supabase/schema.sql).
 */
export function computeRazorpayCharge(income) {
  const amount = Number(income) || 0;
  return Math.round(amount * RAZORPAY_FEE_PERCENT) / 100;
}
