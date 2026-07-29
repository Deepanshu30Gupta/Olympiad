"use server";

import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

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