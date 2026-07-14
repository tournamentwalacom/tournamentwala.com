"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TournamentReviewRow({ tournament }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");

  async function sendAction(action, rejection_reason) {
    setBusy(true);
    await fetch(`/api/admin/tournaments/${tournament.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, rejection_reason }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <tr>
      <td>
        <strong>{tournament.name}</strong>
        <div className="admin-row-sub">
          {tournament.sport} · {tournament.city}
        </div>
      </td>
      <td>{tournament.venue}</td>
      <td>{tournament.start_date}</td>
      <td>
        {tournament.organizer_name}
        <div className="admin-row-sub">
          {[tournament.organizer_email, tournament.organizer_phone]
            .filter(Boolean)
            .join(" · ")}
        </div>
      </td>
      <td>
        {tournament.promotions?.length ? (
          <>
            {tournament.promotions.map((p) => p.name).join(", ")}
            <div className="admin-row-sub">
              ₹{Number(tournament.promotion_total || 0).toLocaleString("en-IN")}
            </div>
          </>
        ) : (
          "—"
        )}
      </td>
      <td className="admin-row-actions">
        {!showReject ? (
          <>
            <Link href={`/admin/tournaments/${tournament.id}/edit`} className="admin-btn">
              Edit
            </Link>
            <button
              type="button"
              className="admin-btn admin-btn-approve"
              disabled={busy}
              onClick={() => sendAction("approve")}
            >
              Approve
            </button>
            <button
              type="button"
              className="admin-btn admin-btn-reject"
              disabled={busy}
              onClick={() => setShowReject(true)}
            >
              Reject
            </button>
          </>
        ) : (
          <div className="admin-reject-box">
            <input
              type="text"
              placeholder="Reason (optional)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <button
              type="button"
              className="admin-btn admin-btn-reject"
              disabled={busy}
              onClick={() => sendAction("reject", reason)}
            >
              Confirm reject
            </button>
            <button
              type="button"
              className="admin-btn"
              disabled={busy}
              onClick={() => setShowReject(false)}
            >
              Cancel
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}
