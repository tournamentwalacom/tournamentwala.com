import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { checkRateLimit, clientIp } from "@/lib/rateLimit";
import { resolveGoogleMapsLink } from "@/lib/mapsLink";
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
  const rawUrl = typeof body?.url === "string" ? body.url.trim() : "";
  const cityHint = typeof body?.city === "string" ? body.city.trim() : "";
  if (!rawUrl) {
    return NextResponse.json(
      { error: "Please paste a Google Maps venue link first." },
      { status: 400 }
    );
  }

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
  // share.google) instead redirect to a Search results page with only the
  // business name — geocode that by name, scoped to the city already
  // entered on the form, as the best available fallback.
  const precise = "latitude" in resolved;
  const coords = precise ? resolved : await geocodeQuery(resolved.query, cityHint);

  if (!coords) {
    return NextResponse.json(
      {
        error:
          "Couldn't pin down that venue's location from its name. Please open the pin in Google Maps, tap Share, and paste the maps.app.goo.gl or maps.google.com link instead.",
      },
      { status: 422 }
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
