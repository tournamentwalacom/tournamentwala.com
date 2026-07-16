export const CONTACT_MESSAGE_STATUSES = ["new", "read", "replied"];

export function parseContactStatusInput(body) {
  const status = typeof body?.status === "string" ? body.status.trim() : "";

  if (!CONTACT_MESSAGE_STATUSES.includes(status)) {
    return { data: null, error: "Invalid status" };
  }

  return { data: { status }, error: null };
}
