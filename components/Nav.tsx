"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Globe2, LogOut } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/admin", label: "Admin" },
  { href: "/facilitator", label: "Trainer" },
  { href: "/learner", label: "Employee" },
];

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    function checkLogin() {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");

      setIsLoggedIn(Boolean(token && user));
    }

    checkLogin();
  }, [pathname]);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setIsLoggedIn(false);

    router.replace("/");
    router.refresh();
  }

  return (
    <nav className="flex flex-wrap items-center justify-between gap-4 py-3">
      <Link
        href="/"
        className="flex items-center gap-2 font-display text-2xl font-bold"
      >
        <Globe2 className="text-emerald-400" />
        CultureBridge
      </Link>

      <div className="flex flex-wrap items-center gap-5">
        {NAV_LINKS.map((link) => {
          const active = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition hover:text-cyan-300 ${
                active ? "text-cyan-300" : "text-white/80"
              }`}
            >
              {link.label}
            </Link>
          );
        })}

        {isLoggedIn ? (
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 px-5 py-2 font-semibold text-white transition hover:scale-105"
          >
            <LogOut size={16} />
            Logout
          </button>
        ) : (
          <>
            <Link
              href="/login"
              className="text-sm text-white/80 hover:text-cyan-300"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="text-sm text-cyan-300 hover:text-white"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}