"use client";

import { useState } from "react";

/**
 * "Auto-fill details" button for the venue's Google Maps link — shared by
 * the public post-tournament form and the admin tournament form. Resolves
 * the pasted link to precise coordinates (lib/mapsLink.js + lib/geocode.js
 * via /api/geocode/from-maps-link) and reports the result back up so the
 * parent form can fill in latitude/longitude/address/city/pincode. Clicking
 * this is required before either form can be submitted — see the
 * `!form.latitude || !form.longitude` check in each form's submit handler.
 */
export default function VenueMapAutofillButton({ mapUrl, latitude, longitude, onResult }) {
  const [status, setStatus] = useState("idle"); // idle | loading | error
  const [error, setError] = useState("");

  const hasCoords = typeof latitude === "number" && typeof longitude === "number";

  async function handleClick() {
    if (!mapUrl) return;
    setStatus("loading");
    setError("");

    try {
      const res = await fetch("/api/geocode/from-maps-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: mapUrl }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || typeof data.latitude !== "number") {
        setError(data.error || "Couldn't fetch the location. Please try again.");
        setStatus("error");
        return;
      }

      onResult(data);
      setStatus("idle");
    } catch {
      setError("Network error — please try again.");
      setStatus("error");
    }
  }

  return (
    <div className="post-map-autofill">
      <button
        type="button"
        className="btn btn-ghost post-map-autofill-btn"
        onClick={handleClick}
        disabled={!mapUrl || status === "loading"}
      >
        {status === "loading" ? "Fetching location…" : "Auto-fill details from map link"}
      </button>
      {hasCoords && status !== "loading" && (
        <p className="post-map-status-success">
          📍 Location found: {latitude.toFixed(6)}, {longitude.toFixed(6)} — address, city &amp; pincode filled in below.
        </p>
      )}
      {error && <p className="post-error">{error}</p>}
    </div>
  );
}
