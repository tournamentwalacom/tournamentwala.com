"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function TournamentPoster({ src, alt }) {
  const [open, setOpen] = useState(false);
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(e) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function close() {
    setOpen(false);
    setZoomed(false);
  }

  return (
    <>
      <button
        type="button"
        className="tdp-portrait"
        onClick={() => setOpen(true)}
        aria-label="View poster full size"
      >
        <img src={src} alt={alt} />
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="poster-lightbox" onClick={close}>
            <button
              type="button"
              className="poster-lightbox-close"
              onClick={close}
              aria-label="Close full-size poster"
            >
              ×
            </button>
            <div
              className={`poster-lightbox-frame${zoomed ? " zoomed" : ""}`}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={src}
                alt={alt}
                onClick={() => setZoomed((z) => !z)}
              />
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
