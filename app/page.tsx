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
  Building2,
} from "lucide-react";

const learningAreas = [
  {
    icon: MessageSquare,
    title: "Cross-Cultural Communication",
    description:
      "Learn how to communicate clearly and professionally with colleagues from different cultural backgrounds.",
  },
  {
    icon: Handshake,
    title: "Global Team Collaboration",
    description:
      "Build trust, understand working styles and collaborate effectively across international teams.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Professional Workplace Skills",
    description:
      "Practise meetings, feedback, teamwork and professional situations in a global workplace.",
  },
{
  icon: Languages,
  title: "Global Workplace Readiness",
  description:
    "Understand international workplace practices, professional expectations and effective communication across cultures.",
},
];

const benefits = [
  "Practical workplace scenarios",
  "Structured learning workshops",
  "Interactive knowledge assessments",
  "Facilitator-led learning",
  "Progress and completion tracking",
  "Cross-cultural collaboration skills",
];

export default function Home() {
  return (
    <div className="space-y-24">

      {/* HERO SECTION */}
      <section className="grid items-center gap-12 py-10 md:grid-cols-2 md:py-20">
        <div>
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-300">
            <Globe2 size={16} />
            Global Workplace Learning Platform
          </p>

          <h1 className="font-display text-4xl font-bold leading-tight text-white md:text-6xl">
  Prepare for a
  <span className="text-emerald-400">
    {" "}Connected Global Workplace.
  </span>
</h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
  Empower engineers and professionals with the cultural
  awareness, communication and collaboration skills needed
  to work confidently with international teams.
</p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/register" className="btn btn-pri">
              Start Learning <ArrowRight size={18} />
            </Link>

            <Link href="/login" className="btn btn-ghost">
              Sign In
            </Link>
          </div>

          <p className="mt-5 text-sm text-slate-400">
            Learn. Understand. Collaborate. Grow together.
          </p>
        </div>

        <div className="glass p-7 md:p-10">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-emerald-400/15 p-3 text-emerald-300">
              <Globe2 size={30} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                One Global Team
              </h2>
              <p className="text-sm text-slate-400">
                Different cultures. Shared goals.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-semibold text-emerald-300">
                UNDERSTAND
              </p>
              <p className="mt-2 text-slate-200">
                Recognise different communication and working styles.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-semibold text-cyan-300">
                PRACTISE
              </p>
              <p className="mt-2 text-slate-200">
                Learn through realistic professional situations and workshops.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-semibold text-violet-300">
                COLLABORATE
              </p>
              <p className="mt-2 text-slate-200">
                Apply your learning to build stronger international teams.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PURPOSE */}
      <section className="glass p-8 md:p-12 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-400">
            Our Purpose
          </p>

          <h2 className="mt-4 font-display text-3xl font-bold text-white md:text-4xl">
            Learn Smarter. Collaborate Better. Grow Without Limits.
          </h2>

          <p className="mt-5 text-lg leading-8 text-slate-300">
            Discover a smarter way to learn, practise real-world skills, and grow with confidence. Explore interactive lessons, expert-led workshops, hands-on challenges, and personalised learning experiences designed to prepare you for tomorrow's opportunities.
          </p>
        </div>
      </section>

      {/* LEARNING AREAS */}
      <section>
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-400">
            What You Will Learn
          </p>

          <h2 className="mt-3 font-display text-3xl font-bold text-white md:text-4xl">
            Skills for working in a global environment
          </h2>

          <p className="mt-4 text-slate-300">
            Develop practical skills that support effective
            communication and professional collaboration.
          </p>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {learningAreas.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="glass p-7 transition hover:-translate-y-1"
              >
                <div className="inline-flex rounded-xl bg-emerald-400/10 p-3 text-emerald-300">
                  <Icon size={26} />
                </div>

                <h3 className="mt-5 text-xl font-semibold text-white">
                  {item.title}
                </h3>

                <p className="mt-3 leading-7 text-slate-300">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section>
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-400">
            Learning Experience
          </p>

          <h2 className="mt-3 font-display text-3xl font-bold text-white md:text-4xl">
            From learning to real-world collaboration
          </h2>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <div className="glass p-7">
            <GraduationCap className="text-emerald-400" size={32} />
            <h3 className="mt-5 text-xl font-semibold">1. Learn</h3>
            <p className="mt-3 leading-7 text-slate-300">
              Explore lessons and understand global workplace practices.
            </p>
          </div>

          <div className="glass p-7">
            <Target className="text-cyan-400" size={32} />
            <h3 className="mt-5 text-xl font-semibold">2. Practise</h3>
            <p className="mt-3 leading-7 text-slate-300">
              Participate in scenarios, quizzes and facilitated workshops.
            </p>
          </div>

          <div className="glass p-7">
            <Users className="text-violet-400" size={32} />
            <h3 className="mt-5 text-xl font-semibold">3. Collaborate</h3>
            <p className="mt-3 leading-7 text-slate-300">
              Use your learning to work more effectively with global teams.
            </p>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="grid items-center gap-10 md:grid-cols-2">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-400">
            Platform Features
          </p>

          <h2 className="mt-3 font-display text-3xl font-bold text-white md:text-4xl">
            A structured learning experience for professionals
          </h2>

          <p className="mt-5 leading-8 text-slate-300">
            CultureBridge brings learning content, workshops,
            assessments and facilitator support into one platform.
          </p>
        </div>

        <div className="glass p-7">
          <ul className="space-y-5">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
                  ✓
                </span>
                <span className="text-slate-200">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* AUDIENCE */}
      <section className="glass p-8 text-center md:p-12">
        <Building2 className="mx-auto text-emerald-400" size={38} />

        <h2 className="mt-5 font-display text-3xl font-bold text-white">
          Prepare your team for global opportunities
        </h2>

        <p className="mx-auto mt-4 max-w-2xl leading-8 text-slate-300">
          Whether you are an engineer, a working professional,
          a learner or a facilitator, CultureBridge supports
          the skills needed to collaborate across cultures.
        </p>

        <Link href="/register" className="btn btn-pri mt-7">
          Join CultureBridge <ArrowRight size={18} />
        </Link>
      </section>

      <footer className="border-t border-white/10 pt-6 text-center text-sm text-slate-400">
        © 2026 CultureBridge. Building understanding for better global collaboration.
      </footer>
    </div>
  );
}