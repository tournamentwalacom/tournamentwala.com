"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import TournamentReviewRow from "@/components/admin/TournamentReviewRow";

export default function PendingTournamentsPanel({ tournaments, playersCount }) {
  const router = useRouter();
  const [selected, setSelected] = useState(() => new Set());
  const [busy, setBusy] = useState(false);
  const [showBulkReject, setShowBulkReject] = useState(false);
  const [bulkReason, setBulkReason] = useState("");

  const allIds = useMemo(() => tournaments.map((t) => t.id), [tournaments]);
  const allSelected = allIds.length > 0 && selected.size === allIds.length;
  const someSelected = selected.size > 0;

  function toggleOne(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) => (prev.size === allIds.length ? new Set() : new Set(allIds)));
  }

  function clearSelection() {
    setSelected(new Set());
    setShowBulkReject(false);
    setBulkReason("");
  }

  async function bulkAction(action, rejection_reason) {
    if (!selected.size || busy) return;
    setBusy(true);
    try {
      await fetch("/api/admin/tournaments/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selected), action, rejection_reason }),
      });
    } finally {
      setBusy(false);
      clearSelection();
      router.refresh();
    }
  }

  return (
    <div className="admin-panel">
      <div className="admin-panel-head">
        <h2 className="admin-section-title admin-panel-title">
          Pending review {tournaments.length ? `(${tournaments.length})` : ""}
        </h2>

        {someSelected && !showBulkReject && (
          <div className="admin-bulk-toolbar">
            <span className="admin-bulk-count">{selected.size} selected</span>
            <button
              type="button"
              className="admin-btn admin-btn-approve"
              disabled={busy}
              onClick={() => bulkAction("approve")}
            >
              Approve selected
            </button>
            <button
              type="button"
              className="admin-btn admin-btn-reject"
              disabled={busy}
              onClick={() => setShowBulkReject(true)}
            >
              Reject selected
            </button>
            <button type="button" className="admin-btn" disabled={busy} onClick={clearSelection}>
              Clear
            </button>
          </div>
        )}

        {showBulkReject && (
          <div className="admin-reject-box admin-bulk-toolbar">
            <span className="admin-bulk-count">{selected.size} selected</span>
            <input
              type="text"
              placeholder="Reason (optional)"
              value={bulkReason}
              onChange={(e) => setBulkReason(e.target.value)}
            />
            <button
              type="button"
              className="admin-btn admin-btn-reject"
              disabled={busy}
              onClick={() => bulkAction("reject", bulkReason)}
            >
              Confirm reject
            </button>
            <button
              type="button"
              className="admin-btn"
              disabled={busy}
              onClick={() => setShowBulkReject(false)}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {!tournaments.length ? (
        <div className="admin-placeholder">Nothing waiting on review.</div>
      ) : (
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="admin-th-check">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    aria-label="Select all pending tournaments"
                  />
                </th>
                <th>Tournament</th>
                <th>Venue</th>
                <th>Start date</th>
                <th>Organizer</th>
                <th>Promotions</th>
                <th>Players</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {tournaments.map((t) => (
                <TournamentReviewRow
                  key={t.id}
                  tournament={t}
                  playersCount={playersCount[t.id] || 0}
                  selected={selected.has(t.id)}
                  onToggleSelect={() => toggleOne(t.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
