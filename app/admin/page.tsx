"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Users,
  BookOpen,
  CheckCircle2,
  Clock3,
  Search,
  Download,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  BarChart3,
  Sparkles,
  AlertCircle,
  X,
  GraduationCap,
} from "lucide-react";

import {
  getWorkshops,
  addWorkshop,
  deleteWorkshop,
  updateWorkshop,
} from "@/lib/api";

import { CATS, Workshop } from "@/lib/data";
import DashboardLayout from "@/components/DashboardLayout";
import { useTheme } from "@/components/ThemeProvider";

type WorkshopRow = {
  id: string;
  title: string;
  category: string;
  facilitator: string;
  date: string;
  capacity: number;
  registered: number;
  completed: number;
  status: string;
};

const panel =
  "rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm";

const inputStyle =
  "w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15";

function getText(value: any, fallback = ""): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);

  if (value && typeof value === "object") {
    if (typeof value.name === "string") return value.name;
    if (typeof value.title === "string") return value.title;
    if (typeof value.email === "string") return value.email;
    if (typeof value.label === "string") return value.label;
  }

  return fallback;
}

function normalizeWorkshop(item: any): WorkshopRow {
  return {
    id: String(item?._id || item?.id || ""),
    title: getText(item?.title, "Untitled workshop"),
    category: getText(item?.category, "General"),
    facilitator: getText(item?.facilitator, "Not assigned"),
    date: getText(item?.date, ""),
    capacity: Number(item?.capacity) || 0,
    registered: Number(item?.registered) || 0,
    completed: Number(item?.completed) || 0,
    status: getText(item?.status, "Draft"),
  };
}

const trendData = [
  { week: "W1", participants: 12 },
  { week: "W2", participants: 28 },
  { week: "W3", participants: 41 },
  { week: "W4", participants: 62 },
  { week: "W5", participants: 86 },
];

export default function Admin() {
  const router = useRouter();
  const { theme } = useTheme();
  const dark = theme === "dark";

  const [workshops, setWorkshops] = useState<WorkshopRow[]>([]);
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    category: "",
    facilitator: "",
    date: "",
    capacity: "30",
  });

  useEffect(() => {
    try {
      const user = JSON.parse(
        localStorage.getItem("user") || "{}"
      );

      if (!user || !user.role) {
        router.replace("/login");
        return;
      }

      const role = String(user.role).toLowerCase();

      if (role !== "admin") {
        if (role === "facilitator" || role === "trainer") {
          router.replace("/facilitator");
        } else {
          router.replace("/learner");
        }
        return;
      }

      setAuthorized(true);
    } catch {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      router.replace("/login");
    }
  }, [router]);

  async function loadWorkshops() {
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
            : Array.isArray(response?.data?.workshops)
              ? response.data.workshops
              : [];

      setWorkshops(records.map(normalizeWorkshop));
    } catch (err: any) {
      setError(err?.message || "Unable to load workshops.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (authorized) {
      loadWorkshops();
    }
  }, [authorized]);

  async function createWorkshop(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setNotice("");

    if (form.title.trim().length < 4) {
      setError("Workshop title must have at least 4 characters.");
      return;
    }

    if (!form.date || new Date(form.date) < new Date(
      new Date().toDateString()
    )) {
      setError("Please select today or a future date.");
      return;
    }

    const capacity = Number(form.capacity);

    if (!Number.isInteger(capacity) || capacity < 5 || capacity > 200) {
      setError("Capacity must be between 5 and 200.");
      return;
    }

    if (!form.facilitator.trim()) {
      setError("Please enter a facilitator name.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        title: form.title.trim(),
        category: form.category || "General",
        facilitator: form.facilitator.trim(),
        date: form.date,
        capacity,
        status: "Draft",
      };

      await addWorkshop(payload);

      setForm({
        title: "",
        category: "",
        facilitator: "",
        date: "",
        capacity: "30",
      });

      setNotice("Workshop created successfully.");
      await loadWorkshops();
    } catch (err: any) {
      setError(err?.message || "Could not create workshop.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleWorkshop(workshop: WorkshopRow) {
    setError("");
    setNotice("");

    const nextStatus =
      workshop.status.toLowerCase() === "published"
        ? "Draft"
        : "Published";

    try {
      await updateWorkshop(workshop.id, {
        status: nextStatus,
      });

      setNotice(`Workshop moved to ${nextStatus}.`);
      await loadWorkshops();
    } catch (err: any) {
      setError(err?.message || "Unable to update workshop.");
    }
  }

  async function removeWorkshop(id: string) {
    if (!window.confirm("Are you sure you want to delete this workshop?")) {
      return;
    }

    setError("");
    setNotice("");

    try {
      await deleteWorkshop(id);
      setNotice("Workshop deleted successfully.");
      await loadWorkshops();
    } catch (err: any) {
      setError(err?.message || "Unable to delete workshop.");
    }
  }
  function exportCSV() {
    const headers = [
      "Title",
      "Category",
      "Facilitator",
      "Date",
      "Capacity",
      "Registered",
      "Completed",
      "Status",
    ];

    const rows = filtered.map((w) => [
      w.title,
      w.category,
      w.facilitator,
      w.date,
      w.capacity,
      w.registered,
      w.completed,
      w.status,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((value) =>
            `"${String(value ?? "").replace(/"/g, '""')}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "culturebridge-workshops.csv";
    link.click();

    URL.revokeObjectURL(url);
  }

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return workshops;

    return workshops.filter((w) =>
      [
        w.title,
        w.category,
        w.facilitator,
        w.status,
      ].some((value) => value.toLowerCase().includes(query))
    );
  }, [workshops, search]);

  const totalWorkshops = workshops.length;

  const publishedCount = workshops.filter(
    (w) => w.status.toLowerCase() === "published"
  ).length;

  const totalRegistered = workshops.reduce(
    (sum, w) => sum + w.registered,
    0
  );

  const totalCompleted = workshops.reduce(
    (sum, w) => sum + w.completed,
    0
  );

  const completionRate =
    totalRegistered > 0
      ? Math.round((totalCompleted / totalRegistered) * 100)
      : 0;

  if (!authorized || loading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-500/20 border-t-teal-500" />
          <p className="text-sm text-[var(--muted)]">
            Loading your admin dashboard...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-7">

        {/* Welcome section */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 p-6 text-white shadow-xl sm:p-8">
          <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-teal-400/10 blur-3xl" />
          <div className="absolute -bottom-20 right-1/3 h-52 w-52 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative z-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-teal-200">
                <Sparkles size={14} />
                ADMIN WORKSPACE
              </div>

              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Welcome to CultureBridge
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
                Manage workshops, monitor participation, and help your
                organization build stronger cross-cultural collaboration.
              </p>
            </div>

            <button
              type="button"
              onClick={loadWorkshops}
              className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/20 sm:self-center"
            >
              <RefreshCw size={16} />
              Refresh data
            </button>
          </div>
        </section>

        {/* Feedback messages */}
        {notice && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600">
            <span className="flex items-center gap-2">
              <CheckCircle2 size={18} />
              {notice}
            </span>

            <button
              type="button"
              onClick={() => setNotice("")}
              aria-label="Dismiss message"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-500">
            <span className="flex items-center gap-2">
              <AlertCircle size={18} />
              {error}
            </span>

            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* Statistics */}
        <section>
          <div className="mb-4">
            <h3 className="text-lg font-bold text-[var(--text)]">
              Workspace overview
            </h3>
            <p className="mt-1 text-sm text-[var(--muted)]">
              A summary of your workshop activity.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className={`${panel} p-5`}>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--muted)]">
                  Total workshops
                </span>
                <span className="rounded-xl bg-blue-500/10 p-3 text-blue-500">
                  <CalendarDays size={21} />
                </span>
              </div>
              <p className="mt-4 text-3xl font-bold text-[var(--text)]">
                {totalWorkshops}
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Workshops in your workspace
              </p>
            </div>

            <div className={`${panel} p-5`}>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--muted)]">
                  Published
                </span>
                <span className="rounded-xl bg-emerald-500/10 p-3 text-emerald-500">
                  <BookOpen size={21} />
                </span>
              </div>
              <p className="mt-4 text-3xl font-bold text-[var(--text)]">
                {publishedCount}
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Live workshops
              </p>
            </div>

            <div className={`${panel} p-5`}>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--muted)]">
                  Participants
                </span>
                <span className="rounded-xl bg-violet-500/10 p-3 text-violet-500">
                  <Users size={21} />
                </span>
              </div>
              <p className="mt-4 text-3xl font-bold text-[var(--text)]">
                {totalRegistered}
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Total registrations
              </p>
            </div>

            <div className={`${panel} p-5`}>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--muted)]">
                  Completion rate
                </span>
                <span className="rounded-xl bg-teal-500/10 p-3 text-teal-500">
                  <GraduationCap size={21} />
                </span>
              </div>
              <p className="mt-4 text-3xl font-bold text-[var(--text)]">
                {completionRate}%
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Based on recorded completions
              </p>
            </div>
          </div>
        </section>

        {/* Analytics */}
        <section id="analytics" className="grid gap-4 xl:grid-cols-3">
          <div className={`${panel} p-5 xl:col-span-2`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-[var(--text)]">
                  Participation trend
                </h3>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  Illustrative sample trend, not live registration history.
                </p>
              </div>

              <span className="rounded-lg bg-teal-500/10 px-3 py-1.5 text-xs font-semibold text-teal-600">
                Sample data
              </span>
            </div>

            <div className="mt-6 flex h-48 items-end gap-3 sm:gap-5">
              {trendData.map((item) => (
                <div
                  key={item.week}
                  className="flex flex-1 flex-col items-center gap-2"
                >
                  <span className="text-xs font-semibold text-[var(--text)]">
                    {item.participants}
                  </span>

                  <div className="flex h-36 w-full items-end overflow-hidden rounded-t-lg bg-[var(--surface-2)]">
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-teal-600 to-cyan-400 transition-all"
                      style={{
                        height: `${(item.participants / 100) * 100}%`,
                      }}
                    />
                  </div>

                  <span className="text-xs text-[var(--muted)]">
                    {item.week}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className={`${panel} flex flex-col justify-between p-5`}>
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-[var(--text)]">
                  Learning progress
                </h3>
                <BarChart3 className="text-teal-500" size={21} />
              </div>

              <p className="mt-2 text-sm text-[var(--muted)]">
                Recorded participant completions.
              </p>
            </div>

            <div className="my-6">
              <div className="mb-2 flex items-end justify-between">
                <span className="text-4xl font-bold text-[var(--text)]">
                  {completionRate}%
                </span>
                <span className="text-xs text-[var(--muted)]">
                  Completion
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-[var(--surface-2)]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-400 transition-all"
                  style={{
                    width: `${Math.min(completionRate, 100)}%`,
                  }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-[var(--border)] pt-4 text-sm">
              <span className="text-[var(--muted)]">
                Completed participants
              </span>
              <strong className="text-[var(--text)]">
                {totalCompleted}
              </strong>
            </div>
          </div>
        </section>
        {/* Workshop management */}
        <section id="workshops" className={`${panel} overflow-hidden`}>
          <div className="flex flex-col justify-between gap-4 border-b border-[var(--border)] p-5 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-lg font-bold text-[var(--text)]">
                Workshop management
              </h3>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Search, publish, and manage your workshops.
              </p>
            </div>

            <button
              type="button"
              onClick={exportCSV}
              disabled={filtered.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-semibold text-[var(--text)] transition hover:bg-[var(--surface-2)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Download size={16} />
              Export CSV
            </button>
          </div>

          <div className="border-b border-[var(--border)] p-5">
            <div className="relative max-w-md">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
              />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search workshops, category, facilitator..."
                className={`${inputStyle} pl-10`}
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-5 py-14 text-center">
              <div className="rounded-2xl bg-[var(--surface-2)] p-4 text-[var(--muted)]">
                <CalendarDays size={30} />
              </div>

              <h4 className="mt-4 font-semibold text-[var(--text)]">
                {search ? "No matching workshops" : "No workshops yet"}
              </h4>

              <p className="mt-1 max-w-sm text-sm text-[var(--muted)]">
                {search
                  ? "Try another search term."
                  : "Create your first workshop using the form below."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-[var(--surface-2)] text-xs uppercase tracking-wider text-[var(--muted)]">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Workshop</th>
                    <th className="px-5 py-4 font-semibold">Facilitator</th>
                    <th className="px-5 py-4 font-semibold">Date</th>
                    <th className="px-5 py-4 font-semibold">Participants</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                    <th className="px-5 py-4 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((w) => (
                    <tr
                      key={w.id}
                      className="border-b border-[var(--border)] transition hover:bg-[var(--surface-2)]"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-[var(--text)]">
                          {w.title}
                        </p>
                        <p className="mt-1 text-xs text-[var(--muted)]">
                          {w.category}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-[var(--text)]">
                        {w.facilitator}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-[var(--muted)]">
                        {w.date
                          ? new Date(w.date).toLocaleDateString()
                          : "Not scheduled"}
                      </td>

                      <td className="px-5 py-4 text-[var(--text)]">
                        <div className="flex items-center gap-2">
                          <Users
                            size={15}
                            className="text-[var(--muted)]"
                          />
                          {w.registered} / {w.capacity || "—"}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            w.status.toLowerCase() === "published"
                              ? "bg-emerald-500/10 text-emerald-600"
                              : "bg-amber-500/10 text-amber-600"
                          }`}
                        >
                          {w.status}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => toggleWorkshop(w)}
                            title={
                              w.status.toLowerCase() === "published"
                                ? "Move to draft"
                                : "Publish workshop"
                            }
                            className="rounded-lg border border-[var(--border)] p-2 text-[var(--muted)] transition hover:border-teal-500/40 hover:text-teal-500"
                          >
                            {w.status.toLowerCase() === "published" ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => removeWorkshop(w.id)}
                            title="Delete workshop"
                            className="rounded-lg border border-[var(--border)] p-2 text-rose-500 transition hover:border-rose-500/40 hover:bg-rose-500/10"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border)] px-5 py-4 text-xs text-[var(--muted)]">
            <span>
              Showing {filtered.length} of {workshops.length} workshops
            </span>
            <span>CultureBridge Admin Workspace</span>
          </div>
        </section>

        {/* Create workshop */}
        <section id="create-workshop" className={`${panel} p-5 sm:p-6`}>
          <div className="mb-6 flex items-start gap-3">
            <div className="rounded-xl bg-teal-500/10 p-3 text-teal-500">
              <Plus size={22} />
            </div>

            <div>
              <h3 className="text-lg font-bold text-[var(--text)]">
                Create a new workshop
              </h3>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Add a learning session to your organization.
              </p>
            </div>
          </div>

          <form onSubmit={createWorkshop} className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--text)]">
                  Workshop title *
                </label>
                <input
                  required
                  minLength={4}
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                  placeholder="Enter workshop title"
                  className={inputStyle}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--text)]">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className={inputStyle}
                >
                  <option value="">Select category</option>
                  {CATS.map((category: any, index: number) => {
                    const value =
                      typeof category === "string"
                        ? category
                        : category?.name || category?.label || "";

                    return (
                      <option key={index} value={value}>
                        {value}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--text)]">
                  Facilitator *
                </label>
                <input
                  required
                  value={form.facilitator}
                  onChange={(e) =>
                    setForm({ ...form, facilitator: e.target.value })
                  }
                  placeholder="Enter facilitator name"
                  className={inputStyle}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--text)]">
                  Workshop date *
                </label>
                <input
                  required
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={form.date}
                  onChange={(e) =>
                    setForm({ ...form, date: e.target.value })
                  }
                  className={inputStyle}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--text)]">
                  Participant capacity *
                </label>
                <input
                  required
                  type="number"
                  min={5}
                  max={200}
                  value={form.capacity}
                  onChange={(e) =>
                    setForm({ ...form, capacity: e.target.value })
                  }
                  className={inputStyle}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[var(--border)] pt-5">
              <button
                type="button"
                onClick={() =>
                  setForm({
                    title: "",
                    category: "",
                    facilitator: "",
                    date: "",
                    capacity: "30",
                  })
                }
                className="rounded-xl border border-[var(--border)] px-5 py-3 text-sm font-semibold text-[var(--text)] transition hover:bg-[var(--surface-2)]"
              >
                Clear form
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-600/15 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <RefreshCw size={17} className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus size={17} />
                    Create workshop
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* Footer note */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 text-xs text-[var(--muted)]">
          <span>CultureBridge · Admin workspace</span>
          <span className="flex items-center gap-1">
            <Clock3 size={13} />
            Manage your learning programs
          </span>
        </div>
      </div>
    </DashboardLayout>
  );
}