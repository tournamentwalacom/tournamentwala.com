"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import TicketLoader from "./TicketLoader";

const THUMB = 52;
const TRACK_PAD = 4;
const CONFIRM_THRESHOLD = 0.82;

export default function SlideToSubmit({
  onConfirm,
  busy = false,
  disabled = false,
  resetSignal,
  idleLabel = "Slide to submit",
  busyLabel = "Submitting…",
}) {
  const trackRef = useRef(null);
  const maxXRef = useRef(0);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    if (resetSignal === undefined) return;
    setLocked(false);
    setDragX(0);
  }, [resetSignal]);

  const getMaxX = useCallback(() => {
    const track = trackRef.current;
    if (!track) return 0;
    return Math.max(0, track.offsetWidth - THUMB - TRACK_PAD * 2);
  }, []);

  function handlePointerDown(e) {
    if (disabled || busy || locked) return;
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
      setDragX(max);
      setLocked(true);
      onConfirm();
    } else {
      setDragX(0);
    }
  }

  function handleKeyDown(e) {
    if (disabled || busy || locked) return;
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    maxXRef.current = getMaxX();
    setDragX(maxXRef.current);
    setLocked(true);
    onConfirm();
  }

  const active = busy || locked;
  const shownX = active ? maxXRef.current || getMaxX() : dragX;
  const max = getMaxX() || 1;
  const progress = Math.min(1, shownX / max);

  return (
    <div
      className="slide-submit-track"
      ref={trackRef}
      onPointerMove={handlePointerMove}
      onPointerUp={finishDrag}
      onPointerCancel={finishDrag}
    >
      <div
        className="slide-submit-fill"
        style={{
          width: `${shownX + THUMB}px`,
          transition: dragging ? "none" : "width 0.25s ease",
        }}
      />
      <span
        className={`slide-submit-label${active ? " is-active" : ""}`}
        style={{ opacity: active ? 1 : Math.max(0, 1 - progress * 1.6) }}
      >
        {active ? busyLabel : idleLabel}
      </span>
      <div
        className={`slide-submit-thumb${dragging ? " is-dragging" : ""}${
          active ? " is-active" : ""
        }`}
        style={{
          transform: `translateX(${shownX}px)`,
          transition: dragging ? "none" : "transform 0.25s ease",
        }}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled || busy || locked}
        aria-label={idleLabel}
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
  );
}
