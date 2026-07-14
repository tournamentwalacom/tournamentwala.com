/** Uploads a poster file to /api/upload/poster and returns its public URL.
 * Shared by the public submission form and the admin form since both need
 * the exact same fetch + error handling. */
export async function uploadPosterFile(file) {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch("/api/upload/poster", {
      method: "POST",
      body: formData,
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return { url: null, error: data.error || "Couldn't upload the poster." };
    }

    return { url: data.url, error: null };
  } catch {
    return { url: null, error: "Network error while uploading. Please try again." };
  }
}
