import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { checkRateLimit, clientIp } from "@/lib/rateLimit";
import { resolveGoogleMapsLink, extractBareCoordinates } from "@/lib/mapsLink";
import { reverseGeocode, geocodeQuery } from "@/lib/geocode";

/**
 * Powers the "Auto-fill details" button on the venue form (both the public
 * post-tournament page and the admin tournament form). Doesn't touch the DB
 * or cost money (Nominatim is free), so it isn't session-gated — only rate
 * limited, same as other public POST routes.
 */
export async function POST(request) {
  const withinLimit = await checkRateLimit(supabaseAdmin(), {
    key: `geocode_maps_link:${clientIp(request)}`,
    limit: 30,
    windowSeconds: 60 * 60,
  });
  if (!withinLimit) {
    return NextResponse.json(
      { error: "Too many requests. Please try again in a bit." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const rawInput = typeof body?.url === "string" ? body.url.trim() : "";
  const cityHint = typeof body?.city === "string" ? body.city.trim() : "";
  if (!rawInput) {
    return NextResponse.json(
      { error: "Please paste a Google Maps venue link first." },
      { status: 400 }
    );
  }

  // Coordinates pasted directly (from long-pressing/clicking the exact spot
  // in Google Maps — see lib/mapsLink.js) skip link resolution entirely and
  // are always precise, since they're Google's own GPS math, not a lookup.
  const bareCoords = extractBareCoordinates(rawInput);

  let coords = bareCoords;
  let precise = true;

  if (!coords) {
    const resolved = await resolveGoogleMapsLink(rawInput);
    if (!resolved) {
      return NextResponse.json(
        {
          error:
            "Couldn't read a location from that. Paste a full Google Maps link (maps.app.goo.gl or maps.google.com), or long-press the exact spot in Google Maps and paste the coordinates it shows (e.g. 12.9716, 77.5946).",
        },
        { status: 422 }
      );
    }
    // Most links carry coordinates directly. Some short-link formats (e.g.
    // share.google) instead redirect to a Search results page with only the
    // business name — geocode that by name, scoped to the city already
    // entered on the form, as the best available fallback.
    precise = "latitude" in resolved;
    coords = precise ? resolved : await geocodeQuery(resolved.query, cityHint);

    if (!coords) {
      return NextResponse.json(
        {
          error:
            "Couldn't pin down that venue's location from its name. Instead, open Google Maps, long-press the exact spot, and paste the coordinates it shows (e.g. 12.9716, 77.5946) — that always works.",
        },
        { status: 422 }
      );
    }
  }

  const details = await reverseGeocode(coords.latitude, coords.longitude);

  return NextResponse.json({
    latitude: coords.latitude,
    longitude: coords.longitude,
    address: details?.address ?? null,
    city: details?.city ?? null,
    pincode: details?.pincode ?? null,
    precise,
    // When the input was bare coordinates (not a URL), normalize it into a
    // real clickable Google Maps link so the field stores something usable
    // by the "View location on map" button on the tournament page — see
    // app/explore/[slug]/page.jsx. Omitted for link input since the
    // organizer's original pasted link is already fine as-is.
    google_maps_link: bareCoords
      ? `https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`
      : undefined,
  });
}
