"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function slugify(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildInitialForm(initial) {
  if (!initial) {
    return {
      title: "",
      slug: "",
      keywords: "",
      meta_description: "",
      cover_image_url: "",
      content: [""],
      status: "draft",
    };
  }

  return {
    title: initial.title || "",
    slug: initial.slug || "",
    keywords: initial.keywords || "",
    meta_description: initial.meta_description || "",
    cover_image_url: initial.cover_image_url || "",
    content: initial.content?.length ? initial.content : [""],
    status: initial.status || "draft",
  };
}

export default function BlogForm({ mode, initial }) {
  const router = useRouter();
  const [form, setForm] = useState(() => buildInitialForm(initial));
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [status, setStatus] = useState("idle"); // idle | submitting | deleting | error
  const [error, setError] = useState("");

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleTitleChange(value) {
    setForm((f) => ({
      ...f,
      title: value,
      slug: slugTouched ? f.slug : slugify(value),
    }));
  }

  function updateParagraph(index, value) {
    setForm((f) => ({
      ...f,
      content: f.content.map((p, i) => (i === index ? value : p)),
    }));
  }

  function addParagraph() {
    setForm((f) => ({ ...f, content: [...f.content, ""] }));
  }

  function removeParagraph(index) {
    setForm((f) => ({
      ...f,
      content: f.content.length > 1 ? f.content.filter((_, i) => i !== index) : f.content,
    }));
  }

  async function submit(nextStatus) {
    setError("");
    setStatus("submitting");

    const payload = { ...form, status: nextStatus };

    try {
      const res =
        mode === "create"
          ? await fetch("/api/admin/blogs", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            })
          : await fetch(`/api/admin/blogs/${initial.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ fields: payload }),
            });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      router.push("/admin/blogs");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setStatus("error");
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete "${form.title}"? This can't be undone.`)) return;

    setStatus("deleting");
    try {
      const res = await fetch(`/api/admin/blogs/${initial.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Delete failed.");
        setStatus("error");
        return;
      }
      router.push("/admin/blogs");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setStatus("error");
    }
  }

  const busy = status === "submitting" || status === "deleting";

  return (
    <form className="post-form" onSubmit={(e) => e.preventDefault()}>
      <div className="post-form-grid">
        <label className="post-field post-field-wide">
          Title
          <input
            type="text"
            required
            maxLength={200}
            placeholder="e.g. How to Find Sports Tournaments Near You in India"
            value={form.title}
            onChange={(e) => handleTitleChange(e.target.value)}
          />
        </label>

        <label className="post-field post-field-wide">
          URL slug
          <input
            type="text"
            required
            maxLength={200}
            placeholder="how-to-find-sports-tournaments-near-you"
            value={form.slug}
            onChange={(e) => {
              setSlugTouched(true);
              update("slug", slugify(e.target.value));
            }}
          />
          <span>tournamentwala.com/blogs/{form.slug || "your-slug"}</span>
        </label>

        <label className="post-field post-field-wide">
          SEO keywords <span>(comma separated)</span>
          <input
            type="text"
            maxLength={300}
            placeholder="tournaments near me, sports tournaments India"
            value={form.keywords}
            onChange={(e) => update("keywords", e.target.value)}
          />
        </label>

        <label className="post-field post-field-wide">
          Meta description <span>(shown in Google search results)</span>
          <textarea
            maxLength={300}
            rows={2}
            placeholder="A short 1-2 sentence summary for search engines"
            value={form.meta_description}
            onChange={(e) => update("meta_description", e.target.value)}
          />
        </label>

        <label className="post-field post-field-wide">
          Cover image URL <span>(optional)</span>
          <input
            type="text"
            placeholder="https://..."
            value={form.cover_image_url}
            onChange={(e) => update("cover_image_url", e.target.value)}
          />
        </label>
      </div>

      <div className="blog-paragraphs">
        <div className="blog-paragraphs-header">
          <h3>Content</h3>
          <p>Each box below becomes one paragraph on the published post.</p>
        </div>

        {form.content.map((para, i) => (
          <div className="blog-paragraph-row" key={i}>
            <label className="post-field post-field-wide">
              Paragraph {i + 1}
              <textarea
                rows={4}
                placeholder="Write a paragraph..."
                value={para}
                onChange={(e) => updateParagraph(i, e.target.value)}
              />
            </label>
            {form.content.length > 1 && (
              <button
                type="button"
                className="blog-paragraph-remove"
                onClick={() => removeParagraph(i)}
                aria-label={`Remove paragraph ${i + 1}`}
              >
                Remove
              </button>
            )}
          </div>
        ))}

        <button type="button" className="admin-btn" onClick={addParagraph}>
          + Add paragraph
        </button>
      </div>

      {error && <p className="post-error">{error}</p>}

      <div className="admin-row-actions">
        <button
          type="button"
          className="btn btn-primary"
          disabled={busy}
          onClick={() => submit("published")}
        >
          {status === "submitting" ? "Publishing…" : "Publish"}
        </button>
        <button
          type="button"
          className="admin-btn"
          disabled={busy}
          onClick={() => submit("draft")}
        >
          {status === "submitting" ? "Saving…" : "Save as draft"}
        </button>
        {mode === "edit" && (
          <button
            type="button"
            className="admin-btn admin-btn-reject"
            disabled={busy}
            onClick={handleDelete}
          >
            {status === "deleting" ? "Deleting…" : "Delete post"}
          </button>
        )}
      </div>
    </form>
  );
}
