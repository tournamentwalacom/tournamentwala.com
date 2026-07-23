// Turns a pasted Google Maps venue link into precise coordinates — used
// instead of pincode-centroid geocoding (see lib/geocode.js) so nearby-
// tournament distance sorting reflects the actual ground, not just the
// postal area centroid.

const SHORT_LINK_HOSTS = new Set(["maps.app.goo.gl", "goo.gl"]);
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

function isGoogleMapsHost(hostname) {
  return (
    SHORT_LINK_HOSTS.has(hostname) ||
    /(^|\.)google\.[a-z.]+$/i.test(hostname)
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

// Short links (maps.app.goo.gl, goo.gl/maps) are plain HTTP redirects to the
// full place URL — no JS execution needed, just follow the redirect chain.
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
 * Resolves a pasted Google Maps link (full or shortened) to { latitude,
 * longitude }. Returns null if the URL isn't a recognizable Google Maps
 * link or no coordinates could be found in it — never throws.
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

  return extractLatLngFromUrl(finalUrl);
}
