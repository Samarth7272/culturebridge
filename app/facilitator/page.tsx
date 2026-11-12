"use client";

import { useEffect, useState } from "react";
import { UserCheck, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { getWorkshops, saveAttendance } from "@/lib/api";

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

  // Load published workshops and saved attendance from MongoDB
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

      // Restore attendance from MongoDB
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

  // Check user role and load workshops
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
      setError("");

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

  if (loading) {
    return (
      <div className="p-6">
        Loading published workshops...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-4xl font-bold">
        Trainer workspace
      </h1>

      <p className="text-white/70">
        Manage published workshops and attendance.
      </p>

      <button
        onClick={loadWorkshops}
        disabled={saving}
        className="glass rounded-xl px-4 py-3"
      >
        <RefreshCw
          className="mr-2 inline"
          size={16}
        />
        Refresh workshops
      </button>

      {error && (
        <p className="rounded-xl bg-red-500/20 p-4">
          {error}
        </p>
      )}

      {workshops.length === 0 ? (
        <p className="glass rounded-xl p-5">
          No published workshops are available.
          Ask an admin to publish one.
        </p>
      ) : (
        <>
          <div>
            <label
              htmlFor="workshop"
              className="mb-2 block"
            >
              Workshop
            </label>

            <select
              id="workshop"
              className="input w-full md:max-w-md"
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
          </div>

          <section className="glass glow rounded-2xl p-5">
            <h2 className="mb-2 flex items-center gap-2 font-semibold">
              <UserCheck size={18} />
              Attendance
            </h2>

            <p className="mb-3 text-sm text-white/70">
              {present.length} of {PEOPLE.length} present
            </p>

            {saving && (
              <p className="mb-3 text-sm text-white/70">
                Saving attendance...
              </p>
            )}

            <ul className="grid gap-2 sm:grid-cols-2">
              {PEOPLE.map(person => (
                <li key={person}>
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/15 p-3">
                    <input
                      type="checkbox"
                      checked={present.includes(person)}
                      disabled={saving || !currentId}
                      onChange={() => togglePerson(person)}
                    />

                    {person}
                  </label>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}