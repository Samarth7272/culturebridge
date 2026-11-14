"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, Save, Trash2, BookOpen, Video, Clock3 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { getWorkshops, updateWorkshop } from "@/lib/api";

type Lesson = {
  _id?: string;
  title: string;
  content: string;
  videoUrl: string;
  duration: number;
};

type Module = {
  _id?: string;
  title: string;
  description: string;
  content: string;
  duration: number;
  lessons: Lesson[];
};

type Programme = {
  _id: string;
  title: string;
  description?: string;
  cat?: string;
  date?: string;
  status?: string;
  modules?: Module[];
};

const inputClass =
  "w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text)] outline-none focus:border-rose-600";

export default function ProgrammeDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id || "");

  const [programme, setProgramme] = useState<Programme | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const response: any = await getWorkshops();
        const records = Array.isArray(response)
          ? response
          : Array.isArray(response?.workshops)
            ? response.workshops
            : Array.isArray(response?.data)
              ? response.data
              : [];
        const found = records.find(
          (item: any) => String(item._id || item.id) === id
        );

        if (!found) {
          if (active) setError("Programme not found. Return to the admin dashboard and refresh the list.");
          return;
        }

        if (active) {
          setProgramme(found);
          setModules(
            Array.isArray(found.modules)
              ? found.modules.map((module: any) => ({
                  ...module,
                  lessons: Array.isArray(module.lessons) ? module.lessons : [],
                }))
              : []
          );
        }
      } catch (err: any) {
        if (active) setError(err?.message || "Unable to load programme.");
      } finally {
        if (active) setLoading(false);
      }
    }

    if (id) load();
    return () => { active = false; };
  }, [id]);

  function addModule() {
    setModules((current) => [
      ...current,
      { title: "", description: "", content: "", duration: 0, lessons: [] },
    ]);
  }

  function updateModule(index: number, patch: Partial<Module>) {
    setModules((current) =>
      current.map((module, i) => (i === index ? { ...module, ...patch } : module))
    );
  }

  function removeModule(index: number) {
    setModules((current) => current.filter((_, i) => i !== index));
  }

  function addLesson(moduleIndex: number) {
    const next = [...modules];
    next[moduleIndex].lessons = [
      ...next[moduleIndex].lessons,
      { title: "", content: "", videoUrl: "", duration: 0 },
    ];
    setModules(next);
  }

  function updateLesson(moduleIndex: number, lessonIndex: number, patch: Partial<Lesson>) {
    setModules((current) =>
      current.map((module, i) =>
        i === moduleIndex
          ? {
              ...module,
              lessons: module.lessons.map((lesson, j) =>
                j === lessonIndex ? { ...lesson, ...patch } : lesson
              ),
            }
          : module
      )
    );
  }

  function removeLesson(moduleIndex: number, lessonIndex: number) {
    setModules((current) =>
      current.map((module, i) =>
        i === moduleIndex
          ? { ...module, lessons: module.lessons.filter((_, j) => j !== lessonIndex) }
          : module
      )
    );
  }

  async function saveContent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!programme) return;

    const cleaned = modules.map((module, index) => ({
      ...module,
      title: module.title.trim(),
      order: index + 1,
      lessons: module.lessons.map((lesson) => ({
        ...lesson,
        title: lesson.title.trim(),
        duration: Number(lesson.duration) || 0,
      })),
    }));

    if (cleaned.some((module) => !module.title)) {
      setError("Every module needs a title.");
      return;
    }
    if (cleaned.some((module) => module.lessons.some((lesson) => !lesson.title))) {
      setError("Every lesson needs a title.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");
    try {
      await updateWorkshop(id, { modules: cleaned });
      setModules(cleaned);
      setMessage("Programme content saved successfully.");
    } catch (err: any) {
      setError(err?.message || "Unable to save programme content.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardLayout role="admin">
      <div className="mx-auto max-w-5xl space-y-6">
        <button
          type="button"
          onClick={() => router.push("/admin#programs")}
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--text)]"
        >
          <ArrowLeft size={16} /> Back to programmes
        </button>

        {loading ? (
          <div className="rounded-2xl border border-[var(--border)] p-8 text-center text-[var(--muted)]">
            Loading programme...
          </div>
        ) : error && !programme ? (
          <div className="rounded-2xl border border-rose-500/30 p-6 text-rose-600">{error}</div>
        ) : programme ? (
          <>
            <header className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-rose-600">Learning programme</p>
                  <h1 className="text-2xl font-bold text-[var(--text)]">{programme.title}</h1>
                  <p className="mt-2 text-sm text-[var(--muted)]">{programme.description || "Add programme description from the programme setup form."}</p>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-[var(--muted)]">
                    <span className="rounded-full bg-[var(--surface)] px-3 py-1">{programme.cat || "General"}</span>
                    <span className="rounded-full bg-[var(--surface)] px-3 py-1">{programme.status || "Draft"}</span>
                    {programme.date && <span className="rounded-full bg-[var(--surface)] px-3 py-1">{new Date(programme.date).toLocaleDateString()}</span>}
                  </div>
                </div>
                <BookOpen className="text-rose-600" size={28} />
              </div>
            </header>

            <form onSubmit={saveContent} className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-[var(--text)]">Modules and lessons</h2>
                  <p className="mt-1 text-sm text-[var(--muted)]">Organise the programme into modules, then add lessons and optional video links.</p>
                </div>
                <button type="button" onClick={addModule} className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white">
                  <Plus size={16} /> Add module
                </button>
              </div>

              {message && <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-600">{message}</div>}
              {error && <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-600">{error}</div>}

              {modules.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[var(--border)] p-10 text-center">
                  <BookOpen className="mx-auto mb-3 text-[var(--muted)]" size={30} />
                  <p className="font-semibold text-[var(--text)]">No modules added yet</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">Add the first module to start building this programme.</p>
                </div>
              ) : (
                modules.map((module, moduleIndex) => (
                  <section key={module._id || moduleIndex} className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-semibold text-[var(--text)]">Module {moduleIndex + 1}</h3>
                      <button type="button" onClick={() => removeModule(moduleIndex)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-rose-600 hover:bg-rose-500/10">
                        <Trash2 size={14} /> Remove module
                      </button>
                    </div>
                    <input className={inputClass} placeholder="Module title *" value={module.title} onChange={(e) => updateModule(moduleIndex, { title: e.target.value })} required />
                    <textarea className={inputClass} rows={2} placeholder="Module description" value={module.description} onChange={(e) => updateModule(moduleIndex, { description: e.target.value })} />
                    <textarea className={inputClass} rows={3} placeholder="Module learning content / notes" value={module.content} onChange={(e) => updateModule(moduleIndex, { content: e.target.value })} />
                    <div className="flex items-center gap-2 text-xs text-[var(--muted)]"><Clock3 size={14} /> Estimated module duration in minutes</div>
                    <input className={inputClass} type="number" min="0" value={module.duration} onChange={(e) => updateModule(moduleIndex, { duration: Number(e.target.value) })} />

                    <div className="space-y-3 border-t border-[var(--border)] pt-4">
                      <div className="flex items-center justify-between gap-3">
                        <h4 className="font-medium text-[var(--text)]">Lessons ({module.lessons.length})</h4>
                        <button type="button" onClick={() => addLesson(moduleIndex)} className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] px-3 py-2 text-xs text-[var(--text)]">
                          <Plus size={14} /> Add lesson
                        </button>
                      </div>
                      {module.lessons.map((lesson, lessonIndex) => (
                        <div key={lesson._id || lessonIndex} className="grid gap-3 rounded-xl bg-[var(--surface)] p-4">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-[var(--text)]">Lesson {lessonIndex + 1}</p>
                            <button type="button" onClick={() => removeLesson(moduleIndex, lessonIndex)} className="text-rose-600" aria-label="Remove lesson"><Trash2 size={15} /></button>
                          </div>
                          <input className={inputClass} placeholder="Lesson title *" value={lesson.title} onChange={(e) => updateLesson(moduleIndex, lessonIndex, { title: e.target.value })} required />
                          <textarea className={inputClass} rows={3} placeholder="Lesson content / instructions" value={lesson.content} onChange={(e) => updateLesson(moduleIndex, lessonIndex, { content: e.target.value })} />
                          <div className="flex items-center gap-2"><Video size={15} className="text-[var(--muted)]" /><input className={inputClass} type="url" placeholder="Optional video URL (https://...)" value={lesson.videoUrl} onChange={(e) => updateLesson(moduleIndex, lessonIndex, { videoUrl: e.target.value })} /></div>
                          <input className={inputClass} type="number" min="0" placeholder="Duration in minutes" value={lesson.duration} onChange={(e) => updateLesson(moduleIndex, lessonIndex, { duration: Number(e.target.value) })} />
                        </div>
                      ))}
                    </div>
                  </section>
                ))
              )}

              <div className="flex justify-end border-t border-[var(--border)] pt-5">
                <button disabled={saving} type="submit" className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
                  <Save size={16} /> {saving ? "Saving..." : "Save programme content"}
                </button>
              </div>
            </form>
          </>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
