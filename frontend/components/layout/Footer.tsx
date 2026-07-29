"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Home, Target, BarChart3, LayoutGrid, Users, Mail, Shield, HelpCircle, HelpingHand } from "lucide-react";

const SUPPORT_EMAIL = "support.qublem.in@gmail.com";

const PRODUCT_LINKS = [
  { label: "Home", href: "/", icon: Home },
  { label: "Practice", href: "/onboarding", icon: Target },
  { label: "Leaderboard", href: "/leaderboard", icon: BarChart3 },
  { label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
];

const COMPANY_LINKS = [
  { label: "About", href: "/story", icon: Users },
  { label: "Contact", href: "/contact", icon: Mail },
  { label: "Privacy", href: "/privacy", icon: Shield },
  { label: "FAQ", href: "/#faq", icon: HelpCircle },
];

export function Footer() {
  const pathname = usePathname();

  function handleHomeClick(e: React.MouseEvent, href: string) {
    if (href === "/" && pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <footer className="m-4 overflow-hidden rounded-3xl border border-[#F0E6D6] bg-[#FFFBF2] p-8 dark:border-neutral-800 dark:bg-neutral-900 sm:m-6 sm:p-10">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.2fr_0.8fr_0.8fr_1.2fr]">
        <div>
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo.svg" alt="Qublem" width={44} height={44} className="rounded-xl" />
            <span className="text-2xl font-extrabold text-[#2B2118] dark:text-neutral-100" style={{ fontFamily: "var(--font-fredoka), sans-serif" }}>
              Qublem
            </span>
          </Link>
          <p className="mt-4 text-sm text-[#6B5D4F] dark:text-neutral-400">
            Adaptive practice platform for Math Olympiads.
          </p>
          <span className="mt-4 inline-block rounded-full bg-[#FFE8E0] px-3 py-1.5 text-xs font-semibold text-[#D9502F] dark:bg-[#FF6B4A]/15 dark:text-[#FF9478]">
            ✨ Practice. Improve. <span className="text-[#FF6B4A]">Achieve.</span>
          </span>

          <p className="mt-6 text-xs font-bold uppercase tracking-wide text-[#2B2118] dark:text-neutral-200">Connect with us</p>
          <div className="mt-2.5 flex items-center gap-2.5">
            <a
              href="https://www.instagram.com/qublem.in?igsh=MTU2ZnRmeXVib3hucg=="
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#F0E6D6] text-[#D9502F] transition-colors hover:bg-[#FFE8E0] dark:border-neutral-700 dark:text-[#FF9478] dark:hover:bg-neutral-800"
            >
              <InstagramIcon size={16} />
            </a>
            <span
              aria-label="LinkedIn (not yet linked — needs a real URL)"
              title="LinkedIn URL not yet provided"
              className="flex h-9 w-9 cursor-not-allowed items-center justify-center rounded-full border border-[#F0E6D6] text-[#8A7C6C] opacity-50 dark:border-neutral-700 dark:text-neutral-600"
            >
              <LinkedinIcon size={16} />
            </span>
          </div>
        </div>

        <div>
          <h3 className="border-b-2 border-[#FF6B4A] pb-2 text-sm font-bold text-[#2B2118] dark:text-neutral-100" style={{ display: "inline-block" }}>
            Product
          </h3>
          <ul className="mt-4 flex flex-col gap-3">
            {PRODUCT_LINKS.map((item) => (
              <li key={item.label}>
                <Link href={item.href} onClick={(e) => handleHomeClick(e, item.href)} className="flex items-center gap-2 text-sm text-[#6B5D4F] transition-colors hover:text-[#FF6B4A] dark:text-neutral-400 dark:hover:text-[#FF9478]">
                  <item.icon size={15} /> {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="border-b-2 border-[#FF6B4A] pb-2 text-sm font-bold text-[#2B2118] dark:text-neutral-100" style={{ display: "inline-block" }}>
            Company
          </h3>
          <ul className="mt-4 flex flex-col gap-3">
            {COMPANY_LINKS.map((item) => (
              <li key={item.label}>
                <Link href={item.href} className="flex items-center gap-2 text-sm text-[#6B5D4F] transition-colors hover:text-[#FF6B4A] dark:text-neutral-400 dark:hover:text-[#FF9478]">
                  <item.icon size={15} /> {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative overflow-hidden pb-4">
          <div className="relative z-10 rounded-2xl border border-[#F0E6D6] bg-white/60 p-5 dark:border-neutral-800 dark:bg-neutral-800/40">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FFE8E0] dark:bg-[#FF6B4A]/15">
                <Mail size={18} color="#FF6B4A" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#2B2118] dark:text-neutral-100">Get in touch</h3>
                <p className="text-xs text-[#6B5D4F] dark:text-neutral-400">We&rsquo;re here to help!</p>
              </div>
            </div>
            <a
              href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Hello Qublem!")}`}
              className="mt-3 block rounded-xl bg-[#FFE8E0] px-3 py-2 text-center text-sm font-semibold text-[#D9502F] transition-colors hover:bg-[#FFDACB] dark:bg-[#FF6B4A]/15 dark:text-[#FF9478] dark:hover:bg-[#FF6B4A]/25"
            >
              {SUPPORT_EMAIL}
            </a>
            <Link
              href="/contact"
              className="mt-2 block rounded-xl bg-[#FF6B4A] px-3 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-[#D9502F]"
            >
              Send us a message
            </Link>
          </div>
          {/* Constrained within this column now — no longer overlaps the
              bottom bar below it. */}
          <MountainFlagIllustration className="pointer-events-none absolute -right-3 -top-3 h-16 w-16 opacity-25 md:h-20 md:w-20" />
        </div>
      </div>

      <div className="mx-auto mt-8 flex max-w-6xl flex-col items-center justify-between gap-3 border-t border-[#F0E6D6] pt-6 text-xs text-[#6B5D4F] dark:border-neutral-800 dark:text-neutral-500 sm:flex-row">
        <span>© 2026 Qublem. All rights reserved.</span>
        <span>Made with ❤️ in India.</span>
        <Link href="/contact" className="flex items-center gap-1 rounded-full bg-[#FFE8E0] px-3 py-1.5 font-semibold text-[#D9502F] transition-colors hover:bg-[#FFDACB] dark:bg-[#FF6B4A]/15 dark:text-[#FF9478]">
          <HelpingHand size={13} /> Need help? →
        </Link>
      </div>
    </footer>
  );
}

function InstagramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function LinkedinIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function MountainFlagIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 160" className={className}>
      <path d="M0 160 L60 60 L100 110 L140 40 L200 160 Z" fill="#4C3AA0" opacity="0.85" />
      <path d="M60 160 L140 40 L200 160 Z" fill="#FF6B4A" opacity="0.9" />
      <line x1="140" y1="40" x2="140" y2="10" stroke="#2B2118" strokeWidth="2" />
      <path d="M140 10 L165 18 L140 26 Z" fill="#FFB238" />
      <circle cx="30" cy="30" r="3" fill="#FFB238" />
      <circle cx="175" cy="55" r="2.5" fill="#6FCF52" />
      <path d="M20 90 l4 8 l8 4 l-8 4 l-4 8 l-4 -8 l-8 -4 l8 -4 Z" fill="#FF6B4A" opacity="0.7" />
    </svg>
  );
}