"use client";

import { useEffect, useState } from "react";
import {
  UserCheck,
  RefreshCw,
  CalendarDays,
  Users,
  CheckCircle2,
  Clock3,
  ClipboardCheck,
  GraduationCap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getWorkshops, saveAttendance } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";

type Workshop = {
  _id?: string;
  id?: string;
  title: string;
  status: string;
  facilitator?: string;
  attendance?: string[];
};

const PEOPLE = [
  "Ananya Rao",
  "Lukas Meyer",
  "Chidi Eze",
  "Yuki Tanaka",
  "Priya Nair",
  "Mateo Silva",
  "Hana Cho",
  "Omar Haddad",
];

export default function Facilitator() {
  const router = useRouter();

  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [selected, setSelected] = useState("");
  const [attendance, setAttendance] = useState<
    Record<string, string[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Load published workshops and attendance from MongoDB
  async function loadWorkshops() {
    try {
      setLoading(true);
      setError("");

      const data = await getWorkshops();

      const published = (
        Array.isArray(data) ? data : []
      ).filter(
        (w: Workshop) =>
          w.status?.toLowerCase() === "published"
      );

      setWorkshops(published);

      const savedAttendance: Record<string, string[]> = {};

      published.forEach((w: Workshop) => {
        const id = w._id || w.id;

        if (id) {
          savedAttendance[id] = w.attendance || [];
        }
      });

      setAttendance(savedAttendance);

      setSelected(previous => {
        if (
          published.some(
            w => (w._id || w.id) === previous
          )
        ) {
          return previous;
        }

        return published[0]?._id || published[0]?.id || "";
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not load workshops"
      );
    } finally {
      setLoading(false);
    }
  }

  // Verify facilitator role
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

      loadWorkshops();
    } catch {
      router.replace("/login");
    }
  }, []);

  const currentId = selected;
  const present = attendance[currentId] || [];
  const absent = PEOPLE.length - present.length;
  const percentage = PEOPLE.length
    ? Math.round((present.length / PEOPLE.length) * 100)
    : 0;

  // Save attendance directly to MongoDB
  async function togglePerson(person: string) {
    if (!currentId || saving) return;

    const current = attendance[currentId] || [];

    const updated = current.includes(person)
      ? current.filter(p => p !== person)
      : [...current, person];

    try {
      setSaving(true);
      setError("");

      await saveAttendance(currentId, updated);

      setAttendance(previous => ({
        ...previous,
        [currentId]: updated,
      }));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not save attendance"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardLayout role="facilitator">
      <div className="space-y-7">

        {/* Welcome section */}
        <section className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-gradient-to-br from-teal-500/15 via-[var(--surface)] to-blue-500/10 p-6 sm:p-8">
          <div className="pointer-events-none absolute -right-12 -top-16 h-52 w-52 rounded-full bg-teal-500/10 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/10 px-3 py-1.5 text-xs font-semibold text-teal-500">
                <GraduationCap size={15} />
                TRAINER WORKSPACE
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-[var(--text)] sm:text-3xl">
                Welcome back, Trainer
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--muted)]">
                Manage your published workshops, monitor
                participation and keep attendance up to date.
              </p>
            </div>

            <button
              type="button"
              onClick={loadWorkshops}
              disabled={loading || saving}
              className="btn btn-pri inline-flex items-center justify-center gap-2 self-start rounded-xl px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50 sm:self-center"
            >
              <RefreshCw
                size={17}
                className={loading ? "animate-spin" : ""}
              />
              Refresh workshops
            </button>
          </div>
        </section>

        {/* Error message */}
        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500">
            <span className="font-semibold">Notice:</span>
            <span>{error}</span>
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="dashboard-card flex min-h-64 flex-col items-center justify-center gap-3 rounded-2xl p-8">
            <RefreshCw
              size={28}
              className="animate-spin text-[var(--primary)]"
            />
            <p className="font-medium text-[var(--text)]">
              Loading your workshops
            </p>
            <p className="text-sm text-[var(--muted)]">
              Connecting to your workspace...
            </p>
          </div>
        ) : (
          <>
            {/* Empty state */}
            {workshops.length === 0 ? (
              <div className="dashboard-card rounded-2xl p-8 text-center sm:p-12">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--surface-2)] text-[var(--primary)]">
                  <CalendarDays size={30} />
                </div>

                <h3 className="text-lg font-bold text-[var(--text)]">
                  No published workshops yet
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">
                  Published workshops assigned to trainers will
                  appear here. Please ask an administrator to
                  publish a workshop.
                </p>
              </div>
            ) : (
              <>
                {/* Summary cards */}
                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="dashboard-card rounded-2xl p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--muted)]">
                        Published workshops
                      </span>
                      <span className="rounded-xl bg-blue-500/10 p-2.5 text-blue-500">
                        <CalendarDays size={19} />
                      </span>
                    </div>
                    <p className="mt-4 text-3xl font-bold text-[var(--text)]">
                      {workshops.length}
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      Available in your workspace
                    </p>
                  </div>

                  <div className="dashboard-card rounded-2xl p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--muted)]">
                        Participants
                      </span>
                      <span className="rounded-xl bg-violet-500/10 p-2.5 text-violet-500">
                        <Users size={19} />
                      </span>
                    </div>
                    <p className="mt-4 text-3xl font-bold text-[var(--text)]">
                      {PEOPLE.length}
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      Participants in the attendance list
                    </p>
                  </div>

                  <div className="dashboard-card rounded-2xl p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--muted)]">
                        Present
                      </span>
                      <span className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-500">
                        <UserCheck size={19} />
                      </span>
                    </div>
                    <p className="mt-4 text-3xl font-bold text-[var(--text)]">
                      {present.length}
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      For the selected workshop
                    </p>
                  </div>

                  <div className="dashboard-card rounded-2xl p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--muted)]">
                        Attendance rate
                      </span>
                      <span className="rounded-xl bg-amber-500/10 p-2.5 text-amber-500">
                        <ClipboardCheck size={19} />
                      </span>
                    </div>
                    <p className="mt-4 text-3xl font-bold text-[var(--text)]">
                      {percentage}%
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      For the selected workshop
                    </p>
                  </div>
                </section>

                {/* Workshop selector */}
                <section id="workshops" className="dashboard-card scroll-mt-24 rounded-2xl p-5 sm:p-6">
                  <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-[var(--text)]">
                        Workshop overview
                      </h3>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        Select a workshop to manage its attendance.
                      </p>
                    </div>

                    <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-500">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      Published
                    </span>
                  </div>

                  <label
                    htmlFor="workshop"
                    className="mb-2 block text-sm font-medium text-[var(--text)]"
                  >
                    Select workshop
                  </label>

                  <select
                    id="workshop"
                    className="input w-full rounded-xl md:max-w-xl"
                    value={currentId}
                    onChange={e => setSelected(e.target.value)}
                  >
                    {workshops.map(w => {
                      const id = w._id || w.id || "";

                      return (
                        <option key={id} value={id}>
                          {w.title}
                        </option>
                      );
                    })}
                  </select>

                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl bg-[var(--surface-2)] p-4">
                      <p className="text-xs text-[var(--muted)]">
                        Total participants
                      </p>
                      <p className="mt-2 text-xl font-bold text-[var(--text)]">
                        {PEOPLE.length}
                      </p>
                    </div>

                    <div className="rounded-xl bg-emerald-500/10 p-4">
                      <p className="text-xs text-emerald-600">
                        Present
                      </p>
                      <p className="mt-2 text-xl font-bold text-emerald-600">
                        {present.length}
                      </p>
                    </div>

                    <div className="rounded-xl bg-amber-500/10 p-4">
                      <p className="text-xs text-amber-600">
                        Not marked present
                      </p>
                      <p className="mt-2 text-xl font-bold text-amber-600">
                        {absent}
                      </p>
                    </div>
                  </div>
                </section>

                {/* Attendance management */}
                <section id="attendance" className="dashboard-card scroll-mt-24 p-5 sm:p-6">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-xl bg-teal-500/10 p-2.5 text-teal-500">
                          <UserCheck size={20} />
                        </span>
                        <h3 className="text-lg font-bold text-[var(--text)]">
                          Attendance management
                        </h3>
                      </div>
                      <p className="mt-2 text-sm text-[var(--muted)]">
                        Mark participants present. Changes are
                        saved to the database.
                      </p>
                    </div>

                    <div className="rounded-xl border border-[var(--border)] px-4 py-3">
                      <p className="text-xs text-[var(--muted)]">
                        Attendance progress
                      </p>
                      <p className="mt-1 text-xl font-bold text-[var(--text)]">
                        {percentage}%
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-[var(--surface-2)]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-teal-500 to-blue-500 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-[var(--text)]">
                      Participant list
                    </p>

                    {saving ? (
                      <span className="inline-flex items-center gap-2 text-xs text-[var(--muted)]">
                        <RefreshCw size={14} className="animate-spin" />
                        Saving changes...
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 text-xs text-emerald-500">
                        <CheckCircle2 size={15} />
                        Attendance synced
                      </span>
                    )}
                  </div>

                  <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                    {PEOPLE.map((person, index) => {
                      const isPresent = present.includes(person);

                      return (
                        <li key={person}>
                          <label
                            className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
                              isPresent
                                ? "border-emerald-500/30 bg-emerald-500/5"
                                : "border-[var(--border)] bg-[var(--surface-2)] hover:border-[var(--primary)]"
                            } ${
                              saving
                                ? "cursor-not-allowed opacity-70"
                                : ""
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isPresent}
                              disabled={saving || !currentId}
                              onChange={() => togglePerson(person)}
                              className="h-4 w-4 accent-emerald-500"
                            />

                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/20 to-blue-500/20 text-sm font-bold text-[var(--primary)]">
                              {person
                                .split(" ")
                                .map(part => part[0])
                                .join("")}
                            </span>

                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-semibold text-[var(--text)]">
                                {person}
                              </span>
                              <span className="mt-1 block text-xs text-[var(--muted)]">
                                Participant {String(index + 1).padStart(2, "0")}
                              </span>
                            </span>

                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                isPresent
                                  ? "bg-emerald-500/10 text-emerald-500"
                                  : "bg-[var(--surface)] text-[var(--muted)]"
                              }`}
                            >
                              {isPresent ? "Present" : "Absent"}
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>

                  <div className="mt-5 flex items-center gap-2 rounded-xl bg-[var(--surface-2)] p-4 text-xs leading-5 text-[var(--muted)]">
                    <Clock3 size={16} className="shrink-0" />
                    Attendance updates are saved when you change
                    a participant's status.
                  </div>
                </section>
              </>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}