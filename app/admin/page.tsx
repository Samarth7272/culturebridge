"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CalendarDays,
  Download,
  Plus,
  Trash2,
  Users,
  CheckCircle2,
  ClipboardList,
} from "lucide-react";

import {
  getWorkshops,
  addWorkshop,
  deleteWorkshop,
  updateWorkshop,
} from "@/lib/api";

import { CATS, Workshop } from "@/lib/data";

const trend = [
  { w: "W1", r: 12 },
  { w: "W2", r: 28 },
  { w: "W3", r: 41 },
  { w: "W4", r: 62 },
  { w: "W5", r: 86 },
];

const norm = (w: any): Workshop => ({
  ...w,
  id: w._id ?? w.id,
  registered: w.registered ?? 0,
  completed: w.completed ?? 0,
});

export default function Admin() {
  const router = useRouter();

  const [ws, setWs] = useState<Workshop[]>([]);
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  const [f, setF] = useState({
    title: "",
    cat: CATS[0],
    date: "",
    capacity: "20",
    facilitator: "",
  });

  const [err, setErr] = useState<Record<string, string>>({});

  const reg = ws.reduce((a, w) => a + w.registered, 0);
  const done = ws.reduce((a, w) => a + w.completed, 0);

  // Check whether the logged-in user is an admin
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        router.replace("/login");
        return;
      }

      const user = JSON.parse(storedUser);
      const role = String(user.role ?? "").toLowerCase().trim();

      if (role !== "admin") {
        const routes: Record<string, string> = {
          facilitator: "/facilitator",
          learner: "/learner",
        };

        router.replace(routes[role] || "/login");
        return;
      }

      setAuthorized(true);
    } catch {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      router.replace("/login");
    }
  }, [router]);

  // Load workshops only after admin authorization
  useEffect(() => {
    if (!authorized) return;

    async function load() {
      try {
        const data = await getWorkshops();
        setWs(data.map(norm));
      } catch (error) {
        console.error("Unable to load workshops:", error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [authorized]);

  // Create workshop
  async function add(e: React.FormEvent) {
    e.preventDefault();

    const x: Record<string, string> = {};
    const cap = Number(f.capacity);

    if (f.title.trim().length < 4) {
      x.title = "Enter a title of at least 4 characters.";
    }

    if (!f.date) {
      x.date = "Choose a date.";
    }

    if (!Number.isInteger(cap) || cap < 5 || cap > 200) {
      x.capacity = "Capacity must be a whole number from 5 to 200.";
    }

    if (!f.facilitator.trim()) {
      x.facilitator = "Enter a facilitator name.";
    }

    setErr(x);

    if (Object.keys(x).length > 0) return;

    try {
      const created = await addWorkshop({
        title: f.title.trim(),
        cat: f.cat,
        date: f.date,
        capacity: cap,
        facilitator: f.facilitator.trim(),
        status: "Draft",
      });

      setWs((prev) => [...prev, norm(created)]);

      setF({
        title: "",
        cat: CATS[0],
        date: "",
        capacity: "20",
        facilitator: "",
      });

      setErr({});
    } catch (error: any) {
      setErr({ title: error.message || "Unable to create workshop." });
    }
  }

  // Publish or unpublish workshop
  async function toggle(id: string) {
    const w = ws.find((x) => x.id === id);
    if (!w) return;

    const status =
      w.status === "Draft" ? "Published" : "Draft";

    try {
      await updateWorkshop(id, { status });

      setWs((prev) =>
        prev.map((x) =>
          x.id === id ? { ...x, status } : x
        )
      );
    } catch (error) {
      console.error("Unable to update workshop:", error);
    }
  }

  // Delete workshop
  async function remove(id: string) {
    if (!window.confirm("Are you sure you want to delete this workshop?")) {
      return;
    }

    try {
      await deleteWorkshop(id);
      setWs((prev) => prev.filter((x) => x.id !== id));
    } catch (error) {
      console.error("Unable to delete workshop:", error);
    }
  }

  // Export CSV report
  function csv() {
    const rows = [
      [
        "Title",
        "Category",
        "Date",
        "Registered",
        "Capacity",
        "Completed",
        "Status",
      ],
      ...ws.map((w) => [
        w.title,
        w.cat,
        w.date,
        w.registered,
        w.capacity,
        w.completed,
        w.status,
      ]),
    ];

    const content = rows
      .map((r) =>
        r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([content], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "culturebridge-report.csv";
    a.click();

    URL.revokeObjectURL(url);
  }

  const cards = [
    [ClipboardList, "Workshops", ws.length, "text-emerald"],
    [Users, "Registrations", reg, "text-royal"],
    [
      CheckCircle2,
      "Completion",
      reg ? Math.round((done / reg) * 100) + "%" : "0%",
      "text-gold",
    ],
  ] as const;

  if (!authorized || loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-lg text-white/70">
          Checking admin access...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-4xl font-bold">
          Admin dashboard
        </h1>

        <button onClick={csv} className="btn btn-ghost">
          <Download size={18} aria-hidden />
          Export CSV
        </button>
      </div>

      {/* Dashboard statistics */}
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map(([I, label, value, color]) => (
          <div key={label} className="glass glow p-5">
            <I className={color} aria-hidden />
            <p className="mt-2 text-3xl font-bold">{value}</p>
            <p className="text-sm text-white/70">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">

        <section className="glass p-5" aria-label="Registrations trend">
          <h2 className="mb-3 font-semibold">
            Registrations over time
          </h2>

          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <CartesianGrid stroke="#ffffff22" />
                <XAxis dataKey="w" stroke="#cbd5e1" />
                <YAxis stroke="#cbd5e1" />
                <Tooltip
                  contentStyle={{
                    background: "#0a1020",
                    border: "1px solid #ffffff33",
                  }}
                />
                <Area
                  dataKey="r"
                  name="Registrations"
                  stroke="#2dd4bf"
                  fill="#4361ee"
                  fillOpacity={0.4}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="glass p-5" aria-label="Completion by workshop">
          <h2 className="mb-3 font-semibold">
            Registered vs completed
          </h2>

          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={ws.map((w, i) => ({
                  n: "W" + (i + 1),
                  Registered: w.registered,
                  Completed: w.completed,
                }))}
              >
                <CartesianGrid stroke="#ffffff22" />
                <XAxis dataKey="n" stroke="#cbd5e1" />
                <YAxis stroke="#cbd5e1" />
                <Tooltip
                  contentStyle={{
                    background: "#0a1020",
                    border: "1px solid #ffffff33",
                  }}
                />
                <Bar
                  dataKey="Registered"
                  fill="#8b5cf6"
                  radius={4}
                />
                <Bar
                  dataKey="Completed"
                  fill="#10b981"
                  radius={4}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

      </div>

      {/* Workshop list */}
      <section className="glass p-5" aria-label="Workshops">
        <h2 className="mb-3 flex items-center gap-2 font-semibold">
          <CalendarDays size={18} aria-hidden />
          Workshops and upcoming calendar
        </h2>

        {ws.length === 0 ? (
          <p className="text-white/70">
            No workshops yet. Use the form below to create your first one.
          </p>
        ) : (
          <ul className="divide-y divide-white/10">
            {[...ws]
              .sort((a, b) => a.date.localeCompare(b.date))
              .map((w) => (
                <li
                  key={w.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-3"
                >
                  <div>
                    <p className="font-medium">{w.title}</p>
                    <p className="text-sm text-white/70">
                      {w.date} · {w.cat} · {w.facilitator} ·{" "}
                      {w.registered}/{w.capacity} registered
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggle(w.id)}
                      className={`rounded-full px-3 py-1 text-sm font-medium text-ink ${
                        w.status === "Published"
                          ? "bg-emerald"
                          : "bg-gold"
                      }`}
                    >
                      {w.status}
                    </button>

                    <button
                      onClick={() => remove(w.id)}
                      className="rounded-lg p-2 hover:bg-white/10"
                      aria-label={`Delete ${w.title}`}
                    >
                      <Trash2 size={18} className="text-coral" />
                    </button>
                  </div>
                </li>
              ))}
          </ul>
        )}
      </section>

      {/* Create workshop form */}
      <form
        onSubmit={add}
        noValidate
        className="glass grid gap-3 p-5 md:grid-cols-2"
        aria-label="Create workshop"
      >
        <h2 className="font-semibold md:col-span-2">
          Create a workshop
        </h2>

        {(
          [
            ["title", "Title", "text"],
            ["date", "Date", "date"],
            ["capacity", "Capacity", "number"],
            ["facilitator", "Facilitator", "text"],
          ] as const
        ).map(([key, label, type]) => (
          <div key={key}>
            <label
              htmlFor={key}
              className="mb-1 block text-sm"
            >
              {label}
            </label>

            <input
              id={key}
              type={type}
              className="input"
              value={f[key]}
              onChange={(e) =>
                setF({ ...f, [key]: e.target.value })
              }
              aria-invalid={!!err[key]}
              aria-describedby={
                err[key] ? key + "-e" : undefined
              }
            />

            {err[key] && (
              <p
                id={key + "-e"}
                role="alert"
                className="mt-1 text-sm text-coral"
              >
                {err[key]}
              </p>
            )}
          </div>
        ))}

        <div>
          <label
            htmlFor="cat"
            className="mb-1 block text-sm"
          >
            Category
          </label>

          <select
            id="cat"
            className="input"
            value={f.cat}
            onChange={(e) =>
              setF({ ...f, cat: e.target.value })
            }
          >
            {CATS.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button className="btn btn-pri">
            <Plus size={18} aria-hidden />
            Save draft
          </button>
        </div>
      </form>

    </div>
  );
}