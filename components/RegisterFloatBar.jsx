"use client";

import { useEffect, useRef, useState } from "react";
import SwipeToRegister from "./SwipeToRegister";

export default function RegisterFloatBar({ prize, registerHref, tournamentId }) {
  const sentinelRef = useRef(null);
  const [docked, setDocked] = useState(false);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setDocked(entry.boundingClientRect.top <= window.innerHeight),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div ref={sentinelRef} className="tdp-float-sentinel" aria-hidden="true" />
      <div className={`tdp-float-bar${docked ? " is-docked" : ""}`}>
        <div className="tdp-float-pill">
          <div className="tdp-float-prize">
            <small>Prize pool</small>
            <span className="amt">{prize}</span>
          </div>
          <div className="tdp-float-cta">
            <SwipeToRegister
              href={registerHref}
              tournamentId={tournamentId}
              idleLabel="Slide to Register"
            />
          </div>
        </div>
      </div>
    </>
  );
}
