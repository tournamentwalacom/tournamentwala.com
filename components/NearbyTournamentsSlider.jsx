"use client";

import { useEffect, useRef, useState } from "react";
import { haversineDistanceKm } from "@/lib/geo";
import {
  LOCATION_CHOICE_KEY,
  LOCATION_GRANTED_EVENT,
  requestLocation,
} from "@/lib/locationConsent";
import TicketSlider from "@/components/TicketSlider";
import TicketLoader from "@/components/TicketLoader";

const NEARBY_COUNT = 5;

export default function NearbyTournamentsSlider({ tickets }) {
  const [userCoords, setUserCoords] = useState(null);
  const [locating, setLocating] = useState(false);
  const sectionRef = useRef(null);

  // Restores silently on a return visit — no event needed, mirrors
  // ExploreTournaments.jsx's own on-mount restore.
  useEffect(() => {
    if (localStorage.getItem(LOCATION_CHOICE_KEY) === "granted") {
      setLocating(true);
      requestLocation({
        onSuccess: (coords) => {
          setUserCoords(coords);
          setLocating(false);
        },
        onError: () => setLocating(false),
      });
    }
  }, []);

  // Hero's "Find nearby tournament" button broadcasts freshly-obtained
  // coordinates here, since it's a separate, unrelated component with no
  // shared React state.
  useEffect(() => {
    function handleGranted(event) {
      setUserCoords(event.detail);
      sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    window.addEventListener(LOCATION_GRANTED_EVENT, handleGranted);
    return () => window.removeEventListener(LOCATION_GRANTED_EVENT, handleGranted);
  }, []);

  if (!userCoords) {
    if (!locating) {
      return <section id="nearby-tournaments" ref={sectionRef} />;
    }
    return (
      <section
        className="section tournaments-section tournaments-section--tint"
        id="nearby-tournaments"
        ref={sectionRef}
      >
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Nearby Tournaments</span>
            <h2 className="section-title">Find your Spot.</h2>
          </div>
          <TicketLoader label="Finding tournaments near you" size="md" />
        </div>
      </section>
    );
  }

  const nearby = tickets
    .filter((t) => t.latitude != null && t.longitude != null)
    .map((t) => ({
      ...t,
      distanceKm: haversineDistanceKm(userCoords.lat, userCoords.lng, t.latitude, t.longitude),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, NEARBY_COUNT);

  return (
    <section
      className="section tournaments-section tournaments-section--tint"
      id="nearby-tournaments"
      ref={sectionRef}
    >
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Nearby Tournaments</span>
          <div className="section-title-row">
            <h2 className="section-title">Find your Spot.</h2>
            <a href="/explore-tournaments" className="btn btn-ghost browse-all">
              Browse all
            </a>
          </div>
        </div>

        {nearby.length === 0 ? (
          <div className="tickets-empty">
            No tournaments near you yet — check back soon, or{" "}
            <a href="/explore-tournaments">browse all tournaments</a>.
          </div>
        ) : (
          <TicketSlider tickets={nearby} browseAllHref="/explore-tournaments" />
        )}
      </div>
    </section>
  );
}
