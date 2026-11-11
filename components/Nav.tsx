"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe2 } from "lucide-react";
const L = [["/", "Home"], ["/admin", "Admin"], ["/facilitator", "Trainer"], ["/learner", "Employee"]];
export default function Nav() {
  const p = usePathname();
  return (
    <header className="sticky top-0 z-20 glass !rounded-none !border-x-0 !border-t-0">
      <nav aria-label="Main" className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold"><Globe2 className="text-teal" aria-hidden /> CultureBridge</Link>
        <ul className="flex gap-1">{L.map(([h, n]) => (
          <li key={h}><Link href={h} aria-current={p === h ? "page" : undefined} className={`rounded-lg px-3 py-2 text-sm font-medium ${p === h ? "bg-white/15" : "hover:bg-white/10"}`}>{n}</Link></li>))}</ul>
      </nav>
    </header>
  );
}
