const RESEND_API_URL = "https://api.resend.com/emails";

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Wraps a list of label/value rows in a single-column, fluid-width table
 * layout — the pattern that survives Gmail/Outlook mobile apps stripping
 * <style> blocks, unlike flexbox/grid or viewport-based CSS.
 */
export function renderEmailLayout({ heading, rows }) {
  const rowsHtml = rows
    .map(
      ({ label, value, multiline }) => `
      <p style="margin:0 0 12px; font-size:14px; line-height:1.6; color:#374151; word-break:break-word;">
        <strong style="color:#111827;">${escapeHtml(label)}:</strong>
        ${multiline ? "<br/>" : " "}${escapeHtml(value ?? "N/A").replace(/\n/g, "<br/>")}
      </p>`
    )
    .join("");

  return `<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  </head>
  <body style="margin:0; padding:0; background-color:#f4f4f5;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5; padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px; width:100%; background-color:#ffffff; border-radius:8px; overflow:hidden; font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
            <tr>
              <td style="background-color:#111827; padding:16px 20px;">
                <span style="color:#ffffff; font-size:16px; font-weight:600;">Tournamentwala</span>
              </td>
            </tr>
            <tr>
              <td style="padding:20px;">
                <h1 style="margin:0 0 16px; font-size:18px; line-height:1.4; color:#111827;">${escapeHtml(heading)}</h1>
                ${rowsHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:14px 20px; background-color:#f9fafb; font-size:12px; color:#6b7280;">
                Automated notification from tournamentwala.com
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/**
 * Sends via Resend's HTTP API (no SMTP creds — just an API key). Best-effort:
 * callers should never let a notification failure fail the request that
 * triggered it, so this logs and swallows errors instead of throwing.
 */
export async function sendNotificationEmail({ subject, html }) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ADMIN_EMAIL;
  const from = process.env.EMAIL_FROM || "Tournamentwala <onboarding@resend.dev>";

  if (!apiKey || !to) {
    console.error("sendNotificationEmail: RESEND_API_KEY or ADMIN_EMAIL not set, skipping email");
    return;
  }

  try {
    const res = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html }),
    });

    if (!res.ok) {
      console.error("sendNotificationEmail: Resend API error", res.status, await res.text());
    }
  } catch (error) {
    console.error("sendNotificationEmail: failed to send", error);
  }
}
