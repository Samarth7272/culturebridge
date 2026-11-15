"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Menu,
  Sun,
  Moon,
  Bell,
  BellRing,
  LogOut,
  ChevronDown,
  X,
  CheckCheck,
  RefreshCw,
  CalendarDays,
  BookOpen,
  Users,
  Award,
  ClipboardCheck,
  AlertCircle,
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { getWorkshops, getMyProgress } from "@/lib/api";

type Role = "admin" | "facilitator" | "learner";

type TopbarProps = {
  role: Role;
  onMenuClick: () => void;
};

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  href?: string;
  action?: string;
  kind: "programme" | "learner" | "assessment" | "certificate" | "reminder";
};

const titles: Record<Role, string> = {
  admin: "Admin Dashboard",
  facilitator: "Trainer Dashboard",
  learner: "Employee Dashboard",
};

const readStorageKey = (role: Role) => `culturebridge:notifications:read:${role}`;

function unwrapRecords(response: any): any[] {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.workshops)) return response.workshops;
  if (Array.isArray(response?.progress)) return response.progress;
  if (Array.isArray(response?.data?.workshops)) return response.data.workshops;
  if (Array.isArray(response?.data?.progress)) return response.data.progress;
  return [];
}

function idOf(value: any): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") return String(value._id || value.id || "");
  return "";
}

function dateLabel(value: any): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function iconFor(kind: NotificationItem["kind"]) {
  switch (kind) {
    case "programme":
      return BookOpen;
    case "learner":
      return Users;
    case "assessment":
      return ClipboardCheck;
    case "certificate":
      return Award;
    default:
      return CalendarDays;
  }
}

export default function Topbar({ role, onMenuClick }: TopbarProps) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [name, setName] = useState("User");
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState("");

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      setName(user.name || user.fullName || user.email || "User");
    } catch {
      setName("User");
    }
  }, []);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(readStorageKey(role)) || "[]");
      setReadIds(Array.isArray(stored) ? stored : []);
    } catch {
      setReadIds([]);
    }
  }, [role]);

  // Notices are derived from records already returned by the authenticated API.
  // Read/unread state is stored in this browser; it is not yet synchronised across devices.
  const loadNotifications = useCallback(async () => {
    setNotificationsLoading(true);
    setNotificationsError("");

    try {
      const workshopResponse = await getWorkshops();
      const workshops = unwrapRecords(workshopResponse);
      const next: NotificationItem[] = [];
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      if (role === "admin") {
        workshops
          .filter((workshop) => String(workshop.status || "").toLowerCase() === "draft")
          .slice(0, 8)
          .forEach((workshop) => {
            const id = idOf(workshop._id || workshop.id);
            if (!id) return;
            next.push({
              id: `admin-draft-${id}`,
              title: "Programme needs review",
              message: `${workshop.title || "Untitled programme"} is still a draft. Review it before publishing.`,
              href: `/admin/programs/${id}`,
              action: "Review programme",
              kind: "programme",
            });
          });

        const recentlyUpdated = workshops
          .filter((workshop) => {
            const timestamp = workshop.updatedAt || workshop.createdAt;
            if (!timestamp) return false;
            const date = new Date(timestamp);
            return !Number.isNaN(date.getTime()) && now.getTime() - date.getTime() <= 7 * 24 * 60 * 60 * 1000;
          })
          .slice(0, 5);

        recentlyUpdated.forEach((workshop) => {
          const id = idOf(workshop._id || workshop.id);
          if (!id) return;
          const date = dateLabel(workshop.updatedAt || workshop.createdAt);
          next.push({
            id: `admin-updated-${id}-${workshop.updatedAt || workshop.createdAt}`,
            title: "Recent programme activity",
            message: `${workshop.title || "A programme"} was updated${date ? ` on ${date}` : ""}.`,
            href: `/admin/programs/${id}`,
            action: "View programme",
            kind: "programme",
          });
        });
      } else if (role === "facilitator") {
        workshops.forEach((workshop) => {
          const id = idOf(workshop._id || workshop.id);
          if (!id) return;
          const title = workshop.title || "Assigned programme";
          const registered = Number(workshop.registered || 0);
          const sessionDate = workshop.date ? new Date(workshop.date) : null;
          if (sessionDate && !Number.isNaN(sessionDate.getTime()) && sessionDate >= today) {
            next.push({
              id: `facilitator-session-${id}-${workshop.date}`,
              title: "Upcoming assigned programme",
              message: `${title}${dateLabel(workshop.date) ? ` is scheduled for ${dateLabel(workshop.date)}` : " has an upcoming date"}.`,
              href: "/facilitator#workshops",
              action: "View workshops",
              kind: "reminder",
            });
          }
          if (registered > 0) {
            next.push({
              id: `facilitator-roster-${id}-${registered}`,
              title: "Learner activity",
              message: `${registered} learner${registered === 1 ? " is" : "s are"} registered in ${title}.`,
              href: "/facilitator#learners",
              action: "View learners",
              kind: "learner",
            });
          }
        });
      } else {
        const progressResponse = await getMyProgress();
        const progressRecords = unwrapRecords(progressResponse);
        const workshopMap = new Map(
          workshops.map((workshop) => [idOf(workshop._id || workshop.id), workshop])
        );

        progressRecords.forEach((progress) => {
          const workshopId = idOf(progress.workshop);
          const workshop = workshopMap.get(workshopId) ||
            (typeof progress.workshop === "object" ? progress.workshop : null);
          const title = workshop?.title || "Your learning programme";
          const percentage = Math.max(0, Math.min(100, Number(progress.progressPercentage || 0)));
          next.push({
            id: `learner-progress-${idOf(progress._id) || workshopId}-${percentage}`,
            title: progress.completedAt ? "Programme completed" : "Continue learning",
            message: progress.completedAt
              ? `You have completed ${title}.`
              : `${title} is ${percentage}% complete. Continue where you left off.`,
            href: "/learner",
            action: "Open learning",
            kind: progress.completedAt ? "certificate" : "reminder",
          });

          const quizResults = Array.isArray(progress.quizResults) ? progress.quizResults : [];
          quizResults.forEach((result: any) => {
            const quizType = result.quizType === "pre" ? "Pre-training" : "Post-training";
            next.push({
              id: `learner-quiz-${workshopId}-${result.quizType}-${result.completedAt || result._id || "saved"}`,
              title: "Assessment result saved",
              message: `${quizType} quiz for ${title}: ${result.score}/${result.total}.`,
              href: "/learner#pre-quiz",
              action: "View assessment",
              kind: "assessment",
            });
          });
        });
      }

      setNotifications(next.slice(0, 12));
    } catch (error: any) {
      setNotificationsError(error?.message || "Unable to load notifications right now.");
      setNotifications([]);
    } finally {
      setNotificationsLoading(false);
    }
  }, [role]);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !readIds.includes(item.id)).length,
    [notifications, readIds]
  );

  function saveReadIds(next: string[]) {
    setReadIds(next);
    try {
      localStorage.setItem(readStorageKey(role), JSON.stringify(next));
    } catch {
      // The panel remains usable if browser storage is unavailable.
    }
  }

  function markOneRead(id: string) {
    if (readIds.includes(id)) return;
    saveReadIds([...readIds, id]);
  }

  function markAllRead() {
    saveReadIds([...new Set([...readIds, ...notifications.map((item) => item.id)])]);
  }

  function openNotification(item: NotificationItem) {
    markOneRead(item.id);
    setNotificationsOpen(false);
    if (item.href) router.push(item.href);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.replace("/login");
    router.refresh();
  }

  const initials = name
    .split(/[\s@]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-xl">
      <div className="flex min-h-[76px] items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open navigation"
            className="rounded-xl border border-[var(--border)] p-2.5 text-[var(--muted)] hover:bg-[var(--surface-2)] lg:hidden"
          >
            <Menu size={20} />
          </button>

          <div className="min-w-0">
            <p className="hidden text-xs text-[var(--muted)] sm:block">
              Workspace / {titles[role]}
            </p>
            <h1 className="truncate text-lg font-bold text-[var(--text)] sm:text-xl">
              {titles[role]}
            </h1>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            aria-label="Toggle theme"
            className="rounded-xl border border-[var(--border)] p-2.5 text-[var(--muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
          >
            {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setNotificationsOpen((open) => !open);
                setProfileOpen(false);
              }}
              aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
              aria-expanded={notificationsOpen}
              title="Notifications"
              className="relative rounded-xl border border-[var(--border)] p-2.5 text-[var(--muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
            >
              {unreadCount > 0 ? <BellRing size={19} /> : <Bell size={19} />}
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <>
                <button
                  type="button"
                  aria-label="Close notifications"
                  className="fixed inset-0 z-40 cursor-default bg-black/10"
                  onClick={() => setNotificationsOpen(false)}
                />
                <section
                  aria-label="Notification centre"
                  className="absolute right-0 top-14 z-50 w-[min(92vw,390px)] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl"
                >
                  <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3">
                    <div>
                      <h2 className="text-sm font-bold text-[var(--text)]">Notifications</h2>
                      <p className="mt-0.5 text-xs text-[var(--muted)]">
                        {unreadCount ? `${unreadCount} unread` : "You're all caught up"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => void loadNotifications()}
                        disabled={notificationsLoading}
                        title="Refresh notifications"
                        aria-label="Refresh notifications"
                        className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface-2)] disabled:opacity-50"
                      >
                        <RefreshCw size={16} className={notificationsLoading ? "animate-spin" : ""} />
                      </button>
                      <button
                        type="button"
                        onClick={markAllRead}
                        disabled={unreadCount === 0}
                        title="Mark all as read"
                        aria-label="Mark all as read"
                        className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface-2)] disabled:opacity-40"
                      >
                        <CheckCheck size={17} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setNotificationsOpen(false)}
                        aria-label="Close notifications panel"
                        className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface-2)]"
                      >
                        <X size={17} />
                      </button>
                    </div>
                  </div>

                  <div className="max-h-[min(65vh,480px)] overflow-y-auto">
                    {notificationsLoading && notifications.length === 0 ? (
                      <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-[var(--muted)]">
                        <RefreshCw size={16} className="animate-spin" /> Loading notifications...
                      </div>
                    ) : notificationsError ? (
                      <div className="flex gap-2 px-4 py-5 text-sm text-rose-500">
                        <AlertCircle size={17} className="mt-0.5 shrink-0" />
                        <span>{notificationsError}</span>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="px-5 py-9 text-center">
                        <Bell size={25} className="mx-auto text-[var(--muted)]" />
                        <p className="mt-3 text-sm font-semibold text-[var(--text)]">No updates right now</p>
                        <p className="mt-1 text-xs text-[var(--muted)]">New activity will appear here when available.</p>
                      </div>
                    ) : (
                      notifications.map((item) => {
                        const Icon = iconFor(item.kind);
                        const isRead = readIds.includes(item.id);
                        return (
                          <div
                            key={item.id}
                            className={`border-b border-[var(--border)] last:border-b-0 ${isRead ? "opacity-75" : "bg-[var(--accent-soft)]/40"}`}
                          >
                            <button
                              type="button"
                              onClick={() => openNotification(item)}
                              className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-[var(--surface-2)]"
                            >
                              <span className="mt-0.5 rounded-xl bg-[var(--surface-2)] p-2 text-[var(--primary)]">
                                <Icon size={17} />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="flex items-center gap-2">
                                  <span className="text-sm font-semibold text-[var(--text)]">{item.title}</span>
                                  {!isRead && <span className="h-2 w-2 shrink-0 rounded-full bg-rose-600" />}
                                </span>
                                <span className="mt-1 block text-xs leading-5 text-[var(--muted)]">{item.message}</span>
                                {item.action && <span className="mt-2 block text-xs font-semibold text-[var(--primary)]">{item.action} →</span>}
                              </span>
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                  <div className="border-t border-[var(--border)] px-4 py-2">
                    <p className="text-[10px] leading-4 text-[var(--muted)]">
                      Updates are based on your current account data. Read status is saved in this browser.
                    </p>
                  </div>
                </section>
              </>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setProfileOpen(!profileOpen);
                setNotificationsOpen(false);
              }}
              aria-expanded={profileOpen}
              className="flex items-center gap-2 rounded-xl border border-[var(--border)] p-1.5 transition hover:bg-[var(--surface-2)]"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-blue-600 text-sm font-bold text-white">
                {initials}
              </span>

              <span className="hidden max-w-32 text-left sm:block">
                <span className="block truncate text-sm font-semibold text-[var(--text)]">
                  {name}
                </span>
                <span className="block text-xs capitalize text-[var(--muted)]">
                  {role === "facilitator" ? "Trainer" : role === "learner" ? "Employee" : "Admin"}
                </span>
              </span>

              <ChevronDown size={15} className="hidden text-[var(--muted)] sm:block" />
            </button>

            {profileOpen && (
              <>
                <button
                  type="button"
                  aria-label="Close profile menu"
                  className="fixed inset-0 z-40 cursor-default"
                  onClick={() => setProfileOpen(false)}
                />

                <div className="absolute right-0 top-14 z-50 w-52 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-xl">
                  <div className="border-b border-[var(--border)] px-3 py-2">
                    <p className="truncate text-sm font-semibold text-[var(--text)]">
                      {name}
                    </p>
                    <p className="text-xs capitalize text-[var(--muted)]">
                      {role}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={logout}
                    className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-rose-500 transition hover:bg-rose-500/10"
                  >
                    <LogOut size={17} />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
