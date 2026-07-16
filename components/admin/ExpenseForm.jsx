"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CATEGORY_SUGGESTIONS = ["Marketing", "Design", "Hosting", "Salary", "Equipment", "Misc"];

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function buildInitialForm(initial) {
  if (!initial) {
    return {
      title: "",
      category: "",
      amount: "",
      expense_date: todayDate(),
      notes: "",
    };
  }

  return {
    title: initial.title || "",
    category: initial.category || "",
    amount: String(initial.amount ?? ""),
    expense_date: initial.expense_date || todayDate(),
    notes: initial.notes || "",
  };
}

export default function ExpenseForm({ mode, initial }) {
  const router = useRouter();
  const [form, setForm] = useState(() => buildInitialForm(initial));
  const [status, setStatus] = useState("idle"); // idle | submitting | deleting | error
  const [error, setError] = useState("");

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setStatus("submitting");

    try {
      const res =
        mode === "create"
          ? await fetch("/api/admin/expenses", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(form),
            })
          : await fetch(`/api/admin/expenses/${initial.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ fields: form }),
            });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      router.push("/admin/expenses");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setStatus("error");
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete "${form.title}"? This can't be undone.`)) return;

    setStatus("deleting");
    try {
      const res = await fetch(`/api/admin/expenses/${initial.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Delete failed.");
        setStatus("error");
        return;
      }
      router.push("/admin/expenses");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setStatus("error");
    }
  }

  const busy = status === "submitting" || status === "deleting";

  return (
    <form className="post-form" onSubmit={handleSubmit}>
      <div className="post-form-grid">
        <label className="post-field post-field-wide">
          Title
          <input
            type="text"
            required
            maxLength={120}
            placeholder="e.g. Instagram ads, office rent"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
          />
        </label>

        <label className="post-field">
          Category
          <input
            type="text"
            maxLength={40}
            list="expense-category-suggestions"
            placeholder="Other"
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
          />
          <datalist id="expense-category-suggestions">
            {CATEGORY_SUGGESTIONS.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </label>

        <label className="post-field">
          Amount (₹)
          <input
            type="number"
            required
            min="0"
            step="1"
            value={form.amount}
            onChange={(e) => update("amount", e.target.value)}
          />
        </label>

        <label className="post-field">
          Date
          <input
            type="date"
            required
            value={form.expense_date}
            onChange={(e) => update("expense_date", e.target.value)}
          />
        </label>

        <label className="post-field post-field-wide">
          Notes <span>(optional)</span>
          <textarea
            maxLength={500}
            rows={3}
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
          />
        </label>
      </div>

      {error && <p className="post-error">{error}</p>}

      <div className="admin-row-actions">
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {status === "submitting" ? "Saving…" : mode === "create" ? "Add expense" : "Save changes"}
        </button>
        {mode === "edit" && (
          <button
            type="button"
            className="admin-btn admin-btn-reject"
            disabled={busy}
            onClick={handleDelete}
          >
            {status === "deleting" ? "Deleting…" : "Delete expense"}
          </button>
        )}
      </div>
    </form>
  );
}
