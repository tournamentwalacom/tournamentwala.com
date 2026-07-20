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

export default function ProfileTournamentPlayers({ tournamentId, tournamentName, count }) {
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
      const res = await fetch(`/api/organizer/tournaments/${tournamentId}/registrations`);
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

  if (!count) {
    return <p className="profile-players-empty">No players registered yet.</p>;
  }

  return (
    <>
      <button type="button" className="profile-players-btn" onClick={openModal}>
        View registered players ({count})
      </button>

      {open && (
        <div className="profile-modal-backdrop" onClick={() => setOpen(false)}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="profile-modal-close"
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="profile-modal-title">Registered players</h2>
            <p className="profile-modal-hint">{tournamentName}</p>

            {loading && <p className="profile-modal-status">Loading…</p>}
            {!loading && error && <p className="profile-modal-status">{error}</p>}
            {!loading && !error && players && players.length === 0 && (
              <p className="profile-modal-status">No players registered yet.</p>
            )}
            {!loading && !error && players?.length > 0 && (
              <div className="profile-modal-table-scroll">
                <table className="profile-modal-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Phone</th>
                      <th>City</th>
                      <th>Registered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {players.map((p) => (
                      <tr key={p.id}>
                        <td>{p.player_name}</td>
                        <td>{p.player_phone}</td>
                        <td>{p.city}</td>
                        <td>{formatRegisteredOn(p.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
