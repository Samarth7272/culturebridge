import Link from "next/link";
import { CATS } from "@/lib/data";
import Globe from "@/components/Globe";
import { Users, CalendarCheck, Award, Star, MessageCircle, Handshake, Laptop, HeartHandshake, Briefcase, Video } from "lucide-react";
const icons = [MessageCircle, Video, Handshake, Laptop, HeartHandshake, Briefcase];
const hues = ["text-emerald", "text-royal", "text-violet", "text-teal", "text-coral", "text-gold"];
const stats = [[Users, "1,240", "learners (demo data)"], [CalendarCheck, "86", "workshops run"], [Award, "82%", "completion"], [Star, "4.6/5", "satisfaction"]] as const;
export default function Home() {
  return (
    <div className="space-y-16">
      <section className="grid items-center gap-8 md:grid-cols-2">
        <div>
          <h1 className="font-display text-5xl font-bold leading-tight md:text-6xl">Teams that work across borders, working well together.</h1>
          <p className="mt-4 max-w-prose text-lg text-white/80">Plan workshops, practise real engineering situations, and see what changed. Built for multinational and shared-service teams.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/admin" className="btn btn-pri">Get started</Link>
            <Link href="/learner" className="btn btn-ghost">Explore workshops</Link>
          </div>
        </div>
        <div className="flex justify-center"><Globe /></div>
      </section>
      <section aria-label="Impact" className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map(([Ic, v, l], i) => (<div key={l} className="glass p-5"><Ic className={hues[i]} aria-hidden /><p className="mt-2 text-3xl font-bold">{v}</p><p className="text-sm text-white/70">{l}</p></div>))}
      </section>
      <section>
        <h2 className="font-display text-3xl font-bold">Workshop categories</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATS.map((c, i) => { const I = icons[i]; return (<Link key={c} href="/learner" className="glass glow p-5 transition hover:-translate-y-1"><I className={hues[i]} aria-hidden /><h3 className="mt-3 text-lg font-semibold">{c}</h3><p className="text-sm text-white/70">Short lessons, scenarios and a facilitated session.</p></Link>); })}
        </div>
      </section>
      <section className="glass p-6 md:p-10">
        <h2 className="font-display text-3xl font-bold">Context, not stereotypes</h2>
        <p className="mt-3 max-w-prose text-white/80">Cultural patterns are shown as possible context, never rules about every person. Every scenario has a reviewer, a source and a review date.</p>
      </section>
      <section>
        <h2 className="font-display text-3xl font-bold">What learners say <span className="text-base font-normal text-gold">(demo content, fictional)</span></h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {["The scenarios felt like our real stand-ups.", "I finally had words for giving direct feedback kindly."].map((q, i) => (<figure key={q} className="glass p-5"><blockquote>“{q}”</blockquote><figcaption className="mt-2 text-sm text-white/60">Demo learner {i + 1}</figcaption></figure>))}
        </div>
      </section>
      <footer className="border-t border-white/10 pt-6 text-sm text-white/60">© 2026 CultureBridge. Demo project with fictional data.</footer>
    </div>
  );
}
