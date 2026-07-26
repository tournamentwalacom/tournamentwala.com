const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

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
