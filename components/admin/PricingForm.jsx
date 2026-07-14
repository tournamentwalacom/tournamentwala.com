"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function buildInitialForm(initial) {
  if (!initial) {
    return {
      name: "",
      description: "",
      price: "",
      price_unit: "",
      allow_quantity: false,
      requires_telegram_upload: false,
      requires_brief: false,
      is_free: false,
      is_active: true,
      sort_order: "0",
    };
  }

  return {
    name: initial.name || "",
    description: initial.description || "",
    price: String(initial.price ?? ""),
    price_unit: initial.price_unit || "",
    allow_quantity: Boolean(initial.allow_quantity),
    requires_telegram_upload: Boolean(initial.requires_telegram_upload),
    requires_brief: Boolean(initial.requires_brief),
    is_free: Boolean(initial.is_free),
    is_active: Boolean(initial.is_active),
    sort_order: String(initial.sort_order ?? "0"),
  };
}

export default function PricingForm({ mode, initial }) {
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
          ? await fetch("/api/admin/pricing", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(form),
            })
          : await fetch(`/api/admin/pricing/${initial.id}`, {
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

      router.push("/admin/pricing");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setStatus("error");
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete "${form.name}"? This can't be undone.`)) return;

    setStatus("deleting");
    try {
      const res = await fetch(`/api/admin/pricing/${initial.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Delete failed.");
        setStatus("error");
        return;
      }
      router.push("/admin/pricing");
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
          Package name
          <input
            type="text"
            required
            maxLength={120}
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
          />
        </label>

        <label className="post-field post-field-wide">
          Description
          <textarea
            maxLength={500}
            rows={3}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
          />
        </label>

        <label className="post-field">
          Price (₹)
          <input
            type="number"
            required
            min="0"
            step="1"
            value={form.price}
            onChange={(e) => update("price", e.target.value)}
          />
        </label>

        <label className="post-field">
          Price unit <span>(optional, e.g. &ldquo;story&rdquo;)</span>
          <input
            type="text"
            maxLength={40}
            placeholder="Leave blank for a flat price"
            value={form.price_unit}
            onChange={(e) => update("price_unit", e.target.value)}
          />
        </label>

        <label className="post-field">
          Sort order
          <input
            type="number"
            step="1"
            value={form.sort_order}
            onChange={(e) => update("sort_order", e.target.value)}
          />
        </label>

        <label className="post-field post-field-checkbox">
          <input
            type="checkbox"
            checked={form.allow_quantity}
            onChange={(e) => update("allow_quantity", e.target.checked)}
          />
          Let organizers pick a quantity (e.g. multiple stories)
        </label>

        <label className="post-field post-field-checkbox">
          <input
            type="checkbox"
            checked={form.requires_telegram_upload}
            onChange={(e) => update("requires_telegram_upload", e.target.checked)}
          />
          Requires sending media + payment screenshot on Telegram
        </label>

        <label className="post-field post-field-checkbox">
          <input
            type="checkbox"
            checked={form.requires_brief}
            onChange={(e) => update("requires_brief", e.target.checked)}
          />
          Requires the poster/reel brief section (we design the asset from scratch)
        </label>

        <label className="post-field post-field-checkbox">
          <input
            type="checkbox"
            checked={form.is_free}
            onChange={(e) => update("is_free", e.target.checked)}
          />
          Free / always-included (shown as an info note, not a toggle)
        </label>

        <label className="post-field post-field-checkbox">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => update("is_active", e.target.checked)}
          />
          Active (visible on the public form)
        </label>
      </div>

      {error && <p className="post-error">{error}</p>}

      <div className="admin-row-actions">
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {status === "submitting"
            ? "Saving…"
            : mode === "create"
            ? "Create package"
            : "Save changes"}
        </button>
        {mode === "edit" && (
          <button
            type="button"
            className="admin-btn admin-btn-reject"
            disabled={busy}
            onClick={handleDelete}
          >
            {status === "deleting" ? "Deleting…" : "Delete package"}
          </button>
        )}
      </div>
    </form>
  );
}
