"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Users,
  ClipboardCheck,
  RefreshCw,
  Plus,
  Save,
  Video,
  ChevronDown,
  BarChart3,
  CheckCircle2,
} from "lucide-react";

import {
  getWorkshops,
  updateWorkshop,
  saveAttendance,
} from "@/lib/api";

import DashboardLayout from "@/components/DashboardLayout";

type Learner = {
  _id: string;
  name?: string;
  email?: string;
};

type Lesson = {
  _id?: string;
  title: string;
  content?: string;
  videoUrl?: string;
  duration?: number;
};

type Module = {
  _id?: string;
  title: string;
  description?: string;
  content?: string;
  duration?: number;
  lessons: Lesson[];
};

type Workshop = {
  _id: string;
  title: string;
  description?: string;
  date?: string;
  status: string;
  capacity?: number;
  registered?: number;
  enrolledUsers: Learner[];
  attendance: (Learner | string)[];
  modules: Module[];
  trainer?: Learner | string;
};

type Tab = "overview" | "workshops" | "learners" | "attendance";

const emptyModule = (): Module => ({
  title: "New module",
  description: "",
  content: "",
  duration: 0,
  lessons: [],
});

const emptyLesson = (): Lesson => ({
  title: "New lesson",
  content: "",
  videoUrl: "",
  duration: 0,
});

export default function Facilitator() {
  const router = useRouter();

  const [tab, setTab] = useState<Tab>("overview");
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [draft, setDraft] = useState<Module[]>([]);
  const [presentIds, setPresentIds] = useState<string[]>([]);

  // Load facilitator programmes
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    setNotice("");

    try {
      const data = await getWorkshops();
      const rows = Array.isArray(data) ? (data as Workshop[]) : [];

      setWorkshops(rows);

      setSelected((old) =>
        rows.some((w) => w._id === old)
          ? old
          : rows[0]?._id || ""
      );
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Could not load programmes"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Check facilitator authentication
  useEffect(() => {
    const stored = localStorage.getItem("user");

    if (!stored) {
      router.replace("/login");
      return;
    }

    try {
      const user = JSON.parse(stored);

      if (
        String(user.role).toLowerCase() !== "facilitator"
      ) {
        router.replace("/login");
        return;
      }

      load();
    } catch {
      router.replace("/login");
    }
  }, [router, load]);

  // Keep the URL hash and the selected dashboard tab synchronized.
  useEffect(() => {
    const validTabs: Tab[] = [
      "overview",
      "workshops",
      "learners",
      "attendance",
    ];

    const syncTabFromUrl = () => {
      const hash = window.location.hash.replace(/^#/, "");

      if (validTabs.includes(hash as Tab)) {
        setTab(hash as Tab);
      } else {
        setTab("overview");
        window.history.replaceState(
          null,
          "",
          `${window.location.pathname}${window.location.search}#overview`
        );
      }
    };

    syncTabFromUrl();
    window.addEventListener("hashchange", syncTabFromUrl);

    return () => {
      window.removeEventListener("hashchange", syncTabFromUrl);
    };
  }, []);

  // Use this for buttons inside the dashboard so the sidebar stays in sync.
  function changeTab(nextTab: Tab) {
    setTab(nextTab);
    setError("");
    setNotice("");

    if (typeof window !== "undefined") {
      window.location.hash = nextTab;
    }
  }

  const current = workshops.find(
    (w) => w._id === selected
  );

  // Load selected programme content and attendance
  useEffect(() => {
    setDraft(
      current?.modules
        ? structuredClone(current.modules)
        : []
    );

    setPresentIds(
      current?.attendance?.map((x) =>
        typeof x === "string" ? x : x._id
      ) || []
    );
  }, [selected, workshops]);

  const learners = current?.enrolledUsers || [];

  const totalPresent = current?.attendance?.length || 0;

  const attendanceRate = learners.length
    ? Math.round((totalPresent / learners.length) * 100)
    : 0;

  const totalLessons = useMemo(
    () =>
      workshops.reduce(
        (total, workshop) =>
          total +
          (workshop.modules || []).reduce(
            (moduleTotal, mod) =>
              moduleTotal + (mod.lessons || []).length,
            0
          ),
        0
      ),
    [workshops]
  );

  // Update module
  function patchModule(
    index: number,
    patch: Partial<Module>
  ) {
    setDraft((old) =>
      old.map((m, i) =>
        i === index ? { ...m, ...patch } : m
      )
    );
  }

  // Update lesson
  function patchLesson(
    moduleIndex: number,
    lessonIndex: number,
    patch: Partial<Lesson>
  ) {
    setDraft((old) =>
      old.map((m, i) =>
        i !== moduleIndex
          ? m
          : {
              ...m,
              lessons: m.lessons.map((l, j) =>
                j === lessonIndex
                  ? { ...l, ...patch }
                  : l
              ),
            }
      )
    );
  }

  // Save learning content
  async function saveContent() {
    if (!current) return;

    if (
      draft.some(
        (m) =>
          !m.title.trim() ||
          m.lessons.some((l) => !l.title.trim())
      )
    ) {
      setError("Every module and lesson needs a title.");
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const updated = await updateWorkshop(
        current._id,
        { modules: draft }
      );

      setWorkshops((old) =>
        old.map((w) =>
          w._id === current._id
            ? {
                ...w,
                ...updated,
                modules: updated.modules || draft,
              }
            : w
        )
      );

      setNotice("Learning content saved successfully.");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Could not save learning content"
      );
    } finally {
      setSaving(false);
    }
  }

  // Save attendance
  async function saveAttendanceNow() {
    if (!current) return;

    setSaving(true);
    setError("");
    setNotice("");

    try {
      await saveAttendance(current._id, presentIds);

      setWorkshops((old) =>
        old.map((w) =>
          w._id === current._id
            ? {
                ...w,
                attendance: learners.filter((l) =>
                  presentIds.includes(l._id)
                ),
              }
            : w
        )
      );

      setNotice("Attendance saved successfully.");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Could not save attendance"
      );
    } finally {
      setSaving(false);
    }
  }
  const nav: {
    id: Tab;
    label: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: "overview",
      label: "Overview",
      icon: <BarChart3 size={17} />,
    },
    {
      id: "workshops",
      label: "Workshops & content",
      icon: <BookOpen size={17} />,
    },
    {
      id: "learners",
      label: "Learners",
      icon: <Users size={17} />,
    },
    {
      id: "attendance",
      label: "Attendance",
      icon: <ClipboardCheck size={17} />,
    },
  ];

  return (
    <DashboardLayout role="facilitator">
      <div className="space-y-6">

        {/* Welcome header */}
        <section className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-gradient-to-br from-teal-500/15 via-[var(--surface)] to-blue-500/10 p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-teal-500/10 px-3 py-1.5 text-xs font-semibold text-teal-600">
                TRAINER WORKSPACE
              </span>

              <h1 className="mt-3 text-2xl font-bold text-[var(--text)] sm:text-3xl">
                Welcome back, Trainer
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                Plan learning experiences, manage your
                programmes and support every learner’s progress.
              </p>
            </div>

            <button
              onClick={load}
              disabled={loading || saving}
              className="btn btn-pri inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              Refresh data
            </button>
          </div>
        </section>

        {/* Navigation tabs */}
        <nav className="flex flex-wrap gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2">
          {nav.map((item) => (
            <button
              key={item.id}
              onClick={() => changeTab(item.id)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                tab === item.id
                  ? "bg-[var(--primary)] text-white"
                  : "text-[var(--muted)] hover:bg-[var(--surface-2)]"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Error message */}
        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500"
          >
            {error}
          </div>
        )}

        {/* Success message */}
        {notice && (
          <div
            role="status"
            className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-600"
          >
            {notice}
          </div>
        )}

        {/* Loading screen */}
        {loading ? (
          <div className="dashboard-card flex min-h-52 items-center justify-center gap-3 rounded-2xl">
            <RefreshCw className="animate-spin" />
            Loading trainer workspace…
          </div>
        ) : (
          <>
            {/* No programmes assigned */}
            {workshops.length === 0 ? (
              <div className="dashboard-card rounded-2xl p-8 text-center">
                <BookOpen className="mx-auto mb-3" />

                <h2 className="font-bold text-[var(--text)]">
                  No programmes assigned yet
                </h2>

                <p className="mt-2 text-sm text-[var(--muted)]">
                  Ask an administrator to assign a programme
                  to your trainer account.
                </p>
              </div>
            ) : (
              <>
                {/* Programme selector */}
                <section className="dashboard-card rounded-2xl p-5">
                  <label
                    htmlFor="programme-select"
                    className="mb-2 block text-sm font-semibold text-[var(--text)]"
                  >
                    Select programme
                  </label>

                  <select
                    id="programme-select"
                    value={selected}
                    onChange={(e) =>
                      setSelected(e.target.value)
                    }
                    className="input w-full rounded-xl"
                  >
                    {workshops.map((w) => (
                      <option key={w._id} value={w._id}>
                        {w.title} · {w.status}
                      </option>
                    ))}
                  </select>
                </section>

                {/* OVERVIEW TAB */}
                {current && tab === "overview" && (
                  <div className="space-y-6">

                    {/* Metric cards */}
                    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      {[
                        {
                          label: "Assigned programmes",
                          value: workshops.length,
                          icon: <BookOpen />,
                        },
                        {
                          label: "Enrolled learners",
                          value: workshops.reduce(
                            (n, w) =>
                              n + (w.enrolledUsers?.length || 0),
                            0
                          ),
                          icon: <Users />,
                        },
                        {
                          label: "Learning lessons",
                          value: totalLessons,
                          icon: <Video />,
                        },
                        {
                          label: "Published programmes",
                          value: workshops.filter(
                            (w) => w.status === "Published"
                          ).length,
                          icon: <CheckCircle2 />,
                        },
                      ].map((c) => (
                        <div
                          key={c.label}
                          className="dashboard-card rounded-2xl p-5"
                        >
                          <div className="flex items-center justify-between text-[var(--muted)]">
                            <span className="text-sm">
                              {c.label}
                            </span>

                            <span className="rounded-xl bg-teal-500/10 p-2 text-teal-600">
                              {c.icon}
                            </span>
                          </div>

                          <p className="mt-4 text-3xl font-bold text-[var(--text)]">
                            {c.value}
                          </p>
                        </div>
                      ))}
                    </section>
                    {/* Programme overview */}
                    <section className="grid gap-4 lg:grid-cols-2">
                      <div className="dashboard-card rounded-2xl p-6">
                        <p className="text-sm text-[var(--muted)]">
                          Selected programme
                        </p>

                        <h2 className="mt-2 text-xl font-bold text-[var(--text)]">
                          {current.title}
                        </h2>

                        <p className="mt-2 text-sm text-[var(--muted)]">
                          {current.description ||
                            "No programme description added."}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600">
                            {current.status}
                          </span>

                          <span className="rounded-full bg-[var(--surface-2)] px-3 py-1 text-xs text-[var(--muted)]">
                            {current.date || "Date not set"}
                          </span>
                        </div>
                      </div>

                      <div className="dashboard-card rounded-2xl p-6">
                        <p className="text-sm text-[var(--muted)]">
                          Attendance snapshot
                        </p>

                        <p className="mt-2 text-4xl font-bold text-[var(--text)]">
                          {attendanceRate}%
                        </p>

                        <p className="mt-1 text-sm text-[var(--muted)]">
                          {totalPresent} present out of{" "}
                          {learners.length} enrolled learners
                        </p>

                        <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--surface-2)]">
                          <div
                            className="h-full rounded-full bg-teal-500"
                            style={{
                              width: `${attendanceRate}%`,
                            }}
                          />
                        </div>

                        <button
                          onClick={() => changeTab("attendance")}
                          className="btn btn-ghost mt-4 rounded-xl px-4 py-2 text-sm"
                        >
                          Manage attendance
                        </button>
                      </div>
                    </section>
                  </div>
                )}

                {/* WORKSHOPS & CONTENT TAB */}
                {current && tab === "workshops" && (
                  <section className="dashboard-card space-y-5 rounded-2xl p-5 sm:p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h2 className="text-xl font-bold text-[var(--text)]">
                          Learning content studio
                        </h2>

                        <p className="mt-1 text-sm text-[var(--muted)]">
                          Organise modules, lessons, learning notes
                          and video links.
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          setDraft((old) => [
                            ...old,
                            emptyModule(),
                          ])
                        }
                        className="btn btn-pri inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm"
                      >
                        <Plus size={16} />
                        Add module
                      </button>
                    </div>

                    {draft.length === 0 && (
                      <div className="rounded-xl bg-[var(--surface-2)] p-6 text-center text-sm text-[var(--muted)]">
                        No modules yet. Add your first module
                        to build this programme.
                      </div>
                    )}

                    {draft.map((mod, mi) => (
                      <details
                        key={mod._id || mi}
                        open
                        className="rounded-xl border border-[var(--border)]"
                      >
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4">
                          <span className="font-semibold text-[var(--text)]">
                            Module {mi + 1}:{" "}
                            {mod.title || "Untitled module"}
                          </span>

                          <ChevronDown size={17} />
                        </summary>

                        <div className="space-y-3 border-t border-[var(--border)] p-4">
                          <input
                            className="input w-full rounded-lg"
                            aria-label="Module title"
                            value={mod.title}
                            onChange={(e) =>
                              patchModule(mi, {
                                title: e.target.value,
                              })
                            }
                            placeholder="Module title"
                          />

                          <textarea
                            className="input min-h-20 w-full rounded-lg"
                            aria-label="Module description"
                            value={mod.description || ""}
                            onChange={(e) =>
                              patchModule(mi, {
                                description: e.target.value,
                              })
                            }
                            placeholder="Module description"
                          />

                          <textarea
                            className="input min-h-24 w-full rounded-lg"
                            aria-label="Module learning content"
                            value={mod.content || ""}
                            onChange={(e) =>
                              patchModule(mi, {
                                content: e.target.value,
                              })
                            }
                            placeholder="Learning notes or instructions"
                          />

                          <div className="space-y-3">
                            {(mod.lessons || []).map(
                              (lesson, li) => (
                                <div
                                  key={lesson._id || li}
                                  className="rounded-xl bg-[var(--surface-2)] p-4"
                                >
                                  <p className="mb-3 text-sm font-semibold text-[var(--text)]">
                                    Lesson {li + 1}
                                  </p>

                                  <input
                                    className="input mb-2 w-full rounded-lg"
                                    value={lesson.title}
                                    onChange={(e) =>
                                      patchLesson(mi, li, {
                                        title: e.target.value,
                                      })
                                    }
                                    placeholder="Lesson title"
                                  />

                                  <textarea
                                    className="input mb-2 min-h-20 w-full rounded-lg"
                                    value={lesson.content || ""}
                                    onChange={(e) =>
                                      patchLesson(mi, li, {
                                        content: e.target.value,
                                      })
                                    }
                                    placeholder="Lesson description and notes"
                                  />

                                  <div className="grid gap-2 sm:grid-cols-[1fr_120px]">
                                    <input
                                      className="input w-full rounded-lg"
                                      type="url"
                                      value={lesson.videoUrl || ""}
                                      onChange={(e) =>
                                        patchLesson(mi, li, {
                                          videoUrl: e.target.value,
                                        })
                                      }
                                      placeholder="Video URL (YouTube, Vimeo or MP4)"
                                    />

                                    <input
                                      className="input w-full rounded-lg"
                                      type="number"
                                      min="0"
                                      value={lesson.duration || 0}
                                      onChange={(e) =>
                                        patchLesson(mi, li, {
                                          duration: Number(
                                            e.target.value
                                          ),
                                        })
                                      }
                                      placeholder="Minutes"
                                    />
                                  </div>

                                  {lesson.videoUrl && (
                                    <a
                                      href={lesson.videoUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-[var(--primary)]"
                                    >
                                      <Video size={14} />
                                      Test video link
                                    </a>
                                  )}

                                  <button
                                    onClick={() =>
                                      patchModule(mi, {
                                        lessons: mod.lessons.filter(
                                          (_, i) => i !== li
                                        ),
                                      })
                                    }
                                    className="mt-3 text-xs font-semibold text-red-500"
                                  >
                                    Remove lesson
                                  </button>
                                </div>
                              )
                            )}
                          </div>

                          <div className="flex flex-wrap justify-between gap-2">
                            <button
                              onClick={() =>
                                patchModule(mi, {
                                  lessons: [
                                    ...mod.lessons,
                                    emptyLesson(),
                                  ],
                                })
                              }
                              className="btn btn-ghost inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
                            >
                              <Plus size={15} />
                              Add lesson
                            </button>

                            <button
                              onClick={() =>
                                setDraft((old) =>
                                  old.filter((_, i) => i !== mi)
                                )
                              }
                              className="rounded-lg px-3 py-2 text-sm font-semibold text-red-500"
                            >
                              Remove module
                            </button>
                          </div>
                        </div>
                      </details>
                    ))}

                    <div className="flex justify-end">
                      <button
                        onClick={saveContent}
                        disabled={saving}
                        className="btn btn-pri inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold disabled:opacity-50"
                      >
                        <Save size={16} />
                        {saving
                          ? "Saving…"
                          : "Save learning content"}
                      </button>
                    </div>
                  </section>
                )}
                {/* LEARNERS TAB */}
                {current && tab === "learners" && (
                  <section className="dashboard-card rounded-2xl p-5">
                    <h2 className="text-xl font-bold text-[var(--text)]">
                      Enrolled learners
                    </h2>

                    <p className="mt-1 text-sm text-[var(--muted)]">
                      Learners enrolled in {current.title}.
                    </p>

                    {learners.length === 0 ? (
                      <p className="mt-5 rounded-xl bg-[var(--surface-2)] p-5 text-sm text-[var(--muted)]">
                        No learners have enrolled yet.
                      </p>
                    ) : (
                      <div className="mt-4 divide-y divide-[var(--border)]">
                        {learners.map((l, i) => (
                          <div
                            key={l._id}
                            className="flex items-center gap-3 py-3"
                          >
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-500/10 text-sm font-bold text-teal-600">
                              {(l.name || l.email || "L")
                                .slice(0, 1)
                                .toUpperCase()}
                            </span>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-[var(--text)]">
                                {l.name || "Learner"}
                              </p>

                              <p className="truncate text-xs text-[var(--muted)]">
                                {l.email || "Email unavailable"}
                              </p>
                            </div>

                            <span className="text-xs text-[var(--muted)]">
                              Learner {i + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                )}

                {/* ATTENDANCE TAB */}
                {current && tab === "attendance" && (
                  <section className="dashboard-card rounded-2xl p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h2 className="text-xl font-bold text-[var(--text)]">
                          Attendance register
                        </h2>

                        <p className="mt-1 text-sm text-[var(--muted)]">
                          Mark enrolled learners present.
                          Unchecked learners are recorded as absent.
                        </p>
                      </div>

                      <span className="rounded-full bg-teal-500/10 px-3 py-1.5 text-sm font-bold text-teal-600">
                        {learners.length
                          ? Math.round(
                              (presentIds.length / learners.length) *
                                100
                            )
                          : 0}
                        % present
                      </span>
                    </div>

                    {learners.length === 0 ? (
                      <p className="mt-5 rounded-xl bg-[var(--surface-2)] p-5 text-sm text-[var(--muted)]">
                        No enrolled learners to mark.
                      </p>
                    ) : (
                      <div className="mt-4 grid gap-2 sm:grid-cols-2">
                        {learners.map((l) => {
                          const isPresent = presentIds.includes(
                            l._id
                          );

                          return (
                            <label
                              key={l._id}
                              className="flex cursor-pointer items-center gap-3 rounded-xl border border-[var(--border)] p-4"
                            >
                              <input
                                type="checkbox"
                                checked={isPresent}
                                onChange={(e) =>
                                  setPresentIds((old) =>
                                    e.target.checked
                                      ? [...old, l._id]
                                      : old.filter(
                                          (id) => id !== l._id
                                        )
                                  )
                                }
                                className="h-4 w-4 accent-emerald-500"
                              />

                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-semibold text-[var(--text)]">
                                  {l.name || "Learner"}
                                </span>

                                <span className="block truncate text-xs text-[var(--muted)]">
                                  {l.email || ""}
                                </span>
                              </span>

                              <span
                                className={`text-xs font-semibold ${
                                  isPresent
                                    ? "text-emerald-600"
                                    : "text-[var(--muted)]"
                                }`}
                              >
                                {isPresent ? "Present" : "Absent"}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    )}

                    <div className="mt-5 flex justify-end">
                      <button
                        onClick={saveAttendanceNow}
                        disabled={saving || !current}
                        className="btn btn-pri inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold disabled:opacity-50"
                      >
                        <Save size={16} />
                        {saving
                          ? "Saving…"
                          : "Save attendance"}
                      </button>
                    </div>
                  </section>
                )}
              </>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}