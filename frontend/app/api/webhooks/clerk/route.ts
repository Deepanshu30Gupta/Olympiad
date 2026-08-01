import { Webhook } from "svix";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { sendEmail, buildPersonalizedEmailBody } from "@/lib/send-email";

interface ClerkUserEvent {
  type: string;
  data: {
    id: string;
    email_addresses: { email_address: string }[];
    first_name: string | null;
    last_name: string | null;
  };
}

export async function POST(req: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("CLERK_WEBHOOK_SECRET is not set");
    return new Response("Server misconfiguration", { status: 500 });
  }

  const headerList = await headers();
  const svixId = headerList.get("svix-id");
  const svixTimestamp = headerList.get("svix-timestamp");
  const svixSignature = headerList.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const body = await req.text();
  const wh = new Webhook(webhookSecret);

  let event: ClerkUserEvent;
  try {
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkUserEvent;
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type === "user.created") {
    const { id, email_addresses, first_name, last_name } = event.data;
    const email = email_addresses[0]?.email_address;

    if (!email) {
      console.error(`Clerk user ${id} has no email address`);
      return new Response("No email on user", { status: 400 });
    }

    const name = [first_name, last_name].filter(Boolean).join(" ") || null;

    const newUser = await prisma.user.upsert({
      where: { clerkId: id },
      update: {},
      create: { clerkId: id, email, name },
    });

    console.log(`Synced new user: ${email} (${id})`);

    // Real welcome flow — fires immediately on sign-up, both channels
    // at once. Deliberately fire-and-forget-ish: a welcome message
    // failing to send should never break account creation itself, so
    // errors here are logged, not thrown.
    const welcomeMessage =
      "Welcome to Qublem! We're excited to have you here. Head over to Practice to get matched with your first question, or check out the Leaderboard to see where you stand. Good luck, and have fun training!";

    try {
      await prisma.notification.create({
        data: {
          title: "Welcome to Qublem! 🎉",
          body: welcomeMessage,
          deliveryMode: "both",
          recipientCount: 1,
          recipients: { create: [{ userId: newUser.id }] },
        },
      });
    } catch (err) {
      console.error("Failed to create welcome notification:", err);
    }

    try {
      await sendEmail({
        to: email,
        subject: "Welcome to Qublem! 🎉",
        text: buildPersonalizedEmailBody(name ?? "there", welcomeMessage),
      });
    } catch (err) {
      console.error("Failed to send welcome email:", err);
    }
  }

  if (event.type === "user.updated") {
    const { id, email_addresses, first_name, last_name } = event.data;
    const email = email_addresses[0]?.email_address;
    const name = [first_name, last_name].filter(Boolean).join(" ") || null;

    await prisma.user.updateMany({
      where: { clerkId: id },
      data: {
        ...(email ? { email } : {}),
        name,
      },
    });

    console.log(`Synced updated profile for user: ${id}`);
  }

  if (event.type === "user.deleted") {
    const { id } = event.data;
    await prisma.user.deleteMany({ where: { clerkId: id } });
    console.log(`Removed deleted user: ${id}`);
  }

  return new Response("OK", { status: 200 });
}