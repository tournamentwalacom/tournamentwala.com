"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TournamentPlayersButton from "@/components/admin/TournamentPlayersButton";

const STRUCTURED_BRIEF_FIELDS = [
  ["description", "Description"],
  ["banner_url", "Banner"],
  ["whatsapp_number", "WhatsApp"],
  ["organizer_email", "Email"],
  ["organizer_website", "Website"],
  ["google_maps_link", "Google Maps"],
  ["end_date", "End date"],
  ["registration_last_date", "Registration last date"],
  ["reporting_time", "Reporting time"],
  ["start_time", "Match start time"],
  ["team_size", "Team size"],
  ["max_teams", "Max teams"],
  ["ball_type", "Ball/match type"],
  ["second_prize", "Runner-up prize"],
  ["third_prize", "Third prize"],
  ["other_awards", "Other awards"],
  ["registration_link", "Registration link"],
  ["registration_qr_url", "Registration QR"],
  ["registration_status", "Registration status"],
  ["tournament_type_tag", "Tournament type"],
  ["gender_tag", "Gender"],
];

export default function TournamentReviewRow({ tournament, playersCount }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");
  const [showBrief, setShowBrief] = useState(false);

  const hasBrief = Boolean(tournament.promo_brief_mode);

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
            {hasBrief && (
              <button
                type="button"
                className="admin-btn admin-btn-link"
                onClick={() => setShowBrief((v) => !v)}
              >
                {showBrief ? "Hide" : "View"} poster/reel brief
              </button>
            )}
          </>
        ) : (
          "—"
        )}
      </td>
      <td>
        <TournamentPlayersButton
          tournamentId={tournament.id}
          tournamentName={tournament.name}
          count={playersCount || 0}
        />
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
            <button
              type="button"
              className="admin-btn admin-btn-reject"
              disabled={busy}
              onClick={deleteTournament}
            >
              Delete
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
    {hasBrief && showBrief && (
      <tr className="admin-row-brief">
        <td colSpan={7}>
          <div className="admin-brief-box">
            <strong>Poster/reel brief</strong>{" "}
            <span className="admin-row-sub">
              ({tournament.promo_brief_mode === "freeform" ? "pasted as one paragraph" : "filled in as fields"})
            </span>
            {tournament.promo_brief_mode === "freeform" ? (
              <p className="admin-brief-text">{tournament.promo_brief_text || "—"}</p>
            ) : (
              <dl className="admin-brief-fields">
                {STRUCTURED_BRIEF_FIELDS.filter(([key]) => tournament[key]).map(([key, label]) => (
                  <div key={key}>
                    <dt>{label}</dt>
                    <dd>{String(tournament[key])}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </td>
      </tr>
    )}
    </>
  );
}
