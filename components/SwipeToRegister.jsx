"use client";

import { useCallback, useRef, useState } from "react";
import TicketLoader from "./TicketLoader";

const THUMB = 52;
const TRACK_PAD = 4;
const CONFIRM_THRESHOLD = 0.82;

export default function SwipeToRegister({
  href,
  idleLabel = "Slide to Register",
  busyLabel = "Calling…",
}) {
  const trackRef = useRef(null);
  const maxXRef = useRef(0);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [locked, setLocked] = useState(false);

  const getMaxX = useCallback(() => {
    const track = trackRef.current;
    if (!track) return 0;
    return Math.max(0, track.offsetWidth - THUMB - TRACK_PAD * 2);
  }, []);

  function go() {
    setLocked(true);
    window.setTimeout(() => {
      window.location.href = href;
    }, 300);
  }

  function handlePointerDown(e) {
    if (locked) return;
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
      go();
    } else {
      setDragX(0);
    }
  }

  function handleKeyDown(e) {
    if (locked) return;
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    maxXRef.current = getMaxX();
    setDragX(maxXRef.current);
    go();
  }

  const active = locked;
  const shownX = active ? maxXRef.current || getMaxX() : dragX;
  const max = getMaxX() || 1;
  const progress = Math.min(1, shownX / max);

  return (
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
        aria-label={`${idleLabel} — calls the organizer to book your spot`}
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
