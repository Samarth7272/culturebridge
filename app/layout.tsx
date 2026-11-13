import "./globals.css";
import type { Metadata } from "next";
import { ThemeProvider } from "@/components/ThemeProvider";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: "CultureBridge",
  description: "Workshops for global etiquette, diversity and inclusion",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen overflow-x-hidden font-sans antialiased">
        <ThemeProvider>
          <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
          >
            <div className="absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-violet-600/20 blur-3xl" />
            <div className="absolute -right-24 top-20 h-[26rem] w-[26rem] rounded-full bg-cyan-500/15 blur-3xl" />
            <div className="absolute bottom-0 left-1/3 h-[24rem] w-[24rem] rounded-full bg-emerald-500/10 blur-3xl" />
          </div>

          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}