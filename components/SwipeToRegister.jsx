"use client";

import { useCallback, useRef, useState } from "react";
import TicketLoader from "./TicketLoader";

const THUMB = 52;
const TRACK_PAD = 4;
const CONFIRM_THRESHOLD = 0.82;
const PHONE_RE = /^[6-9]\d{9}$/;

export default function SwipeToRegister({
  href,
  tournamentId,
  idleLabel = "Slide to Register",
  busyLabel = "Calling…",
}) {
  const trackRef = useRef(null);
  const maxXRef = useRef(0);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [locked, setLocked] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [wantsUpdates, setWantsUpdates] = useState(true);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const getMaxX = useCallback(() => {
    const track = trackRef.current;
    if (!track) return 0;
    return Math.max(0, track.offsetWidth - THUMB - TRACK_PAD * 2);
  }, []);

  function openConfirm() {
    maxXRef.current = maxXRef.current || getMaxX();
    setDragX(maxXRef.current);
    setShowConfirm(true);
  }

  function resetSlider() {
    setShowConfirm(false);
    setDragX(0);
    setName("");
    setPhone("");
    setWantsUpdates(true);
    setFormError("");
  }

  function call() {
    setLocked(true);
    window.setTimeout(() => {
      window.location.href = href;
    }, 300);
  }

  async function handleConfirm(e) {
    e.preventDefault();
    const trimmedName = name.trim();
    const digits = phone.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "");

    if (!trimmedName) {
      setFormError("Please enter your name.");
      return;
    }
    if (!PHONE_RE.test(digits)) {
      setFormError("Please enter a valid 10-digit phone number.");
      return;
    }

    setFormError("");
    setSubmitting(true);

    try {
      await fetch("/api/registrations/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tournamentId,
          name: trimmedName,
          phone: digits,
          wantsUpdates,
        }),
      });
    } catch {
      // Best-effort — a failed save shouldn't stop the player from calling.
    }

    setSubmitting(false);
    setShowConfirm(false);
    call();
  }

  function handlePointerDown(e) {
    if (locked || showConfirm) return;
    maxXRef.current = getMaxX();
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e) {
    if (!dragging) return;
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left - TRACK_PAD - THUMB / 2;
    setDragX(Math.max(0, Math.min(maxXRef.current, x)));
  }

  function finishDrag() {
    if (!dragging) return;
    setDragging(false);
    const max = maxXRef.current || 1;
    if (dragX / max >= CONFIRM_THRESHOLD) {
      openConfirm();
    } else {
      setDragX(0);
    }
  }

  function handleKeyDown(e) {
    if (locked || showConfirm) return;
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    maxXRef.current = getMaxX();
    openConfirm();
  }

  const active = locked;
  const shownX = active || showConfirm ? maxXRef.current || getMaxX() : dragX;
  const max = getMaxX() || 1;
  const progress = Math.min(1, shownX / max);

  return (
    <>
      <div
        className="swipe-register-track"
        ref={trackRef}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
      >
        <div
          className="swipe-register-fill"
          style={{
            width: `${shownX + THUMB}px`,
            transition: dragging ? "none" : "width 0.25s ease",
          }}
        />
        <span
          className="swipe-register-label"
          style={{ opacity: Math.max(0, 1 - progress * 1.6) }}
        >
          {active ? busyLabel : idleLabel}
        </span>
        <div
          className={`swipe-register-thumb${dragging ? " is-dragging" : ""}${
            active ? " is-active" : ""
          }`}
          style={{
            transform: `translateX(${shownX}px)`,
            transition: dragging ? "none" : "transform 0.25s ease",
          }}
          role="button"
          tabIndex={locked ? -1 : 0}
          aria-disabled={locked}
          aria-label={`${idleLabel} — enter your details to call the organizer`}
          onPointerDown={handlePointerDown}
          onKeyDown={handleKeyDown}
        >
          {active ? (
            <TicketLoader iconOnly size="sm" label={busyLabel} />
          ) : (
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path
                d="M9 6l6 6-6 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
      </div>

      {showConfirm && (
        <div
          className="register-confirm-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Confirm your registration details"
        >
          <form
            className="register-confirm-card"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleConfirm}
          >
            <h3>Confirm your details</h3>
            <p className="register-confirm-sub">
              We&rsquo;ll save these so the organizer knows who&rsquo;s calling.
            </p>

            <label className="post-field">
              Your name
              <input
                type="text"
                autoFocus
                maxLength={80}
                value={name}
                disabled={submitting}
                onChange={(e) => setName(e.target.value)}
              />
            </label>

            <label className="post-field">
              Phone number
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="10-digit mobile number"
                value={phone}
                disabled={submitting}
                onChange={(e) => setPhone(e.target.value.replace(/[^\d]/g, ""))}
              />
            </label>

            <label className="register-confirm-checkbox">
              <input
                type="checkbox"
                checked={wantsUpdates}
                disabled={submitting}
                onChange={(e) => setWantsUpdates(e.target.checked)}
              />
              Receive tournament updates regularly
            </label>

            {formError && <p className="post-error">{formError}</p>}

            <div className="register-confirm-actions">
              <button
                type="button"
                className="btn btn-ghost"
                disabled={submitting}
                onClick={resetSlider}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? "Submitting…" : "Confirm & Call"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
