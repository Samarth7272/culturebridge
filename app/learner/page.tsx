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
  getWorkshopProgress,
  markLessonCompleted,
  saveQuizAnswers,
  saveScenarioAnswer,
} from "@/lib/api";
import type { LearnerProgress } from "@/lib/api";


// Convert common video links into embeddable player URLs.
function getVideoEmbedUrl(rawUrl?: string) {
  if (!rawUrl) return null;
  try {
    const url = new URL(rawUrl);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    const host = url.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (["youtube.com", "m.youtube.com", "youtube-nocookie.com"].includes(host)) {
      const id = url.searchParams.get("v") || url.pathname.match(/\/(?:embed|shorts)\/([^/?]+)/)?.[1];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (host === "vimeo.com") {
      const id = url.pathname.split("/").filter(Boolean).pop();
      return id && /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}` : null;
    }
    return null;
  } catch {
    return null;
  }
}

function LessonVideo({ url, title }: { url?: string; title: string }) {
  if (!url) return null;

  let safeUrl = "";
  try {
    const parsed = new URL(url.trim());
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
    safeUrl = parsed.toString();
  } catch {
    return (
      <p className="mt-3 text-sm text-[var(--muted)]">
        This video link is not a valid web address. Please add a complete link beginning with https://
      </p>
    );
  }

  const embedUrl = getVideoEmbedUrl(safeUrl);
  const isDirectVideo = /\.(mp4|webm|ogg)(?:$|[?#])/i.test(new URL(safeUrl).pathname + new URL(safeUrl).search);

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-[var(--border)] bg-black">
      {embedUrl ? (
        <div className="aspect-video">
          <iframe
            src={embedUrl}
            title={`${title} video`}
            className="h-full w-full"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="origin"
            allowFullScreen
          />
        </div>
      ) : isDirectVideo ? (
        <video className="aspect-video w-full" controls preload="metadata" playsInline>
          <source src={safeUrl} />
          Your browser does not support video playback.
        </video>
      ) : (
        <div className="p-4 text-center text-white">
          <p className="mb-2 text-sm">This video host may not support embedded playback.</p>
          <a
            href={safeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-gray-200"
          >
            Open {title} video
          </a>
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/15 px-3 py-2">
        <span className="text-xs text-white/75">Having trouble playing?</span>
        <a
          href={safeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md px-3 py-1.5 text-xs font-semibold text-white underline underline-offset-4 hover:bg-white/10"
        >
          Open video in a new tab
        </a>
      </div>
    </div>
  );
}

type LearnerLesson = {
  _id?: string;
  title: string;
  content?: string;
  videoUrl?: string;
  duration?: number;
};

type LearnerModule = {
  _id?: string;
  title: string;
  description?: string;
  content?: string;
  duration?: number;
  lessons?: LearnerLesson[];
};

type LearnerWorkshop = Workshop & {
  id: string;
  enrolledByMe?: boolean;
  registered?: number;
  completed?: number;
  modules?: LearnerModule[];
};

export default function Learner() {
  const router = useRouter();

  const [ws, setWs] = useState<LearnerWorkshop[]>([]);
  const [enrolled, setEnrolled] = useState<string[]>([]);
  const [enrollmentLoading, setEnrollmentLoading] = useState("");
  const [expandedProgramme, setExpandedProgramme] = useState("");
  const [loadingWorkshops, setLoadingWorkshops] = useState(true);
  const [workshopError, setWorkshopError] = useState("");
  const [progressByWorkshop, setProgressByWorkshop] = useState<
    Record<string, LearnerProgress>
  >({});
  const [savingLesson, setSavingLesson] = useState("");
  const [progressError, setProgressError] = useState("");

  // Assessments are scoped to the programme selected by the learner.
  const [activeWorkshopId, setActiveWorkshopId] = useState("");
  const [firstTryByWorkshop, setFirstTryByWorkshop] = useStore<
    Record<string, Record<string, boolean>>
  >("cb.firstByWorkshop", {});
  const [retryingByWorkshop, setRetryingByWorkshop] = useState<
    Record<string, Record<string, boolean>>
  >({});
  const [scenarioSaving, setScenarioSaving] = useState("");
  const [name, setName] = useStore<string>("cb.name", "Demo Learner");

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

      const enrolledIds = formatted
        .filter((w) => w.enrolledByMe === true)
        .map((w) => w.id);

      setEnrolled(enrolledIds);
      setActiveWorkshopId((current) =>
        enrolledIds.includes(current) ? current : enrolledIds[0] || ""
      );

      // Load database-backed progress for each enrolled programme.
      // A progress-loading failure should not stop the workshop list from appearing.
      const progressResults = await Promise.all(
        enrolledIds.map(async (workshopId) => {
          try {
            const progressRecord = await getWorkshopProgress(workshopId);
            return [workshopId, progressRecord] as const;
          } catch (error) {
            console.error(`Unable to load progress for programme ${workshopId}:`, error);
            return [workshopId, null] as const;
          }
        })
      );

      const loadedProgress: Record<string, LearnerProgress> = {};
      for (const [workshopId, progressRecord] of progressResults) {
        if (progressRecord) loadedProgress[workshopId] = progressRecord;
      }

      setProgressByWorkshop((current) => ({ ...current, ...loadedProgress }));

      if (progressResults.some(([, progressRecord]) => !progressRecord)) {
        setProgressError(
          "Some programme progress could not be loaded. Refresh the page or check the backend progress API."
        );
      } else {
        setProgressError("");
      }
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

  // Calculate lesson completion using the progress saved in MongoDB.
  function getLessonStats(workshop: LearnerWorkshop) {
    const lessonIds = (workshop.modules || []).flatMap((module) =>
      (module.lessons || [])
        .map((lesson) => lesson._id)
        .filter((id): id is string => Boolean(id))
    );

    const completedIds = progressByWorkshop[workshop.id]?.completedLessons || [];
    const completedSet = new Set(completedIds.map(String));
    const completed = lessonIds.filter((id) => completedSet.has(String(id))).length;
    const total = lessonIds.length;

    return {
      completed,
      total,
      percentage: total ? Math.round((completed / total) * 100) : 0,
    };
  }

  function isLessonCompleted(workshopId: string, lessonId?: string) {
    if (!lessonId) return false;
    return (progressByWorkshop[workshopId]?.completedLessons || []).some(
      (id) => String(id) === String(lessonId)
    );
  }

  async function completeLesson(workshopId: string, lessonId?: string) {
    if (!lessonId || savingLesson) return;

    const requestKey = `${workshopId}:${lessonId}`;
    setSavingLesson(requestKey);
    setProgressError("");

    try {
      const savedProgress = await markLessonCompleted(workshopId, lessonId);
      setProgressByWorkshop((current) => ({
        ...current,
        [workshopId]: savedProgress,
      }));
    } catch (error) {
      setProgressError(
        error instanceof Error
          ? error.message
          : "Unable to save lesson completion. Please try again."
      );
    } finally {
      setSavingLesson("");
    }
  }

  // Save quiz answers through the backend. The server calculates the score.
  async function submitQuiz(phase: "pre" | "post", result: {
    score: number;
    total: number;
    answers: number[];
    at: string;
  }) {
    const workshopId = activeWorkshopId;
    if (!workshopId) {
      throw new Error("Please enrol in a programme before taking an assessment.");
    }

    try {
      setProgressError("");
      const response = await saveQuizAnswers(workshopId, {
        quizType: phase,
        answers: result.answers,
      });
      const updatedProgress =
        response?.progress || (await getWorkshopProgress(workshopId));
      setProgressByWorkshop((current) => ({
        ...current,
        [workshopId]: updatedProgress,
      }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to save quiz answers.";
      setProgressError(message);
      throw error;
    }
  }

  // Save scenario choices through the backend. Correctness is determined by the server.
  async function submitScenarioAnswer(scenarioId: string, selectedOption: number) {
    if (!activeWorkshopId || scenarioSaving) return;

    const workshopId = activeWorkshopId;
    const previousResult = (progressByWorkshop[workshopId]?.scenarioResults || [])
      .find((item) => item.scenarioId === scenarioId);

    try {
      setScenarioSaving(`${workshopId}:${scenarioId}`);
      setProgressError("");

      const response = await saveScenarioAnswer(workshopId, {
        scenarioId,
        selectedOption,
      });
      const updatedProgress =
        response?.progress || (await getWorkshopProgress(workshopId));

      if (!previousResult && firstTryByWorkshop[workshopId]?.[scenarioId] === undefined) {
        const correct = Boolean(response?.result?.correct);
        setFirstTryByWorkshop({
          ...firstTryByWorkshop,
          [workshopId]: {
            ...(firstTryByWorkshop[workshopId] || {}),
            [scenarioId]: correct,
          },
        });
      }

      setProgressByWorkshop((current) => ({
        ...current,
        [workshopId]: updatedProgress,
      }));
      setRetryingByWorkshop((current) => ({
        ...current,
        [workshopId]: {
          ...(current[workshopId] || {}),
          [scenarioId]: false,
        },
      }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to save your scenario answer.";
      setProgressError(message);
    } finally {
      setScenarioSaving("");
    }
  }

  // Learning calculations are derived from the selected programme's MongoDB record.
  const open = ws.filter(
    (w) => w.status?.toLowerCase() === "published"
  );
  const activeWorkshop = ws.find((workshop) => workshop.id === activeWorkshopId);
  const activeProgress = activeWorkshopId
    ? progressByWorkshop[activeWorkshopId]
    : undefined;

  const quiz: QuizStore = {};
  for (const savedQuiz of activeProgress?.quizResults || []) {
    const mappedResult = {
      score: savedQuiz.score,
      total: savedQuiz.total,
      answers: savedQuiz.answers || [],
      at: savedQuiz.completedAt || "",
    };
    if (savedQuiz.quizType === "pre") quiz.pre = mappedResult;
    if (savedQuiz.quizType === "post") quiz.post = mappedResult;
  }

  const savedScenarios = activeProgress?.scenarioResults || [];
  const done = Object.fromEntries(
    savedScenarios.filter((item) => item.correct).map((item) => [item.scenarioId, 1])
  ) as Record<string, number>;
  const T = SCENARIOS.length;
  const n = Object.keys(done).length;
  const p = progress(n, T, quiz);
  const firstTry = Object.values(firstTryByWorkshop[activeWorkshopId] || {}).filter(Boolean).length;
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

        {/* My Learning: programmes the learner has joined */}
        <section id="my-learning" className="scroll-mt-24 space-y-4" aria-label="My Learning">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-xl bg-teal-500/10 p-2.5 text-teal-500"><GraduationCap size={20} /></span>
              <h3 className="text-xl font-bold text-[var(--text)]">My Learning</h3>
            </div>
            <p className="mt-2 text-sm text-[var(--muted)]">Your enrolled programmes, modules, lesson notes and video classes.</p>
          </div>

          {loadingWorkshops ? (
            <div className="dashboard-card rounded-2xl p-5 text-sm text-[var(--muted)]">Loading your learning library...</div>
          ) : enrolled.length === 0 ? (
            <div className="dashboard-card rounded-2xl p-6 text-sm text-[var(--muted)]">You have not enrolled in a programme yet. Explore available workshops below and enrol to start learning.</div>
          ) : (
            <div className="space-y-4">
              {open.filter((w) => enrolled.includes(w.id)).map((w) => {
                const courseProgress = getLessonStats(w);
                return (
                <article key={`learning-${w.id}`} className="dashboard-card rounded-2xl p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h4 className="text-lg font-bold text-[var(--text)]">{w.title}</h4>
                      <p className="mt-1 text-sm text-[var(--muted)]">{(w.modules || []).length} learning module(s)</p>
                    </div>
                    <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-500">Enrolled</span>
                  </div>

                  <div className="mt-4 rounded-xl bg-[var(--surface-2)] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-[var(--text)]">Programme progress</span>
                      <span className="text-sm font-bold text-[var(--primary)]">{courseProgress.percentage}%</span>
                    </div>
                    <div
                      className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--surface)]"
                      role="progressbar"
                      aria-valuenow={courseProgress.percentage}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${w.title} lesson progress`}
                    >
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-teal-500 to-blue-500 transition-all"
                        style={{ width: `${courseProgress.percentage}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-[var(--muted)]">
                      {courseProgress.completed} of {courseProgress.total} lessons completed
                    </p>
                  </div>

                  {!w.modules || w.modules.length === 0 ? (
                    <p className="mt-4 rounded-xl bg-[var(--surface-2)] p-4 text-sm text-[var(--muted)]">Your trainer has not added lessons to this programme yet.</p>
                  ) : (
                    <div className="mt-4 space-y-4">
                      {w.modules.map((module, mi) => (
                        <section key={module._id || `${w.id}-my-module-${mi}`} className="rounded-xl border border-[var(--border)] p-4">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h5 className="font-bold text-[var(--text)]">Module {mi + 1}: {module.title}</h5>
                            {module.duration ? <span className="text-xs text-[var(--muted)]">{module.duration} min</span> : null}
                          </div>
                          {module.description ? <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{module.description}</p> : null}
                          {module.content ? <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[var(--text)]">{module.content}</p> : null}
                          <div className="mt-4 space-y-3">
                            {(module.lessons || []).length === 0 ? <p className="text-sm text-[var(--muted)]">No lessons have been added to this module yet.</p> : (module.lessons || []).map((lesson, li) => (
                              <div key={lesson._id || `${w.id}-my-${mi}-${li}`} className="rounded-lg bg-[var(--surface-2)] p-4">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <h6 className="font-semibold text-[var(--text)]">Lesson {li + 1}: {lesson.title}</h6>
                                  {lesson.duration ? <span className="text-xs text-[var(--muted)]">{lesson.duration} min</span> : null}
                                </div>
                                {lesson.content ? <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[var(--muted)]">{lesson.content}</p> : null}
                                <LessonVideo url={lesson.videoUrl} title={lesson.title} />
                                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                                  {isLessonCompleted(w.id, lesson._id) ? (
                                    <span className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-500">
                                      <CheckCircle2 size={15} />
                                      Completed and saved
                                    </span>
                                  ) : (
                                    <span className="text-xs text-[var(--muted)]">
                                      Mark this lesson complete after you finish it.
                                    </span>
                                  )}
                                  <button
                                    type="button"
                                    className="btn btn-ghost inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold"
                                    onClick={() => completeLesson(w.id, lesson._id)}
                                    disabled={
                                      !lesson._id ||
                                      isLessonCompleted(w.id, lesson._id) ||
                                      savingLesson === `${w.id}:${lesson._id}` ||
                                      !!savingLesson
                                    }
                                  >
                                    {savingLesson === `${w.id}:${lesson._id}` ? (
                                      <RefreshCw size={14} className="animate-spin" />
                                    ) : (
                                      <CheckCircle2 size={14} />
                                    )}
                                    {isLessonCompleted(w.id, lesson._id)
                                      ? "Lesson completed"
                                      : "Mark as completed"}
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </section>
                      ))}
                    </div>
                  )}
                </article>
                );
              })}
            </div>
          )}
        </section>


        {/* Error notification */}
        {workshopError && (
          <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500">
            <span className="font-semibold">Notice:</span>
            <span>{workshopError}</span>
          </div>
        )}

        {progressError && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-600">
            <span className="font-semibold">Progress:</span>
            <span>{progressError}</span>
          </div>
        )}

        {/* Learning statistics */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="dashboard-card rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--muted)]">
                Programme progress
              </span>
              <span className="rounded-xl bg-teal-500/10 p-2.5 text-teal-500">
                <TrendingUp size={20} />
              </span>
            </div>

            <p className="mt-4 text-3xl font-bold text-[var(--text)]">
              {p}%
            </p>

            <p className="mt-1 text-xs text-[var(--muted)]">
              {activeWorkshop?.title || "Select an enrolled programme"}
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
                Track your training progress and achievements for each programme separately.
              </p>
            </div>

            {enrolled.length > 0 && (
              <label className="block min-w-0 sm:min-w-64">
                <span className="mb-1 block text-xs font-semibold text-[var(--muted)]">
                  Selected programme
                </span>
                <select
                  value={activeWorkshopId}
                  onChange={(event) => setActiveWorkshopId(event.target.value)}
                  className="input w-full rounded-xl"
                >
                  {ws.filter((workshop) => enrolled.includes(workshop.id)).map((workshop) => (
                    <option key={workshop.id} value={workshop.id}>
                      {workshop.title}
                    </option>
                  ))}
                </select>
              </label>
            )}

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

                    {on && (
                      <div className="mt-4 border-t border-[var(--border)] pt-4">
                        <button
                          type="button"
                          className="btn btn-ghost inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold"
                          aria-expanded={expandedProgramme === w.id}
                          onClick={() =>
                            setExpandedProgramme(
                              expandedProgramme === w.id ? "" : w.id
                            )
                          }
                        >
                          <BookOpen size={16} />
                          {expandedProgramme === w.id
                            ? "Hide Modules & Lessons"
                            : "View Modules & Lessons"}
                        </button>

                        {expandedProgramme === w.id && (
                          <div className="mt-4 space-y-4">
                            {!w.modules || w.modules.length === 0 ? (
                              <div className="rounded-xl bg-[var(--surface-2)] p-4 text-sm text-[var(--muted)]">
                                No learning modules have been added to this
                                programme yet. Please check again later.
                              </div>
                            ) : (
                              w.modules.map((module, moduleIndex) => (
                                <div
                                  key={module._id || `${w.id}-module-${moduleIndex}`}
                                  className="rounded-xl border border-[var(--border)] p-4"
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <h5 className="font-bold text-[var(--text)]">
                                      Module {moduleIndex + 1}: {module.title}
                                    </h5>
                                    {module.duration ? (
                                      <span className="shrink-0 text-xs text-[var(--muted)]">
                                        {module.duration} min
                                      </span>
                                    ) : null}
                                  </div>

                                  {module.description ? (
                                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                                      {module.description}
                                    </p>
                                  ) : null}

                                  {module.content ? (
                                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[var(--text)]">
                                      {module.content}
                                    </p>
                                  ) : null}

                                  <div className="mt-4 space-y-3">
                                    {(module.lessons || []).length === 0 ? (
                                      <p className="text-sm text-[var(--muted)]">
                                        No lessons in this module yet.
                                      </p>
                                    ) : (
                                      (module.lessons || []).map(
                                        (lesson, lessonIndex) => (
                                          <div
                                            key={lesson._id || `${w.id}-module-${moduleIndex}-lesson-${lessonIndex}`}
                                            className="rounded-lg bg-[var(--surface-2)] p-3"
                                          >
                                            <div className="flex items-start justify-between gap-3">
                                              <p className="font-semibold text-[var(--text)]">
                                                Lesson {lessonIndex + 1}: {lesson.title}
                                              </p>
                                              {lesson.duration ? (
                                                <span className="shrink-0 text-xs text-[var(--muted)]">
                                                  {lesson.duration} min
                                                </span>
                                              ) : null}
                                            </div>

                                            {lesson.content ? (
                                              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[var(--muted)]">
                                                {lesson.content}
                                              </p>
                                            ) : null}

                                            <LessonVideo url={lesson.videoUrl} title={lesson.title} />
                                          </div>
                                        )
                                      )
                                    )}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Guided learning pathway */}
        <section aria-label="Your learning pathway" className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">Your development journey</p>
            <h3 className="mt-1 text-xl font-bold text-[var(--text)]">Your learning pathway</h3>
            <p className="mt-1 text-sm text-[var(--muted)]">Move through these stages at your own pace. Your progress and certificate status are shown here.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { id: "my-learning", step: "01", title: "Learn", detail: "Programme videos and lessons", status: enrolled.length ? `${enrolled.length} enrolled` : "Explore programmes" },
              { id: "pre-quiz", step: "02", title: "Starting-point check", detail: "Understand your current knowledge", status: quiz.pre ? "Completed" : "Not started" },
              { id: "scenarios", step: "03", title: "Workplace practice", detail: "Apply skills to realistic situations", status: `${n}/${T} completed` },
              { id: "post-quiz", step: "04", title: "Final knowledge check", detail: "Review what you have learned", status: quiz.post ? "Completed" : "Locked until ready" },
            ].map((item) => (
              <a key={item.id} href={`#${item.id}`} className="dashboard-card group rounded-2xl p-4 transition hover:-translate-y-0.5 hover:border-[var(--primary)]">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold tracking-wider text-[var(--primary)]">STAGE {item.step}</span>
                  <ArrowRight size={16} className="text-[var(--muted)] transition group-hover:translate-x-1" />
                </div>
                <h4 className="mt-3 font-bold text-[var(--text)]">{item.title}</h4>
                <p className="mt-1 min-h-10 text-xs leading-5 text-[var(--muted)]">{item.detail}</p>
                <p className="mt-3 text-xs font-semibold text-[var(--primary)]">{item.status}</p>
              </a>
            ))}
          </div>
        </section>

        {/* Starting-point knowledge check */}
        <section
          id="pre-quiz"
          className="scroll-mt-24 space-y-4"
          aria-label="Starting-point knowledge check"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500">
              <BookOpen size={20} />
            </span>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
                Step 02
              </p>
              <h3 className="text-xl font-bold text-[var(--text)]">
                Starting-point knowledge check
              </h3>
            </div>
          </div>

          <p className="text-sm text-[var(--muted)]">
            A short baseline check to understand what you already know. It is a learning reference, not a judgement of your ability.
          </p>

          <details className="dashboard-card group rounded-2xl">
            <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 p-5 sm:p-6">
              <span>
                <span className="block font-semibold text-[var(--text)]">{quiz.pre ? "Review your starting-point result" : "Begin starting-point check"}</span>
                <span className="mt-1 block text-xs text-[var(--muted)]">Open when you are ready · short knowledge check</span>
              </span>
              <span className="rounded-full bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-500">{quiz.pre ? "Completed" : "Not started"}</span>
            </summary>
            <div className="border-t border-[var(--border)] p-5 sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-500">
                <Target size={14} />
                Knowledge check
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

            {activeWorkshopId ? (
              <Quiz
                phase="pre"
                result={quiz.pre}
                onDone={(r) => submitQuiz("pre", r)}
              />
            ) : (
              <p className="rounded-xl bg-[var(--surface-2)] p-4 text-sm text-[var(--muted)]">
                Enrol in a published programme to start this knowledge check.
              </p>
            )}
            </div>
          </details>
        </section>

        {/* Applied workplace practice */}
        <section
          id="scenarios"
          className="scroll-mt-24 space-y-4"
          aria-label="Applied workplace practice"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
              <Target size={20} />
            </span>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
                Step 03
              </p>
              <h3 className="text-xl font-bold text-[var(--text)]">
                Applied workplace practice
              </h3>
            </div>
          </div>

          <p className="text-sm text-[var(--muted)]">
            Build confidence through realistic cross-cultural situations involving meetings, feedback, communication, inclusion and collaboration. Choose a response, review the feedback and learn the key takeaway.
          </p>

          <details className="dashboard-card rounded-2xl">
            <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 p-5">
              <span>
                <span className="block font-semibold text-[var(--text)]">Explore the five workplace situations</span>
                <span className="mt-1 block text-xs text-[var(--muted)]">Silent stand-ups, code review feedback, inclusive meeting times and more</span>
              </span>
              <span className="rounded-full bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-500">{n} of {T} completed</span>
            </summary>
            <div className="space-y-4 border-t border-[var(--border)] p-4 sm:p-5">
          <div className="mb-4 rounded-2xl bg-[var(--surface-2)] p-4">
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
              const savedScenario = savedScenarios.find((item) => item.scenarioId === s.id);
              const isRetrying = !!retryingByWorkshop[activeWorkshopId]?.[s.id];
              const c = isRetrying ? undefined : savedScenario?.selectedOption;
              const completed = !!savedScenario?.correct;
              const answerCorrect = savedScenario?.correct ?? false;

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

                      if (selected && answerCorrect) {
                        optionStyle =
                          "border-emerald-500/50 bg-emerald-500/10";
                      } else if (selected && !answerCorrect) {
                        optionStyle =
                          "border-red-500/50 bg-red-500/10";
                      }

                      return (
                        <button
                          key={i}
                          type="button"
                          disabled={disabled || !activeWorkshopId || !!scenarioSaving}
                          onClick={() => {
                            void submitScenarioAnswer(s.id, i);
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

                          {selected && answerCorrect && (
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
                        answerCorrect
                          ? "border-emerald-500/30 bg-emerald-500/5"
                          : "border-red-500/30 bg-red-500/5"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {answerCorrect ? (
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
                            answerCorrect
                              ? "text-emerald-500"
                              : "text-red-500"
                          }`}
                        >
                          {answerCorrect
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

                      {!answerCorrect && (
                        <button
                          type="button"
                          className="btn btn-ghost mt-3 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs"
                          onClick={() => {
                            setRetryingByWorkshop((current) => ({
                              ...current,
                              [activeWorkshopId]: {
                                ...(current[activeWorkshopId] || {}),
                                [s.id]: true,
                              },
                            }));
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
            </div>
          </details>
        </section>

        {/* Final knowledge check */}
        <section
          id="post-quiz"
          className="scroll-mt-24 space-y-4"
          aria-label="Final knowledge check"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <GraduationCap size={20} />
            </span>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
                Step 04
              </p>

              <h3 className="text-xl font-bold text-[var(--text)]">
                Final knowledge check
              </h3>
            </div>
          </div>

          <p className="text-sm text-[var(--muted)]">
            Review your understanding after the learning modules and workplace practice. This becomes available when the required earlier stages are complete.
          </p>

          <details className="dashboard-card rounded-2xl" open={!!quiz.post}>
            <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 p-5 sm:p-6">
              <span>
                <span className="block font-semibold text-[var(--text)]">{quiz.post ? "Review final assessment result" : "Open final knowledge check"}</span>
                <span className="mt-1 block text-xs text-[var(--muted)]">{preDone && n === T ? "Ready when you are" : "Complete the earlier stages to unlock"}</span>
              </span>
              <span className="rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-500">{quiz.post ? "Completed" : "Pending"}</span>
            </summary>
            <div className="border-t border-[var(--border)] p-5 sm:p-6">
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

            {activeWorkshopId ? (
              <Quiz
                phase="post"
                result={quiz.post}
                locked={!preDone || n < T}
                onDone={(r) => submitQuiz("post", r)}
              />
            ) : (
              <p className="rounded-xl bg-[var(--surface-2)] p-4 text-sm text-[var(--muted)]">
                Enrol in a published programme to access the final assessment.
              </p>
            )}
            </div>
          </details>
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
                Step 05
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
                  {activeWorkshop?.title || "Professional learning programme"}
                </p>

                <p className="mt-2 text-sm text-[var(--muted)]">
                  For successfully completing the required learning activities and assessments.
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
                  {quiz.post.at
                    ? new Date(quiz.post.at).toLocaleDateString()
                    : "Date unavailable"}
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
