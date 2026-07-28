"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ADMIN_SECTIONS } from "@/lib/permissions";

function buildInitialForm(initial) {
  if (!initial) {
    return { email: "", password: "", permissions: [], active: true };
  }

  return {
    email: initial.email || "",
    password: "",
    permissions: initial.permissions || [],
    active: initial.active !== false,
  };
}

export default function WorkerForm({ mode, initial }) {
  const router = useRouter();
  const [form, setForm] = useState(() => buildInitialForm(initial));
  const [status, setStatus] = useState("idle"); // idle | submitting | deleting | error
  const [error, setError] = useState("");

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function togglePermission(key) {
    setForm((f) => ({
      ...f,
      permissions: f.permissions.includes(key)
        ? f.permissions.filter((k) => k !== key)
        : [...f.permissions, key],
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setStatus("submitting");

    try {
      const res =
        mode === "create"
          ? await fetch("/api/admin/workers", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: form.email,
                password: form.password,
                permissions: form.permissions,
              }),
            })
          : await fetch(`/api/admin/workers/${initial.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                fields: {
                  permissions: form.permissions,
                  active: form.active,
                  ...(form.password ? { password: form.password } : {}),
                },
              }),
            });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      router.push("/admin/admin-panel");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setStatus("error");
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Remove worker access for "${form.email}"? This can't be undone.`)) {
      return;
    }

    setStatus("deleting");
    try {
      const res = await fetch(`/api/admin/workers/${initial.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Delete failed.");
        setStatus("error");
        return;
      }
      router.push("/admin/admin-panel");
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
          Email
          <input
            type="email"
            required
            disabled={mode === "edit"}
            placeholder="worker@example.com"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />
        </label>

        <label className="post-field post-field-wide">
          {mode === "create" ? "Password" : "New password"}{" "}
          {mode === "edit" && <span>(leave blank to keep current)</span>}
          <input
            type="password"
            required={mode === "create"}
            minLength={8}
            autoComplete="new-password"
            placeholder={mode === "create" ? "At least 8 characters" : "••••••••"}
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
          />
        </label>

        {mode === "edit" && (
          <label className="post-field post-field-checkbox">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => update("active", e.target.checked)}
            />
            Active (unchecking blocks this login immediately)
          </label>
        )}
      </div>

      <h3 className="post-form-section">Tab access</h3>
      <div className="admin-permissions-grid">
        {ADMIN_SECTIONS.map((section) => (
          <label key={section.key} className="post-field post-field-checkbox">
            <input
              type="checkbox"
              checked={form.permissions.includes(section.key)}
              onChange={() => togglePermission(section.key)}
            />
            {section.label}
          </label>
        ))}
      </div>

      {error && <p className="post-error">{error}</p>}

      <div className="admin-row-actions">
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {status === "submitting" ? "Saving…" : mode === "create" ? "Create worker" : "Save changes"}
        </button>
        {mode === "edit" && (
          <button
            type="button"
            className="admin-btn admin-btn-reject"
            disabled={busy}
            onClick={handleDelete}
          >
            {status === "deleting" ? "Removing…" : "Remove worker"}
          </button>
        )}
      </div>
    </form>
  );
}
