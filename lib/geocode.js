const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const NOMINATIM_REVERSE_URL = "https://nominatim.openstreetmap.org/reverse";

// Converts an Indian pincode to coordinates using OpenStreetMap's free
// Nominatim API. Never throws — a geocoding hiccup should never block a
// tournament submission, so any failure just returns null and the row is
// saved without coordinates (it's simply excluded from distance sorting).
export async function geocodePincode(pincode) {
  if (!pincode) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const url = `${NOMINATIM_URL}?postalcode=${encodeURIComponent(pincode)}&country=India&format=json&limit=1`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "TournamentWala/1.0 (mitochondigital@gmail.com)",
        "Accept-Language": "en",
      },
      signal: controller.signal,
    });
    if (!res.ok) return null;

    const results = await res.json();
    const latitude = parseFloat(results?.[0]?.lat);
    const longitude = parseFloat(results?.[0]?.lon);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

    return { latitude, longitude };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

// Reverse-geocodes coordinates (extracted from a pasted Google Maps link,
// see lib/mapsLink.js) into an address/city/pincode for auto-filling the
// venue form. Never throws — same defensive shape as geocodePincode above.
export async function reverseGeocode(latitude, longitude) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const url = `${NOMINATIM_REVERSE_URL}?lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}&format=json&addressdetails=1&zoom=18`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "TournamentWala/1.0 (mitochondigital@gmail.com)",
        "Accept-Language": "en",
      },
      signal: controller.signal,
    });
    if (!res.ok) return null;

    const result = await res.json();
    const a = result?.address || {};

    const postcodeDigits = typeof a.postcode === "string" ? a.postcode.replace(/\D/g, "") : "";
    const pincode = /^\d{6}$/.test(postcodeDigits) ? postcodeDigits : null;
    const city = a.city || a.town || a.village || a.municipality || a.state_district || null;
    const address =
      [a.road, a.suburb || a.neighbourhood, a.county].filter(Boolean).join(", ") ||
      result?.display_name ||
      null;

    return { address, city, pincode };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
