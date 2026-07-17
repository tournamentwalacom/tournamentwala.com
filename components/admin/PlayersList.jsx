"use client";

import { useMemo, useState } from "react";

const EXPORT_HEADERS = [
  "Name",
  "Phone",
  "Tournament",
  "Sport",
  "City",
  "Pincode",
  "Updates opt-in",
  "Registered",
];

function formatDate(iso) {
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

function downloadExcel(rows) {
  const headRow = `<tr>${EXPORT_HEADERS.map((h) => `<th>${h}</th>`).join("")}</tr>`;
  const bodyRows = rows
    .map(
      (p) => `<tr>
        <td>${escapeHtml(p.player_name)}</td>
        <td>${escapeHtml(p.player_phone)}</td>
        <td>${escapeHtml(p.tournament_name)}</td>
        <td>${escapeHtml(p.sport)}</td>
        <td>${escapeHtml(p.city)}</td>
        <td>${escapeHtml(p.pincode)}</td>
        <td>${p.wants_updates ? "Yes" : "No"}</td>
        <td>${escapeHtml(formatDate(p.created_at))}</td>
      </tr>`
    )
    .join("");

  const html = `<html><head><meta charset="utf-8" /></head><body><table border="1">${headRow}${bodyRows}</table></body></html>`;
  const blob = new Blob([html], { type: "application/vnd.ms-excel" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `players-${new Date().toISOString().slice(0, 10)}.xls`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function PlayersList({ initialPlayers }) {
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("all");
  const [sport, setSport] = useState("all");
  const [pincodeFrom, setPincodeFrom] = useState("");
  const [pincodeTo, setPincodeTo] = useState("");

  const cities = useMemo(
    () => [...new Set(initialPlayers.map((p) => p.city).filter(Boolean))].sort(),
    [initialPlayers]
  );
  const sports = useMemo(
    () => [...new Set(initialPlayers.map((p) => p.sport).filter(Boolean))].sort(),
    [initialPlayers]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const from = pincodeFrom ? Number(pincodeFrom) : null;
    const to = pincodeTo ? Number(pincodeTo) : null;

    return initialPlayers.filter((p) => {
      if (city !== "all" && p.city !== city) return false;
      if (sport !== "all" && p.sport !== sport) return false;

      if (from !== null || to !== null) {
        const pin = Number(p.pincode);
        if (!p.pincode || Number.isNaN(pin)) return false;
        if (from !== null && pin < from) return false;
        if (to !== null && pin > to) return false;
      }

      if (q) {
        const haystack = `${p.player_name} ${p.player_phone} ${p.tournament_name}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [initialPlayers, search, city, sport, pincodeFrom, pincodeTo]);

  return (
    <div className="admin-players-wrap">
      <div className="admin-players-filters">
        <input
          type="text"
          className="admin-players-search"
          placeholder="Search name, phone or tournament"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select value={city} onChange={(e) => setCity(e.target.value)}>
          <option value="all">All cities</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select value={sport} onChange={(e) => setSport(e.target.value)}>
          <option value="all">All sports</option>
          {sports.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <input
          type="number"
          inputMode="numeric"
          className="admin-players-pincode"
          placeholder="Pincode from"
          value={pincodeFrom}
          onChange={(e) => setPincodeFrom(e.target.value)}
        />
        <input
          type="number"
          inputMode="numeric"
          className="admin-players-pincode"
          placeholder="Pincode to"
          value={pincodeTo}
          onChange={(e) => setPincodeTo(e.target.value)}
        />

        <button
          type="button"
          className="admin-btn admin-btn-primary"
          disabled={!filtered.length}
          onClick={() => downloadExcel(filtered)}
        >
          Download as Excel
        </button>
      </div>

      {!filtered.length ? (
        <div className="admin-placeholder">No registrations match these filters.</div>
      ) : (
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Tournament</th>
                <th>Sport</th>
                <th>City</th>
                <th>Pincode</th>
                <th>Updates opt-in</th>
                <th>Registered</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>{p.player_name}</td>
                  <td>{p.player_phone}</td>
                  <td>{p.tournament_name}</td>
                  <td>{p.sport}</td>
                  <td>{p.city}</td>
                  <td>{p.pincode || "—"}</td>
                  <td>
                    <span
                      className={`admin-query-badge admin-query-badge-${
                        p.wants_updates ? "replied" : "new"
                      }`}
                    >
                      {p.wants_updates ? "Yes" : "No"}
                    </span>
                  </td>
                  <td>{formatDate(p.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
