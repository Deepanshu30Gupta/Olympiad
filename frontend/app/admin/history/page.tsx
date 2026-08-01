import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { Mail, Bell, MailPlus } from "lucide-react";
import { getNotificationHistoryAction } from "@/app/admin-actions";
import { RecipientListToggle } from "@/features/admin/RecipientListToggle";

export default async function AdminHistoryPage() {
  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress;
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!email || !adminEmail || email.toLowerCase() !== adminEmail.toLowerCase()) {
    redirect("/");
  }

  const history = await getNotificationHistoryAction();

  return (
    <div className="min-h-screen bg-[#FFFBF2] px-6 py-10 dark:bg-neutral-950">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-[#2B2118] dark:text-neutral-100" style={{ fontFamily: "var(--font-fredoka), sans-serif" }}>
            🕐 Sent History
          </h1>
          <Link href="/admin/compose" className="rounded-lg border border-[#F0E6D6] px-3 py-1.5 text-xs font-semibold text-[#6B5D4F] hover:border-[#FF6B4A]/50 dark:border-neutral-800 dark:text-neutral-400">
            📨 Send a Message →
          </Link>
        </div>
        <p className="mt-1 text-sm text-[#6B5D4F] dark:text-neutral-400">
          Every message you've sent — what, when, and how.
        </p>

        {history.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-[#F0E6D6] bg-white p-8 text-center dark:border-neutral-800 dark:bg-neutral-900">
            <p className="text-sm text-[#6B5D4F] dark:text-neutral-400">Nothing sent yet.</p>
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-3">
            {history.map((n) => (
              <div key={n.id} className="rounded-2xl border border-[#F0E6D6] bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
                <div className="flex items-start justify-between gap-3">
                  <span className="font-semibold text-[#2B2118] dark:text-neutral-100">{n.title}</span>
                  <span className="shrink-0 text-xs text-[#6B5D4F] dark:text-neutral-500">
                    {new Date(n.createdAt).toLocaleString("en-IN", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" })}
                  </span>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-[#2B2118]/80 dark:text-neutral-300">{n.body}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  <span className="flex items-center gap-1 rounded-full bg-[#ECE8FA] px-2.5 py-1 font-semibold text-[#4C3AA0] dark:bg-indigo-950/40 dark:text-indigo-300">
                    {n.deliveryMode === "notification" && <Bell size={12} />}
                    {n.deliveryMode === "email" && <Mail size={12} />}
                    {n.deliveryMode === "both" && <MailPlus size={12} />}
                    {n.deliveryMode === "notification" ? "In-App Only" : n.deliveryMode === "email" ? "Email Only" : "In-App + Email"}
                  </span>
                  <span className="rounded-full bg-[#F0E6D6] px-2.5 py-1 font-semibold text-[#6B5D4F] dark:bg-neutral-800 dark:text-neutral-400">
                    {n.recipientCount} recipient{n.recipientCount !== 1 ? "s" : ""}
                  </span>
                  {(n.deliveryMode === "email" || n.deliveryMode === "both") && (
                    <span className={`rounded-full px-2.5 py-1 font-semibold ${n.emailSent ? "bg-[#E6F7E0] text-[#2E6B1B] dark:bg-emerald-950/40 dark:text-emerald-300" : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"}`}>
                      {n.emailSent ? "Email delivered" : "Email failed"}
                    </span>
                  )}
                </div>
                <RecipientListToggle recipients={n.recipients} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}