"use client";

import { useState, type ReactNode } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

type Role = "admin" | "facilitator" | "learner";

type DashboardLayoutProps = {
  role: Role;
  children: ReactNode;
};

export default function DashboardLayout({
  role,
  children,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Sidebar
        role={role}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="min-h-screen lg:pl-64">
        <Topbar
          role={role}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>

        <footer className="border-t border-[var(--border)] px-6 py-5 text-center text-xs text-[var(--muted)]">
          CultureBridge · Building bridges across cultures
        </footer>
      </div>
    </div>
  );
}