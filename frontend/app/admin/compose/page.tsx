import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { ComposeMessageClient } from "@/features/admin/ComposeMessageClient";

export default async function AdminComposePage() {
  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress;
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!email || !adminEmail || email.toLowerCase() !== adminEmail.toLowerCase()) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-[#FFFBF2] px-6 py-10 dark:bg-neutral-950">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-[#2B2118] dark:text-neutral-100" style={{ fontFamily: "var(--font-fredoka), sans-serif" }}>
            📨 Send a Message
          </h1>
          <div className="flex gap-2">
            <Link href="/admin/messages" className="rounded-lg border border-[#F0E6D6] px-3 py-1.5 text-xs font-semibold text-[#6B5D4F] hover:border-[#FF6B4A]/50 dark:border-neutral-800 dark:text-neutral-400">
              Inbox
            </Link>
            <Link href="/admin/library" className="rounded-lg border border-[#F0E6D6] px-3 py-1.5 text-xs font-semibold text-[#6B5D4F] hover:border-[#FF6B4A]/50 dark:border-neutral-800 dark:text-neutral-400">
              Library
            </Link>
            <Link href="/admin/history" className="rounded-lg border border-[#F0E6D6] px-3 py-1.5 text-xs font-semibold text-[#6B5D4F] hover:border-[#FF6B4A]/50 dark:border-neutral-800 dark:text-neutral-400">
              History
            </Link>
          </div>
        </div>
        <p className="mt-1 text-sm text-[#6B5D4F] dark:text-neutral-400">
          Send a real in-app notification, optionally also by email, to specific users or everyone.
        </p>

        <ComposeMessageClient />
      </div>
    </div>
  );
}