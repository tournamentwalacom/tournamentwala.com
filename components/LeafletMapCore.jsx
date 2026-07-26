"use client";

// Raw Leaflet/OpenStreetMap rendering only — no fetches, no form state. Kept
// separate from VenueMapPicker.jsx so that component can dynamic-import this
// one with { ssr: false } (Leaflet touches `window` at import time and can't
// run during server rendering).

import { useEffect, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Leaflet's default marker icon references image paths that don't resolve
// under a bundler — point them at the same CDN copies Leaflet's own docs
// recommend for bundled apps.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const INDIA_CENTER = [20.5937, 78.9629];
const INDIA_ZOOM = 5;
const PIN_ZOOM = 17;

function ClickToPlace({ onMove }) {
  useMapEvents({
    click(e) {
      onMove(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function DraggableMarker({ position, onMove }) {
  const markerRef = useRef(null);
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (!marker) return;
        const { lat, lng } = marker.getLatLng();
        onMove(lat, lng);
      },
    }),
    [onMove]
  );

  return <Marker draggable position={position} eventHandlers={eventHandlers} ref={markerRef} />;
}

// Recenters the map imperatively whenever `recenterKey` changes (bumped by
// the parent only for *programmatic* moves — auto-fill, GPS, search — not
// for a drag/click the user just made on the map itself, which shouldn't
// visually jump).
function RecenterOnExternalChange({ position, recenterKey }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, PIN_ZOOM);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recenterKey]);
  return null;
}

export default function LeafletMapCore({ latitude, longitude, recenterKey, onMove }) {
  const hasPosition = typeof latitude === "number" && typeof longitude === "number";
  const position = hasPosition ? [latitude, longitude] : null;

  return (
    <MapContainer
      center={position || INDIA_CENTER}
      zoom={hasPosition ? PIN_ZOOM : INDIA_ZOOM}
      scrollWheelZoom
      style={{ height: "260px", width: "100%", borderRadius: "12px" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickToPlace onMove={onMove} />
      {hasPosition && <DraggableMarker position={position} onMove={onMove} />}
      <RecenterOnExternalChange position={position} recenterKey={recenterKey} />
    </MapContainer>
  );
}
