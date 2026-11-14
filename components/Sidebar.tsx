"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  CalendarDays,
  BarChart3,
  Users,
  Settings,
  BookOpen,
  ClipboardCheck,
  Award,
  Globe2,
  Building2,
  X,
  Home,
} from "lucide-react";

type Role = "admin" | "facilitator" | "learner";

type SidebarProps = {
  role: Role;
  open: boolean;
  onClose: () => void;
};

const menus = {
  admin: [
    {
      label: "Overview",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      label: "Organisation Management",
      href: "/admin#organisations",
      icon: Building2,
    },
    {
      label: "User Management",
      href: "/admin#users",
      icon: Users,
    },
    {
      label: "Learning Programs",
      href: "/admin#programs",
      icon: BookOpen,
    },
    {
      label: "Country Learning Paths",
      href: "/admin#countries",
      icon: Globe2,
    },
    {
      label: "Assessments",
      href: "/admin#assessments",
      icon: ClipboardCheck,
    },
    {
      label: "Analytics & Reports",
      href: "/admin#analytics",
      icon: BarChart3,
    },
    {
      label: "Certificates",
      href: "/admin#certificates",
      icon: Award,
    },
    {
      label: "Settings",
      href: "/admin#settings",
      icon: Settings,
    },
  ],

  facilitator: [
    {
      label: "Overview",
      href: "/facilitator",
      icon: LayoutDashboard,
    },
    {
      label: "Workshops",
      href: "/facilitator#workshops",
      icon: CalendarDays,
    },
    {
      label: "Attendance",
      href: "/facilitator#attendance",
      icon: ClipboardCheck,
    },
  ],

  learner: [
    {
      label: "My Learning",
      href: "/learner",
      icon: LayoutDashboard,
    },
    {
      label: "Workshops",
      href: "/learner#workshops",
      icon: CalendarDays,
    },
    {
      label: "Assessments",
      href: "/learner#pre-quiz",
      icon: BookOpen,
    },
    {
      label: "Achievements",
      href: "/learner#achievements",
      icon: Award,
    },
  ],
};

const roleLabels = {
  admin: "Administrator",
  facilitator: "Trainer",
  learner: "Employee",
};

export default function Sidebar({
  role,
  open,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();
  const [currentHash, setCurrentHash] = useState("");

  useEffect(() => {
    const updateHash = () => {
      setCurrentHash(window.location.hash);
    };

    updateHash();

    window.addEventListener("hashchange", updateHash);

    return () => {
      window.removeEventListener("hashchange", updateHash);
    };
  }, [pathname]);

  const isActive = (href: string) => {
    const [itemPath, itemHash] = href.split("#");

    if (pathname !== itemPath) {
      return false;
    }

    if (itemHash) {
      return currentHash === `#${itemHash}`;
    }

    return currentHash === "";
  };

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed bottom-0 left-0 top-0 z-50 flex w-64 flex-col border-r border-[var(--border)] bg-[var(--surface)] shadow-xl transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex h-20 shrink-0 items-center justify-between border-b border-[var(--border)] px-5">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-3"
          >
            <span className="rounded-xl bg-[var(--primary)] p-2 text-white shadow-lg">
              <Globe2 size={22} />
            </span>

            <span>
              <span className="block text-lg font-bold text-[var(--text)]">
                CultureBridge
              </span>

              <span className="text-xs text-[var(--muted)]">
                {roleLabels[role]}
              </span>
            </span>
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="rounded-lg p-2 text-[var(--muted)] transition hover:bg-[var(--surface-2)] lg:hidden"
          >
            <X size={19} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-7">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
            Workspace
          </p>

          <nav className="space-y-1">
            {menus[role].map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    setCurrentHash(
                      item.href.includes("#")
                        ? `#${item.href.split("#")[1]}`
                        : ""
                    );

                    onClose();
                  }}
                  aria-current={active ? "page" : undefined}
                  className={`group relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 ${
                    active
                      ? "bg-[var(--accent-soft)] text-[var(--primary)]"
                      : "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
                  }`}
                >
                  {active && (
                    <span className="absolute bottom-2 left-0 top-2 w-1 rounded-full bg-[var(--primary)]" />
                  )}

                  <Icon
                    size={19}
                    className={`shrink-0 transition-transform duration-200 ${
                      active
                        ? "text-[var(--primary)]"
                        : "group-hover:scale-110"
                    }`}
                  />

                  <span>{item.label}</span>

                  {active && (
                    <span className="ml-auto h-2 w-2 rounded-full bg-[var(--primary)]" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom section */}
        <div className="shrink-0 border-t border-[var(--border)] p-4">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[var(--muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
          >
            <Home size={18} />
            Back to website
          </Link>

          <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
            <p className="text-xs font-semibold text-[var(--text)]">
              CultureBridge
            </p>

            <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
              Building bridges across cultures.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}