"use client";
import { useState, useEffect } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CalendarDays, Download, Plus, Trash2, Users, CheckCircle2, ClipboardList } from "lucide-react";
import { useStore } from "@/lib/useStore";
import { CATS, SEED, Workshop } from "@/lib/data";

const trend = [{ w: "W1", r: 12 }, { w: "W2", r: 28 }, { w: "W3", r: 41 }, { w: "W4", r: 62 }, { w: "W5", r: 86 }];

export default function Admin() {
  const [ws, setWs] = useStore<Workshop[]>("cb.workshops", SEED);
  const [f, setF] = useState({ title: "", cat: CATS[0], date: "", capacity: "20", facilitator: "" });
  const [err, setErr] = useState<Record<string, string>>({});
  const reg = ws.reduce((a, w) => a + w.registered, 0), done = ws.reduce((a, w) => a + w.completed, 0);
  useEffect(() => {
  const u = localStorage.getItem("user");
  if (!u) { window.location.href = "/login"; return; }
  if (JSON.parse(u).role !== "facilitator") window.location.href = "/login";
}, []);

  function add(e: React.FormEvent) {
    e.preventDefault();
    const x: Record<string, string> = {}, cap = Number(f.capacity);
    if (f.title.trim().length < 4) x.title = "Enter a title of at least 4 characters.";
    if (!f.date) x.date = "Choose a date.";
    if (!Number.isInteger(cap) || cap < 5 || cap > 200) x.capacity = "Capacity must be a whole number from 5 to 200.";
    if (!f.facilitator.trim()) x.facilitator = "Enter a facilitator name.";
    setErr(x);
    if (Object.keys(x).length) return;
    setWs([...ws, { id: "w" + Date.now(), title: f.title.trim(), cat: f.cat, date: f.date, capacity: cap, registered: 0, completed: 0, facilitator: f.facilitator.trim(), status: "Draft" }]);
    setF({ ...f, title: "", date: "", facilitator: "" });
  }
  const toggle = (id: string) => setWs(ws.map(w => w.id === id ? { ...w, status: w.status === "Draft" ? "Published" : "Draft" } : w));
  function csv() {
    const rows = [["Title", "Category", "Date", "Registered", "Capacity", "Completed", "Status"], ...ws.map(w => [w.title, w.cat, w.date, w.registered, w.capacity, w.completed, w.status])];
    const b = new Blob([rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n")], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "culturebridge-report.csv"; a.click();
  }
  const cards = [[ClipboardList, "Workshops", ws.length, "text-emerald"], [Users, "Registrations", reg, "text-royal"], [CheckCircle2, "Completion", reg ? Math.round((done / reg) * 100) + "%" : "0%", "text-gold"]] as const;
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="font-display text-4xl font-bold">Admin dashboard</h1>
        <button onClick={csv} className="btn btn-ghost"><Download size={18} aria-hidden /> Export CSV</button></div>
      <div className="grid gap-4 sm:grid-cols-3">{cards.map(([I, l, v, c]) => (<div key={l} className="glass glow p-5"><I className={c} aria-hidden /><p className="mt-2 text-3xl font-bold">{v}</p><p className="text-sm text-white/70">{l}</p></div>))}</div>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="glass p-5" aria-label="Registrations trend"><h2 className="mb-3 font-semibold">Registrations over time</h2>
          <div className="h-60"><ResponsiveContainer><AreaChart data={trend}><CartesianGrid stroke="#ffffff22" /><XAxis dataKey="w" stroke="#cbd5e1" /><YAxis stroke="#cbd5e1" /><Tooltip contentStyle={{ background: "#0a1020", border: "1px solid #ffffff33" }} /><Area dataKey="r" name="Registrations" stroke="#2dd4bf" fill="#4361ee" fillOpacity={0.4} /></AreaChart></ResponsiveContainer></div></section>
        <section className="glass p-5" aria-label="Completion by workshop"><h2 className="mb-3 font-semibold">Registered vs completed</h2>
          <div className="h-60"><ResponsiveContainer><BarChart data={ws.map((w, i) => ({ n: "W" + (i + 1), Registered: w.registered, Completed: w.completed }))}><CartesianGrid stroke="#ffffff22" /><XAxis dataKey="n" stroke="#cbd5e1" /><YAxis stroke="#cbd5e1" /><Tooltip contentStyle={{ background: "#0a1020", border: "1px solid #ffffff33" }} /><Bar dataKey="Registered" fill="#8b5cf6" radius={4} /><Bar dataKey="Completed" fill="#10b981" radius={4} /></BarChart></ResponsiveContainer></div></section>
      </div>
      <section className="glass p-5" aria-label="Workshops"><h2 className="mb-3 flex items-center gap-2 font-semibold"><CalendarDays size={18} aria-hidden /> Workshops and upcoming calendar</h2>
        {ws.length === 0 ? <p className="text-white/70">No workshops yet. Use the form below to create your first one.</p> :
          <ul className="divide-y divide-white/10">{[...ws].sort((a, b) => a.date.localeCompare(b.date)).map(w => (
            <li key={w.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
              <div><p className="font-medium">{w.title}</p><p className="text-sm text-white/70">{w.date} · {w.cat} · {w.facilitator} · {w.registered}/{w.capacity} registered</p></div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggle(w.id)} className={`rounded-full px-3 py-1 text-sm font-medium text-ink ${w.status === "Published" ? "bg-emerald" : "bg-gold"}`} aria-label={`${w.title}: ${w.status}. Switch status`}>{w.status}</button>
                <button onClick={() => setWs(ws.filter(x => x.id !== w.id))} className="rounded-lg p-2 hover:bg-white/10" aria-label={`Delete ${w.title}`}><Trash2 size={18} className="text-coral" /></button>
              </div></li>))}</ul>}
      </section>
      <form onSubmit={add} noValidate className="glass grid gap-3 p-5 md:grid-cols-2" aria-label="Create workshop">
        <h2 className="font-semibold md:col-span-2">Create a workshop</h2>
        {([["title", "Title", "text"], ["date", "Date", "date"], ["capacity", "Capacity", "number"], ["facilitator", "Facilitator", "text"]] as const).map(([k, l, t]) => (
          <div key={k}><label htmlFor={k} className="mb-1 block text-sm">{l}</label>
            <input id={k} type={t} className="input" value={f[k]} onChange={e => setF({ ...f, [k]: e.target.value })} aria-invalid={!!err[k]} aria-describedby={err[k] ? k + "-e" : undefined} />
            {err[k] && <p id={k + "-e"} role="alert" className="mt-1 text-sm text-coral">{err[k]}</p>}</div>))}
        <div><label htmlFor="cat" className="mb-1 block text-sm">Category</label><select id="cat" className="input" value={f.cat} onChange={e => setF({ ...f, cat: e.target.value })}>{CATS.map(c => <option key={c}>{c}</option>)}</select></div>
        <div className="flex items-end"><button className="btn btn-pri"><Plus size={18} aria-hidden /> Save draft</button></div>
      </form>
    </div>
  );
}
