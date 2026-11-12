"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Lock,
  UserPlus,
  GraduationCap,
  Presentation,
} from "lucide-react";
import { post } from "@/lib/api";

const field =
  "w-full rounded-xl border border-white/15 bg-white/10 py-3 pl-11 pr-4 text-white outline-none placeholder:text-white/40 transition focus:border-pink-400 focus:ring-2 focus:ring-pink-400/40";

export default function Register() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("learner");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Register user and redirect according to role
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { token, user } = await post("/auth/register", {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
      });

      const dashboardRoutes: Record<string, string> = {
        admin: "/admin",
        facilitator: "/facilitator",
        learner: "/learner",
      };

      const userRole = String(user.role).toLowerCase().trim();
      const destination = dashboardRoutes[userRole];

      if (!destination) {
        throw new Error("Invalid user role. Please contact the administrator.");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      router.replace(destination);
      router.refresh();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Registration failed. Please try again."
      );
      setLoading(false);
    }
  }

  const roles = [
    {
      id: "learner",
      label: "Employee",
      icon: GraduationCap,
    },
    {
      id: "facilitator",
      label: "Trainer",
      icon: Presentation,
    },
  ];

  return (
    <div className="flex min-h-[75vh] items-center justify-center">
      <form
        onSubmit={submit}
        className="auth-card animate-fadeup w-full max-w-md space-y-5 rounded-3xl p-8"
      >
        <div>
          <h2 className="font-display text-3xl font-bold">
            Join{" "}
            <span className="animate-gradient bg-gradient-to-r from-pink-400 via-violet-400 to-cyan-300 bg-clip-text text-transparent">
              CultureBridge
            </span>
          </h2>

          <p className="mt-1 text-sm text-white/60">
            Create your account in seconds.
          </p>
        </div>

        {/* Name */}
        <div className="relative">
          <User
            className="absolute left-3.5 top-3.5 text-white/50"
            size={18}
          />
          <input
            className={field}
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* Email */}
        <div className="relative">
          <Mail
            className="absolute left-3.5 top-3.5 text-white/50"
            size={18}
          />
          <input
            className={field}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Password */}
        <div className="relative">
          <Lock
            className="absolute left-3.5 top-3.5 text-white/50"
            size={18}
          />
          <input
            className={field}
            type="password"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>

        {/* Select role */}
        <div className="grid grid-cols-2 gap-3">
          {roles.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setRole(id)}
              className={`flex flex-col items-center gap-1 rounded-xl border py-3 text-sm font-semibold transition ${
                role === id
                  ? "border-pink-400 bg-pink-500/20 text-white shadow-lg shadow-pink-500/20"
                  : "border-white/15 bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              <Icon size={22} />
              {label}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <p className="rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="animate-gradient flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 via-violet-500 to-cyan-500 py-3 font-semibold text-white shadow-lg shadow-pink-500/30 transition hover:scale-[1.02] disabled:opacity-60"
        >
          <UserPlus size={18} />
          {loading ? "Creating..." : "Create account"}
        </button>

        <p className="text-center text-sm text-white/60">
          Already have an account?{" "}
          <a
            href="/login"
            className="font-semibold text-pink-300 hover:underline"
          >
            Login
          </a>
        </p>
      </form>
    </div>
  );
}