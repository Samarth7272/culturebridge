"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Menu,
  Sun,
  Moon,
  Bell,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

type Role = "admin" | "facilitator" | "learner";

type TopbarProps = {
  role: Role;
  onMenuClick: () => void;
};

const titles = {
  admin: "Admin Dashboard",
  facilitator: "Trainer Dashboard",
  learner: "Employee Dashboard",
};

export default function Topbar({ role, onMenuClick }: TopbarProps) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [name, setName] = useState("User");
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      setName(user.name || user.fullName || user.email || "User");
    } catch {
      setName("User");
    }
  }, []);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.replace("/login");
    router.refresh();
  }

  const initials = name
    .split(/[\s@]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-xl">
      <div className="flex min-h-[76px] items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open navigation"
            className="rounded-xl border border-[var(--border)] p-2.5 text-[var(--muted)] hover:bg-[var(--surface-2)] lg:hidden"
          >
            <Menu size={20} />
          </button>

          <div className="min-w-0">
            <p className="hidden text-xs text-[var(--muted)] sm:block">
              Workspace / {titles[role]}
            </p>
            <h1 className="truncate text-lg font-bold text-[var(--text)] sm:text-xl">
              {titles[role]}
            </h1>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            aria-label="Toggle theme"
            className="rounded-xl border border-[var(--border)] p-2.5 text-[var(--muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
          >
            {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
          </button>

          <button
            type="button"
            aria-label="Notifications"
            title="Notifications"
            className="relative rounded-xl border border-[var(--border)] p-2.5 text-[var(--muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
          >
            <Bell size={19} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen(!profileOpen)}
              aria-expanded={profileOpen}
              className="flex items-center gap-2 rounded-xl border border-[var(--border)] p-1.5 transition hover:bg-[var(--surface-2)]"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-blue-600 text-sm font-bold text-white">
                {initials}
              </span>

              <span className="hidden max-w-32 text-left sm:block">
                <span className="block truncate text-sm font-semibold text-[var(--text)]">
                  {name}
                </span>
                <span className="block text-xs capitalize text-[var(--muted)]">
                  {role === "facilitator" ? "Trainer" : role === "learner" ? "Employee" : "Admin"}
                </span>
              </span>

              <ChevronDown size={15} className="hidden text-[var(--muted)] sm:block" />
            </button>

            {profileOpen && (
              <>
                <button
                  type="button"
                  aria-label="Close profile menu"
                  className="fixed inset-0 z-40 cursor-default"
                  onClick={() => setProfileOpen(false)}
                />

                <div className="absolute right-0 top-14 z-50 w-52 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-xl">
                  <div className="border-b border-[var(--border)] px-3 py-2">
                    <p className="truncate text-sm font-semibold text-[var(--text)]">
                      {name}
                    </p>
                    <p className="text-xs capitalize text-[var(--muted)]">
                      {role}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={logout}
                    className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-rose-500 transition hover:bg-rose-500/10"
                  >
                    <LogOut size={17} />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}