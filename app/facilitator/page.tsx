"use client";
import { useState, useEffect } from "react";
import { UserCheck } from "lucide-react";
import { useStore } from "@/lib/useStore";
import { PEOPLE, SEED, Workshop } from "@/lib/data";

export default function Facilitator() {
  const [ws] = useStore<Workshop[]>("cb.workshops", SEED);
  const [att, setAtt] = useStore<Record<string, string[]>>("cb.attendance", {});
  const [sel, setSel] = useState("");
  const mine = ws.filter(w => w.status === "Published");
  const id = sel || mine[0]?.id || "";
  const present = att[id] ?? [];
  const toggle = (p: string) => setAtt({ ...att, [id]: present.includes(p) ? present.filter(x => x !== p) : [...present, p] });
  useEffect(() => {
  const u = localStorage.getItem("user");
  if (!u) { window.location.href = "/login"; return; }
  if (JSON.parse(u).role !== "facilitator") window.location.href = "/login";
}, []);
  return (
    <div className="space-y-6">
      <h1 className="font-display text-4xl font-bold">Trainer workspace</h1>
      {mine.length === 0 ? <p className="glass p-5">No published workshops are assigned to you. Ask an admin to publish one.</p> : <>
        <div><label htmlFor="ws" className="mb-1 block text-sm">Workshop</label>
          <select id="ws" className="input md:max-w-md" value={id} onChange={e => setSel(e.target.value)}>{mine.map(w => <option key={w.id} value={w.id}>{w.title}</option>)}</select></div>
        <section className="glass glow p-5" aria-label="Attendance"><h2 className="mb-1 flex items-center gap-2 font-semibold"><UserCheck size={18} aria-hidden /> Attendance</h2>
          <p className="mb-3 text-sm text-white/70" aria-live="polite">{present.length} of {PEOPLE.length} present (demo roster)</p>
          <ul className="grid gap-2 sm:grid-cols-2">{PEOPLE.map(p => (<li key={p}><label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/15 p-3 hover:bg-white/10"><input type="checkbox" className="h-5 w-5 accent-emerald" checked={present.includes(p)} onChange={() => toggle(p)} />{p}</label></li>))}</ul></section></>}
    </div>
  );
}
