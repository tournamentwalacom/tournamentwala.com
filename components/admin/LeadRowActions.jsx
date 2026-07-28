"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LeadRowActions({ lead }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function deleteLead() {
    const name = lead.full_name || lead.email || "this lead";
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;

    setBusy(true);
    const res = await fetch(`/api/admin/leads/${lead.id}`, { method: "DELETE" });
    setBusy(false);
    if (res.ok) {
      router.refresh();
    } else {
      alert("Couldn't delete this lead. Please try again.");
    }
  }

  return (
    <button
      type="button"
      className="admin-btn admin-btn-reject"
      disabled={busy}
      onClick={deleteLead}
    >
      Delete
    </button>
  );
}
