import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { checkRateLimit, clientIp } from "@/lib/rateLimit";
import { resolveGoogleMapsLink } from "@/lib/mapsLink";
import { reverseGeocode, geocodeQuery } from "@/lib/geocode";

/**
 * Powers the venue-location controls on both tournament forms — the "Auto-
 * fill details" button (pasted Google Maps link), the map picker's "Use my
 * current location" and address-search actions, and dragging/clicking the
 * pin directly. Doesn't touch the DB or cost money (Nominatim is free), so
 * it isn't session-gated — only rate limited, same as other public POST
 * routes. Accepts exactly one of:
 *   - { url }                 a pasted Google Maps/Search link
 *   - { latitude, longitude } explicit coordinates (map click/drag/GPS)
 *   - { query }                free-text address to search (map search box)
 */
export async function POST(request) {
  const withinLimit = await checkRateLimit(supabaseAdmin(), {
    key: `geocode_maps_link:${clientIp(request)}`,
    limit: 60,
    windowSeconds: 60 * 60,
  });
  if (!withinLimit) {
    return NextResponse.json(
      { error: "Too many requests. Please try again in a bit." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const cityHint = typeof body?.city === "string" ? body.city.trim() : "";

  const explicitLat = Number(body?.latitude);
  const explicitLng = Number(body?.longitude);
  const hasExplicitCoords =
    Number.isFinite(explicitLat) &&
    Number.isFinite(explicitLng) &&
    Math.abs(explicitLat) <= 90 &&
    Math.abs(explicitLng) <= 180;

  const rawUrl = typeof body?.url === "string" ? body.url.trim() : "";
  const rawQuery = typeof body?.query === "string" ? body.query.trim() : "";

  let coords = null;
  let precise = true;

  if (hasExplicitCoords) {
    // A pin the user directly placed/dragged/GPS-located — always treated
    // as precise since they confirmed it themselves.
    coords = { latitude: explicitLat, longitude: explicitLng };
  } else if (rawUrl) {
    const resolved = await resolveGoogleMapsLink(rawUrl);
    if (!resolved) {
      return NextResponse.json(
        {
          error:
            "Couldn't read a location from that link. Open the venue's pin in Google Maps, tap Share, and paste that link — or paste the full maps.google.com URL instead of a shortened one.",
        },
        { status: 422 }
      );
    }
    // Most links carry coordinates directly. Some short-link formats (e.g.
    // share.google) instead redirect to a Search results page with only
    // the business name — geocode that by name, scoped to the city already
    // entered on the form, as the best available fallback.
    precise = "latitude" in resolved;
    coords = precise ? resolved : await geocodeQuery(resolved.query, cityHint);
    if (!coords) {
      return NextResponse.json(
        {
          error:
            "Couldn't pin down that venue's location from its name. Try the map below instead — search your address or drag the pin to the exact spot.",
        },
        { status: 422 }
      );
    }
  } else if (rawQuery) {
    precise = false; // an address search result — the user should still fine-tune by dragging
    coords = await geocodeQuery(rawQuery, cityHint);
    if (!coords) {
      return NextResponse.json(
        { error: "Couldn't find that address. Try a nearby landmark, or drag the pin directly on the map." },
        { status: 422 }
      );
    }
  } else {
    return NextResponse.json(
      { error: "Please paste a Google Maps venue link, search an address, or drop a pin on the map." },
      { status: 400 }
    );
  }

  const details = await reverseGeocode(coords.latitude, coords.longitude);

  return NextResponse.json({
    latitude: coords.latitude,
    longitude: coords.longitude,
    address: details?.address ?? null,
    city: details?.city ?? null,
    pincode: details?.pincode ?? null,
    precise,
  });
}
