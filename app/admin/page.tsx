"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Users,
  BookOpen,
  CheckCircle2,
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
  Clock3,
  Building2,
  Pencil,
  Mail,
  Phone,
  Globe2,
} from "lucide-react";

import {
  getWorkshops,
  addWorkshop,
  deleteWorkshop,
  updateWorkshop,
  getOrganisations,
  addOrganisation,
  updateOrganisation,
  deleteOrganisation,
  type Organisation,
  getUsers,
  addUser,
  updateUser,
  deleteUser,
  type ManagedUser,
} from "@/lib/api";

import { CATS } from "@/lib/data";
import DashboardLayout from "@/components/DashboardLayout";

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
  "w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-rose-600 focus:ring-2 focus:ring-rose-600/15";

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
    category: getText(item?.cat || item?.category, "General"),
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
  useEffect(() => {
  const scrollToSection = () => {
    const id = window.location.hash.slice(1);
    if (!id) return;

    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  scrollToSection();

  window.addEventListener("hashchange", scrollToSection);

  return () => {
    window.removeEventListener("hashchange", scrollToSection);
  };
}, []);
  const router = useRouter();

  const [workshops, setWorkshops] = useState<WorkshopRow[]>([]);
  const [managedUsers, setManagedUsers] = useState<ManagedUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSaving, setUserSaving] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userForm, setUserForm] = useState({
    name: "", email: "", password: "", role: "learner" as "learner" | "facilitator",
    organisation: "",
  });
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [orgLoading, setOrgLoading] = useState(false);
  const [orgSaving, setOrgSaving] = useState(false);
  const [orgSearch, setOrgSearch] = useState("");
  const [editingOrgId, setEditingOrgId] = useState<string | null>(null);
  const [orgForm, setOrgForm] = useState({
    name: "", industry: "", email: "", contactPerson: "", phone: "",
  });
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    trainerId: "",
    organisationId: "",
    modulesText: "",
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
      loadOrganisations();
      loadUsers();
    }
  }, [authorized]);

  async function loadOrganisations() {
    setOrgLoading(true);
    try {
      const response: any = await getOrganisations();
      const records = Array.isArray(response)
        ? response
        : Array.isArray(response?.organisations)
          ? response.organisations
          : Array.isArray(response?.data)
            ? response.data
            : [];
      setOrganisations(records);
    } catch (err: any) {
      setError(err?.message || "Unable to load organisations.");
    } finally {
      setOrgLoading(false);
    }
  }

  function resetOrgForm() {
    setOrgForm({ name: "", industry: "", email: "", contactPerson: "", phone: "" });
    setEditingOrgId(null);
  }

  async function saveOrganisation(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setNotice("");
    if (orgForm.name.trim().length < 2 || !orgForm.industry.trim()) {
      setError("Enter an organisation name and industry.");
      return;
    }
    setOrgSaving(true);
    try {
      const payload = {
        name: orgForm.name.trim(),
        industry: orgForm.industry.trim(),
        email: orgForm.email.trim(),
        contactPerson: orgForm.contactPerson.trim(),
        phone: orgForm.phone.trim(),
      };
      if (editingOrgId) {
        await updateOrganisation(editingOrgId, payload);
        setNotice("Organisation updated successfully.");
      } else {
        await addOrganisation(payload);
        setNotice("Organisation added successfully.");
      }
      resetOrgForm();
      await loadOrganisations();
    } catch (err: any) {
      setError(err?.message || "Unable to save organisation.");
    } finally {
      setOrgSaving(false);
    }
  }

  function startEditOrganisation(org: Organisation) {
    setEditingOrgId(org._id);
    setOrgForm({
      name: org.name || "",
      industry: org.industry || "",
      email: org.email || "",
      contactPerson: org.contactPerson || "",
      phone: org.phone || "",
    });
    document.getElementById("organisations")?.scrollIntoView({ behavior: "smooth" });
  }

  async function toggleOrganisationStatus(org: Organisation) {
    try {
      await updateOrganisation(org._id, {
        status: org.status === "Active" ? "Inactive" : "Active",
      });
      setNotice(`Organisation marked ${org.status === "Active" ? "Inactive" : "Active"}.`);
      await loadOrganisations();
    } catch (err: any) {
      setError(err?.message || "Unable to update organisation status.");
    }
  }

  async function removeOrganisation(org: Organisation) {
    if (!window.confirm(`Delete ${org.name}? This removes the organisation record only.`)) return;
    try {
      await deleteOrganisation(org._id);
      setNotice("Organisation deleted.");
      if (editingOrgId === org._id) resetOrgForm();
      await loadOrganisations();
    } catch (err: any) {
      setError(err?.message || "Unable to delete organisation.");
    }
  }

  const filteredOrganisations = organisations.filter((org) =>
    [org.name, org.industry, org.email, org.contactPerson, org.status]
      .some((value) => String(value || "").toLowerCase().includes(orgSearch.toLowerCase()))
  );


  async function loadUsers() {
    setUsersLoading(true);
    try {
      const response: any = await getUsers();
      const records = Array.isArray(response)
        ? response
        : Array.isArray(response?.users)
          ? response.users
          : Array.isArray(response?.data)
            ? response.data
            : [];
      setManagedUsers(records);
    } catch (err: any) {
      setError(err?.message || "Unable to load users.");
    } finally {
      setUsersLoading(false);
    }
  }

  function resetUserForm() {
    setUserForm({ name: "", email: "", password: "", role: "learner", organisation: "" });
    setEditingUserId(null);
  }

  async function saveUser(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setNotice("");
    if (!userForm.name.trim() || !userForm.email.trim()) {
      setError("Enter the user's name and email.");
      return;
    }
    if (!editingUserId && userForm.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }
    setUserSaving(true);
    try {
      const payload: any = {
        name: userForm.name.trim(),
        email: userForm.email.trim(),
        role: userForm.role,
        organisation: userForm.organisation || null,
      };
      if (userForm.password) payload.password = userForm.password;
      if (editingUserId) {
        await updateUser(editingUserId, payload);
        setNotice("User updated successfully.");
      } else {
        await addUser(payload);
        setNotice("User created successfully.");
      }
      resetUserForm();
      await loadUsers();
    } catch (err: any) {
      setError(err?.message || "Unable to save user.");
    } finally {
      setUserSaving(false);
    }
  }

  function startEditUser(user: ManagedUser) {
    setEditingUserId(user._id);
    setUserForm({
      name: user.name || "",
      email: user.email || "",
      password: "",
      role: user.role === "facilitator" ? "facilitator" : "learner",
      organisation: typeof user.organisation === "string"
        ? user.organisation
        : user.organisation?._id || "",
    });
    document.getElementById("users")?.scrollIntoView({ behavior: "smooth" });
  }

  async function toggleUserStatus(user: ManagedUser) {
    try {
      const nextStatus = user.status === "Inactive" ? "Active" : "Inactive";
      await updateUser(user._id, { status: nextStatus });
      setNotice(`${user.name} is now ${nextStatus.toLowerCase()}.`);
      await loadUsers();
    } catch (err: any) {
      setError(err?.message || "Unable to update user status.");
    }
  }

  async function removeUser(user: ManagedUser) {
    if (!window.confirm(`Delete user ${user.name}? This cannot be undone.`)) return;
    try {
      await deleteUser(user._id);
      setNotice("User deleted successfully.");
      if (editingUserId === user._id) resetUserForm();
      await loadUsers();
    } catch (err: any) {
      setError(err?.message || "Unable to delete user.");
    }
  }

  const filteredUsers = managedUsers.filter((user) => {
    const orgName = typeof user.organisation === "object" && user.organisation
      ? user.organisation.name
      : "";
    const query = userSearch.toLowerCase();
    return [user.name, user.email, user.role, user.status, orgName]
      .some((value) => String(value || "").toLowerCase().includes(query));
  });

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

    const selectedTrainer = managedUsers.find(
      (user) => user._id === form.trainerId && user.role === "facilitator"
    );

    if (form.trainerId && !selectedTrainer) {
      setError("Please select a valid trainer.");
      return;
    }

    const selectedOrganisation = organisations.find(
      (org) => org._id === form.organisationId && org.status === "Active"
    );

    if (form.organisationId && !selectedOrganisation) {
      setError("Please select an active organisation.");
      return;
    }

    setSaving(true);

    try {
      const modules = form.modulesText
        .split("\n")
        .map((title) => title.trim())
        .filter(Boolean)
        .map((title, index) => ({
          title,
          description: "",
          content: "",
          order: index + 1,
          duration: 0,
        }));

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        cat: form.category || "General",
        trainer: form.trainerId || undefined,
        facilitator: selectedTrainer?.name || "",
        organisation: form.organisationId || undefined,
        date: form.date,
        capacity,
        modules,
        status: "Draft",
      };

      await addWorkshop(payload);

      setForm({
        title: "",
        category: "",
        description: "",
        trainerId: "",
        organisationId: "",
        modulesText: "",
        date: "",
        capacity: "30",
      });

      setNotice("Learning programme created successfully.");
      await loadWorkshops();
    } catch (err: any) {
      setError(err?.message || "Could not create learning programme.");
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

  async function openCountryProgramme(searchTitle: string) {
    try {
      setError("");
      const response: any = await getWorkshops();
      const records = Array.isArray(response)
        ? response
        : Array.isArray(response?.workshops)
          ? response.workshops
          : Array.isArray(response?.data)
            ? response.data
            : [];

      const target = searchTitle.trim().toLowerCase();
      const programme = records.find((item: any) =>
        String(item?.title || "").trim().toLowerCase() === target
      );

      if (!programme) {
        setError(`No programme found for "${searchTitle}". Create it under Learning Programs first.`);
        return;
      }

      const programmeId = programme._id || programme.id;
      if (!programmeId) {
        setError("The programme was found, but it has no valid ID.");
        return;
      }

      router.push(`/admin/programs/${programmeId}`);
    } catch (err: any) {
      setError(err?.message || "Unable to open this learning programme.");
    }
  }

  if (!authorized || loading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-rose-600/20 border-t-rose-600" />
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
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#090909] via-[#171114] to-[#4a1022] p-6 text-white shadow-xl sm:p-8">
          <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-rose-500/10 blur-3xl" />
          <div className="absolute -bottom-20 right-1/3 h-52 w-52 rounded-full bg-rose-500/10 blur-3xl" />

          <div className="relative z-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-rose-200">
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
                <span className="rounded-xl bg-rose-500/10 p-3 text-blue-500">
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
                <span className="rounded-xl bg-rose-600/10 p-3 text-rose-700">
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
                <span className="rounded-xl bg-stone-500/10 p-3 text-stone-600">
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
                <span className="rounded-xl bg-rose-600/10 p-3 text-rose-700">
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

              <span className="rounded-lg bg-teal-500/10 px-3 py-1.5 text-xs font-semibold text-rose-700">
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
                      className="w-full rounded-t-lg bg-gradient-to-t from-rose-800 to-rose-500 transition-all"
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
                <BarChart3 className="text-rose-600" size={21} />
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
                  className="h-full rounded-full bg-gradient-to-r from-rose-700 to-rose-500 transition-all"
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
        {/* User management */}
        <section id="users" className={`${panel} scroll-mt-24 overflow-hidden`}>
          <div className="flex flex-col justify-between gap-3 border-b border-[var(--border)] p-5 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <Users className="text-rose-600" size={20} />
                <h3 className="text-lg font-bold text-[var(--text)]">User management</h3>
              </div>
              <p className="mt-1 text-sm text-[var(--muted)]">Create employees and trainers, assign organisations, and manage accounts.</p>
            </div>
            <span className="rounded-xl bg-[var(--surface)] px-4 py-2 text-sm text-[var(--muted)]">
              <strong className="text-[var(--text)]">{managedUsers.length}</strong> users
            </span>
          </div>
          <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
            <form onSubmit={saveUser} className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-semibold text-[var(--text)]">{editingUserId ? "Edit user" : "Create user"}</h4>
                {editingUserId && <button type="button" onClick={resetUserForm} className="text-xs font-medium text-rose-600">Cancel edit</button>}
              </div>
              <input className={inputStyle} placeholder="Full name *" value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} required />
              <input className={inputStyle} type="email" placeholder="Email address *" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} required />
              <input className={inputStyle} type="password" placeholder={editingUserId ? "New password (optional)" : "Temporary password (min. 6 characters)"} value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} minLength={editingUserId ? 0 : 6} required={!editingUserId} autoComplete="new-password" />
              <select className={inputStyle} value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value as "learner" | "facilitator" })}>
                <option value="learner">Employee / Learner</option>
                <option value="facilitator">Trainer / Facilitator</option>
              </select>
              <select className={inputStyle} value={userForm.organisation} onChange={(e) => setUserForm({ ...userForm, organisation: e.target.value })}>
                <option value="">No organisation assigned</option>
                {organisations.filter((org) => org.status === "Active").map((org) => (
                  <option key={org._id} value={org._id}>{org.name}</option>
                ))}
              </select>
              <button disabled={userSaving} type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60">
                <Plus size={16} /> {userSaving ? "Saving..." : editingUserId ? "Save user changes" : "Create user"}
              </button>
              <p className="text-xs leading-5 text-[var(--muted)]">The password is hashed by the backend. Admin accounts cannot be created from this form.</p>
            </form>

            <div className="min-w-0">
              <div className="mb-3 flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={16} />
                  <input className={`${inputStyle} pl-9`} placeholder="Search name, email, role or organisation..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)} />
                </div>
                <button type="button" onClick={loadUsers} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] px-4 py-2 text-sm text-[var(--text)] hover:bg-[var(--surface)]">
                  <RefreshCw size={15} /> Refresh
                </button>
              </div>
              {usersLoading ? (
                <div className="rounded-xl border border-[var(--border)] p-8 text-center text-sm text-[var(--muted)]">Loading users...</div>
              ) : filteredUsers.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[var(--border)] p-8 text-center">
                  <Users className="mx-auto mb-2 text-[var(--muted)]" size={28} />
                  <p className="font-medium text-[var(--text)]">No users found</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">Create an employee or trainer using the form.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredUsers.map((user) => {
                    const orgName = typeof user.organisation === "object" && user.organisation
                      ? user.organisation.name
                      : "No organisation";
                    return (
                      <article key={user._id} className="rounded-xl border border-[var(--border)] p-4">
                        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h5 className="font-semibold text-[var(--text)]">{user.name}</h5>
                              <span className="rounded-full bg-rose-500/10 px-2.5 py-1 text-xs font-medium capitalize text-rose-600">{user.role}</span>
                              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${user.status === "Inactive" ? "bg-[var(--surface)] text-[var(--muted)]" : "bg-emerald-500/10 text-emerald-600"}`}>{user.status || "Active"}</span>
                            </div>
                            <p className="mt-1 break-all text-sm text-[var(--muted)]">{user.email}</p>
                            <p className="mt-1 text-xs text-[var(--muted)]">Organisation: {orgName}</p>
                          </div>
                          <div className="flex shrink-0 flex-wrap gap-2">
                            <button type="button" onClick={() => startEditUser(user)} className="rounded-lg border border-[var(--border)] p-2 text-[var(--text)] hover:bg-[var(--surface)]" aria-label="Edit user"><Pencil size={15} /></button>
                            <button type="button" onClick={() => toggleUserStatus(user)} className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs text-[var(--text)] hover:bg-[var(--surface)]">{user.status === "Inactive" ? "Activate" : "Deactivate"}</button>
                            <button type="button" onClick={() => removeUser(user)} className="rounded-lg border border-rose-500/30 p-2 text-rose-600 hover:bg-rose-500/10" aria-label="Delete user"><Trash2 size={15} /></button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Organisation management */}
        <section id="organisations" className={`${panel} scroll-mt-24 overflow-hidden`}>
          <div className="flex flex-col justify-between gap-3 border-b border-[var(--border)] p-5 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="text-rose-600" size={20} />
                <h3 className="text-lg font-bold text-[var(--text)]">Organisation management</h3>
              </div>
              <p className="mt-1 text-sm text-[var(--muted)]">Add and manage the companies using CultureBridge.</p>
            </div>
            <div className="rounded-xl bg-[var(--surface)] px-4 py-2 text-sm text-[var(--muted)]">
              <strong className="text-[var(--text)]">{organisations.length}</strong> organisations
            </div>
          </div>

          <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <form onSubmit={saveOrganisation} className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <h4 className="font-semibold text-[var(--text)]">{editingOrgId ? "Edit organisation" : "Add an organisation"}</h4>
                {editingOrgId && <button type="button" onClick={resetOrgForm} className="text-xs font-medium text-rose-600">Cancel edit</button>}
              </div>
              <input className={inputStyle} placeholder="Organisation name *" value={orgForm.name} onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })} required />
              <input className={inputStyle} placeholder="Industry * (e.g. Information Technology)" value={orgForm.industry} onChange={(e) => setOrgForm({ ...orgForm, industry: e.target.value })} required />
              <input className={inputStyle} type="email" placeholder="Organisation email" value={orgForm.email} onChange={(e) => setOrgForm({ ...orgForm, email: e.target.value })} />
              <input className={inputStyle} placeholder="Contact person" value={orgForm.contactPerson} onChange={(e) => setOrgForm({ ...orgForm, contactPerson: e.target.value })} />
              <input className={inputStyle} placeholder="Phone number" value={orgForm.phone} onChange={(e) => setOrgForm({ ...orgForm, phone: e.target.value })} />
              <button disabled={orgSaving} type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60">
                <Plus size={16} /> {orgSaving ? "Saving..." : editingOrgId ? "Save changes" : "Add organisation"}
              </button>
            </form>

            <div className="min-w-0">
              <div className="mb-3 flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={16} />
                  <input className={`${inputStyle} pl-9`} placeholder="Search organisations..." value={orgSearch} onChange={(e) => setOrgSearch(e.target.value)} />
                </div>
                <button type="button" onClick={loadOrganisations} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] px-4 py-2 text-sm text-[var(--text)] hover:bg-[var(--surface)]">
                  <RefreshCw size={15} /> Refresh
                </button>
              </div>
              {orgLoading ? (
                <div className="rounded-xl border border-[var(--border)] p-8 text-center text-sm text-[var(--muted)]">Loading organisations...</div>
              ) : filteredOrganisations.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[var(--border)] p-8 text-center">
                  <Building2 className="mx-auto mb-2 text-[var(--muted)]" size={28} />
                  <p className="font-medium text-[var(--text)]">No organisations found</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">Add your first organisation using the form.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredOrganisations.map((org) => (
                    <article key={org._id} className="rounded-xl border border-[var(--border)] p-4">
                      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h5 className="font-semibold text-[var(--text)]">{org.name}</h5>
                            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${org.status === "Active" ? "bg-emerald-500/10 text-emerald-600" : "bg-[var(--surface)] text-[var(--muted)]"}`}>{org.status || "Active"}</span>
                          </div>
                          <p className="mt-1 text-sm text-[var(--muted)]">{org.industry}</p>
                          {org.contactPerson && <p className="mt-2 text-xs text-[var(--muted)]">Contact: {org.contactPerson}</p>}
                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--muted)]">
                            {org.email && <span className="inline-flex items-center gap-1"><Mail size={13} />{org.email}</span>}
                            {org.phone && <span className="inline-flex items-center gap-1"><Phone size={13} />{org.phone}</span>}
                          </div>
                        </div>
                        <div className="flex shrink-0 flex-wrap gap-2">
                          <button type="button" onClick={() => startEditOrganisation(org)} className="rounded-lg border border-[var(--border)] p-2 text-[var(--text)] hover:bg-[var(--surface)]" aria-label="Edit organisation"><Pencil size={15} /></button>
                          <button type="button" onClick={() => toggleOrganisationStatus(org)} className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs text-[var(--text)] hover:bg-[var(--surface)]">{org.status === "Active" ? "Deactivate" : "Activate"}</button>
                          <button type="button" onClick={() => removeOrganisation(org)} className="rounded-lg border border-rose-500/30 p-2 text-rose-600 hover:bg-rose-500/10" aria-label="Delete organisation"><Trash2 size={15} /></button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
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
                            onClick={() => router.push(`/admin/programs/${w.id}`)}
                            title="Open programme details"
                            className="rounded-lg border border-[var(--border)] p-2 text-[var(--muted)] transition hover:border-rose-500/40 hover:text-rose-600"
                          >
                            <BookOpen size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleWorkshop(w)}
                            title={
                              w.status.toLowerCase() === "published"
                                ? "Move to draft"
                                : "Publish workshop"
                            }
                            className="rounded-lg border border-[var(--border)] p-2 text-[var(--muted)] transition hover:border-teal-500/40 hover:text-rose-600"
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

        {/* Create programme */}
        <section
  id="programs"
  className={`${panel} p-5 sm:p-6 scroll-mt-24`}
>
          <div className="mb-6 flex items-start gap-3">
            <div className="rounded-xl bg-rose-600/10 p-3 text-rose-700">
              <Plus size={22} />
            </div>

            <div>
              <h3 className="text-lg font-bold text-[var(--text)]">
                Create a learning programme
              </h3>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Create a programme, assign a trainer and organisation, and outline its modules.
              </p>
            </div>
          </div>

          <form onSubmit={createWorkshop} className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--text)]">
                  Programme title *
                </label>
                <input
                  required
                  minLength={4}
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                  placeholder="Enter programme title"
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
                  Assign trainer
                </label>
                <select
                  value={form.trainerId}
                  onChange={(e) =>
                    setForm({ ...form, trainerId: e.target.value })
                  }
                  className={inputStyle}
                >
                  <option value="">Select a trainer (optional)</option>
                  {managedUsers
                    .filter((user) => user.role === "facilitator" && user.status !== "Inactive")
                    .map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.name} — {user.email}
                      </option>
                    ))}
                </select>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  Only active trainer accounts are listed.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--text)]">
                  Assign organisation
                </label>
                <select
                  value={form.organisationId}
                  onChange={(e) =>
                    setForm({ ...form, organisationId: e.target.value })
                  }
                  className={inputStyle}
                >
                  <option value="">No organisation (general programme)</option>
                  {organisations
                    .filter((org) => org.status === "Active")
                    .map((org) => (
                      <option key={org._id} value={org._id}>
                        {org.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-[var(--text)]">
                  Programme description
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Describe the learning outcomes and audience..."
                  className={inputStyle}
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-[var(--text)]">
                  Learning modules
                </label>
                <textarea
                  rows={4}
                  value={form.modulesText}
                  onChange={(e) =>
                    setForm({ ...form, modulesText: e.target.value })
                  }
                  placeholder={"Enter one module title per line, e.g.\nJapanese workplace culture\nProfessional communication\nMeetings and teamwork"}
                  className={inputStyle}
                />
                <p className="mt-1 text-xs text-[var(--muted)]">
                  Each line becomes a separate module. You can add detailed lesson content in a later module editor.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--text)]">
                  Programme date *
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
                    description: "",
                    trainerId: "",
                    organisationId: "",
                    modulesText: "",
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
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#881337] to-[#be3455] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-900/15 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <RefreshCw size={17} className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus size={17} />
                    Create programme
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* Country Learning Paths */}
<section
  id="countries"
  className={`${panel} p-5 sm:p-6 scroll-mt-24`}
>
  <div className="mb-6">
    <div className="flex items-center gap-3">
      <Globe2 size={22} className="text-rose-500" />
      <h2 className="text-lg font-bold text-[var(--text)]">
        Country Learning Paths
      </h2>
    </div>
    <p className="mt-2 text-sm text-[var(--muted)]">
      Build learning journeys that prepare professionals to work
      confidently across different cultures.
    </p>
  </div>

  <div className="grid gap-4 md:grid-cols-2">
    <button
      type="button"
      onClick={() => openCountryProgramme("India-Japan Workplace Readiness")}
      className="w-full rounded-xl border border-[var(--border)] p-5 text-left transition hover:border-rose-500 hover:bg-rose-500/5 focus:outline-none focus:ring-2 focus:ring-rose-500/40"
    >
      <h3 className="font-semibold text-[var(--text)]">
        India–Japan Workplace Readiness
      </h3>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Japanese workplace etiquette, communication,
        teamwork and professional collaboration.
      </p>
      <span className="mt-4 inline-block text-xs text-rose-500">
        Open learning programme →
      </span>
    </button>

    <button
      type="button"
      onClick={() => openCountryProgramme("Global Workplace Communication")}
      className="w-full rounded-xl border border-[var(--border)] p-5 text-left transition hover:border-rose-500 hover:bg-rose-500/5 focus:outline-none focus:ring-2 focus:ring-rose-500/40"
    >
      <h3 className="font-semibold text-[var(--text)]">
        Global Workplace Communication
      </h3>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Inclusive communication, international meetings,
        feedback and remote teamwork.
      </p>
      <span className="mt-4 inline-block text-xs text-rose-500">
        Open learning programme →
      </span>
    </button>
  </div>
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