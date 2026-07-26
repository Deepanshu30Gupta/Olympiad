import type { Metadata } from "next";
import { Geist, Geist_Mono, Fredoka, Plus_Jakarta_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";
import "katex/dist/katex.min.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Qublem",
  description: "Adaptive practice for math olympiad prep.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} ${fredoka.variable} ${plusJakarta.variable} h-full antialiased`}
      >
        <head>
          {/* Runs before hydration/paint — reads the stored theme (or
              falls back to OS preference) and applies the .dark class
              immediately, so there's no flash of the wrong theme while
              React boots up. */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  try {
                    var stored = localStorage.getItem('theme');
                    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    var isDark = stored ? stored === 'dark' : prefersDark;
                    if (isDark) document.documentElement.classList.add('dark');
                  } catch (e) {}
                })();
              `,
            }}
          />
        </head>
        <body className="min-h-full flex flex-col">
  <Header />
  <main className="flex-1">{children}</main>
  <Footer />
</body>
      </html>
    </ClerkProvider>
  );
}