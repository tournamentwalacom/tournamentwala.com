"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

const AUTO_MS = 2500;

export default function TicketSlider({ tickets }) {
  const trackRef = useRef(null);
  const timerRef = useRef(null);
  const resumeRef = useRef(null);

  function step() {
    const track = trackRef.current;
    const card = track?.querySelector(".ticket-slide");
    if (!track || !card) return 0;
    const gap = parseFloat(getComputedStyle(track).columnGap || 0) || 0;
    return card.getBoundingClientRect().width + gap;
  }

  function stop() {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  }

  function play() {
    stop();
    timerRef.current = setInterval(goNext, AUTO_MS);
  }

  function pause() {
    stop();
    clearTimeout(resumeRef.current);
  }

  function scheduleResume() {
    clearTimeout(resumeRef.current);
    resumeRef.current = setTimeout(play, AUTO_MS);
  }

  function goNext() {
    const track = trackRef.current;
    if (!track) return;
    const advance = step();
    const atEnd =
      track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
    track.scrollTo({
      left: atEnd ? 0 : track.scrollLeft + advance,
      behavior: "smooth",
    });
  }

  function goPrev() {
    const track = trackRef.current;
    if (!track) return;
    const advance = step();
    const atStart = track.scrollLeft <= 4;
    track.scrollTo({
      left: atStart ? track.scrollWidth : track.scrollLeft - advance,
      behavior: "smooth",
    });
  }

  function handleArrowClick(fn) {
    return () => {
      pause();
      fn();
      scheduleResume();
    };
  }

  useEffect(() => {
    const track = trackRef.current;
    if (!track || tickets.length <= 1) return;

    play();

    track.addEventListener("pointerdown", pause);
    track.addEventListener("touchstart", pause, { passive: true });
    track.addEventListener("pointerup", scheduleResume);
    track.addEventListener("touchend", scheduleResume);
    track.addEventListener("mouseleave", scheduleResume);

    return () => {
      stop();
      clearTimeout(resumeRef.current);
      track.removeEventListener("pointerdown", pause);
      track.removeEventListener("touchstart", pause);
      track.removeEventListener("pointerup", scheduleResume);
      track.removeEventListener("touchend", scheduleResume);
      track.removeEventListener("mouseleave", scheduleResume);
    };
  }, [tickets.length]);

  return (
    <div className="tickets-slider-wrap">
      <div className="tickets-slider" ref={trackRef}>
        {tickets.map((t) => (
          <Link
            href={`/explore/${t.id}`}
            className="ticket ticket-slide"
            key={t.id}
          >
            <div className="ticket-top">
              <div className="ticket-sport">
                <span className="chip">{t.sport}</span>
                {t.tag && (
                  <span className={`chip ${t.hot ? "chip-hot" : ""}`}>
                    {t.tag}
                  </span>
                )}
              </div>
              <h3>{t.name}</h3>
              <div className="ticket-facts">
                <span>
                  📍 <b>{t.venue}, {t.city}</b>
                </span>
                <span>
                  🗓️ <b>{t.dateRange}</b>
                </span>
                <span>
                  ⚙️ {t.format ? `${t.format} · ` : ""}Entry <b>{t.entryFee}</b>
                </span>
              </div>
            </div>

            <div className="ticket-tear" aria-hidden="true" />

            <div className="ticket-stub">
              <div className="prize">
                <small>Prize pool</small>
                <span className="amt">{t.prize}</span>
              </div>
              <span className="barcode" aria-hidden="true" />
              <span className="btn btn-stub">Register</span>
            </div>
          </Link>
        ))}
      </div>

      {tickets.length > 1 && (
        <div className="slider-nav">
          <button
            type="button"
            className="slider-arrow"
            aria-label="Previous tournaments"
            onClick={handleArrowClick(goPrev)}
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M15 5l-7 7 7 7"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            className="slider-arrow"
            aria-label="Next tournaments"
            onClick={handleArrowClick(goNext)}
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M9 5l7 7-7 7"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
