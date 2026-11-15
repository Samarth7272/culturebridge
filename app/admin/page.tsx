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
  Settings,
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
  trainerId: string;
  date: string;
  capacity: number;
  registered: number;
  completed: number;
  status: string;
};

type AdminReportLearner = {
  learnerId: string;
  learnerName: string;
  learnerEmail: string;
  programmeId: string;
  programmeName: string;
  progressPercentage: number;
  preQuiz: { score: number; total: number; percentage: number; completedAt?: string } | null;
  postQuiz: { score: number; total: number; percentage: number; completedAt?: string } | null;
  quizAttempts: number;
  scenariosCompleted: number;
  scenariosTotal: number;
  scenariosCorrect: number;
  certificateEligible: boolean;
};

type AdminReportProgramme = {
  programmeId: string;
  programmeName: string;
  status: string;
  enrolledCount: number;
  learnersStarted: number;
  preQuizAverage: number | null;
  postQuizAverage: number | null;
  scenarioAttempts: number;
  scenarioAccuracy: number | null;
  scenarioCompletionRate: number | null;
  certificateEligibleCount: number;
};

type AdminReports = {
  summary: {
    totalProgrammes: number;
    totalEnrolments: number;
    learnersWithProgress: number;
    totalQuizAttempts: number;
    preQuizAverage: number | null;
    postQuizAverage: number | null;
    totalScenarioResponses: number;
    scenarioAccuracy: number | null;
    certificateEligibleCount: number;
  };
  programmes: AdminReportProgramme[];
  learners: AdminReportLearner[];
  generatedAt: string;
};

function reportPercent(value: number | null | undefined): string {
  return typeof value === "number" && Number.isFinite(value)
    ? `${value}%`
    : "No data";
}

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

// Handles both a raw MongoDB ObjectId string and a populated MongoDB reference.
function getMongoId(value: any): string {
  if (value === null || value === undefined || value === "") return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);

  if (typeof value === "object") {
    const id = value._id ?? value.id ?? value.$oid;
    return id === value ? "" : getMongoId(id);
  }

  return "";
}

function normalizeWorkshop(item: any): WorkshopRow {
  const trainerId = getMongoId(item?.trainer);
  const populatedTrainerName = getText(item?.trainer?.name, "");

  return {
    id: getMongoId(item?._id || item?.id),
    title: getText(item?.title, "Untitled workshop"),
    category: getText(item?.cat || item?.category, "General"),
    // The populated trainer reference is the source of truth when available.
    facilitator:
      populatedTrainerName ||
      getText(item?.facilitator || item?.trainer, "Not assigned"),
    trainerId,
    date: getText(item?.date, ""),
    capacity: Number(item?.capacity) || 0,
    registered: Number(item?.registered) || 0,
    completed: Number(item?.completed) || 0,
    status: getText(item?.status, "Draft"),
  };
}



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
  const [editingTrainerWorkshopId, setEditingTrainerWorkshopId] = useState<string | null>(null);
  const [editingTrainerId, setEditingTrainerId] = useState("");
  const [trainerSaving, setTrainerSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [adminReports, setAdminReports] = useState<AdminReports | null>(null);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState("");
  const [adminAccount, setAdminAccount] = useState({ name: "Admin", email: "" });

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

      setAdminAccount({
        name: String(user.name || user.fullName || "Admin"),
        email: String(user.email || ""),
      });
      setAuthorized(true);
    } catch {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      router.replace("/login");
    }
  }, [router]);

  async function loadWorkshops(): Promise<WorkshopRow[] | null> {
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

      const normalized = records.map(normalizeWorkshop);
      setWorkshops(normalized);
      return normalized;
    } catch (err: any) {
      setError(err?.message || "Unable to load workshops.");
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function loadAdminReports() {
    setReportsLoading(true);
    setReportsError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Your admin session has expired. Please log in again.");
      }

      const apiBase =
        process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ||
        "http://localhost:5000/api";

      const response = await fetch(`${apiBase}/progress/admin/reports`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.message || `Report request failed (${response.status}).`);
      }

      setAdminReports(data as AdminReports);
    } catch (err: any) {
      setReportsError(err?.message || "Unable to load assessment reports.");
    } finally {
      setReportsLoading(false);
    }
  }

  useEffect(() => {
    if (authorized) {
      loadWorkshops();
      loadOrganisations();
      loadUsers();
      loadAdminReports();
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

  function startTrainerEdit(workshop: WorkshopRow) {
    // Prefer the actual saved MongoDB trainer ID, not the display-name field.
    const savedTrainerId = getMongoId(workshop.trainerId);
    const matchedTrainer = managedUsers.find((user) => {
      const sameId = getMongoId(user._id) === savedTrainerId;
      const sameName =
        String(user.name || "").trim().toLowerCase() ===
        String(workshop.facilitator || "").trim().toLowerCase();
      return (
        user.role === "facilitator" &&
        user.status !== "Inactive" &&
        (sameId || (!savedTrainerId && sameName))
      );
    });

    setEditingTrainerWorkshopId(workshop.id);
    setEditingTrainerId(savedTrainerId || getMongoId(matchedTrainer?._id));
    setError("");
    setNotice("");
  }

  async function saveTrainerAssignment(workshop: WorkshopRow) {
    setError("");
    setNotice("");

    // Capture the selected value once so the request and validation use the same ID.
    const selectedTrainerId = getMongoId(editingTrainerId);
    const selectedTrainer = managedUsers.find(
      (user) =>
        getMongoId(user._id) === selectedTrainerId &&
        user.role === "facilitator" &&
        user.status !== "Inactive"
    );

    if (selectedTrainerId && !selectedTrainer) {
      setError("The selected account is not an active facilitator. Refresh User Management and try again.");
      return;
    }

    setTrainerSaving(true);
    try {
      const payload = {
        trainer: selectedTrainerId || null,
        facilitator: selectedTrainer?.name || "",
      };

      // Save to the backend first.
      const updateResponse: any = await updateWorkshop(workshop.id, payload);
      const responseTrainerId = getMongoId(
        updateResponse?.trainer ?? updateResponse?.data?.trainer
      );

      if (selectedTrainerId && responseTrainerId && responseTrainerId !== selectedTrainerId) {
        throw new Error("The server returned a different trainer than the one selected. The assignment was not confirmed.");
      }

      // Read the record back from the server. Do not show success unless the
      // persisted trainer reference matches the selected MongoDB user ID.
      const refreshedWorkshops = await loadWorkshops();
      if (!refreshedWorkshops) {
        throw new Error("The update request completed, but the programme could not be reloaded to verify the assignment.");
      }

      const refreshedWorkshop = refreshedWorkshops.find(
        (item) => item.id === workshop.id
      );

      if (!refreshedWorkshop) {
        throw new Error("The programme was not returned when verifying the update.");
      }

      if (refreshedWorkshop.trainerId !== selectedTrainerId) {
        throw new Error(
          `The server did not persist the selected trainer. Expected ID ${selectedTrainerId || "(unassigned)"}, but received ${refreshedWorkshop.trainerId || "(no trainer ID)"}. Check the PATCH /api/workshops/:id route and confirm it saves the trainer field.`
        );
      }

      setNotice(
        selectedTrainer
          ? `${selectedTrainer.name} is now assigned to ${workshop.title}.`
          : `Trainer removed from ${workshop.title}.`
      );
      setEditingTrainerWorkshopId(null);
      setEditingTrainerId("");
    } catch (err: any) {
      setError(err?.message || "Unable to update trainer assignment.");
      // Keep the editor open and retain the selected ID so the user can retry.
    } finally {
      setTrainerSaving(false);
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

  // These totals are derived from the current backend responses, not sample data.
  const totalLearners = managedUsers.filter(
    (user) => String(user.role).toLowerCase() === "learner"
  ).length;

  const totalFacilitators = managedUsers.filter(
    (user) => String(user.role).toLowerCase() === "facilitator"
  ).length;

  const activeAccounts = managedUsers.filter(
    (user) => String(user.status || "Active").toLowerCase() !== "inactive"
  ).length;

  const totalOrganisations = organisations.length;
  const totalUsersCount = managedUsers.length;

  const programmeAnalytics = [...workshops].sort(
    (a, b) => b.registered - a.registered
  );

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
              onClick={() => {
                loadWorkshops();
                loadOrganisations();
                loadUsers();
                loadAdminReports();
              }}
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
              Current programme and account totals from your workspace.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className={`${panel} p-5`}>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--muted)]">Learning programmes</span>
                <span className="rounded-xl bg-rose-500/10 p-3 text-blue-500">
                  <CalendarDays size={21} />
                </span>
              </div>
              <p className="mt-4 text-3xl font-bold text-[var(--text)]">{totalWorkshops}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">All programmes in the workspace</p>
            </div>

            <div className={`${panel} p-5`}>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--muted)]">Learners</span>
                <span className="rounded-xl bg-rose-600/10 p-3 text-rose-700">
                  <Users size={21} />
                </span>
              </div>
              <p className="mt-4 text-3xl font-bold text-[var(--text)]">{totalLearners}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">Learner accounts</p>
            </div>

            <div className={`${panel} p-5`}>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--muted)]">Facilitators</span>
                <span className="rounded-xl bg-stone-500/10 p-3 text-stone-600">
                  <GraduationCap size={21} />
                </span>
              </div>
              <p className="mt-4 text-3xl font-bold text-[var(--text)]">{totalFacilitators}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">Trainer accounts</p>
            </div>

            <div className={`${panel} p-5`}>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--muted)]">Published programmes</span>
                <span className="rounded-xl bg-rose-600/10 p-3 text-rose-700">
                  <BookOpen size={21} />
                </span>
              </div>
              <p className="mt-4 text-3xl font-bold text-[var(--text)]">{publishedCount}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">Available to enrolled learners</p>
            </div>

            <div className={`${panel} p-5`}>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--muted)]">Total enrolments</span>
                <span className="rounded-xl bg-teal-500/10 p-3 text-teal-700">
                  <Users size={21} />
                </span>
              </div>
              <p className="mt-4 text-3xl font-bold text-[var(--text)]">{totalRegistered}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">Sum of programme registrations</p>
            </div>

            <div className={`${panel} p-5`}>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--muted)]">Completion rate</span>
                <span className="rounded-xl bg-rose-600/10 p-3 text-rose-700">
                  <BarChart3 size={21} />
                </span>
              </div>
              <p className="mt-4 text-3xl font-bold text-[var(--text)]">{completionRate}%</p>
              <p className="mt-1 text-xs text-[var(--muted)]">Based on recorded programme completions</p>
            </div>
          </div>
        </section>

        {/* Analytics */}
        <section id="analytics" className="grid scroll-mt-24 gap-4 xl:grid-cols-3">
          <div className={`${panel} p-5 xl:col-span-2`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-[var(--text)]">Programme performance</h3>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  Enrolments and completions from the current programme records.
                </p>
              </div>
              <span className="rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                Backend data
              </span>
            </div>

            {programmeAnalytics.length === 0 ? (
              <div className="mt-5 rounded-xl border border-dashed border-[var(--border)] p-8 text-center text-sm text-[var(--muted)]">
                No programme data is available yet.
              </div>
            ) : (
              <div className="mt-5 space-y-5">
                {programmeAnalytics.map((programme) => {
                  const rate = programme.registered > 0
                    ? Math.min(100, Math.round((programme.completed / programme.registered) * 100))
                    : 0;
                  const occupancy = programme.capacity > 0
                    ? Math.min(100, Math.round((programme.registered / programme.capacity) * 100))
                    : 0;

                  return (
                    <div key={programme.id} className="space-y-2">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="break-words text-sm font-semibold text-[var(--text)]">{programme.title}</p>
                          <p className="mt-1 text-xs text-[var(--muted)]">
                            {programme.registered} enrolled · {programme.completed} completed · Capacity {programme.capacity || "not set"}
                          </p>
                        </div>
                        <span className="rounded-full bg-[var(--surface-2)] px-2.5 py-1 text-xs font-medium text-[var(--muted)]">
                          {programme.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[var(--surface-2)]">
                          <div className="h-full rounded-full bg-gradient-to-r from-rose-800 to-rose-500" style={{ width: `${rate}%` }} />
                        </div>
                        <span className="w-12 text-right text-xs font-semibold text-[var(--text)]">{rate}%</span>
                      </div>
                      <p className="text-[11px] text-[var(--muted)]">Capacity used: {occupancy}%</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className={`${panel} p-5`}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[var(--text)]">People and organisations</h3>
              <Building2 className="text-rose-600" size={21} />
            </div>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Account and organisation totals currently available to the admin workspace.
            </p>

            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                <span className="text-sm text-[var(--muted)]">Total accounts</span>
                <strong className="text-[var(--text)]">{totalUsersCount}</strong>
              </div>
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                <span className="text-sm text-[var(--muted)]">Active accounts</span>
                <strong className="text-[var(--text)]">{activeAccounts}</strong>
              </div>
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                <span className="text-sm text-[var(--muted)]">Organisations</span>
                <strong className="text-[var(--text)]">{totalOrganisations}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--muted)]">Draft programmes</span>
                <strong className="text-[var(--text)]">{Math.max(0, totalWorkshops - publishedCount)}</strong>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <div className="flex items-center justify-between gap-3">
                <h4 className="text-sm font-semibold text-[var(--text)]">Assessment snapshot</h4>
                <button
                  type="button"
                  onClick={loadAdminReports}
                  disabled={reportsLoading}
                  className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-medium text-[var(--text)] hover:bg-[var(--surface-2)] disabled:opacity-60"
                >
                  <RefreshCw size={13} className={reportsLoading ? "animate-spin" : ""} />
                  Refresh reports
                </button>
              </div>
              {reportsError ? (
                <p className="mt-3 text-xs text-rose-600">{reportsError}</p>
              ) : (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-[var(--muted)]">Pre-quiz average</p>
                    <p className="mt-1 text-xl font-bold text-[var(--text)]">{reportPercent(adminReports?.summary.preQuizAverage)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--muted)]">Post-quiz average</p>
                    <p className="mt-1 text-xl font-bold text-[var(--text)]">{reportPercent(adminReports?.summary.postQuizAverage)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--muted)]">Scenario accuracy</p>
                    <p className="mt-1 text-xl font-bold text-[var(--text)]">{reportPercent(adminReports?.summary.scenarioAccuracy)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--muted)]">Quiz attempts</p>
                    <p className="mt-1 text-xl font-bold text-[var(--text)]">{adminReports?.summary.totalQuizAttempts ?? "—"}</p>
                  </div>
                </div>
              )}
              <p className="mt-3 text-[11px] text-[var(--muted)]">
                {adminReports?.generatedAt
                  ? `Report updated ${new Date(adminReports.generatedAt).toLocaleString()}`
                  : reportsLoading ? "Loading live assessment data…" : "Assessment report has not loaded yet."}
              </p>
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
                          {editingTrainerWorkshopId === w.id ? (
                            <div className="flex min-w-[260px] flex-wrap items-center justify-end gap-2">
                              <select
                                aria-label={`Assign trainer for ${w.title}`}
                                value={editingTrainerId}
                                onChange={(e) => setEditingTrainerId(e.target.value)}
                                className="max-w-[190px] rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-2 text-xs text-[var(--text)]"
                              >
                                <option value="">Unassigned</option>
                                {managedUsers
                                  .filter(
                                    (user) =>
                                      user.role === "facilitator" &&
                                      String(user.status || "Active").toLowerCase() === "active" &&
                                      Boolean(getMongoId(user._id))
                                  )
                                  .map((user) => (
                                    <option key={getMongoId(user._id)} value={getMongoId(user._id)}>
                                      {user.name} — {user.email}
                                    </option>
                                  ))}
                              </select>
                              <span className="w-full text-right text-[10px] text-[var(--muted)]">
                                {editingTrainerId
                                  ? `Selected: ${managedUsers.find((user) => getMongoId(user._id) === editingTrainerId)?.email || "Loading trainer account…"}`
                                  : "No trainer assigned"}
                              </span>
                              <button
                                type="button"
                                onClick={() => saveTrainerAssignment(w)}
                                disabled={trainerSaving}
                                className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                              >
                                {trainerSaving ? "Saving…" : "Save"}
                              </button>
                              <button
                                type="button"
                                onClick={() => { setEditingTrainerWorkshopId(null); setEditingTrainerId(""); }}
                                className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs text-[var(--text)]"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => startTrainerEdit(w)}
                              title="Change assigned trainer"
                              aria-label={`Change trainer for ${w.title}`}
                              className="rounded-lg border border-[var(--border)] p-2 text-[var(--muted)] transition hover:border-rose-500/40 hover:text-rose-600"
                            >
                              <Pencil size={16} />
                            </button>
                          )}
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

        {/* Assessments and learner performance */}
        <section id="assessments" className={`${panel} scroll-mt-24 overflow-hidden`}>
          <div className="flex flex-col justify-between gap-3 border-b border-[var(--border)] p-5 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-rose-600" size={20} />
                <h3 className="text-lg font-bold text-[var(--text)]">Assessments & learner performance</h3>
              </div>
              <p className="mt-1 text-sm text-[var(--muted)]">Saved quiz scores, scenario responses and learner progress from MongoDB.</p>
            </div>
            <button
              type="button"
              onClick={loadAdminReports}
              disabled={reportsLoading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface-2)] disabled:opacity-60"
            >
              <RefreshCw size={15} className={reportsLoading ? "animate-spin" : ""} />
              {reportsLoading ? "Refreshing…" : "Refresh reports"}
            </button>
          </div>

          <div className="p-5">
            {reportsError && (
              <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-600">{reportsError}</div>
            )}
            {reportsLoading && !adminReports ? (
              <div className="rounded-xl border border-dashed border-[var(--border)] p-8 text-center text-sm text-[var(--muted)]">Loading assessment reports…</div>
            ) : !adminReports || adminReports.learners.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[var(--border)] p-8 text-center">
                <Users className="mx-auto mb-2 text-[var(--muted)]" size={28} />
                <p className="font-semibold text-[var(--text)]">No learner assessment records yet</p>
                <p className="mt-1 text-sm text-[var(--muted)]">Assessment results will appear here after learners complete quizzes or scenarios.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted)]">
                      <th className="px-3 py-3 font-semibold">Learner / programme</th>
                      <th className="px-3 py-3 font-semibold">Progress</th>
                      <th className="px-3 py-3 font-semibold">Pre-quiz</th>
                      <th className="px-3 py-3 font-semibold">Post-quiz</th>
                      <th className="px-3 py-3 font-semibold">Scenarios</th>
                      <th className="px-3 py-3 font-semibold">Certificate readiness</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminReports.learners.map((learner, index) => (
                      <tr key={`${learner.learnerId}-${learner.programmeId}-${index}`} className="border-b border-[var(--border)] last:border-0">
                        <td className="px-3 py-4">
                          <p className="font-semibold text-[var(--text)]">{learner.learnerName}</p>
                          <p className="mt-0.5 text-xs text-[var(--muted)]">{learner.learnerEmail}</p>
                          <p className="mt-1 text-xs text-rose-600">{learner.programmeName}</p>
                        </td>
                        <td className="px-3 py-4 font-semibold text-[var(--text)]">{learner.progressPercentage}%</td>
                        <td className="px-3 py-4 text-[var(--text)]">{learner.preQuiz ? `${learner.preQuiz.score}/${learner.preQuiz.total} (${learner.preQuiz.percentage}%)` : "Not attempted"}</td>
                        <td className="px-3 py-4 text-[var(--text)]">{learner.postQuiz ? `${learner.postQuiz.score}/${learner.postQuiz.total} (${learner.postQuiz.percentage}%)` : "Not attempted"}</td>
                        <td className="px-3 py-4 text-[var(--text)]">{learner.scenariosCompleted}/{learner.scenariosTotal} · {learner.scenariosCorrect} correct</td>
                        <td className="px-3 py-4">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${learner.certificateEligible ? "bg-emerald-500/10 text-emerald-600" : "bg-[var(--surface-2)] text-[var(--muted)]"}`}>
                            {learner.certificateEligible ? "Eligible" : "In progress"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* Certificate readiness report */}
        <section id="certificates" className={`${panel} scroll-mt-24 overflow-hidden`}>
          <div className="border-b border-[var(--border)] p-5">
            <div className="flex items-center gap-2">
              <GraduationCap className="text-rose-600" size={21} />
              <h3 className="text-lg font-bold text-[var(--text)]">Certificates</h3>
            </div>
            <p className="mt-1 text-sm text-[var(--muted)]">Learners meeting the current assessment-based certificate readiness rule.</p>
          </div>
          <div className="p-5">
            <div className="mb-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                <p className="text-xs text-[var(--muted)]">Eligible learners</p>
                <p className="mt-1 text-2xl font-bold text-[var(--text)]">{adminReports?.summary.certificateEligibleCount ?? "—"}</p>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                <p className="text-xs text-[var(--muted)]">Learners with saved progress</p>
                <p className="mt-1 text-2xl font-bold text-[var(--text)]">{adminReports?.summary.learnersWithProgress ?? "—"}</p>
              </div>
            </div>
            <p className="mb-4 rounded-xl border border-amber-500/25 bg-amber-500/5 p-3 text-xs leading-5 text-[var(--muted)]">
              This report shows eligibility based on saved quiz and scenario results. It does not represent a separately stored certificate issuance record; certificate issuance tracking can be added as a distinct backend feature.
            </p>
            {!adminReports || adminReports.learners.filter((learner) => learner.certificateEligible).length === 0 ? (
              <p className="rounded-xl border border-dashed border-[var(--border)] p-6 text-center text-sm text-[var(--muted)]">No learners currently meet the certificate readiness rule.</p>
            ) : (
              <div className="space-y-3">
                {adminReports.learners.filter((learner) => learner.certificateEligible).map((learner, index) => (
                  <article key={`${learner.learnerId}-${learner.programmeId}-${index}`} className="flex flex-col justify-between gap-2 rounded-xl border border-[var(--border)] p-4 sm:flex-row sm:items-center">
                    <div>
                      <p className="font-semibold text-[var(--text)]">{learner.learnerName}</p>
                      <p className="mt-0.5 text-xs text-[var(--muted)]">{learner.learnerEmail}</p>
                      <p className="mt-1 text-xs text-rose-600">{learner.programmeName}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="rounded-lg bg-[var(--surface-2)] px-3 py-2 text-[var(--text)]">Pre: {reportPercent(learner.preQuiz?.percentage)}</span>
                      <span className="rounded-lg bg-[var(--surface-2)] px-3 py-2 text-[var(--text)]">Post: {reportPercent(learner.postQuiz?.percentage)}</span>
                      <span className="rounded-lg bg-emerald-500/10 px-3 py-2 font-semibold text-emerald-600">Eligible</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Admin workspace settings */}
        <section id="settings" className={`${panel} scroll-mt-24 p-5 sm:p-6`}>
          <div className="mb-5 flex items-center gap-2">
            <Settings className="text-rose-600" size={21} />
            <h3 className="text-lg font-bold text-[var(--text)]">Workspace settings</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Admin account</p>
              <p className="mt-2 font-semibold text-[var(--text)]">{adminAccount.name}</p>
              <p className="mt-1 break-all text-sm text-[var(--muted)]">{adminAccount.email || "No email available"}</p>
              <p className="mt-2 text-xs text-[var(--muted)]">Role: Administrator</p>
              <a href="#users" className="mt-3 inline-block text-xs font-semibold text-rose-600 hover:underline">Open user management →</a>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Display preferences</p>
              <p className="mt-2 text-sm text-[var(--text)]">Light and dark appearance is controlled by the theme button in the top bar.</p>
              <p className="mt-2 text-xs text-[var(--muted)]">Use the sun/moon icon at the top-right of the dashboard to change the appearance.</p>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">API connection</p>
              <p className="mt-2 break-all text-sm text-[var(--text)]">{process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api (local default)"}</p>
              <p className="mt-2 text-xs text-[var(--muted)]">Admin reporting is loaded from the authenticated backend route.</p>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Notification centre</p>
              <p className="mt-2 text-sm text-[var(--text)]">Open the bell in the top bar to review the current role-specific notifications.</p>
              <p className="mt-2 text-xs text-[var(--muted)]">Read status currently stays in this browser; shared notification history requires backend storage.</p>
            </div>
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