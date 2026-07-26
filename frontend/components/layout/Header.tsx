import Link from "next/link";
import { Show, UserButton, SignInButton } from "@clerk/nextjs";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { ReportWidget } from "@/components/ReportWidget";

export function Header() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-neutral-800 bg-neutral-950 px-6">
      <Link href="/dashboard" className="font-mono text-sm font-semibold text-neutral-100">
        Qublem
      </Link>
      <div className="flex items-center gap-4">
        <ReportWidget
          triggerLabel="Feedback"
          triggerClassName="text-sm text-neutral-400 hover:text-neutral-200"
        />
        <ThemeToggle />
        <Show when="signed-in">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-neutral-400 hover:text-neutral-200">
              Dashboard
            </Link>
            <UserButton />
          </div>
        </Show>
        <Show when="signed-out">
          <SignInButton>
            <button className="text-sm text-neutral-400 hover:text-neutral-200">Sign in</button>
          </SignInButton>
        </Show>
      </div>
    </header>
  );
}