import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { clerkAppearanceLight } from "@/lib/clerk-appearance";

export default function SignUpPage() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center bg-[#FFFBF2] px-4 py-10">
      <Link href="/" className="mb-2 flex items-center gap-2">
        <Image src="/logo.svg" alt="Qublem" width={36} height={36} className="rounded-lg" />
        <span className="text-xl font-bold text-[#2B2118]" style={{ fontFamily: "var(--font-fredoka), sans-serif" }}>
          Qublem
        </span>
      </Link>
      <p className="mb-7 text-sm text-[#6B5D4F]">Start training today.</p>

      <SignUp
        forceRedirectUrl="/dashboard"
        appearance={{
          ...clerkAppearanceLight,
          elements: {
            card: {
              boxShadow: "none",
              border: "1px solid #F0E6D6",
            },
          },
        }}
      />
    </div>
  );
}