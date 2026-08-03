function buildTextBody(recipientName: string, message: string): string {
  return `Hi ${recipientName},\n\n${message}\n\nRegards,\nDeepanshu Gupta\nFounder, Qublem\n\n---\nqublem.in · support.qublem.in@gmail.com`;
}

// Kept for backward compatibility with any existing call sites that
// still build the text body themselves before calling sendEmail.
export const buildPersonalizedEmailBody = buildTextBody;

function buildHtmlBody(recipientName: string, message: string): string {
  const messageHtml = message
    .split("\n")
    .map((line) => (line.trim() ? `<p style="margin: 0 0 12px 0;">${line}</p>` : ""))
    .join("");

  return `
<!DOCTYPE html>
<html>
  <body style="margin: 0; padding: 0; background-color: #FFFBF2; font-family: -apple-system, 'Segoe UI', Roboto, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FFFBF2; padding: 32px 16px;">
      <tr>
        <td align="center">
          <table width="480" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid #F0E6D6;">
            <tr>
              <td style="padding: 28px 32px 16px 32px; text-align: center;">
                <img src="https://qublem.in/logo.svg" alt="Qublem" width="44" height="44" style="border-radius: 10px; display: inline-block;" />
                <div style="margin-top: 8px; font-size: 20px; font-weight: 700; color: #2B2118;">Qublem</div>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 32px 28px 32px; color: #2B2118; font-size: 15px; line-height: 1.6;">
                <p style="margin: 0 0 16px 0;">Hi ${recipientName},</p>
                ${messageHtml}
                <p style="margin: 20px 0 0 0;">
                  Regards,<br />
                  Deepanshu Gupta<br />
                  Founder, Qublem
                </p>
              </td>
            </tr>
          </table>
          <p style="margin-top: 16px; font-size: 12px; color: #8A7C6C; line-height: 1.6;">
            Qublem — Adaptive practice for Math Olympiads<br />
            <a href="https://qublem.in" style="color: #4C3AA0; text-decoration: none;">qublem.in</a>
            &nbsp;·&nbsp;
            <a href="mailto:support.qublem.in@gmail.com" style="color: #4C3AA0; text-decoration: none;">support.qublem.in@gmail.com</a>
          </p>
          <p style="margin-top: 4px; font-size: 12px; color: #8A7C6C;">
            <a href="https://qublem.in" style="color: #4C3AA0; text-decoration: none;">qublem.in</a>
            &nbsp;·&nbsp;
            <a href="mailto:support.qublem.in@gmail.com" style="color: #4C3AA0; text-decoration: none;">support.qublem.in@gmail.com</a>
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Sends a personalized email with both HTML (branded, logo included)
 * and plain-text versions from the same raw message — the recipient's
 * email client picks whichever it supports, with text as the
 * accessible/spam-filter-friendly fallback. */
export async function sendPersonalizedEmail({
  to,
  subject,
  recipientName,
  message,
}: {
  to: string;
  subject: string;
  recipientName: string;
  message: string;
}): Promise<{ sent: boolean; reason?: string }> {
  if (!process.env.RESEND_API_KEY) {
    return { sent: false, reason: "not_configured" };
  }

  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const result = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "Qublem <onboarding@resend.dev>",
        to,
        subject,
        text: buildTextBody(recipientName, message),
        html: buildHtmlBody(recipientName, message),
      });
      if (result.error) throw new Error(result.error.message);
      return { sent: true };
    } catch (err) {
      console.error(`sendPersonalizedEmail attempt ${attempt} failed for ${to}:`, err);
      if (attempt === 1) await sleep(1500);
    }
  }
  return { sent: false, reason: "failed" };
}

export async function sendPersonalizedEmailBatch(
  recipients: { to: string; subject: string; recipientName: string; message: string }[],
  delayMs: number = 400
): Promise<{ to: string; sent: boolean; reason?: string }[]> {
  const results: { to: string; sent: boolean; reason?: string }[] = [];
  for (const [index, r] of recipients.entries()) {
    const result = await sendPersonalizedEmail(r);
    results.push({ to: r.to, ...result });
    if (index < recipients.length - 1) await sleep(delayMs);
  }
  return results;
}