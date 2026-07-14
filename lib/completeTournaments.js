import { supabaseAdmin } from "@/lib/supabase";
import { todayIST } from "@/lib/istDate";

const BUCKET = "tournament-posters";

function posterPathFromUrl(url) {
  const marker = `/${BUCKET}/`;
  const idx = typeof url === "string" ? url.indexOf(marker) : -1;
  return idx === -1 ? null : url.slice(idx + marker.length);
}

/**
 * Flips "live" tournaments whose date has arrived to "completed" and
 * deletes their poster from storage — the row itself (name, city, prizes,
 * organizer info, etc.) is kept for records, only the image is dropped.
 */
export async function completeExpiredTournaments() {
  const db = supabaseAdmin();
  const today = todayIST();

  const { data: expired, error } = await db
    .from("tournaments")
    .select("id, image_url")
    .eq("status", "live")
    .or(`and(end_date.is.null,start_date.lte.${today}),end_date.lte.${today}`);

  if (error) {
    return { completed: 0, error: error.message };
  }
  if (!expired?.length) {
    return { completed: 0, error: null };
  }

  const paths = expired.map((t) => posterPathFromUrl(t.image_url)).filter(Boolean);
  if (paths.length) {
    await db.storage.from(BUCKET).remove(paths);
  }

  const { error: updateError } = await db
    .from("tournaments")
    .update({ status: "completed", image_url: null })
    .in("id", expired.map((t) => t.id));

  return { completed: expired.length, error: updateError?.message || null };
}
