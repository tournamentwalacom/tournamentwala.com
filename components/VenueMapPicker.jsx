"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

// Leaflet touches `window` at import time, so the actual map must never be
// part of server rendering.
const LeafletMapCore = dynamic(() => import("./LeafletMapCore"), {
  ssr: false,
  loading: () => <div className="post-map-picker-loading">Loading map…</div>,
});

/**
 * Interactive fallback/refinement for setting the venue's exact coordinates
 * — rendered below the "Auto-fill from map link" button (see
 * VenueMapAutofillButton) on both tournament forms. Needed because some
 * Google share-link formats (e.g. the newer share.google short links) don't
 * carry coordinates at all — see lib/mapsLink.js — so this guarantees a real
 * lat/lng is always reachable one way or another: search an address, use
 * GPS, or just click/drag the pin directly on the map. Whichever method sets
 * the coordinates, they're reverse-geocoded the same way to keep
 * address/city/pincode in sync.
 */
export default function VenueMapPicker({ latitude, longitude, city, onLocationChange }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | error
  const [error, setError] = useState("");
  const [recenterKey, setRecenterKey] = useState(0);
  const lastSelfMove = useRef(null);

  // Bumps the map's recenter trigger when the coordinates changed for a
  // reason *other* than this component's own click/drag handler on the map
  // itself (e.g. the separate "Auto-fill from map link" button, or the
  // initial coordinates on an admin edit page) — a drag/click shouldn't
  // cause the map to visually jump right after the user placed it there.
  useEffect(() => {
    if (typeof latitude !== "number" || typeof longitude !== "number") return;
    const last = lastSelfMove.current;
    if (last && last.latitude === latitude && last.longitude === longitude) return;
    setRecenterKey((k) => k + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latitude, longitude]);

  async function resolveAndApply(payload, { recenter }) {
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/geocode/from-maps-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, city }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || typeof data.latitude !== "number") {
        setError(data.error || "Couldn't fetch that location. Please try again.");
        setStatus("error");
        return;
      }

      if (!recenter) {
        lastSelfMove.current = { latitude: data.latitude, longitude: data.longitude };
      }
      onLocationChange(data);
      setStatus("idle");
    } catch {
      setError("Network error — please try again.");
      setStatus("error");
    }
  }

  function handleMapMove(lat, lng) {
    resolveAndApply({ latitude: lat, longitude: lng }, { recenter: false });
  }

  function handleUseMyLocation() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError("Your browser doesn't support location access.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    setError("");
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolveAndApply(
          { latitude: pos.coords.latitude, longitude: pos.coords.longitude },
          { recenter: true }
        ),
      () => {
        setError("Couldn't get your location — please allow location access, or set the pin manually.");
        setStatus("error");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  function handleSearch(e) {
    e.preventDefault();
    if (!search.trim() || status === "loading") return;
    resolveAndApply({ query: search.trim() }, { recenter: true });
  }

  const hasCoords = typeof latitude === "number" && typeof longitude === "number";

  return (
    <div className="post-map-picker-wrap">
      <div className="post-map-picker-controls">
        <form className="post-map-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search an address to jump the map here…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            type="submit"
            className="btn btn-ghost"
            disabled={!search.trim() || status === "loading"}
          >
            Find
          </button>
        </form>
        <button
          type="button"
          className="btn btn-ghost post-map-gps-btn"
          onClick={handleUseMyLocation}
          disabled={status === "loading"}
        >
          📍 Use my current location
        </button>
      </div>

      <LeafletMapCore
        latitude={latitude}
        longitude={longitude}
        recenterKey={recenterKey}
        onMove={handleMapMove}
      />

      <p className="post-map-status-success">
        {hasCoords
          ? `Pin set at ${latitude.toFixed(6)}, ${longitude.toFixed(6)} — drag it to fine-tune; address, city & pincode below update automatically.`
          : "Click or drag on the map to drop a pin at your venue."}
      </p>
      {error && <p className="post-error">{error}</p>}
    </div>
  );
}
