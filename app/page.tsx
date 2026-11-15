import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  BarChart3,
  BookOpen,
  BrainCircuit,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Code2,
  Globe2,
  GraduationCap,
  Handshake,
  MessageSquare,
  Network,
  Rocket,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  Video,
} from "lucide-react";

const learningTracks = [
  {
    icon: Code2,
    number: "01",
    title: "Engineering team collaboration",
    description:
      "Strengthen the communication, handovers and shared ways of working that help technical teams deliver together.",
    tags: ["Engineering teams", "Technical collaboration"],
    tone: "cyan",
  },
  {
    icon: Globe2,
    number: "02",
    title: "Cross-cultural communication",
    description:
      "Navigate different communication styles with curiosity, clarity and respect—without relying on stereotypes.",
    tags: ["Global teams", "Communication"],
    tone: "violet",
  },
  {
    icon: BriefcaseBusiness,
    number: "03",
    title: "Global workplace readiness",
    description:
      "Build confidence in meetings, feedback, professional expectations and day-to-day international work.",
    tags: ["Early-career", "Professionals"],
    tone: "amber",
  },
  {
    icon: Users,
    number: "04",
    title: "Inclusive leadership",
    description:
      "Help managers create space for different perspectives, fair participation and constructive teamwork.",
    tags: ["Managers", "Team leads"],
    tone: "emerald",
  },
  {
    icon: Network,
    number: "05",
    title: "Remote and hybrid teamwork",
    description:
      "Make distributed collaboration more intentional through clear communication and shared team practices.",
    tags: ["Distributed teams", "Collaboration"],
    tone: "blue",
  },
  {
    icon: MessageSquare,
    number: "06",
    title: "Professional communication",
    description:
      "Practise giving feedback, speaking up, resolving misunderstandings and working through difficult moments.",
    tags: ["Communication", "Workplace skills"],
    tone: "pink",
  },
];

const learningExperience = [
  {
    icon: BookOpen,
    title: "Structured learning paths",
    description:
      "Organised programmes, modules and lessons give learners a clear route through each topic.",
  },
  {
    icon: Video,
    title: "Video and learning resources",
    description:
      "Bring lesson content and video resources together in one learning space.",
  },
  {
    icon: ClipboardCheck,
    title: "Quizzes and scenario practice",
    description:
      "Check understanding and practise responses to realistic workplace situations.",
  },
  {
    icon: BarChart3,
    title: "Progress and reporting",
    description:
      "Give learners and programme teams visibility into participation and learning progress.",
  },
  {
    icon: Award,
    title: "Learning achievements",
    description:
      "Recognise completed learning activities with progress milestones and certificates.",
  },
  {
    icon: CalendarDays,
    title: "Trainer-led programmes",
    description:
      "Coordinate workshops, assigned facilitators, learner enrolment and attendance.",
  },
];

const audience = [
  {
    icon: Code2,
    eyebrow: "FOR ENGINEERS",
    title: "Work confidently across teams",
    description:
      "Build the communication and collaboration skills that complement your technical expertise—whether you work with product, design, clients or colleagues around the world.",
  },
  {
    icon: BrainCircuit,
    eyebrow: "FOR PROFESSIONALS & LEADERS",
    title: "Lead with clarity and understanding",
    description:
      "Develop practical approaches to feedback, inclusive meetings, cross-cultural working and leading people with different perspectives.",
  },
  {
    icon: Building2,
    eyebrow: "FOR ORGANISATIONS",
    title: "Create a shared learning culture",
    description:
      "Organise learning programmes, assign facilitators, support employee participation and review programme progress from dedicated workspaces.",
  },
];

const steps = [
  {
    number: "01",
    title: "Choose a learning path",
    description:
      "Explore the programmes available to you and enrol in the learning that fits your goals.",
  },
  {
    number: "02",
    title: "Learn at each stage",
    description:
      "Work through lessons and resources, and join programme activities where available.",
  },
  {
    number: "03",
    title: "Practise and reflect",
    description:
      "Complete knowledge checks and workplace scenarios to apply what you have learned.",
  },
  {
    number: "04",
    title: "Review your progress",
    description:
      "Follow your learning journey and view achievements when programme requirements are met.",
  },
];

const workspaces = [
  {
    icon: ShieldCheck,
    title: "Administrator workspace",
    description:
      "Manage programmes, organisations, user access, facilitator assignments and learning reports.",
    label: "Manage the platform",
  },
  {
    icon: GraduationCap,
    title: "Facilitator workspace",
    description:
      "Access assigned programmes, work with learning content, review learners and record attendance.",
    label: "Guide learning",
  },
  {
    icon: Users,
    title: "Learner workspace",
    description:
      "Explore enrolled programmes, complete lessons and assessments, and follow your progress.",
    label: "Develop your skills",
  },
];

const principles = [
  "Practical, workplace-focused learning",
  "Respectful cross-cultural collaboration",
  "Clear learning stages and progress visibility",
  "Dedicated experiences for each platform role",
];

const toneClasses: Record<string, { icon: string; surface: string; accent: string }> = {
  cyan: {
    icon: "text-cyan-500",
    surface: "bg-cyan-500/10",
    accent: "group-hover:border-cyan-500/40",
  },
  violet: {
    icon: "text-violet-500",
    surface: "bg-violet-500/10",
    accent: "group-hover:border-violet-500/40",
  },
  amber: {
    icon: "text-amber-500",
    surface: "bg-amber-500/10",
    accent: "group-hover:border-amber-500/40",
  },
  emerald: {
    icon: "text-emerald-500",
    surface: "bg-emerald-500/10",
    accent: "group-hover:border-emerald-500/40",
  },
  blue: {
    icon: "text-blue-500",
    surface: "bg-blue-500/10",
    accent: "group-hover:border-blue-500/40",
  },
  pink: {
    icon: "text-pink-500",
    surface: "bg-pink-500/10",
    accent: "group-hover:border-pink-500/40",
  },
};

export default function Home() {
  return (
    <main className="w-full space-y-24 pb-16 sm:space-y-32">
      {/* HERO */}
      <section className="relative isolate overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] px-6 py-16 shadow-sm sm:px-10 sm:py-20 lg:px-14 lg:py-24">
        <div className="pointer-events-none absolute -left-28 -top-28 -z-10 h-80 w-80 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-36 right-0 -z-10 h-96 w-96 rounded-full bg-violet-500/15 blur-3xl" />
        <div className="pointer-events-none absolute right-1/3 top-0 -z-10 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="grid items-center gap-14 lg:grid-cols-[1.08fr_0.92fr] lg:gap-10">
          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-cyan-600 dark:text-cyan-300">
              <Sparkles size={15} />
              Professional learning for a connected world
            </div>

            <h1 className="max-w-3xl text-5xl font-black leading-[1.04] tracking-tight text-[var(--text)] sm:text-6xl lg:text-[4.6rem]">
              Build skills.
              <span className="block bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500 bg-clip-text text-transparent">
                Bridge cultures.
              </span>
              <span className="block">Lead globally.</span>
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-8 text-[var(--muted)] sm:text-lg">
              CultureBridge helps engineers, technical leaders and global
              professionals strengthen the human skills behind great work—from
              cross-cultural communication and inclusive teamwork to workplace
              readiness and professional collaboration.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-violet-600 px-7 py-4 text-sm font-bold text-white shadow-lg shadow-cyan-900/15 transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                Start your learning journey
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-7 py-4 text-sm font-bold text-[var(--text)] transition hover:border-cyan-500/50 hover:bg-cyan-500/5"
              >
                Sign in to your workspace
                <ArrowUpRight size={17} />
              </Link>
            </div>

            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-[var(--muted)]">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500" />
                Designed around real work
              </span>
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500" />
                Built for teams and individuals
              </span>
            </div>
          </div>

          {/* PRODUCT PREVIEW — illustrative UI, not live account data */}
          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-violet-500/20 blur-2xl" />
            <div className="relative overflow-hidden rounded-[1.8rem] border border-white/10 bg-[#0b1224] p-5 text-white shadow-2xl sm:p-7">
              <div className="flex items-center justify-between border-b border-white/10 pb-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500">
                    <Globe2 size={22} />
                  </span>
                  <div>
                    <p className="text-sm font-bold">CultureBridge</p>
                    <p className="text-xs text-white/50">Professional learning hub</p>
                  </div>
                </div>
                <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-[10px] font-semibold text-emerald-200">
                  LEARNING WORKSPACE
                </span>
              </div>

              <div className="py-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200/70">
                  Your development pathway
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                  Learn for the way the world works.
                </h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-white/55">
                  A guided experience from learning content to practical
                  workplace application.
                </p>
              </div>

              <div className="space-y-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/15 text-cyan-200">
                      <BookOpen size={20} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">Learn the concepts</p>
                      <p className="mt-0.5 text-xs text-white/45">Modules, lessons and video resources</p>
                    </div>
                    <ChevronRight size={17} className="text-white/40" />
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-400/15 text-violet-200">
                      <BrainCircuit size={20} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">Practise at work</p>
                      <p className="mt-0.5 text-xs text-white/45">Knowledge checks and workplace scenarios</p>
                    </div>
                    <ChevronRight size={17} className="text-white/40" />
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-200">
                      <BarChart3 size={20} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">Review your progress</p>
                      <p className="mt-0.5 text-xs text-white/45">Learning milestones and achievements</p>
                    </div>
                    <ChevronRight size={17} className="text-white/40" />
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2">
                {[
                  { icon: Code2, label: "Engineering" },
                  { icon: Handshake, label: "Teamwork" },
                  { icon: Globe2, label: "Global skills" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="rounded-xl border border-white/10 bg-white/[0.04] px-2 py-3 text-center">
                      <Icon size={19} className="mx-auto text-cyan-200" />
                      <p className="mt-2 text-[10px] font-semibold text-white/65 sm:text-xs">{item.label}</p>
                    </div>
                  );
                })}
              </div>
              <p className="mt-4 text-center text-[10px] text-white/35">
                Illustrative preview of the learning experience
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* POSITIONING STRIP */}
      <section className="grid gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-[var(--border)] sm:p-8">
        {[
          { icon: Code2, title: "Engineers", text: "Technical teams and specialists" },
          { icon: Target, title: "Professionals", text: "Managers and emerging leaders" },
          { icon: Building2, title: "Organisations", text: "People, culture and L&D teams" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="flex items-center gap-4 sm:px-6 first:sm:pl-0 last:sm:pr-0">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500">
                <Icon size={22} />
              </span>
              <div>
                <p className="font-bold text-[var(--text)]">{item.title}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">{item.text}</p>
              </div>
            </div>
          );
        })}
      </section>

      {/* LEARNING PATHWAYS */}
      <section>
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-300">
            Learning pathways
          </p>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-[var(--text)] sm:text-5xl">
            Skills for people building the future.
          </h2>
          <p className="mt-5 text-base leading-8 text-[var(--muted)] sm:text-lg">
            Develop the professional capabilities that help technical teams,
            leaders and organisations work better across roles, cultures and
            borders.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {learningTracks.map((track) => {
            const Icon = track.icon;
            const tone = toneClasses[track.tone];
            return (
              <article
                key={track.number}
                className={`group rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 transition duration-300 hover:-translate-y-1 hover:shadow-xl ${tone.accent}`}
              >
                <div className="flex items-start justify-between">
                  <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tone.surface} ${tone.icon}`}>
                    <Icon size={24} />
                  </span>
                  <span className="text-sm font-black tracking-widest text-[var(--muted)]/50">{track.number}</span>
                </div>
                <h3 className="mt-6 text-xl font-bold leading-snug text-[var(--text)]">{track.title}</h3>
                <p className="mt-3 min-h-[6rem] text-sm leading-7 text-[var(--muted)]">{track.description}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {track.tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-[var(--border)] px-3 py-1 text-[11px] font-semibold text-[var(--muted)]">{tag}</span>
                  ))}
                </div>
                <Link href="/register" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-cyan-600 transition group-hover:gap-3 dark:text-cyan-300">
                  Explore learning <ArrowRight size={16} />
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      {/* FOR WHOM */}
      <section className="relative overflow-hidden rounded-[2rem] bg-[#0b1224] px-6 py-14 text-white sm:px-10 sm:py-16 lg:px-14">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="relative">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">Learning for every level</p>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">Built for the people behind great teams.</h2>
            <p className="mt-5 max-w-2xl leading-8 text-white/60">From individual contributors to senior leaders and learning teams, CultureBridge supports the skills that make collaboration work.</p>
          </div>
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {audience.map((item, index) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-cyan-200"><Icon size={24} /></span>
                    <span className="text-xs font-bold tracking-[0.16em] text-white/35">0{index + 1}</span>
                  </div>
                  <p className="mt-6 text-[10px] font-bold tracking-[0.2em] text-cyan-200">{item.eyebrow}</p>
                  <h3 className="mt-2 text-xl font-bold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/60">{item.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* PLATFORM EXPERIENCE */}
      <section>
        <div className="grid items-end gap-6 md:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-300">One connected experience</p>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-[var(--text)] sm:text-5xl">Learning, practice and progress in one place.</h2>
          </div>
          <p className="max-w-xl leading-8 text-[var(--muted)] md:justify-self-end">CultureBridge brings programme content, workshops, assessments and learner progress into a single platform experience.</p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {learningExperience.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="flex gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 transition hover:border-cyan-500/40 hover:shadow-lg">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-300"><Icon size={22} /></span>
                <div>
                  <h3 className="font-bold text-[var(--text)]">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* LEARNING JOURNEY */}
      <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] px-6 py-14 sm:px-10 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-300">How it works</p>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-[var(--text)] sm:text-5xl">A clear path from learning to application.</h2>
          <p className="mt-5 leading-8 text-[var(--muted)]">Each programme gives learners a structured way to build understanding, practise skills and review their development.</p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {steps.map((step, index) => (
            <div key={step.number} className="relative rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-6">
              <div className="flex items-center justify-between">
                <span className="text-4xl font-black tracking-tight text-cyan-500/40">{step.number}</span>
                {index !== steps.length - 1 && <ArrowRight size={18} className="hidden text-cyan-500/60 xl:block" />}
              </div>
              <h3 className="mt-5 text-lg font-bold text-[var(--text)]">{step.title}</h3>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ROLE WORKSPACES */}
      <section>
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-300">Dedicated workspaces</p>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-[var(--text)] sm:text-5xl">One platform. The right tools for each role.</h2>
          <p className="mt-5 leading-8 text-[var(--muted)]">A role-based experience keeps programme management, facilitation and personal learning organised.</p>
        </div>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {workspaces.map((workspace) => {
            const Icon = workspace.icon;
            return (
              <article key={workspace.title} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-7">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500"><Icon size={24} /></span>
                <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-cyan-600 dark:text-cyan-300">{workspace.label}</p>
                <h3 className="mt-2 text-xl font-bold text-[var(--text)]">{workspace.title}</h3>
                <p className="mt-3 min-h-20 text-sm leading-7 text-[var(--muted)]">{workspace.description}</p>
                <Link href="/login" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-cyan-600 hover:gap-3 dark:text-cyan-300">Open workspace <ArrowUpRight size={16} /></Link>
              </article>
            );
          })}
        </div>
      </section>

      {/* PRINCIPLES + CTA */}
      <section className="grid items-center gap-10 rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-7 sm:p-10 lg:grid-cols-[0.9fr_1.1fr] lg:p-14">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-300">The CultureBridge approach</p>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-[var(--text)] sm:text-4xl">Professional growth starts with better ways of working.</h2>
          <p className="mt-5 leading-8 text-[var(--muted)]">Technical expertise matters. So does the ability to listen, communicate, include others and work through differences. CultureBridge helps make those capabilities part of everyday learning.</p>
          <Link href="/register" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-violet-600 px-6 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5">Join CultureBridge <ArrowRight size={17} /></Link>
        </div>
        <div className="space-y-3">
          {principles.map((principle) => (
            <div key={principle} className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4">
              <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-emerald-500" />
              <p className="text-sm font-semibold leading-6 text-[var(--text)]">{principle}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative isolate overflow-hidden rounded-[2rem] bg-gradient-to-br from-cyan-700 via-blue-700 to-violet-800 px-6 py-16 text-center text-white shadow-2xl sm:px-12 sm:py-20">
        <div className="pointer-events-none absolute -left-20 -top-24 -z-10 h-72 w-72 rounded-full border border-white/15" />
        <div className="pointer-events-none absolute -bottom-36 -right-20 -z-10 h-96 w-96 rounded-full border border-white/15" />
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15"><Rocket size={28} /></span>
        <h2 className="mx-auto mt-7 max-w-4xl text-3xl font-black tracking-tight sm:text-5xl">Make your next step a stronger one.</h2>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/75 sm:text-lg">Start building the communication, collaboration and global workplace skills that support great engineering and professional work.</p>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/register" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-4 text-sm font-bold text-blue-800 transition hover:scale-[1.02]">Create your account <ArrowRight size={17} /></Link>
          <Link href="/login" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/35 px-7 py-4 text-sm font-bold text-white transition hover:bg-white/10">Sign in <ArrowUpRight size={17} /></Link>
        </div>
      </section>
    </main>
  );
}
