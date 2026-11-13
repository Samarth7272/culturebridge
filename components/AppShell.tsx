"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Nav from "@/components/Nav";

export default function AppShell({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  const isDashboard =
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/facilitator" ||
    pathname.startsWith("/facilitator/") ||
    pathname === "/learner" ||
    pathname.startsWith("/learner/");

  if (isDashboard) {
    return <>{children}</>;
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Nav />
        </div>
      </header>

      <main className="mx-auto min-h-[75vh] max-w-7xl px-4 py-8 sm:px-6">
        {children}
      </main>

      <footer className="border-t border-[var(--border)] py-6 text-center text-sm text-[var(--muted)]">
        <span className="font-semibold text-[var(--text)]">
          CultureBridge
        </span>
        {" "}· Building bridges across cultures
      </footer>
    </>
  );
}