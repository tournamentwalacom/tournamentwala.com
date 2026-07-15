// One-off backfill: geocodes the pincode of any existing tournament row
// that doesn't have coordinates yet, so /explore-tournaments can sort it
// by distance. Safe to re-run — it only touches rows still missing
// latitude/longitude.
//
// Usage: node scripts/backfill-geocode.mjs

import { readFileSync, existsSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { geocodePincode } from "../lib/geocode.js";

function loadEnvLocal() {
  const path = new URL("../.env.local", import.meta.url);
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key] !== undefined) continue;
    process.env[key] = rawValue.replace(/^["']|["']$/g, "");
  }
}
loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set (checked .env.local).");
  process.exit(1);
}

const db = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Nominatim's usage policy asks for ~1 request/second, max.
const DELAY_MS = 1100;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const { data: rows, error } = await db
    .from("tournaments")
    .select("id, pincode")
    .not("pincode", "is", null)
    .is("latitude", null);

  if (error) {
    console.error("Failed to fetch tournaments:", error.message);
    process.exit(1);
  }

  console.log(`Found ${rows.length} tournament(s) to geocode.`);

  let succeeded = 0;
  let failed = 0;

  for (const row of rows) {
    const coords = await geocodePincode(row.pincode);
    if (!coords) {
      console.log(`  [skip] ${row.id} — pincode ${row.pincode} could not be geocoded`);
      failed += 1;
    } else {
      const { error: updateError } = await db
        .from("tournaments")
        .update({ latitude: coords.latitude, longitude: coords.longitude })
        .eq("id", row.id);
      if (updateError) {
        console.log(`  [error] ${row.id} — update failed: ${updateError.message}`);
        failed += 1;
      } else {
        console.log(`  [ok] ${row.id} — pincode ${row.pincode} -> ${coords.latitude}, ${coords.longitude}`);
        succeeded += 1;
      }
    }
    await sleep(DELAY_MS);
  }

  console.log(`Done. ${succeeded} geocoded, ${failed} skipped/failed.`);
}

main();
