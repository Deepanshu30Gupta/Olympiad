import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[#F0E6D6] px-6 py-8 dark:border-neutral-800">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-[#6B5D4F] dark:text-neutral-500 sm:flex-row">
        <span
          className="font-bold text-[#2B2118] dark:text-neutral-200"
          style={{ fontFamily: "var(--font-fredoka), sans-serif" }}
        >
          Qublem
        </span>
        <div className="flex items-center gap-3">
          <Link href="/story">About</Link>
          <span className="h-1 w-1 rounded-full bg-[#D8CBB5]" />
          <Link href="/privacy">Privacy</Link>
          <span className="h-1 w-1 rounded-full bg-[#D8CBB5]" />
          <Link href="/contact">Contact</Link>
        </div>
        <span>© 2026 Qublem</span>
      </div>
      <p className="mt-4 text-center text-xs text-[#B8A990] dark:text-neutral-600">
        Made with ❤️ in India.
      </p>
    </footer>
  );
}