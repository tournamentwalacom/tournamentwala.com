// Shared browser-geolocation consent flow used by both /explore-tournaments
// (components/ExploreTournaments.jsx) and the homepage "Nearby Tournaments"
// section (components/NearbyTournamentsSlider.jsx via components/Hero.jsx).
export const LOCATION_CHOICE_KEY = "tw_location_choice";
export const LOCATION_DISMISSED_KEY = "tw_location_dismissed";

// Broadcast when a click-triggered request succeeds, so already-mounted
// components with no shared React state (e.g. Hero and the homepage Nearby
// section) can react live.
export const LOCATION_GRANTED_EVENT = "tw:location-granted";

const GEOLOCATION_OPTIONS = { timeout: 8000, maximumAge: 600000 };

export function requestLocation({ onSuccess, onError } = {}) {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    onError?.();
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      localStorage.setItem(LOCATION_CHOICE_KEY, "granted");
      onSuccess?.(coords);
    },
    () => {
      localStorage.setItem(LOCATION_CHOICE_KEY, "denied");
      onError?.();
    },
    GEOLOCATION_OPTIONS
  );
}

export function requestAndBroadcastLocation(callbacks = {}) {
  requestLocation({
    onSuccess: (coords) => {
      window.dispatchEvent(
        new CustomEvent(LOCATION_GRANTED_EVENT, { detail: coords })
      );
      callbacks.onSuccess?.(coords);
    },
    onError: callbacks.onError,
  });
}
