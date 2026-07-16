"use client";

import { useMemo, useState } from "react";

const STATUS_LABELS = {
  new: "New",
  read: "Read",
  replied: "Replied",
};

const REASON_LABELS = {
  general: "General",
  player: "Player",
  organizer: "Organizer",
};

function formatDate(iso) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function QueriesList({ initialMessages }) {
  const [messages, setMessages] = useState(initialMessages);
  const [filter, setFilter] = useState("all");
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  const filtered = useMemo(() => {
    if (filter === "all") return messages;
    return messages.filter((m) => m.status === filter);
  }, [messages, filter]);

  async function updateStatus(id, status) {
    setBusyId(id);
    setError("");
    const prev = messages;
    setMessages((cur) => cur.map((m) => (m.id === id ? { ...m, status } : m)));

    const res = await fetch(`/api/admin/queries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      setMessages(prev);
      setError("Couldn't update status. Please try again.");
    }
    setBusyId(null);
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this query? This can't be undone.")) return;

    setBusyId(id);
    setError("");
    const prev = messages;
    setMessages((cur) => cur.filter((m) => m.id !== id));

    const res = await fetch(`/api/admin/queries/${id}`, { method: "DELETE" });

    if (!res.ok) {
      setMessages(prev);
      setError("Couldn't delete this query. Please try again.");
    }
    setBusyId(null);
  }

  return (
    <div className="admin-query-wrap">
      <div className="admin-query-filters">
        {["all", "new", "read", "replied"].map((key) => (
          <button
            key={key}
            type="button"
            className={`admin-query-filter-btn${filter === key ? " active" : ""}`}
            onClick={() => setFilter(key)}
          >
            {key === "all" ? "All" : STATUS_LABELS[key]}
          </button>
        ))}
      </div>

      {error && <p className="post-error">{error}</p>}

      {!filtered.length ? (
        <div className="admin-placeholder">No queries here yet.</div>
      ) : (
        <div className="admin-query-list">
          {filtered.map((m) => (
            <div key={m.id} className="admin-query-card">
              <div className="admin-query-card-head">
                <div>
                  <strong>{m.name}</strong>
                  <div className="admin-row-sub">
                    <a href={`mailto:${m.email}`}>{m.email}</a>
                    {m.phone ? ` · ${m.phone}` : ""}
                  </div>
                </div>
                <div className="admin-query-card-head-right">
                  <span className={`admin-query-badge admin-query-badge-${m.status}`}>
                    {STATUS_LABELS[m.status] || m.status}
                  </span>
                  <span className="admin-query-date">{formatDate(m.created_at)}</span>
                </div>
              </div>

              <span className="admin-query-reason">
                {REASON_LABELS[m.reason] || m.reason}
              </span>

              <p className="admin-query-card-message">{m.message}</p>

              <div className="admin-query-card-actions">
                <select
                  value={m.status}
                  disabled={busyId === m.id}
                  onChange={(e) => updateStatus(m.id, e.target.value)}
                  className="admin-query-status-select"
                  aria-label={`Update status for ${m.name}'s query`}
                >
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="admin-btn admin-btn-reject"
                  disabled={busyId === m.id}
                  onClick={() => handleDelete(m.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
