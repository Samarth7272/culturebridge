"use client";
import { useState, useEffect } from "react";
import { Award, BadgeCheck, Printer, RotateCcw, Trophy } from "lucide-react";
import { useStore } from "@/lib/useStore";
import { SCENARIOS, SEED, Workshop } from "@/lib/data";
import { QuizStore, certificateReady, earnedBadges, improvement, pct, progress } from "@/lib/score";
import Quiz from "@/components/Quiz";
import { getWorkshops } from "@/lib/api";

export default function Learner() {
  const [ws, setWs] = useState<Workshop[]>([]);
useEffect(() => {
  getWorkshops()
    .then((list) => setWs(list.map((w: any) => ({ ...w, id: w._id, registered: w.registered ?? 0, completed: w.completed ?? 0 }))))
    .catch(() => {});
}, []);
  const [enrolled, setEnrolled] = useStore<string[]>("cb.enrolled", []);
  const [done, setDone] = useStore<Record<string, number>>("cb.scenarios", {});
  const [first, setFirst] = useStore<Record<string, boolean>>("cb.first", {});
  const [quiz, setQuiz] = useStore<QuizStore>("cb.quiz", {});
  const [name, setName] = useStore<string>("cb.name", "Demo Learner");
  const [pick, setPick] = useState<Record<string, number>>({});
  const open = ws.filter(w => w.status === "Published");
  const T = SCENARIOS.length, n = Object.keys(done).length, p = progress(n, T, quiz);
  const firstTry = Object.values(first).filter(Boolean).length, imp = improvement(quiz);
  const badges = earnedBadges({ enrolled: enrolled.length, scenariosDone: n, scenarioTotal: T, quiz });
  const ready = certificateReady(n, T, quiz);
  const preDone = !!quiz.pre;
  useEffect(() => {
  const u = localStorage.getItem("user");
  if (!u) { window.location.href = "/login"; return; }
  const user = JSON.parse(u);
  if (user.role !== "learner") { window.location.href = "/login"; return; }
  setName(user.name);
}, []);
  function reset() { setDone({}); setFirst({}); setQuiz({}); setPick({}); }
  return (
    <div className="space-y-8">
      <h1 className="font-display text-4xl font-bold">Welcome back, {name || "Learner"}</h1>
      <section className="glass glow p-5" aria-label="Progress"><div className="flex flex-wrap justify-between gap-2"><h2 className="font-semibold">Learning progress</h2><span>{p}%</span></div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/15" role="progressbar" aria-valuenow={p} aria-valuemin={0} aria-valuemax={100} aria-label="Learning progress"><div className="h-full bg-gradient-to-r from-emerald via-teal to-gold" style={{ width: p + "%" }} /></div>
        <p className="mt-2 text-sm text-white/70">{n}/{T} scenarios complete · {firstTry} correct on first try · pre-quiz {quiz.pre ? pct(quiz.pre.score, quiz.pre.total) + "%" : "not taken"} · post-quiz {quiz.post ? pct(quiz.post.score, quiz.post.total) + "%" : "not taken"}{imp !== null ? ` · change ${imp > 0 ? "+" : ""}${imp} points` : ""}</p>
        <ul className="mt-4 flex flex-wrap gap-2">{badges.map(b => (<li key={b.id} className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm ${b.ok ? "bg-gold font-medium text-ink" : "bg-white/10 text-white/60"}`}><Trophy size={14} aria-hidden /> {b.label}{b.ok ? "" : " (locked)"}</li>))}</ul>
        <button className="btn btn-ghost mt-4" onClick={reset}><RotateCcw size={16} aria-hidden /> Reset my progress</button></section>
      <section aria-label="Workshops"><h2 className="mb-3 font-display text-2xl font-bold">Available workshops</h2>
        <div className="grid gap-4 md:grid-cols-2">{open.map(w => { const on = enrolled.includes(w.id); return (
          <div key={w.id} className="glass p-5"><p className="font-semibold">{w.title}</p><p className="text-sm text-white/70">{w.date} · {w.facilitator}</p>
            <button className={`btn mt-3 ${on ? "btn-ghost" : "btn-pri"}`} onClick={() => setEnrolled(on ? enrolled.filter(x => x !== w.id) : [...enrolled, w.id])}>{on ? <><BadgeCheck size={18} aria-hidden /> Enrolled, tap to leave</> : "Enrol"}</button></div>); })}</div></section>
      <section aria-label="Pre-training quiz"><h2 className="mb-3 font-display text-2xl font-bold">Step 1: Pre-training quiz</h2>
        <Quiz phase="pre" result={quiz.pre} onDone={r => setQuiz({ ...quiz, pre: r })} /></section>
      <section aria-label="Scenarios"><h2 className="mb-3 font-display text-2xl font-bold">Step 2: Workplace scenarios</h2>
        <div className="space-y-4">{SCENARIOS.map(s => { const c = pick[s.id]; return (
          <fieldset key={s.id} className="glass p-5"><legend className="px-1 font-semibold">{s.title}{done[s.id] ? " (completed)" : ""}</legend><p className="mb-3 text-white/80">{s.ctx}</p>
            <div className="space-y-2">{s.opts.map((o, i) => (
              <button key={i} disabled={c !== undefined} onClick={() => { setPick({ ...pick, [s.id]: i }); if (first[s.id] === undefined) setFirst({ ...first, [s.id]: o.best }); if (o.best) setDone({ ...done, [s.id]: 1 }); }}
                className={`block w-full rounded-xl border p-3 text-left ${c === i ? (o.best ? "border-emerald bg-emerald/20" : "border-coral bg-coral/20") : "border-white/20 hover:bg-white/10"}`}>{o.t}</button>))}</div>
            {c !== undefined && <div role="status" className="mt-3 text-sm"><p>{s.opts[c].fb}</p><p className="mt-1 text-teal">Takeaway: {s.take}</p>
              {!s.opts[c].best && <button className="btn btn-ghost mt-2" onClick={() => { const q = { ...pick }; delete q[s.id]; setPick(q); }}>Try again</button>}</div>}
          </fieldset>); })}</div></section>
      <section aria-label="Post-training quiz"><h2 className="mb-3 font-display text-2xl font-bold">Step 3: Post-training quiz</h2>
        <Quiz phase="post" result={quiz.post} locked={!preDone || n < T} onDone={r => setQuiz({ ...quiz, post: r })} /></section>
      <section aria-label="Certificate" className="glass p-6 text-center">{ready && quiz.pre && quiz.post ?
        <div id="cert" className="glow rounded-2xl p-8"><Award className="mx-auto text-gold" size={48} aria-hidden />
          <h2 className="font-display text-3xl font-bold">Certificate of completion</h2>
          <label className="noprint mt-3 block text-sm">Name on certificate <input className="input mx-auto mt-1 max-w-xs" value={name} onChange={e => setName(e.target.value)} /></label>
          <p className="mt-3 text-2xl font-bold">{name || "Learner"}</p>
          <p className="mt-1">completed Global Etiquette and Inclusion Training</p>
          <p className="mt-2 text-sm">{n}/{T} scenarios · pre-quiz {pct(quiz.pre.score, quiz.pre.total)}% · post-quiz {pct(quiz.post.score, quiz.post.total)}% · issued {new Date(quiz.post.at).toLocaleDateString()}</p>
          <button className="btn btn-pri noprint mt-4" onClick={() => window.print()}><Printer size={18} aria-hidden /> Print certificate</button></div> :
        <p className="text-white/70">Finish the pre-quiz, all {T} scenarios and the post-quiz to unlock your certificate.</p>}</section>
    </div>
  );
}