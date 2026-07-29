import { Sparkles, Mail } from "lucide-react";
import { ContactForm } from "@/features/home/ContactForm";
import { PaperAirplane, Sparkle } from "@/features/home/decorations";

const SUPPORT_EMAIL = "support.qublem.in@gmail.com";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#FFFBF2] dark:bg-neutral-950">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 lg:grid-cols-2 lg:items-center">
        <div className="relative">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FFE8E0] px-3 py-1.5 text-xs font-semibold text-[#D9502F] dark:bg-[#FF6B4A]/15 dark:text-[#FF9478]">
            <Sparkles size={12} /> We&rsquo;re here for you
          </div>

          <h1
            className="mt-4 text-5xl font-extrabold leading-tight text-[#2B2118] dark:text-neutral-100"
            style={{ fontFamily: "var(--font-fredoka), sans-serif" }}
          >
            Let&rsquo;s <span className="text-[#FF6B4A]">connect!</span>
          </h1>

          <p className="mt-4 max-w-md text-[#6B5D4F] dark:text-neutral-400">
            Have a question, suggestion, or facing an issue?
            <br />
            We&rsquo;d love to hear from you and help you out.
          </p>

          <div className="relative mt-10 flex justify-center">
            <EnvelopeIllustration className="w-full max-w-sm" />
            <Sparkle size={18} color="#FF6B4A" className="pointer-events-none absolute left-4 top-4" />
            <Sparkle size={14} color="#6FCF52" className="pointer-events-none absolute bottom-8 left-0" />
          </div>

          <div className="relative mt-8 flex items-center gap-4 rounded-2xl border border-[#F0E6D6] bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FFE8E0] dark:bg-[#FF6B4A]/15">
              <Mail size={20} color="#FF6B4A" />
            </div>
            <div>
              <p className="text-sm text-[#6B5D4F] dark:text-neutral-400">Prefer email?</p>
              <a href={`mailto:${SUPPORT_EMAIL}`} className="font-bold text-[#2B2118] hover:text-[#FF6B4A] dark:text-neutral-100 dark:hover:text-[#FF9478]">
                {SUPPORT_EMAIL}
              </a>
              <p className="text-xs text-[#6B5D4F] dark:text-neutral-500">We usually reply within 24 hours.</p>
            </div>
            <PaperAirplane color="#4C3AA0" className="pointer-events-none absolute -right-3 -top-3 hidden sm:block" />
          </div>
        </div>

        <div className="rounded-3xl border border-[#F0E6D6] bg-white p-8 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}

function EnvelopeIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 260" className={className}>
      <circle cx="150" cy="130" r="120" fill="#FFE8D6" opacity="0.6" />
      <circle cx="150" cy="130" r="85" fill="#FFDCC0" opacity="0.5" />

      <path d="M60 110 L240 110 L240 220 L60 220 Z" fill="#FFB86B" />
      <path d="M60 110 L150 175 L240 110 L240 130 L150 195 L60 130 Z" fill="#FF9F45" />
      <path d="M85 95 L215 95 L215 190 L85 190 Z" fill="white" />

      <circle cx="150" cy="140" r="26" fill="none" stroke="#4C3AA0" strokeWidth="6" />
      <path d="M150 128 a12 12 0 1 0 0.1 0 M150 152 v10" stroke="#4C3AA0" strokeWidth="6" fill="none" strokeLinecap="round" />

      <circle cx="30" cy="35" r="3" fill="#FFB238" />
      <circle cx="260" cy="60" r="2.5" fill="#6FCF52" />
      <path d="M240 45 l3 6 l6 3 l-6 3 l-3 6 l-3 -6 l-6 -3 l6 -3 Z" fill="#4C3AA0" opacity="0.6" />
    </svg>
  );
}