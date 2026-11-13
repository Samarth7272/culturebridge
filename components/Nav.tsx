"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Globe2,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/admin", label: "Admin" },
  { href: "/facilitator", label: "Trainer" },
  { href: "/learner", label: "Employee" },
];

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    function checkLogin() {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");
      setIsLoggedIn(Boolean(token && user));
    }

    checkLogin();
    setMobileOpen(false);
  }, [pathname]);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    router.replace("/");
    router.refresh();
  }

  const linkClass = (href: string) => {
    const active = pathname === href;

    return `rounded-lg px-3 py-2 text-sm font-semibold transition ${
      active
        ? "bg-cyan-500/10 text-cyan-500"
        : "text-[var(--text)] hover:bg-[var(--surface-2)] hover:text-cyan-500"
    }`;
  };

  return (
    <nav className="flex min-h-[76px] flex-wrap items-center justify-between gap-3 py-3">
      <Link
        href="/"
        className="flex items-center gap-2 font-display text-xl font-extrabold tracking-tight text-[var(--text)] sm:text-2xl"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-violet-600 text-white shadow-lg">
          <Globe2 size={23} />
        </span>
        CultureBridge
      </Link>

      <div className="hidden items-center gap-1 lg:flex">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={linkClass(link.href)}
          >
            {link.label}
          </Link>
        ))}

        <button
          type="button"
          onClick={toggleTheme}
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          className="ml-2 flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold text-[var(--text)] transition hover:border-cyan-400 hover:bg-cyan-400/10"
        >
          {theme === "dark" ? (
            <>
              <Sun size={18} className="text-amber-400" />
              <span>Light</span>
            </>
          ) : (
            <>
              <Moon size={18} className="text-cyan-500" />
              <span>Dark</span>
            </>
          )}
        </button>

        {isLoggedIn ? (
          <button
            type="button"
            onClick={handleLogout}
            className="ml-2 flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5"
          >
            <LogOut size={16} />
            Logout
          </button>
        ) : (
          <>
            <Link
              href="/login"
              className="ml-2 rounded-xl px-3 py-2 text-sm font-semibold text-[var(--text)] transition hover:text-cyan-500"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 px-4 py-2 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5"
            >
              Register
            </Link>
          </>
        )}
      </div>

      <div className="flex items-center gap-2 lg:hidden">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2.5 text-[var(--text)]"
        >
          {theme === "dark" ? (
            <Sun size={19} className="text-amber-400" />
          ) : (
            <Moon size={19} className="text-cyan-500" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          className="rounded-xl border border-[var(--border)] p-2.5 text-[var(--text)]"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="flex w-full flex-col gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-xl lg:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={linkClass(link.href)}
            >
              {link.label}
            </Link>
          ))}

          {isLoggedIn ? (
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-rose-500 hover:bg-rose-500/10"
            >
              <LogOut size={17} />
              Logout
            </button>
          ) : (
            <>
              <Link href="/login" className={linkClass("/login")}>
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-gradient-to-r from-cyan-500 to-violet-600 px-3 py-2 text-sm font-bold text-white"
              >
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}