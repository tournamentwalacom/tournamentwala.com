const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const NOMINATIM_REVERSE_URL = "https://nominatim.openstreetmap.org/reverse";
const NOMINATIM_HEADERS = {
  "User-Agent": "TournamentWala/1.0 (mitochondigital@gmail.com)",
  "Accept-Language": "en",
};

// Shared by geocodePincode and geocodeQuery below — hits Nominatim's forward
// search endpoint with whatever query string it's given and returns the top
// result's coordinates. Never throws.
async function searchNominatim(queryString) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(`${NOMINATIM_URL}?${queryString}`, {
      headers: NOMINATIM_HEADERS,
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

// Converts an Indian pincode to coordinates using OpenStreetMap's free
// Nominatim API. Never throws — a geocoding hiccup should never block a
// tournament submission, so any failure just returns null and the row is
// saved without coordinates (it's simply excluded from distance sorting).
export async function geocodePincode(pincode) {
  if (!pincode) return null;
  return searchNominatim(
    `postalcode=${encodeURIComponent(pincode)}&country=India&format=json&limit=1`
  );
}

// Fallback for map links that resolve to a place name instead of embedded
// coordinates — e.g. the newer share.google short links redirect to a
// Google *Search* results page (not Maps), which only carries the business
// name in its `q=` param, no lat/lng. Scoping the free-text search to the
// city the organizer already entered keeps results from drifting to a
// same-named venue in a different city.
export async function geocodeQuery(query, city) {
  if (!query) return null;
  const fullQuery = city ? `${query}, ${city}` : query;
  return searchNominatim(
    `q=${encodeURIComponent(fullQuery)}&countrycodes=in&format=json&limit=1`
  );
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
      headers: NOMINATIM_HEADERS,
      signal: controller.signal,
    });
    if (!res.ok) return null;

    const result = await res.json();
    const a = result?.address || {};

    // Indian PIN codes are 6 digits and never start with 0 — OSM's crowd-
    // sourced postcode tag is occasionally malformed (seen: "020626"), so
    // reject anything that can't be a real PIN rather than auto-filling junk.
    const postcodeDigits = typeof a.postcode === "string" ? a.postcode.replace(/\D/g, "") : "";
    const pincode = /^[1-9]\d{5}$/.test(postcodeDigits) ? postcodeDigits : null;
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
