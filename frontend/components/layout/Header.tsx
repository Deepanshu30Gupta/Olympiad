import Link from "next/link";
import { Show, UserButton, SignInButton } from "@clerk/nextjs";

export function Header() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-neutral-800 bg-neutral-950 px-6">
      <Link href="/dashboard" className="font-mono text-sm font-semibold text-neutral-100">
        Olympiad
      </Link>
      <Show when="signed-in">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm text-neutral-400 hover:text-neutral-200">
            Dashboard
          </Link>
          <UserButton afterSignOutUrl="/" />
        </div>
      </Show>
      <Show when="signed-out">
        <SignInButton>
          <button className="text-sm text-neutral-400 hover:text-neutral-200">Sign in</button>
        </SignInButton>
      </Show>
    </header>
  );
}