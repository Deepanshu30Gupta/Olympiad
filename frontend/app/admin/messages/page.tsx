import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { MessagesInboxClient } from "@/features/admin/MessagesInboxClient";

export default async function AdminMessagesPage() {
  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress;
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!email || !adminEmail || email.toLowerCase() !== adminEmail.toLowerCase()) {
    redirect("/");
  }

  const reports = await prisma.report.findMany({ orderBy: { createdAt: "desc" } });
  const reportsForClient = reports.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
    repliedAt: r.repliedAt ? r.repliedAt.toISOString() : null,
  }));

  return (
    <div className="min-h-screen bg-[#FFFBF2] px-6 py-10 dark:bg-neutral-950">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-[#2B2118] dark:text-neutral-100" style={{ fontFamily: "var(--font-fredoka), sans-serif" }}>
            📥 Messages Inbox
          </h1>
          <Link href="/admin/library" className="rounded-lg border border-[#F0E6D6] px-3 py-1.5 text-xs font-semibold text-[#6B5D4F] hover:border-[#FF6B4A]/50 dark:border-neutral-800 dark:text-neutral-400">
            📚 Question Library →
          </Link>
        </div>
        <p className="mt-1 text-sm text-[#6B5D4F] dark:text-neutral-400">
          Every contact form and feedback submission, in one place.
        </p>

        <MessagesInboxClient initialReports={reportsForClient} />
      </div>
    </div>
  );
}