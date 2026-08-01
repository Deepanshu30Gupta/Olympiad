"use server";

import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { sendEmail, sendEmailBatch, buildPersonalizedEmailBody } from "@/lib/send-email";

async function requireAdmin() {
  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress;
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!email || !adminEmail || email.toLowerCase() !== adminEmail.toLowerCase()) {
    throw new Error("Not authorized.");
  }
}

export async function getAllReportsAction() {
  await requireAdmin();
  return prisma.report.findMany({ orderBy: { createdAt: "desc" } });
}

/** Fetches a question with everything visible (all hints, the solution,
 * the correct answer) for the admin preview page — deliberately not
 * gated the way the student-facing flow is, since this exists so you
 * can verify a reported question's accuracy at a glance. */
export async function getQuestionForAdminPreview(externalId: string) {
  await requireAdmin();
  return prisma.question.findUnique({
    where: { externalId },
    include: { hints: { orderBy: { level: "asc" } } },
  });
}

/** Sends the admin directly into the REAL practice page for a specific
 * question — no separate rendering, this reuses the exact same
 * AttemptForm/practice flow a student gets, including the existing
 * Show Solution button. Reuses one dedicated 'Question Library'
 * session across every click, rather than creating a new session row
 * each time you browse a different question. */
export async function previewQuestionAsAdminAction(externalId: string) {
  try {
    await requireAdmin();
    const clerkUser = await currentUser();
    const dbUser = await prisma.user.findUniqueOrThrow({ where: { clerkId: clerkUser!.id } });

    const question = await prisma.question.findUnique({ where: { externalId } });
    if (!question) return { sessionId: null, error: "That question doesn't exist." };

    let adminSession = await prisma.practiceSession.findFirst({
      where: { userId: dbUser.id, name: "Question Library (Admin)" },
    });
    if (!adminSession) {
      adminSession = await prisma.practiceSession.create({
        data: { userId: dbUser.id, examTypes: [], topicFocus: [], name: "Question Library (Admin)" },
      });
    }

    await prisma.practiceSession.update({
      where: { id: adminSession.id },
      data: {
        status: "ACTIVE",
        currentQuestionId: question.id,
        currentQuestionStartedAt: new Date(),
        queuedQuestionIds: [],
      },
    });

    return { sessionId: adminSession.id, error: null };
  } catch (err) {
    console.error("previewQuestionAsAdminAction failed:", err);
    return { sessionId: null, error: "Couldn't open that question." };
  }
}

export async function markReportRepliedAction(reportId: string, replied: boolean) {
  try {
    await requireAdmin();
    await prisma.report.update({
      where: { id: reportId },
      data: { repliedAt: replied ? new Date() : null },
    });
    return { error: null };
  } catch (err) {
    console.error("markReportRepliedAction failed:", err);
    return { error: "Couldn't update. Please try again." };
  }
}

/** Real user search for the admin compose UI — searches by name or
 * email, so you can find specific people to message. */
export async function searchUsersAction(query: string) {
  await requireAdmin();
  if (!query.trim()) return [];
  return prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
      ],
    },
    select: { id: true, name: true, email: true },
    take: 20,
  });
}

/** Sends a notification — always creates the real in-app notification
 * for each recipient. Email is a genuine best-effort add-on: if
 * RESEND_API_KEY isn't configured yet, this skips email entirely and
 * tells the caller so, rather than silently failing or faking success. */
export type DeliveryMode = "notification" | "email" | "both";

/** All users, alphabetically by name (falling back to email for users
 * with no name set) — for the 'browse all' dropdown, separate from
 * search. */
export async function getAllUsersAlphabeticalAction() {
  await requireAdmin();
  const users = await prisma.user.findMany({ select: { id: true, name: true, email: true } });
  return users.sort((a, b) => (a.name ?? a.email).localeCompare(b.name ?? b.email));
}

export async function sendNotificationAction({
  title,
  body,
  recipientUserIds,
  sendToAll,
  deliveryMode,
}: {
  title: string;
  body: string;
  recipientUserIds: string[];
  sendToAll: boolean;
  deliveryMode: DeliveryMode;
}) {
  try {
    await requireAdmin();
    if (!title.trim() || !body.trim()) {
      return { error: "Title and message are required.", emailStatus: "skipped" as const, recipientCount: 0 };
    }

    const targetUsers = sendToAll
      ? await prisma.user.findMany({ select: { id: true, email: true, name: true } })
      : await prisma.user.findMany({ where: { id: { in: recipientUserIds } }, select: { id: true, email: true, name: true } });

    if (targetUsers.length === 0) {
      return { error: "No recipients selected.", emailStatus: "skipped" as const, recipientCount: 0 };
    }

    // Real fix: always create recipient rows regardless of delivery
    // mode, so the History page can always show exactly who a message
    // went to — even for Email Only sends, which previously had zero
    // recorded recipient list, just a count. The bell/inbox query is
    // updated separately to filter these correctly by the parent
    // notification's deliveryMode, so an Email Only send still never
    // shows up in anyone's in-app notifications.
    const notification = await prisma.notification.create({
      data: {
        title: title.trim(),
        body: body.trim(),
        deliveryMode,
        recipientCount: targetUsers.length,
        recipients: { create: targetUsers.map((u) => ({ userId: u.id })) },
      },
    });

    let emailStatus: "sent" | "skipped" | "not_configured" | "failed" | "partial" = "skipped";
    let failedRecipients: string[] = [];
    if (deliveryMode === "email" || deliveryMode === "both") {
      const results = await sendEmailBatch(
        targetUsers.map((u) => ({
          to: u.email,
          subject: title.trim(),
          text: buildPersonalizedEmailBody(u.name ?? "there", body.trim()),
        }))
      );
      const succeeded = results.filter((r) => r.sent);
      failedRecipients = results.filter((r) => !r.sent).map((r) => r.to);

      if (results[0]?.reason === "not_configured") {
        emailStatus = "not_configured";
      } else if (succeeded.length === results.length) {
        emailStatus = "sent";
        await prisma.notification.update({ where: { id: notification.id }, data: { emailSent: true } });
      } else if (succeeded.length > 0) {
        emailStatus = "partial";
        await prisma.notification.update({ where: { id: notification.id }, data: { emailSent: true } });
      } else {
        emailStatus = "failed";
      }
    }

    return { error: null, emailStatus, recipientCount: targetUsers.length, failedRecipients };
  } catch (err) {
    console.error("sendNotificationAction failed:", err);
    return { error: "Couldn't send. Please try again.", emailStatus: "skipped" as const, recipientCount: 0 };
  }
}

/** Real per-user notification fetch — any signed-in user can call
 * this for their own notifications, no admin check needed here. */
export async function getMyNotificationsAction() {
  const clerkUser = await currentUser();
  if (!clerkUser) return { notifications: [], unreadCount: 0 };
  const dbUser = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } });
  if (!dbUser) return { notifications: [], unreadCount: 0 };

  const recipients = await prisma.notificationRecipient.findMany({
    where: {
      userId: dbUser.id,
      notification: { deliveryMode: { in: ["notification", "both"] } },
    },
    include: { notification: true },
    orderBy: { notification: { createdAt: "desc" } },
    take: 20,
  });

  return {
    notifications: recipients.map((r) => ({
      id: r.id,
      title: r.notification.title,
      body: r.notification.body,
      createdAt: r.notification.createdAt.toISOString(),
      read: !!r.readAt,
    })),
    unreadCount: recipients.filter((r) => !r.readAt).length,
  };
}

export async function markNotificationReadAction(recipientId: string) {
  const clerkUser = await currentUser();
  if (!clerkUser) return { error: "Not signed in." };
  const dbUser = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } });
  if (!dbUser) return { error: "User not found." };

  await prisma.notificationRecipient.updateMany({
    where: { id: recipientId, userId: dbUser.id },
    data: { readAt: new Date() },
  });
  return { error: null };
}

/** Lightweight admin check for UI purposes (like showing/hiding the nav
 * item) — doesn't expose the admin email to the client, just a boolean. */
export async function isCurrentUserAdminAction(): Promise<boolean> {
  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress;
  const adminEmail = process.env.ADMIN_EMAIL;
  return !!(email && adminEmail && email.toLowerCase() === adminEmail.toLowerCase());
}

/** Real send history — every message ever sent, regardless of
 * delivery mode, newest first. This is the actual record you asked
 * for: what was shared, when, and via which channel. */
export async function getNotificationHistoryAction() {
  await requireAdmin();
  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
    include: { recipients: { include: { user: { select: { name: true, email: true } } } } },
    take: 100,
  });
  return notifications.map((n) => ({
    id: n.id,
    title: n.title,
    body: n.body,
    createdAt: n.createdAt.toISOString(),
    deliveryMode: n.deliveryMode,
    recipientCount: n.recipientCount,
    emailSent: n.emailSent,
    recipients: n.recipients.map((r) => ({ name: r.user.name, email: r.user.email })),
  }));
}