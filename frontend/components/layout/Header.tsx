import Link from "next/link";
import Image from "next/image";
import { Show, UserButton, SignInButton } from "@clerk/nextjs";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { ReportWidget } from "@/components/ReportWidget";

export function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-[#F0E6D6] bg-[#FFFBF2]/90 px-6 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-950/90">
      <Link href="/dashboard" className="flex items-center gap-2.5">
        <Image src="/logo.svg" alt="Qublem" width={32} height={32} className="rounded-lg" />
        <span
          className="text-lg font-bold text-[#2B2118] dark:text-neutral-100"
          style={{ fontFamily: "var(--font-fredoka), sans-serif" }}
        >
          Qublem
        </span>
      </Link>

      <div className="flex items-center gap-4">
        <ReportWidget
          triggerLabel="Feedback"
          triggerClassName="text-sm text-[#6B5D4F] transition-colors hover:text-[#2B2118] dark:text-neutral-400 dark:hover:text-neutral-200"
        />
        <ThemeToggle />
        <Show when="signed-in">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm text-[#6B5D4F] transition-colors hover:text-[#2B2118] dark:text-neutral-400 dark:hover:text-neutral-200"
            >
              Dashboard
            </Link>
            <UserButton />
          </div>
        </Show>
        <Show when="signed-out">
          <SignInButton>
            <button className="text-sm text-[#6B5D4F] transition-colors hover:text-[#2B2118] dark:text-neutral-400 dark:hover:text-neutral-200">
              Sign in
            </button>
          </SignInButton>
        </Show>
      </div>
    </header>
  );
}