"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  LogIn,
  Eye,
  EyeOff,
  Globe2,
  Users,
  Award,
} from "lucide-react";
import { post } from "@/lib/api";

const field =
  "w-full rounded-xl border border-white/15 bg-white/10 py-3 pl-11 pr-11 text-white outline-none placeholder:text-white/40 transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/40";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { token, user } = await post("/auth/login", {
        email,
        password,
      });

      if (!token || !user || !user.role) {
        throw new Error("Invalid login response from server");
      }

      const role = String(user.role).toLowerCase().trim();

      const dashboardRoutes: Record<string, string> = {
        admin: "/admin",
        facilitator: "/facilitator",
        learner: "/learner",
      };

      const destination = dashboardRoutes[role];

      if (!destination) {
        throw new Error("Your account has an unsupported role.");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      router.replace(destination);
      router.refresh();

    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Login failed. Please try again."
      );
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-[75vh] items-center gap-10 lg:grid-cols-2">
      <div className="animate-fadeup space-y-6">
        <span className="inline-block rounded-full border border-cyan-400/40 bg-cyan-400/10 px-4 py-1 text-sm text-cyan-200">
          ✨ Global etiquette · Diversity · Inclusion
        </span>

        <h1 className="font-display text-5xl font-extrabold leading-tight lg:text-6xl">
          Build{" "}
          <span className="animate-gradient bg-gradient-to-r from-cyan-300 via-violet-400 to-pink-400 bg-clip-text text-transparent">
            bridges
          </span>{" "}
          across cultures
        </h1>

        <p className="max-w-md text-lg text-white/70">
          Learn through real scenarios, join workshops and earn badges as you grow.
        </p>

        <div className="flex flex-wrap gap-3 text-sm">
          <span className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
            <Globe2 size={16} className="text-cyan-300" /> Scenarios
          </span>
          <span className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
            <Users size={16} className="text-pink-300" /> Workshops
          </span>
          <span className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
            <Award size={16} className="text-amber-300" /> Badges
          </span>
        </div>
      </div>

      <form
        onSubmit={submit}
        className="auth-card animate-fadeup mx-auto w-full max-w-md space-y-5 rounded-3xl p-8"
      >
        <div>
          <h2 className="font-display text-3xl font-bold">
            Welcome back
          </h2>
          <p className="mt-1 text-sm text-white/60">
            Log in to continue your journey.
          </p>
        </div>

        <div className="relative">
          <Mail className="absolute left-3.5 top-3.5 text-white/50" size={18} />
          <input
            className={field}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-3.5 top-3.5 text-white/50" size={18} />
          <input
            className={field}
            type={show ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3.5 top-3.5 text-white/50 hover:text-white"
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {error && (
          <p className="rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="animate-gradient flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-violet-500 to-pink-500 py-3 font-semibold text-white shadow-lg shadow-violet-500/30 transition hover:scale-[1.02] disabled:opacity-60"
        >
          <LogIn size={18} />
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-center text-sm text-white/60">
          New here?{" "}
          <a
            href="/register"
            className="font-semibold text-cyan-300 hover:underline"
          >
            Create an account
          </a>
        </p>
      </form>
    </div>
  );
}