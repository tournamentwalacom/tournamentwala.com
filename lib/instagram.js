import { supabaseAdmin } from "@/lib/supabase";

const GRAPH_VERSION = process.env.INSTAGRAM_GRAPH_VERSION || "v21.0";
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

function credentials() {
  const igUserId = process.env.INSTAGRAM_BUSINESS_ID;
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!igUserId || !accessToken) return null;
  return { igUserId, accessToken };
}

async function graphPost(path, params) {
  const res = await fetch(`${GRAPH_BASE}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json) {
    const message = json?.error?.message || `Graph API error ${res.status}`;
    throw new Error(message);
  }
  return json;
}

/**
 * Builds the feed post caption from tournament fields. Tags the organizer's
 * Instagram handle in text too (not just via the collaborators invite below)
 * since a caption mention always shows, while a collaborator invite only
 * shows once the organizer accepts it.
 */
function buildCaption(tournament) {
  const lines = [
    `${tournament.name} is live on TournamentWala! 🏆`,
    [tournament.sport, tournament.city].filter(Boolean).join(" · "),
    tournament.start_date ? `📅 ${tournament.start_date}` : null,
  ].filter(Boolean);

  if (tournament.instagram_id) {
    lines.push(`Hosted by @${tournament.instagram_id}`);
  }

  lines.push("Register now — link in bio.");
  return lines.join("\n");
}

/**
 * Creates a media container then publishes it — the two-step flow every
 * Content Publishing API post requires. Images process near-instantly so,
 * unlike video/reels, no status polling is needed between the two calls.
 */
async function createAndPublish(igUserId, accessToken, containerParams) {
  const container = await graphPost(`${igUserId}/media`, {
    ...containerParams,
    access_token: accessToken,
  });

  const published = await graphPost(`${igUserId}/media_publish`, {
    creation_id: container.id,
    access_token: accessToken,
  });

  return published.id;
}

async function publishFeedPost({ igUserId, accessToken, imageUrl, caption, collaboratorUsername }) {
  if (collaboratorUsername) {
    try {
      return await createAndPublish(igUserId, accessToken, {
        image_url: imageUrl,
        caption,
        collaborators: JSON.stringify([collaboratorUsername]),
      });
    } catch (error) {
      // Collaborator invites can fail for reasons unrelated to the post
      // itself (organizer account privacy settings, API version quirks) —
      // fall back to a plain post with the caption mention rather than
      // losing the whole publish over it.
      console.error("publishFeedPost: collaborator invite failed, retrying without it", error);
    }
  }

  return createAndPublish(igUserId, accessToken, {
    image_url: imageUrl,
    caption,
  });
}

async function publishStory({ igUserId, accessToken, imageUrl }) {
  // Note: the Content Publishing API has no supported way to attach a user
  // mention/tag sticker to a Stories post — captions aren't shown on stories
  // either. So stories publish image-only for now; tagging the organizer on
  // a story would need to stay a manual step if that's required.
  return createAndPublish(igUserId, accessToken, {
    image_url: imageUrl,
    media_type: "STORIES",
  });
}

/**
 * Best-effort: called from the tournament approve action. Never throws —
 * publish failures are recorded on the row for the admin to see/retry, and
 * must never fail the approval itself.
 */
export async function publishApprovedTournamentToInstagram(tournament) {
  const creds = credentials();
  const wantsPost = tournament.promotions?.some((p) => p.kind === "instagram_post");
  const wantsStory = tournament.promotions?.some((p) => p.kind === "instagram_story");

  if (!wantsPost && !wantsStory) return;

  const update = {};

  if (wantsPost) {
    if (!creds) {
      update.instagram_post_status = "failed";
      update.instagram_post_error = "Instagram credentials not configured";
    } else if (!tournament.image_url) {
      update.instagram_post_status = "failed";
      update.instagram_post_error = "No poster image to publish";
    } else {
      try {
        const id = await publishFeedPost({
          ...creds,
          imageUrl: tournament.image_url,
          caption: buildCaption(tournament),
          collaboratorUsername: tournament.instagram_id || null,
        });
        update.instagram_post_status = "published";
        update.instagram_post_id = id;
        update.instagram_post_error = null;
      } catch (error) {
        console.error("publishApprovedTournamentToInstagram: feed post failed", error);
        update.instagram_post_status = "failed";
        update.instagram_post_error = String(error.message || error);
      }
    }
  }

  if (wantsStory) {
    if (!creds) {
      update.instagram_story_status = "failed";
      update.instagram_story_error = "Instagram credentials not configured";
    } else if (!tournament.image_url) {
      update.instagram_story_status = "failed";
      update.instagram_story_error = "No poster image to publish";
    } else {
      try {
        const id = await publishStory({ ...creds, imageUrl: tournament.image_url });
        update.instagram_story_status = "published";
        update.instagram_story_id = id;
        update.instagram_story_error = null;
      } catch (error) {
        console.error("publishApprovedTournamentToInstagram: story failed", error);
        update.instagram_story_status = "failed";
        update.instagram_story_error = String(error.message || error);
      }
    }
  }

  if (Object.keys(update).length) {
    await supabaseAdmin().from("tournaments").update(update).eq("id", tournament.id);
  }
}
