"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatEntryFee, formatPrize } from "@/lib/tournaments";
import TournamentRowActions from "@/components/admin/TournamentRowActions";
import TournamentPlayersButton from "@/components/admin/TournamentPlayersButton";

const EMPTY_TEXT = {
  live: "No live tournaments yet.",
  completed: "No completed tournaments yet.",
  other: "No rejected or cancelled tournaments.",
};

export default function TournamentsSectionPanel({ kind, title, tournaments, playersCount }) {
  const router = useRouter();
  const [selected, setSelected] = useState(() => new Set());
  const [busy, setBusy] = useState(false);

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
  }

  async function bulkUnpublish() {
    if (!selected.size || busy) return;
    setBusy(true);
    try {
      await fetch("/api/admin/tournaments/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selected), action: "unpublish" }),
      });
    } finally {
      setBusy(false);
      clearSelection();
      router.refresh();
    }
  }

  async function bulkDelete() {
    if (!selected.size || busy) return;
    if (!window.confirm(`Delete ${selected.size} tournament(s)? This cannot be undone.`)) {
      return;
    }
    setBusy(true);
    try {
      await fetch("/api/admin/tournaments/bulk", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selected) }),
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
          {title} {tournaments.length ? `(${tournaments.length})` : ""}
        </h2>

        {someSelected && (
          <div className="admin-bulk-toolbar">
            <span className="admin-bulk-count">{selected.size} selected</span>
            {kind === "live" && (
              <button type="button" className="admin-btn" disabled={busy} onClick={bulkUnpublish}>
                Make non-live
              </button>
            )}
            <button
              type="button"
              className="admin-btn admin-btn-reject"
              disabled={busy}
              onClick={bulkDelete}
            >
              Delete selected
            </button>
            <button type="button" className="admin-btn" disabled={busy} onClick={clearSelection}>
              Clear
            </button>
          </div>
        )}
      </div>

      {!tournaments.length ? (
        <div className="admin-placeholder">{EMPTY_TEXT[kind]}</div>
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
                    aria-label={`Select all ${title.toLowerCase()} tournaments`}
                  />
                </th>
                <th>Tournament</th>
                <th>Sport</th>
                <th>City</th>
                {kind === "live" && (
                  <>
                    <th>Entry</th>
                    <th>Prize pool</th>
                  </>
                )}
                {kind === "completed" && <th>Date</th>}
                {kind === "other" && <th>Status</th>}
                <th>Players</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {tournaments.map((t) => (
                <tr key={t.id} className={selected.has(t.id) ? "admin-row-selected" : undefined}>
                  <td className="admin-td-check">
                    <input
                      type="checkbox"
                      checked={selected.has(t.id)}
                      onChange={() => toggleOne(t.id)}
                      aria-label={`Select ${t.name}`}
                    />
                  </td>
                  <td>{t.name}</td>
                  <td>{t.sport}</td>
                  <td>{t.city}</td>
                  {kind === "live" && (
                    <>
                      <td>{formatEntryFee(t)}</td>
                      <td>{formatPrize(t)}</td>
                    </>
                  )}
                  {kind === "completed" && <td>{t.start_date}</td>}
                  {kind === "other" && (
                    <td>
                      <span className={`admin-status-badge admin-status-${t.status}`}>
                        {t.status}
                      </span>
                    </td>
                  )}
                  <td>
                    <TournamentPlayersButton
                      tournamentId={t.id}
                      tournamentName={t.name}
                      count={playersCount[t.id] || 0}
                    />
                  </td>
                  <td className="admin-row-actions">
                    <TournamentRowActions tournament={t} showUnpublish={kind === "live"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
