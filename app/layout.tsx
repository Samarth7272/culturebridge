import "./globals.css";
import type { Metadata } from "next";
import Nav from "@/components/Nav";
import LogoutButton from "@/components/LogoutButton";

export const metadata: Metadata = {
  title: "CultureBridge",
  description: "Workshops for global etiquette, diversity and inclusion",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="relative min-h-screen overflow-x-hidden bg-[#0B1020] font-sans text-white antialiased">
        {/* Background glow blobs */}
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-violet-600/30 blur-3xl" />
          <div className="absolute -right-24 top-20 h-[26rem] w-[26rem] rounded-full bg-cyan-500/25 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-[24rem] w-[24rem] rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="absolute -bottom-24 -right-16 h-[22rem] w-[22rem] rounded-full bg-pink-500/20 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:28px_28px]" />
        </div>

        {/* Rainbow accent line */}
        <div className="h-1 w-full bg-gradient-to-r from-cyan-400 via-violet-500 via-60% to-pink-500" />

        {/* Sticky frosted header */}
        <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0B1020]/70 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4">
            <div className="flex-1">
              <Nav />
            </div>
            <div
              className="shrink-0 [&_button]:rounded-full [&_button]:bg-gradient-to-r [&_button]:from-pink-500 [&_button]:to-violet-500 [&_button]:px-4 [&_button]:py-1.5 [&_button]:text-sm [&_button]:font-semibold [&_button]:text-white [&_button]:shadow-lg [&_button]:shadow-violet-500/30 [&_button]:transition hover:[&_button]:scale-105 hover:[&_button]:shadow-pink-500/40"
            >
              <LogoutButton />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>

        {/* Footer */}
        <footer className="mt-10 border-t border-white/10 py-6 text-center text-sm text-white/50">
          <span className="bg-gradient-to-r from-cyan-300 via-violet-300 to-pink-300 bg-clip-text font-semibold text-transparent">
            CultureBridge
          </span>{" "}
          · Building bridges across cultures
        </footer>
      </body>
    </html>
  );
}