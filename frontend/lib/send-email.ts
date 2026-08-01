export function buildPersonalizedEmailBody(recipientName: string, message: string): string {
  return `Hi ${recipientName},\n\n${message}\n\nRegards,\nDeepanshu Gupta\nFounder, Qublem`;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function sendEmail({
  to,
  subject,
  text,
}: {
  to: string;
  subject: string;
  text: string;
}): Promise<{ sent: boolean; reason?: string }> {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    return { sent: false, reason: "not_configured" };
  }

  const nodemailer = await import("nodemailer");
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  // One retry with a short delay — recovers transient rate-limit
  // rejections. Doesn't help with a receiving server permanently
  // distrusting an unverified Gmail sender, only genuine "try again
  // in a moment" cases.
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      await transporter.sendMail({
        from: `"Qublem" <${process.env.GMAIL_USER}>`,
        to,
        subject,
        text,
      });
      return { sent: true };
    } catch (err) {
      console.error(`sendEmail attempt ${attempt} failed for ${to}:`, err);
      if (attempt === 1) await sleep(2000);
    }
  }
  return { sent: false, reason: "failed" };
}

/** Sends to many recipients with real spacing between each one —
 * looks like normal usage rather than the rapid-fire bulk pattern
 * Gmail's own anti-abuse systems specifically watch for. Returns
 * per-recipient results so callers can report exactly who succeeded
 * and who didn't, rather than a vague aggregate. */
export async function sendEmailBatch(
  recipients: { to: string; subject: string; text: string }[],
  delayMs: number = 1200
): Promise<{ to: string; sent: boolean; reason?: string }[]> {
  const results: { to: string; sent: boolean; reason?: string }[] = [];
  for (const [index, r] of recipients.entries()) {
    const result = await sendEmail(r);
    results.push({ to: r.to, ...result });
    if (index < recipients.length - 1) await sleep(delayMs);
  }
  return results;
}