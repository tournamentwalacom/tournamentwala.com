// Turns a pasted Google Maps venue link into precise coordinates — used
// instead of pincode-centroid geocoding (see lib/geocode.js) so nearby-
// tournament distance sorting reflects the actual ground, not just the
// postal area centroid.

// All of these are plain HTTP redirects (no JS execution needed) to a
// longer Google URL — maps.app.goo.gl/goo.gl land on a maps.google.com
// place URL with embedded coordinates, but the newer share.google links
// land on a plain *Search* results page with only the business name, no
// coordinates (see extractPlaceQueryFromUrl below).
const SHORT_LINK_HOSTS = new Set(["maps.app.goo.gl", "goo.gl", "share.google"]);
const BROWSER_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

// Ordered by how precise/reliable each pattern tends to be in real Google
// Maps URLs. The first match wins.
const COORD_PATTERNS = [
  /@(-?\d{1,2}\.\d+),(-?\d{1,3}\.\d+)/, // .../place/Name/@lat,lng,17z/...
  /!3d(-?\d{1,2}\.\d+)!4d(-?\d{1,3}\.\d+)/, // .../data=...!3dLAT!4dLNG...
  /[?&]q=(-?\d{1,2}\.\d+),(-?\d{1,3}\.\d+)/, // ?q=lat,lng
  /[?&]ll=(-?\d{1,2}\.\d+),(-?\d{1,3}\.\d+)/, // ?ll=lat,lng
];

// Google Maps lets you long-press (mobile) or click (maps.google.com on
// desktop) any exact spot and it shows the raw coordinates directly, with a
// tap/copy to grab them — e.g. "12.971599, 77.594566". Since that's Google's
// own GPS math rather than a name lookup, it can never fail the way a
// share-link name search can (see resolveGoogleMapsLink below) — accepting
// it directly in the same field gives organizers a guaranteed-to-work path.
const BARE_COORD_RE = /^(-?\d{1,2}(?:\.\d+)?)\s*,\s*(-?\d{1,3}(?:\.\d+)?)$/;

export function extractBareCoordinates(text) {
  const match = typeof text === "string" ? text.trim().match(BARE_COORD_RE) : null;
  if (!match) return null;

  const latitude = parseFloat(match[1]);
  const longitude = parseFloat(match[2]);
  if (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    Math.abs(latitude) <= 90 &&
    Math.abs(longitude) <= 180
  ) {
    return { latitude, longitude };
  }
  return null;
}

function isGoogleMapsHost(hostname) {
  return (
    SHORT_LINK_HOSTS.has(hostname) ||
    /(^|\.)google\.[a-z.]+$/i.test(hostname) || // google.com, google.co.in, ...
    /(^|\.)google$/i.test(hostname) // the newer .google TLD, e.g. share.google
  );
}

function extractLatLngFromUrl(fullUrl) {
  for (const pattern of COORD_PATTERNS) {
    const match = fullUrl.match(pattern);
    if (!match) continue;

    const latitude = parseFloat(match[1]);
    const longitude = parseFloat(match[2]);
    if (
      Number.isFinite(latitude) &&
      Number.isFinite(longitude) &&
      Math.abs(latitude) <= 90 &&
      Math.abs(longitude) <= 180
    ) {
      return { latitude, longitude };
    }
  }
  return null;
}

// share.google links (and a plain .../maps/search/?q=<name> URL) carry only
// a business name, not coordinates — pulled out so the caller can fall back
// to geocoding it by name (see lib/geocode.js's geocodeQuery).
function extractPlaceQueryFromUrl(fullUrl) {
  let url;
  try {
    url = new URL(fullUrl);
  } catch {
    return null;
  }
  const q = url.searchParams.get("q");
  if (!q) return null;
  // Only useful as a name if it isn't itself a bare "lat,lng" pair — that
  // case is already handled by COORD_PATTERNS above.
  return /^-?\d+\.\d+,-?\d+\.\d+$/.test(q.trim()) ? null : q.trim();
}

// Short links are plain HTTP redirects — just follow the redirect chain.
async function resolveRedirect(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: { "User-Agent": BROWSER_USER_AGENT },
      signal: controller.signal,
    });
    return res.url || url;
  } catch {
    return url;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Resolves a pasted Google Maps link (full, or shortened via
 * maps.app.goo.gl/goo.gl/share.google) into location info. Returns null if
 * the URL isn't a recognizable Google Maps/Search link at all. Otherwise
 * returns { latitude, longitude } when coordinates were embedded in the
 * link, or { query } when only a place name could be recovered (the caller
 * should geocode that by name) — never both. Never throws.
 */
export async function resolveGoogleMapsLink(rawUrl) {
  let url;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  if (!isGoogleMapsHost(url.hostname)) return null;

  const finalUrl = SHORT_LINK_HOSTS.has(url.hostname)
    ? await resolveRedirect(rawUrl)
    : rawUrl;

  const coords = extractLatLngFromUrl(finalUrl);
  if (coords) return coords;

  const query = extractPlaceQueryFromUrl(finalUrl);
  return query ? { query } : null;
}
