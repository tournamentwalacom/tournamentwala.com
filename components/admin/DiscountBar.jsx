"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DiscountBar({ initial }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState(initial?.message || "");
  const [percentage, setPercentage] = useState(String(initial?.percentage ?? "0"));
  const [isActive, setIsActive] = useState(Boolean(initial?.is_active));
  const [status, setStatus] = useState("idle"); // idle | saving | error
  const [error, setError] = useState("");

  function openModal() {
    setMessage(initial?.message || "");
    setPercentage(String(initial?.percentage ?? "0"));
    setIsActive(Boolean(initial?.is_active));
    setError("");
    setStatus("idle");
    setOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setError("");
    setStatus("saving");

    try {
      const res = await fetch("/api/admin/discount", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, percentage, is_active: isActive }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      setOpen(false);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setStatus("error");
    }
  }

  const busy = status === "saving";

  return (
    <>
      <div className="admin-discount-trigger">
        <button type="button" className="btn admin-discount-btn" onClick={openModal}>
          🔥 Discount &amp; Announcement
        </button>
        {initial?.is_active && Number(initial?.percentage) > 0 && (
          <span className="admin-discount-live-badge">{initial.percentage}% OFF live</span>
        )}
      </div>

      {open && (
        <div className="admin-modal-backdrop" onClick={() => !busy && setOpen(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="admin-modal-title">Discount &amp; announcement</h2>
            <p className="admin-modal-hint">
              Shown as a highlighted banner on the promotion package picker, and the percentage is
              knocked off every paid package&apos;s price.
            </p>

            <form className="post-form" onSubmit={handleSave}>
              <div className="post-form-grid">
                <label className="post-field post-field-wide">
                  Announcement message <span>(optional)</span>
                  <textarea
                    maxLength={200}
                    rows={3}
                    placeholder="e.g. Diwali offer — 20% off all promotion add-ons this week!"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </label>

                <label className="post-field">
                  Discount percentage
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={percentage}
                    onChange={(e) => setPercentage(e.target.value)}
                  />
                </label>

                <label className="post-field post-field-checkbox">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                  />
                  Active (applies to the public picker right now)
                </label>
              </div>

              {error && <p className="post-error">{error}</p>}

              <div className="admin-row-actions admin-modal-actions">
                <button type="submit" className="btn btn-primary" disabled={busy}>
                  {busy ? "Saving…" : "Save"}
                </button>
                <button
                  type="button"
                  className="admin-btn"
                  disabled={busy}
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
