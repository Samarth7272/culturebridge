"use client";

import { useState, useEffect } from "react";
import {
  Award,
  BadgeCheck,
  Printer,
  RotateCcw,
  Trophy,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  GraduationCap,
  RefreshCw,
  Target,
  TrendingUp,
  Users,
  ArrowRight,
  Sparkles,
  CircleCheck,
  LockKeyhole,
} from "lucide-react";

import { useRouter } from "next/navigation";

import { useStore } from "@/lib/useStore";
import { SCENARIOS, Workshop } from "@/lib/data";

import {
  QuizStore,
  certificateReady,
  earnedBadges,
  improvement,
  pct,
  progress,
} from "@/lib/score";

import Quiz from "@/components/Quiz";
import DashboardLayout from "@/components/DashboardLayout";

import {
  getWorkshops,
  enrollWorkshop,
  leaveWorkshop,
} from "@/lib/api";

type LearnerWorkshop = Workshop & {
  id: string;
  enrolledByMe?: boolean;
  registered?: number;
  completed?: number;
};

export default function Learner() {
  const router = useRouter();

  const [ws, setWs] = useState<LearnerWorkshop[]>([]);
  const [enrolled, setEnrolled] = useState<string[]>([]);
  const [enrollmentLoading, setEnrollmentLoading] = useState("");
  const [loadingWorkshops, setLoadingWorkshops] = useState(true);
  const [workshopError, setWorkshopError] = useState("");

  const [done, setDone] = useStore<Record<string, number>>(
    "cb.scenarios",
    {}
  );

  const [first, setFirst] = useStore<Record<string, boolean>>(
    "cb.first",
    {}
  );

  const [quiz, setQuiz] = useStore<QuizStore>("cb.quiz", {});
  const [name, setName] = useStore<string>("cb.name", "Demo Learner");

  const [pick, setPick] = useState<Record<string, number>>({});

  // Load published workshops and enrollment from MongoDB
  async function loadWorkshops() {
    try {
      setLoadingWorkshops(true);
      setWorkshopError("");

      const list = await getWorkshops();

      const formatted: LearnerWorkshop[] = (
        Array.isArray(list) ? list : []
      ).map((w: any) => ({
        ...w,
        id: String(w._id || w.id),
        registered: w.registered ?? 0,
        completed: w.completed ?? 0,
      }));

      setWs(formatted);

      setEnrolled(
        formatted
          .filter((w) => w.enrolledByMe === true)
          .map((w) => w.id)
      );
    } catch (error) {
      setWorkshopError(
        error instanceof Error
          ? error.message
          : "Unable to fetch workshops."
      );
    } finally {
      setLoadingWorkshops(false);
    }
  }

  // Check login and employee role
  useEffect(() => {
    const stored = localStorage.getItem("user");

    if (!stored) {
      router.replace("/login");
      return;
    }

    try {
      const user = JSON.parse(stored);

      if (String(user.role).toLowerCase() !== "learner") {
        router.replace("/login");
        return;
      }

      setName(user.name || "Learner");
      loadWorkshops();
    } catch {
      router.replace("/login");
    }
  }, []);

  // Enroll or leave a workshop using MongoDB
  async function toggleEnrollment(id: string) {
    if (enrollmentLoading) return;

    const alreadyEnrolled = enrolled.includes(id);

    try {
      setEnrollmentLoading(id);
      setWorkshopError("");

      if (alreadyEnrolled) {
        await leaveWorkshop(id);
      } else {
        await enrollWorkshop(id);
      }

      await loadWorkshops();
    } catch (error) {
      setWorkshopError(
        error instanceof Error
          ? error.message
          : "Unable to update enrollment."
      );
    } finally {
      setEnrollmentLoading("");
    }
  }

  // Reset local learning progress
  function reset() {
    setDone({});
    setFirst({});
    setQuiz({});
    setPick({});
  }

  // Learning calculations
  const open = ws.filter(
    (w) => w.status?.toLowerCase() === "published"
  );

  const T = SCENARIOS.length;
  const n = Object.keys(done).length;
  const p = progress(n, T, quiz);

  const firstTry = Object.values(first).filter(Boolean).length;
  const imp = improvement(quiz);

  const badges = earnedBadges({
    enrolled: enrolled.length,
    scenariosDone: n,
    scenarioTotal: T,
    quiz,
  });

  const ready = certificateReady(n, T, quiz);
  const preDone = !!quiz.pre;

  return (
    <DashboardLayout role="learner">
      <div className="space-y-7">

        {/* Welcome section */}
        <section className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-gradient-to-br from-teal-500/15 via-[var(--surface)] to-blue-500/10 p-6 sm:p-8">
          <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-teal-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/10 px-3 py-1.5 text-xs font-semibold text-teal-500">
                <GraduationCap size={15} />
                EMPLOYEE LEARNING PORTAL
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-[var(--text)] sm:text-3xl">
                Welcome back, {name || "Learner"}
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--muted)]">
                Continue your learning journey, develop workplace
                skills and track your professional growth.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href="#workshops"
                  className="btn btn-pri inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
                >
                  Explore workshops
                  <ArrowRight size={16} />
                </a>

                <a
                  href="#learning"
                  className="btn btn-ghost inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
                >
                  View my progress
                </a>
              </div>
            </div>

            <div className="relative flex h-28 w-28 shrink-0 items-center justify-center self-center rounded-3xl border border-[var(--border)] bg-[var(--surface)]/80 shadow-xl md:h-36 md:w-36">
              <div className="absolute inset-2 rounded-2xl border border-teal-500/20" />
              <GraduationCap
                size={64}
                className="text-[var(--primary)]"
                strokeWidth={1.4}
              />
              <Sparkles
                size={20}
                className="absolute right-4 top-4 text-amber-500"
              />
            </div>
          </div>
        </section>

        {/* Error notification */}
        {workshopError && (
          <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500">
            <span className="font-semibold">Notice:</span>
            <span>{workshopError}</span>
          </div>
        )}

        {/* Learning statistics */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="dashboard-card rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--muted)]">
                Overall progress
              </span>
              <span className="rounded-xl bg-teal-500/10 p-2.5 text-teal-500">
                <TrendingUp size={20} />
              </span>
            </div>

            <p className="mt-4 text-3xl font-bold text-[var(--text)]">
              {p}%
            </p>

            <p className="mt-1 text-xs text-[var(--muted)]">
              Your learning completion
            </p>
          </div>

          <div className="dashboard-card rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--muted)]">
                Enrolled workshops
              </span>
              <span className="rounded-xl bg-blue-500/10 p-2.5 text-blue-500">
                <CalendarDays size={20} />
              </span>
            </div>

            <p className="mt-4 text-3xl font-bold text-[var(--text)]">
              {enrolled.length}
            </p>

            <p className="mt-1 text-xs text-[var(--muted)]">
              Your registered workshops
            </p>
          </div>

          <div className="dashboard-card rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--muted)]">
                Scenarios completed
              </span>
              <span className="rounded-xl bg-violet-500/10 p-2.5 text-violet-500">
                <Target size={20} />
              </span>
            </div>

            <p className="mt-4 text-3xl font-bold text-[var(--text)]">
              {n}/{T}
            </p>

            <p className="mt-1 text-xs text-[var(--muted)]">
              Workplace learning activities
            </p>
          </div>

          <div className="dashboard-card rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--muted)]">
                Achievements
              </span>
              <span className="rounded-xl bg-amber-500/10 p-2.5 text-amber-500">
                <Trophy size={20} />
              </span>
            </div>

            <p className="mt-4 text-3xl font-bold text-[var(--text)]">
              {badges.filter((b) => b.ok).length}
            </p>

            <p className="mt-1 text-xs text-[var(--muted)]">
              Badges earned
            </p>
          </div>
        </section>

        {/* Learning progress */}
        <section
          id="learning"
          className="dashboard-card scroll-mt-24 rounded-2xl p-5 sm:p-6"
          aria-label="Learning progress"
        >
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-xl bg-teal-500/10 p-2.5 text-teal-500">
                  <TrendingUp size={20} />
                </span>

                <h3 className="text-lg font-bold text-[var(--text)]">
                  Learning progress
                </h3>
              </div>

              <p className="mt-2 text-sm text-[var(--muted)]">
                Track your training progress and achievements.
              </p>
            </div>

            <span className="text-2xl font-bold text-[var(--primary)]">
              {p}%
            </span>
          </div>

          <div
            className="mt-5 h-3 overflow-hidden rounded-full bg-[var(--surface-2)]"
            role="progressbar"
            aria-valuenow={p}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Learning progress"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-teal-500 to-blue-500 transition-all duration-700"
              style={{ width: `${p}%` }}
            />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl bg-[var(--surface-2)] p-3">
              <p className="text-xs text-[var(--muted)]">
                Scenarios
              </p>
              <p className="mt-1 font-semibold text-[var(--text)]">
                {n} / {T} completed
              </p>
            </div>

            <div className="rounded-xl bg-[var(--surface-2)] p-3">
              <p className="text-xs text-[var(--muted)]">
                First-try correct
              </p>
              <p className="mt-1 font-semibold text-[var(--text)]">
                {firstTry}
              </p>
            </div>

            <div className="rounded-xl bg-[var(--surface-2)] p-3">
              <p className="text-xs text-[var(--muted)]">
                Pre-training quiz
              </p>
              <p className="mt-1 font-semibold text-[var(--text)]">
                {quiz.pre
                  ? `${pct(quiz.pre.score, quiz.pre.total)}%`
                  : "Not taken"}
              </p>
            </div>

            <div className="rounded-xl bg-[var(--surface-2)] p-3">
              <p className="text-xs text-[var(--muted)]">
                Post-training quiz
              </p>
              <p className="mt-1 font-semibold text-[var(--text)]">
                {quiz.post
                  ? `${pct(quiz.post.score, quiz.post.total)}%`
                  : "Not taken"}
              </p>
            </div>
          </div>

          {imp !== null && (
            <p className="mt-4 text-sm text-[var(--muted)]">
              Quiz score improvement:{" "}
              <span className="font-semibold text-[var(--primary)]">
                {imp > 0 ? "+" : ""}
                {imp} points
              </span>
            </p>
          )}

          {/* Achievement badges */}
          <div
            id="achievements"
            className="mt-6 scroll-mt-24 border-t border-[var(--border)] pt-5"
          >
            <div className="mb-3 flex items-center gap-2">
              <Trophy size={18} className="text-amber-500" />
              <h4 className="font-semibold text-[var(--text)]">
                Your achievements
              </h4>
            </div>

            <ul className="flex flex-wrap gap-2">
              {badges.map((b) => (
                <li
                  key={b.id}
                  className={`flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium ${
                    b.ok
                      ? "bg-amber-500/10 text-amber-600"
                      : "bg-[var(--surface-2)] text-[var(--muted)]"
                  }`}
                >
                  <Trophy size={14} />
                  {b.label}
                  {b.ok ? (
                    <CheckCircle2 size={14} />
                  ) : (
                    <LockKeyhole size={13} />
                  )}
                </li>
              ))}
            </ul>
          </div>

          <button
            type="button"
            className="btn btn-ghost mt-5 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm"
            onClick={reset}
          >
            <RotateCcw size={16} />
            Reset my progress
          </button>
        </section>

        {/* Available workshops */}
        <section
          id="workshops"
          className="scroll-mt-24 space-y-4"
          aria-label="Available workshops"
        >
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-xl bg-blue-500/10 p-2.5 text-blue-500">
                  <BookOpen size={20} />
                </span>

                <h3 className="text-xl font-bold text-[var(--text)]">
                  Available workshops
                </h3>
              </div>

              <p className="mt-2 text-sm text-[var(--muted)]">
                Explore and enroll in published training sessions.
              </p>
            </div>

            <button
              type="button"
              className="btn btn-ghost inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm"
              onClick={loadWorkshops}
              disabled={loadingWorkshops || !!enrollmentLoading}
            >
              <RefreshCw
                size={16}
                className={loadingWorkshops ? "animate-spin" : ""}
              />
              Refresh workshops
            </button>
          </div>

          {loadingWorkshops ? (
            <div className="dashboard-card flex min-h-40 flex-col items-center justify-center gap-3 rounded-2xl p-6">
              <RefreshCw
                size={25}
                className="animate-spin text-[var(--primary)]"
              />
              <p className="text-sm text-[var(--muted)]">
                Loading available workshops...
              </p>
            </div>
          ) : open.length === 0 ? (
            <div className="dashboard-card rounded-2xl p-8 text-center">
              <CalendarDays
                size={36}
                className="mx-auto text-[var(--muted)]"
              />
              <h4 className="mt-3 font-semibold text-[var(--text)]">
                No published workshops available
              </h4>
              <p className="mt-2 text-sm text-[var(--muted)]">
                New workshops will appear here when an administrator
                publishes them.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {open.map((w) => {
                const on = enrolled.includes(w.id);
                const busy = enrollmentLoading === w.id;

                return (
                  <article
                    key={w.id}
                    className="dashboard-card rounded-2xl p-5 transition duration-200 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/15 to-blue-500/15 text-[var(--primary)]">
                          <BookOpen size={22} />
                        </span>

                        <div className="min-w-0">
                          <h4 className="truncate font-bold text-[var(--text)]">
                            {w.title}
                          </h4>
                          <p className="mt-1 text-xs text-[var(--muted)]">
                            Published workshop
                          </p>
                        </div>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                          on
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-blue-500/10 text-blue-500"
                        }`}
                      >
                        {on ? "Enrolled" : "Available"}
                      </span>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                        <CalendarDays size={16} />
                        <span>{w.date || "Date to be announced"}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                        <Users size={16} />
                        <span>
                          {w.registered ?? 0} enrolled
                        </span>
                      </div>
                    </div>

                    {w.facilitator && (
                      <p className="mt-3 text-sm text-[var(--muted)]">
                        Trainer: {w.facilitator}
                      </p>
                    )}

                    {w.capacity && (
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        Capacity: {w.capacity}
                      </p>
                    )}

                    <button
                      type="button"
                      className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                        on ? "btn btn-ghost" : "btn btn-pri"
                      }`}
                      onClick={() => toggleEnrollment(w.id)}
                      disabled={busy}
                    >
                      {busy ? (
                        <RefreshCw size={16} className="animate-spin" />
                      ) : on ? (
                        <>
                          <CheckCircle2 size={16} />
                          Leave workshop
                        </>
                      ) : (
                        <>
                          <ArrowRight size={16} />
                          Enroll now
                        </>
                      )}
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Pre-training quiz */}
        <section
          id="pre-quiz"
          className="scroll-mt-24 space-y-4"
          aria-label="Pre-training quiz"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500">
              <BookOpen size={20} />
            </span>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
                Step 01
              </p>
              <h3 className="text-xl font-bold text-[var(--text)]">
                Pre-training assessment
              </h3>
            </div>
          </div>

          <p className="text-sm text-[var(--muted)]">
            Evaluate your existing knowledge before starting the
            workplace learning activities.
          </p>

          <div className="dashboard-card rounded-2xl p-5 sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-500">
                <Target size={14} />
                Knowledge assessment
              </span>

              {quiz.pre ? (
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-500">
                  <CheckCircle2 size={16} />
                  Completed
                </span>
              ) : (
                <span className="text-xs text-[var(--muted)]">
                  Not completed
                </span>
              )}
            </div>

            <Quiz
              phase="pre"
              result={quiz.pre}
              onDone={(r) => setQuiz({ ...quiz, pre: r })}
            />
          </div>
        </section>

        {/* Workplace scenarios */}
        <section
          id="scenarios"
          className="scroll-mt-24 space-y-4"
          aria-label="Workplace scenarios"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
              <Target size={20} />
            </span>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
                Step 02
              </p>
              <h3 className="text-xl font-bold text-[var(--text)]">
                Workplace scenarios
              </h3>
            </div>
          </div>

          <p className="text-sm text-[var(--muted)]">
            Practice real-world workplace situations and learn
            professional etiquette, communication and inclusion.
          </p>

          <div className="mb-4 dashboard-card rounded-2xl p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[var(--text)]">
                  Scenario completion
                </p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  {n} of {T} completed
                </p>
              </div>

              <span className="text-lg font-bold text-[var(--primary)]">
                {T > 0 ? Math.round((n / T) * 100) : 0}%
              </span>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--surface-2)]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-teal-500 to-blue-500 transition-all duration-500"
                style={{
                  width: `${T > 0 ? (n / T) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          <div className="space-y-4">
            {SCENARIOS.map((s, index) => {
              const c = pick[s.id];
              const completed = !!done[s.id];

              return (
                <fieldset
                  key={s.id}
                  className="dashboard-card rounded-2xl p-5 sm:p-6"
                >
                  <legend className="sr-only">
                    {s.title}
                  </legend>

                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-2)] text-sm font-bold text-[var(--primary)]">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <div>
                        <h4 className="font-bold text-[var(--text)]">
                          {s.title}
                        </h4>

                        <p className="mt-1 text-xs text-[var(--muted)]">
                          Workplace learning activity
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                        completed
                          ? "bg-emerald-500/10 text-emerald-500"
                          : "bg-[var(--surface-2)] text-[var(--muted)]"
                      }`}
                    >
                      {completed ? (
                        <CheckCircle2 size={14} />
                      ) : (
                        <Clock3 size={14} />
                      )}
                      {completed ? "Completed" : "In progress"}
                    </span>
                  </div>

                  <div className="mt-5 rounded-xl bg-[var(--surface-2)] p-4">
                    <p className="text-sm leading-6 text-[var(--text)]">
                      {s.ctx}
                    </p>
                  </div>

                  <p className="mb-3 mt-5 text-sm font-semibold text-[var(--text)]">
                    Choose the best response:
                  </p>

                  <div className="space-y-2">
                    {s.opts.map((o, i) => {
                      const selected = c === i;
                      const disabled = c !== undefined;

                      let optionStyle =
                        "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--primary)] hover:bg-[var(--surface-2)]";

                      if (selected && o.best) {
                        optionStyle =
                          "border-emerald-500/50 bg-emerald-500/10";
                      } else if (selected && !o.best) {
                        optionStyle =
                          "border-red-500/50 bg-red-500/10";
                      }

                      return (
                        <button
                          key={i}
                          type="button"
                          disabled={disabled}
                          onClick={() => {
                            setPick({
                              ...pick,
                              [s.id]: i,
                            });

                            if (first[s.id] === undefined) {
                              setFirst({
                                ...first,
                                [s.id]: o.best,
                              });
                            }

                            if (o.best) {
                              setDone({
                                ...done,
                                [s.id]: 1,
                              });
                            }
                          }}
                          className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left text-sm transition ${
                            optionStyle
                          } ${
                            disabled
                              ? "cursor-default"
                              : "cursor-pointer"
                          }`}
                        >
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] text-xs font-semibold text-[var(--muted)]">
                            {String.fromCharCode(65 + i)}
                          </span>

                          <span className="flex-1 leading-6 text-[var(--text)]">
                            {o.t}
                          </span>

                          {selected && o.best && (
                            <CheckCircle2
                              size={18}
                              className="shrink-0 text-emerald-500"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {c !== undefined && (
                    <div
                      role="status"
                      className={`mt-4 rounded-xl border p-4 ${
                        s.opts[c].best
                          ? "border-emerald-500/30 bg-emerald-500/5"
                          : "border-red-500/30 bg-red-500/5"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {s.opts[c].best ? (
                          <CheckCircle2
                            size={18}
                            className="text-emerald-500"
                          />
                        ) : (
                          <Target
                            size={18}
                            className="text-red-500"
                          />
                        )}

                        <p
                          className={`text-sm font-semibold ${
                            s.opts[c].best
                              ? "text-emerald-500"
                              : "text-red-500"
                          }`}
                        >
                          {s.opts[c].best
                            ? "Excellent! Correct answer."
                            : "Not quite. Try again."}
                        </p>
                      </div>

                      <p className="mt-2 text-sm leading-6 text-[var(--text)]">
                        {s.opts[c].fb}
                      </p>

                      <div className="mt-3 rounded-lg bg-[var(--surface-2)] p-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
                          Key takeaway
                        </p>

                        <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                          {s.take}
                        </p>
                      </div>

                      {!s.opts[c].best && (
                        <button
                          type="button"
                          className="btn btn-ghost mt-3 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs"
                          onClick={() => {
                            const q = { ...pick };
                            delete q[s.id];
                            setPick(q);
                          }}
                        >
                          <RotateCcw size={14} />
                          Try again
                        </button>
                      )}
                    </div>
                  )}
                </fieldset>
              );
            })}
          </div>
        </section>

        {/* Post-training quiz */}
        <section
          id="post-quiz"
          className="scroll-mt-24 space-y-4"
          aria-label="Post-training quiz"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <GraduationCap size={20} />
            </span>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
                Step 03
              </p>

              <h3 className="text-xl font-bold text-[var(--text)]">
                Post-training assessment
              </h3>
            </div>
          </div>

          <p className="text-sm text-[var(--muted)]">
            Test what you have learned after completing the
            workplace scenarios.
          </p>

          <div className="dashboard-card rounded-2xl p-5 sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-500">
                <BadgeCheck size={14} />
                Final assessment
              </span>

              {quiz.post ? (
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-500">
                  <CheckCircle2 size={16} />
                  Completed
                </span>
              ) : (
                <span className="text-xs text-[var(--muted)]">
                  {preDone && n === T
                    ? "Ready to start"
                    : "Complete previous steps to unlock"}
                </span>
              )}
            </div>

            {!preDone || n < T ? (
              <div className="mb-4 flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                <LockKeyhole
                  size={19}
                  className="mt-0.5 shrink-0 text-amber-500"
                />

                <div>
                  <p className="text-sm font-semibold text-[var(--text)]">
                    Assessment locked
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                    Complete your pre-training quiz and all {T} workplace
                    scenarios to unlock this assessment.
                  </p>
                </div>
              </div>
            ) : null}

            <Quiz
              phase="post"
              result={quiz.post}
              locked={!preDone || n < T}
              onDone={(r) =>
                setQuiz({
                  ...quiz,
                  post: r,
                })
              }
            />
          </div>
        </section>

        {/* Certificate */}
        <section
          id="certificate"
          className="scroll-mt-24 space-y-4"
          aria-label="Certificate"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
              <Award size={21} />
            </span>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
                Final step
              </p>

              <h3 className="text-xl font-bold text-[var(--text)]">
                Your certificate
              </h3>
            </div>
          </div>

          {ready && quiz.pre && quiz.post ? (
            <div
              id="cert"
              className="dashboard-card overflow-hidden rounded-2xl"
            >
              <div className="border-b border-[var(--border)] bg-gradient-to-r from-teal-500/10 to-blue-500/10 p-6 text-center sm:p-10">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-500/10">
                  <Award
                    size={48}
                    className="text-amber-500"
                  />
                </div>

                <p className="mt-5 text-xs font-bold uppercase tracking-[0.25em] text-[var(--primary)]">
                  CultureBridge Learning Academy
                </p>

                <h2 className="mt-3 text-2xl font-bold text-[var(--text)] sm:text-4xl">
                  Certificate of Completion
                </h2>

                <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[var(--muted)]">
                  This certificate is awarded in recognition of
                  successfully completing the professional learning
                  programme.
                </p>
              </div>

              <div className="p-6 text-center sm:p-10">
                <label className="noprint mx-auto block max-w-sm text-left text-sm font-medium text-[var(--text)]">
                  Name on certificate

                  <input
                    className="input mt-2 w-full rounded-xl"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </label>

                <p className="mt-7 text-xs uppercase tracking-widest text-[var(--muted)]">
                  Proudly presented to
                </p>

                <p className="mt-3 text-3xl font-bold text-[var(--primary)] sm:text-4xl">
                  {name || "Learner"}
                </p>

                <div className="mx-auto mt-4 h-px max-w-md bg-[var(--border)]" />

                <p className="mt-5 text-base font-semibold text-[var(--text)]">
                  Global Etiquette and Inclusion Training
                </p>

                <p className="mt-2 text-sm text-[var(--muted)]">
                  For successfully completing all learning activities
                  and assessments.
                </p>

                <div className="mx-auto mt-7 grid max-w-lg gap-4 sm:grid-cols-3">
                  <div className="rounded-xl bg-[var(--surface-2)] p-3">
                    <p className="text-xs text-[var(--muted)]">
                      Scenarios
                    </p>
                    <p className="mt-1 font-bold text-[var(--text)]">
                      {n}/{T}
                    </p>
                  </div>

                  <div className="rounded-xl bg-[var(--surface-2)] p-3">
                    <p className="text-xs text-[var(--muted)]">
                      Pre-quiz
                    </p>
                    <p className="mt-1 font-bold text-[var(--text)]">
                      {pct(quiz.pre.score, quiz.pre.total)}%
                    </p>
                  </div>

                  <div className="rounded-xl bg-[var(--surface-2)] p-3">
                    <p className="text-xs text-[var(--muted)]">
                      Post-quiz
                    </p>
                    <p className="mt-1 font-bold text-[var(--text)]">
                      {pct(quiz.post.score, quiz.post.total)}%
                    </p>
                  </div>
                </div>

                <p className="mt-7 text-xs text-[var(--muted)]">
                  Issued on{" "}
                  {new Date(quiz.post.at).toLocaleDateString()}
                </p>

                <button
                  type="button"
                  className="btn btn-pri noprint mt-6 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold"
                  onClick={() => window.print()}
                >
                  <Printer size={18} />
                  Print certificate
                </button>
              </div>
            </div>
          ) : (
            <div className="dashboard-card rounded-2xl p-6 sm:p-8">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--surface-2)] text-[var(--muted)]">
                  <Award size={34} />
                </div>

                <h4 className="mt-4 text-lg font-bold text-[var(--text)]">
                  Certificate not unlocked yet
                </h4>

                <p className="mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">
                  Complete the pre-training quiz, all {T} workplace
                  scenarios and the post-training quiz to earn your
                  certificate.
                </p>

                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                      preDone
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-[var(--surface-2)] text-[var(--muted)]"
                    }`}
                  >
                    {preDone ? "✓" : "○"} Pre-quiz
                  </span>

                  <span
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                      n === T
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-[var(--surface-2)] text-[var(--muted)]"
                    }`}
                  >
                    {n === T ? "✓" : "○"} Scenarios
                  </span>

                  <span
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                      quiz.post
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-[var(--surface-2)] text-[var(--muted)]"
                    }`}
                  >
                    {quiz.post ? "✓" : "○"} Post-quiz
                  </span>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
