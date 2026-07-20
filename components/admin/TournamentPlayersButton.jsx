"use client";

import { useState } from "react";

const EXPORT_HEADERS = ["Name", "Phone", "Sport", "City", "Pincode", "Updates opt-in", "Registered"];

function formatRegisteredOn(iso) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
}

function downloadExcel(players, tournamentName) {
  const headRow = `<tr>${EXPORT_HEADERS.map((h) => `<th>${h}</th>`).join("")}</tr>`;
  const bodyRows = players
    .map(
      (p) => `<tr>
        <td>${escapeHtml(p.player_name)}</td>
        <td>${escapeHtml(p.player_phone)}</td>
        <td>${escapeHtml(p.sport)}</td>
        <td>${escapeHtml(p.city)}</td>
        <td>${escapeHtml(p.pincode)}</td>
        <td>${p.wants_updates ? "Yes" : "No"}</td>
        <td>${escapeHtml(formatRegisteredOn(p.created_at))}</td>
      </tr>`
    )
    .join("");

  const html = `<html><head><meta charset="utf-8" /></head><body><table border="1">${headRow}${bodyRows}</table></body></html>`;
  const blob = new Blob([html], { type: "application/vnd.ms-excel" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${tournamentName.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-players.xls`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function TournamentPlayersButton({ tournamentId, tournamentName, count }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [players, setPlayers] = useState(null);

  async function openModal() {
    setOpen(true);
    if (players) return;

    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/tournaments/${tournamentId}/registrations`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Couldn't load registered players.");
      } else {
        setPlayers(data.registrations || []);
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  }

  return (
    <>
      <button type="button" className="admin-btn" onClick={openModal}>
        Players ({count || 0})
      </button>

      {open && (
        <div className="admin-modal-backdrop" onClick={() => setOpen(false)}>
          <div className="admin-modal admin-modal-wide" onClick={(e) => e.stopPropagation()}>
            <h2 className="admin-modal-title">Registered players</h2>
            <p className="admin-modal-hint">{tournamentName}</p>

            {loading && <div className="admin-placeholder">Loading…</div>}
            {!loading && error && <div className="admin-placeholder">{error}</div>}
            {!loading && !error && players && players.length === 0 && (
              <div className="admin-placeholder">No players registered yet.</div>
            )}
            {!loading && !error && players?.length > 0 && (
              <div className="admin-table-scroll">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Phone</th>
                      <th>Sport</th>
                      <th>City</th>
                      <th>Pincode</th>
                      <th>Registered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {players.map((p) => (
                      <tr key={p.id}>
                        <td>{p.player_name}</td>
                        <td>{p.player_phone}</td>
                        <td>{p.sport}</td>
                        <td>{p.city}</td>
                        <td>{p.pincode || "—"}</td>
                        <td>{formatRegisteredOn(p.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="admin-row-actions admin-modal-actions">
              <button
                type="button"
                className="admin-btn admin-btn-primary"
                disabled={!players?.length}
                onClick={() => downloadExcel(players, tournamentName)}
              >
                Download as Excel
              </button>
              <button type="button" className="admin-btn" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
