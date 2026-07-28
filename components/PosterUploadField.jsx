"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { uploadPosterFile } from "@/lib/uploadPoster";
import TicketLoader from "@/components/TicketLoader";

/** File-upload widget for the tournament poster. Shared by the public
 * submission form and the admin form — both store the result in the same
 * `image_url` field, just via an upload instead of a pasted link. Also
 * reused for the banner and registration QR uploads in the poster/reel
 * brief section, via the `hint` override (same endpoint/bucket, any image). */
export default function PosterUploadField({ value, onChange, hint, alt }) {
  const [status, setStatus] = useState("idle"); // idle | uploading | error
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(e) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setStatus("uploading");
    setError("");

    const { url, error: uploadError } = await uploadPosterFile(file);

    if (!url) {
      setError(uploadError);
      setStatus("error");
      return;
    }

    onChange(url);
    setStatus("idle");
  }

  return (
    <div className="post-poster-field">
      {value ? (
        <div className="post-poster-preview">
          <button
            type="button"
            className="post-poster-preview-trigger"
            onClick={() => setOpen(true)}
            aria-label="View full-size image"
          >
            <img src={value} alt={alt || "Tournament poster preview"} />
          </button>
          <button
            type="button"
            className="post-poster-remove"
            onClick={() => onChange("")}
          >
            Remove &amp; replace
          </button>
        </div>
      ) : (
        <label className="post-poster-dropzone">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFile}
            disabled={status === "uploading"}
          />
          {status === "uploading" ? (
            <TicketLoader size="sm" label="Uploading" />
          ) : (
            <span>{hint || "Click to upload poster — JPEG, PNG or WEBP, up to 8MB"}</span>
          )}
        </label>
      )}
      {error && <p className="post-error">{error}</p>}

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="poster-lightbox" onClick={() => setOpen(false)}>
            <button
              type="button"
              className="poster-lightbox-close"
              onClick={() => setOpen(false)}
              aria-label="Close full-size image"
            >
              ×
            </button>
            <div className="poster-lightbox-frame" onClick={(e) => e.stopPropagation()}>
              <img src={value} alt={alt || "Tournament poster preview"} />
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
