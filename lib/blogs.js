import { supabase } from "@/lib/supabase";

function trimmed(value, maxLength) {
  if (typeof value !== "string") return null;
  const t = value.trim();
  if (!t || t.length > maxLength) return null;
  return t;
}

/** "How to Find Tournaments!" -> "how-to-find-tournaments" */
export function slugify(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Validates an admin create/update payload for a blog post. Returns
 * { data, error } — data is null when error is set.
 */
export function parseBlogInput(body) {
  const title = trimmed(body.title, 200);
  const slugSource = trimmed(body.slug, 200) || title;
  const slug = slugSource ? slugify(slugSource) : null;
  const keywords = typeof body.keywords === "string" ? body.keywords.trim().slice(0, 300) || null : null;
  const meta_description =
    typeof body.meta_description === "string"
      ? body.meta_description.trim().slice(0, 300) || null
      : null;
  const cover_image_url =
    typeof body.cover_image_url === "string" ? body.cover_image_url.trim() || null : null;
  const status = body.status === "published" ? "published" : "draft";

  const content = Array.isArray(body.content)
    ? body.content.map((p) => (typeof p === "string" ? p.trim() : "")).filter(Boolean)
    : [];

  if (!title || !slug || content.length === 0) {
    return {
      data: null,
      error: "Please add a title and at least one paragraph of content.",
    };
  }

  return {
    data: { title, slug, keywords, meta_description, cover_image_url, content, status },
    error: null,
  };
}

/** Published posts, newest first — used by the public /blogs listing. */
export async function getPublishedBlogs() {
  const { data, error } = await supabase
    .from("blogs")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error || !data) return [];
  return data;
}

export async function getBlogBySlug(slug) {
  const { data } = await supabase
    .from("blogs")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  return data || null;
}

/** A handful of other published posts, for the "keep reading" strip. */
export async function getRelatedBlogs(excludeId, limit = 3) {
  const { data, error } = await supabase
    .from("blogs")
    .select("*")
    .eq("status", "published")
    .neq("id", excludeId)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data;
}

export function formatBlogDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** ~200 words/min reading estimate, based on the paragraph content. */
export function estimateReadTime(content) {
  const words = (Array.isArray(content) ? content : [])
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function getBlogKeywordsList(keywords) {
  if (!keywords) return [];
  return keywords
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
}
