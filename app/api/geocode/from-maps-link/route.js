import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { checkRateLimit, clientIp } from "@/lib/rateLimit";
import { resolveGoogleMapsLink } from "@/lib/mapsLink";
import { reverseGeocode } from "@/lib/geocode";

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
  if (!rawUrl) {
    return NextResponse.json(
      { error: "Please paste a Google Maps venue link first." },
      { status: 400 }
    );
  }

  const coords = await resolveGoogleMapsLink(rawUrl);
  if (!coords) {
    return NextResponse.json(
      {
        error:
          "Couldn't read a location from that link. Open the venue's pin in Google Maps, tap Share, and paste that link — or paste the full maps.google.com URL instead of a shortened one.",
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
  });
}
