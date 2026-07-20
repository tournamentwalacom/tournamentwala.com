"use client";

import { useState } from "react";

function formatRegisteredOn(iso) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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
