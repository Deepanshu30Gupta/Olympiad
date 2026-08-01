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
        text,
      });
      if (result.error) throw new Error(result.error.message);
      return { sent: true };
    } catch (err) {
      console.error(`sendEmail attempt ${attempt} failed for ${to}:`, err);
      if (attempt === 1) await sleep(1500);
    }
  }
  return { sent: false, reason: "failed" };
}

export async function sendEmailBatch(
  recipients: { to: string; subject: string; text: string }[],
  delayMs: number = 400
): Promise<{ to: string; sent: boolean; reason?: string }[]> {
  const results: { to: string; sent: boolean; reason?: string }[] = [];
  for (const [index, r] of recipients.entries()) {
    const result = await sendEmail(r);
    results.push({ to: r.to, ...result });
    if (index < recipients.length - 1) await sleep(delayMs);
  }
  return results;
}