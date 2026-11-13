import Link from "next/link";
import {
  Globe2,
  Users,
  MessageSquare,
  BriefcaseBusiness,
  Target,
  ArrowRight,
  GraduationCap,
  Handshake,
  Languages,
  BookOpen,
  Award,
  BarChart3,
  CalendarDays,
  ClipboardCheck,
  ShieldCheck,
  Sparkles,
  Code2,
  MonitorPlay,
  BrainCircuit,
  Rocket,
  Lightbulb,
  CheckCircle2,
  Laptop,
  Network,
  Trophy,
  Video,
  Building2,
} from "lucide-react";

const learningAreas = [
  {
    icon: Code2,
    title: "Technical Learning",
    description:
      "Develop practical engineering knowledge through technical learning activities, coding practice and professional development.",
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
  },
  {
    icon: MessageSquare,
    title: "Cross-Cultural Communication",
    description:
      "Learn how to communicate clearly and professionally with people from different cultures and backgrounds.",
    color: "text-violet-400",
    bg: "bg-violet-400/10",
  },
  {
    icon: Handshake,
    title: "Global Team Collaboration",
    description:
      "Build teamwork skills and understand different working styles in international engineering teams.",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
  },
  {
    icon: BriefcaseBusiness,
    title: "Workplace Readiness",
    description:
      "Improve professional behaviour, meeting participation, problem-solving and workplace communication.",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
  },
];

const platformFeatures = [
  {
    icon: BookOpen,
    title: "Learning Resources",
    description:
      "Access structured learning content and practical professional development resources.",
    color: "text-cyan-400",
  },
  {
    icon: CalendarDays,
    title: "Live Workshops",
    description:
      "Participate in trainer-led workshops, group discussions and collaborative sessions.",
    color: "text-violet-400",
  },
  {
    icon: Code2,
    title: "Engineering Challenges",
    description:
      "Develop technical and professional skills through practical engineering challenges.",
    color: "text-emerald-400",
  },
  {
    icon: ClipboardCheck,
    title: "Assessments",
    description:
      "Test your knowledge through quizzes, learning activities and assessments.",
    color: "text-amber-400",
  },
  {
    icon: Award,
    title: "Achievements",
    description:
      "Track completed activities, learning milestones and achievements.",
    color: "text-pink-400",
  },
  {
    icon: BarChart3,
    title: "Progress Analytics",
    description:
      "Monitor participation, learning progress and workshop performance.",
    color: "text-blue-400",
  },
];

const benefits = [
  {
    icon: Globe2,
    title: "Global Exposure",
    description:
      "Understand international professional environments and cultural differences.",
  },
  {
    icon: Users,
    title: "Better Collaboration",
    description:
      "Learn to work effectively with engineers and professionals across teams.",
  },
  {
    icon: BrainCircuit,
    title: "Continuous Learning",
    description:
      "Build technical knowledge and professional skills through structured activities.",
  },
  {
    icon: Trophy,
    title: "Professional Growth",
    description:
      "Measure your progress and work towards your learning goals.",
  },
];

const journey = [
  {
    number: "01",
    title: "Register",
    description:
      "Create your account and access your dedicated learning workspace.",
  },
  {
    number: "02",
    title: "Explore",
    description:
      "Discover workshops, learning resources and engineering activities.",
  },
  {
    number: "03",
    title: "Participate",
    description:
      "Join workshops, complete assessments and collaborate with others.",
  },
  {
    number: "04",
    title: "Grow",
    description:
      "Review your progress, achievements and professional development.",
  },
];

const roles = [
  {
    icon: ShieldCheck,
    title: "Administrator",
    description:
      "Manage users, oversee platform activities and monitor learning performance.",
  },
  {
    icon: GraduationCap,
    title: "Trainer",
    description:
      "Organise workshops, manage participants and guide learning activities.",
  },
  {
    icon: Users,
    title: "Employee / Learner",
    description:
      "Explore learning resources, join workshops and track achievements.",
  },
];

export default function Home() {
  return (
    <div className="w-full space-y-24 pb-12">

      {/* HERO SECTION */}
      <section className="relative overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] px-6 py-16 sm:px-10 lg:px-14 lg:py-24">
        <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-violet-500/15 blur-3xl" />

        <div className="relative grid items-center gap-14 lg:grid-cols-2">
          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-500">
              <Sparkles size={16} />
              A new approach to professional learning
            </div>

            <h1 className="text-5xl font-extrabold leading-tight tracking-tight text-[var(--text)] sm:text-6xl lg:text-7xl">
              Learn Together.
              <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-500 bg-clip-text text-transparent">
                Grow Globally.
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-8 text-[var(--muted)]">
              CultureBridge is a digital learning platform for engineers and
              professionals. Develop technical knowledge, improve communication
              and build the skills needed to collaborate confidently with
              international teams.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 px-7 py-4 font-bold text-white shadow-xl transition duration-300 hover:-translate-y-1 hover:shadow-cyan-500/20"
              >
                Start Learning
                <ArrowRight size={19} />
              </Link>

              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] px-7 py-4 font-semibold text-[var(--text)] transition hover:border-cyan-400 hover:bg-cyan-400/10"
              >
                Explore Workspace
                <ArrowRight size={18} />
              </Link>
            </div>

            <div className="mt-9 flex flex-wrap gap-5 text-sm text-[var(--muted)]">
              <span className="flex items-center gap-2">
                <CheckCircle2 size={17} className="text-emerald-400" />
                Practical Learning
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 size={17} className="text-emerald-400" />
                Global Collaboration
              </span>
            </div>
          </div>

          {/* HERO GRAPHIC */}
          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500/20 to-violet-500/20 blur-3xl" />

            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-950 via-blue-950 to-violet-950 p-7 text-white shadow-2xl sm:p-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60">
                    Your professional journey
                  </p>
                  <h3 className="mt-1 text-2xl font-bold">
                    Global Learning Hub
                  </h3>
                </div>
                <Globe2 size={35} className="text-cyan-300" />
              </div>

              <div className="relative my-10 flex h-60 items-center justify-center">
                <div className="absolute h-60 w-60 animate-pulse rounded-full border border-cyan-300/20" />
                <div className="absolute h-44 w-44 rounded-full border border-violet-300/30" />
                <div className="absolute h-32 w-32 rounded-full bg-cyan-400/10 blur-xl" />

                <div className="relative flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-400 to-violet-600 shadow-2xl shadow-cyan-500/30">
                  <Globe2 size={55} />
                </div>

                <div className="absolute left-0 top-5 rounded-xl border border-white/10 bg-white/10 p-3 backdrop-blur-lg">
                  <Code2 size={23} className="text-cyan-300" />
                  <p className="mt-1 text-xs">Engineering</p>
                </div>

                <div className="absolute right-0 top-8 rounded-xl border border-white/10 bg-white/10 p-3 backdrop-blur-lg">
                  <Users size={23} className="text-violet-300" />
                  <p className="mt-1 text-xs">Teamwork</p>
                </div>

                <div className="absolute bottom-2 left-8 rounded-xl border border-white/10 bg-white/10 p-3 backdrop-blur-lg">
                  <MessageSquare size={23} className="text-emerald-300" />
                  <p className="mt-1 text-xs">Communication</p>
                </div>

                <div className="absolute bottom-0 right-4 rounded-xl border border-white/10 bg-white/10 p-3 backdrop-blur-lg">
                  <GraduationCap size={23} className="text-amber-300" />
                  <p className="mt-1 text-xs">Learning</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Laptop, label: "Learn" },
                  { icon: Network, label: "Connect" },
                  { icon: Trophy, label: "Achieve" },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.label}
                      className="rounded-xl border border-white/10 bg-white/5 p-3 text-center"
                    >
                      <Icon className="mx-auto text-cyan-300" size={22} />
                      <p className="mt-2 text-xs font-semibold">
                        {item.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="mx-auto max-w-5xl text-center">
        <span className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-500">
          About CultureBridge
        </span>

        <h2 className="mt-4 text-3xl font-extrabold text-[var(--text)] sm:text-5xl">
          More than learning.
          <span className="block text-cyan-500">
            A platform for professional growth.
          </span>
        </h2>

        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-[var(--muted)]">
          Technology connects the world, but successful collaboration requires
          more than technical knowledge. CultureBridge brings engineers,
          trainers and professionals together to improve technical learning,
          cultural understanding, communication and teamwork.
        </p>

        <div className="mt-12 grid gap-5 text-left md:grid-cols-3">
          {[
            {
              icon: Lightbulb,
              title: "Understand",
              description:
                "Discover different cultures, communication styles and workplace expectations.",
            },
            {
              icon: Handshake,
              title: "Collaborate",
              description:
                "Practise teamwork and build stronger professional relationships.",
            },
            {
              icon: Rocket,
              title: "Advance",
              description:
                "Develop your abilities through structured activities and continuous learning.",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-7 transition duration-300 hover:-translate-y-2"
              >
                <Icon size={29} className="text-cyan-500" />
                <h3 className="mt-5 text-xl font-bold text-[var(--text)]">
                  {item.title}
                </h3>
                <p className="mt-3 leading-7 text-[var(--muted)]">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* LEARNING AREAS */}
      <section>
        <div className="text-center">
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-500">
            Learning Pathways
          </span>
          <h2 className="mt-4 text-3xl font-extrabold text-[var(--text)] sm:text-5xl">
            Skills for the modern engineer
          </h2>
          <p className="mx-auto mt-5 max-w-2xl leading-8 text-[var(--muted)]">
            Learn technical and professional skills that help you succeed in
            modern, connected workplaces.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {learningAreas.map((area) => {
            const Icon = area.icon;

            return (
              <div
                key={area.title}
                className="group rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 transition duration-300 hover:-translate-y-2 hover:border-cyan-400/50 hover:shadow-xl"
              >
                <div
                  className={`mb-6 inline-flex rounded-2xl p-4 ${area.bg} ${area.color} transition group-hover:scale-110`}
                >
                  <Icon size={29} />
                </div>

                <h3 className="text-lg font-bold text-[var(--text)]">
                  {area.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                  {area.description}
                </p>

                <Link
                  href="/register"
                  className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-cyan-500 transition hover:gap-4"
                >
                  Start Learning
                  <ArrowRight size={16} />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* PLATFORM FEATURES */}
      <section className="rounded-[2rem] bg-[var(--surface)]/50 px-5 py-14 sm:px-9 sm:py-16">
        <div className="text-center">
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-500">
            Platform Capabilities
          </span>

          <h2 className="mt-4 text-3xl font-extrabold text-[var(--text)] sm:text-5xl">
            Everything in one learning space
          </h2>

          <p className="mx-auto mt-5 max-w-2xl leading-8 text-[var(--muted)]">
            A connected environment for learning, training, participation and
            professional development.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {platformFeatures.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-7 transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <Icon size={29} className={feature.color} />

                <h3 className="mt-5 text-xl font-bold text-[var(--text)]">
                  {feature.title}
                </h3>

                <p className="mt-3 leading-7 text-[var(--muted)]">
                  {feature.description}
                </p>

                <Link
                  href="/login"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-cyan-500 hover:gap-4"
                >
                  Access Platform
                  <ArrowRight size={16} />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* WORKSHOPS AND COLLABORATION */}
      <section className="grid items-center gap-10 lg:grid-cols-2">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-blue-950 to-violet-950 p-9 text-white sm:p-12">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-cyan-400/20 blur-3xl" />

          <div className="relative">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-cyan-300">
              <Video size={32} />
            </div>

            <h3 className="mt-8 text-3xl font-extrabold">
              Learn through collaboration
            </h3>

            <p className="mt-5 leading-8 text-white/70">
              Participate in guided workshops, interactive discussions and
              practical learning experiences designed to strengthen
              professional skills.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm">
                Live Workshops
              </span>
              <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm">
                Group Activities
              </span>
              <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm">
                Team Learning
              </span>
            </div>

            <Link
              href="/login"
              className="mt-9 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-blue-700 transition hover:scale-105"
            >
              Explore Workshops
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        <div>
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-500">
            Learn Together
          </span>

          <h2 className="mt-4 text-3xl font-extrabold leading-tight text-[var(--text)] sm:text-5xl">
            Prepare for a world of global opportunities.
          </h2>

          <p className="mt-6 leading-8 text-[var(--muted)]">
            Engineers often work with colleagues, clients and teams across
            different countries. CultureBridge helps learners understand
            different perspectives and develop the confidence to collaborate
            effectively.
          </p>

          <div className="mt-8 space-y-5">
            {[
              "Build confidence in professional communication",
              "Understand international workplace practices",
              "Improve teamwork and problem-solving",
              "Develop technical and interpersonal abilities",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <CheckCircle2
                  size={21}
                  className="mt-0.5 shrink-0 text-emerald-400"
                />
                <span className="text-[var(--text)]">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* LEARNING JOURNEY */}
      <section>
        <div className="text-center">
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-500">
            How It Works
          </span>

          <h2 className="mt-4 text-3xl font-extrabold text-[var(--text)] sm:text-5xl">
            Your learning journey
          </h2>

          <p className="mx-auto mt-5 max-w-2xl leading-8 text-[var(--muted)]">
            Start learning, participate in activities and keep developing your
            professional skills.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {journey.map((step, index) => (
            <div
              key={step.number}
              className="relative rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-7 transition duration-300 hover:-translate-y-2"
            >
              <span className="text-5xl font-extrabold text-cyan-500/30">
                {step.number}
              </span>

              <h3 className="mt-5 text-xl font-bold text-[var(--text)]">
                {step.title}
              </h3>

              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                {step.description}
              </p>

              {index !== 3 && (
                <ArrowRight
                  size={20}
                  className="absolute right-5 top-9 hidden text-cyan-500 lg:block"
                />
              )}
            </div>
          ))}
        </div>
      </section>
      {/* USER ROLES */}
      <section>
        <div className="text-center">
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-500">
            Designed for Every Role
          </span>

          <h2 className="mt-4 text-3xl font-extrabold text-[var(--text)] sm:text-5xl">
            One platform. Three workspaces.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl leading-8 text-[var(--muted)]">
            Dedicated experiences for administrators, trainers and employees.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {roles.map((role) => {
            const Icon = role.icon;

            return (
              <div
                key={role.title}
                className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center transition duration-300 hover:-translate-y-2 hover:shadow-xl"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-500">
                  <Icon size={32} />
                </div>

                <h3 className="mt-6 text-xl font-bold text-[var(--text)]">
                  {role.title}
                </h3>

                <p className="mt-4 min-h-20 leading-7 text-[var(--muted)]">
                  {role.description}
                </p>

                <Link
                  href="/login"
                  className="mt-6 inline-flex items-center gap-2 font-bold text-cyan-500 transition hover:gap-4"
                >
                  Access Workspace
                  <ArrowRight size={17} />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* BENEFITS */}
      <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] px-6 py-14 sm:px-10">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-500">
              Why CultureBridge
            </span>

            <h2 className="mt-4 text-3xl font-extrabold leading-tight text-[var(--text)] sm:text-5xl">
              Build skills that go beyond the classroom.
            </h2>

            <p className="mt-6 leading-8 text-[var(--muted)]">
              Technical knowledge is important, but successful professionalsalso need communication, collaboration and adaptability.
              CultureBridge brings these learning experiences together.
            </p>

            <Link
              href="/register"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 px-6 py-4 font-bold text-white transition hover:-translate-y-1"
            >
              Join CultureBridge
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;

              return (
                <div
                  key={benefit.title}
                  className="rounded-2xl border border-[var(--border)] p-6 transition hover:-translate-y-1"
                >
                  <Icon size={27} className="text-cyan-500" />

                  <h3 className="mt-4 font-bold text-[var(--text)]">
                    {benefit.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      {/* FINAL CTA */}
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-cyan-600 via-blue-600 to-violet-700 px-7 py-16 text-center text-white shadow-2xl sm:px-14">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border border-white/20" />
        <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full border border-white/20" />

        <div className="relative">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15">
            <Building2 size={32} />
          </div>

          <h2 className="mt-7 text-3xl font-extrabold sm:text-5xl">
            Your global journey starts here.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl leading-8 text-white/80">
            Join a learning environment where engineers and professionals can
            develop, collaborate and prepare for the future of work.
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="rounded-xl bg-white px-7 py-4 font-bold text-blue-700 transition hover:scale-105"
            >
              Create Your Account
              <ArrowRight className="ml-2 inline" size={18} />
            </Link>

            <Link
              href="/login"
              className="rounded-xl border border-white/40 px-7 py-4 font-semibold text-white transition hover:bg-white/10"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}