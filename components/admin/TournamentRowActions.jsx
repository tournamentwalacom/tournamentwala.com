"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TournamentRowActions({ tournament, showUnpublish }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function unpublish() {
    setBusy(true);
    await fetch(`/api/admin/tournaments/${tournament.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "unpublish" }),
    });
    setBusy(false);
    router.refresh();
  }

  async function deleteTournament() {
    if (!window.confirm(`Delete "${tournament.name}"? This cannot be undone.`)) {
      return;
    }
    setBusy(true);
    await fetch(`/api/admin/tournaments/${tournament.id}`, { method: "DELETE" });
    setBusy(false);
    router.refresh();
  }

  return (
    <>
      <Link href={`/admin/tournaments/${tournament.id}/edit`} className="admin-btn">
        Edit
      </Link>
      {showUnpublish && (
        <button type="button" className="admin-btn" disabled={busy} onClick={unpublish}>
          Make non-live
        </button>
      )}
      <button
        type="button"
        className="admin-btn admin-btn-reject"
        disabled={busy}
        onClick={deleteTournament}
      >
        Delete
      </button>
    </>
  );
}
