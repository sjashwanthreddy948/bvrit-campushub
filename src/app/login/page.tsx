"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CheckCircle2, Lock, Mail, Eye, EyeOff, AlertCircle, ArrowLeft, ShieldCheck, GraduationCap, Users, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { loginUser } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";

type RoleOption = "student" | "faculty" | "coordinator" | "hod" | "admin";

const ROLE_TABS: { id: RoleOption; label: string; email: string; desc: string }[] = [
  { id: "student", label: "Student", email: "student@college.edu", desc: "Alex Johnson • 22CSE042" },
  { id: "faculty", label: "Faculty", email: "faculty@college.edu", desc: "Prof. Sharma • CSE Dept" },
  { id: "coordinator", label: "TPO Officer", email: "coordinator@college.edu", desc: "Dr. Lakshmi • Placement Cell" },
  { id: "hod", label: "HOD", email: "hod@college.edu", desc: "Dr. Rao • Head of Department" },
  { id: "admin", label: "Admin", email: "admin@college.edu", desc: "System Administrator" },
];

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = React.useState<RoleOption>("student");
  const [email, setEmail] = React.useState("student@college.edu");
  const [password, setPassword] = React.useState("campus2026");
  const [showPassword, setShowPassword] = React.useState(false);
  const [keepSignedIn, setKeepSignedIn] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleRoleChange = (role: RoleOption) => {
    setSelectedRole(role);
    const target = ROLE_TABS.find((t) => t.id === role);
    if (target) {
      setEmail(target.email);
      setPassword("campus2026");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your institutional email and password.");
      return;
    }

    setLoading(true);

    try {
      const res = await loginUser({ email: email.trim(), password });
      if (!res.success) {
        setError(res.error || "Invalid institutional credentials.");
        setLoading(false);
        return;
      }

      if (res.redirectUrl) {
        window.location.href = res.redirectUrl;
      } else {
        window.location.href = "/dashboard";
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100">
      
      {/* Top Bar Back Link */}
      <div className="w-full max-w-5xl mb-4 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to BVRIT Portal</span>
        </Link>
        <span className="text-xs font-semibold text-slate-500">
          Campus Placement Session 2025–26
        </span>
      </div>

      {/* 2-Panel Card Container */}
      <div className="w-full max-w-5xl rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
        
        {/* ── Left Institutional Panel ─────────────────────────────────── */}
        <div className="lg:col-span-5 relative p-8 sm:p-10 flex flex-col justify-between bg-slate-900 text-white overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800">
          <div className="space-y-6 relative z-10">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 shadow-sm">
                <Image src="/images/bvrit-logo.png" alt="BVRIT Crest" width={36} height={36} className="object-contain" />
              </div>
              <div>
                <span className="font-extrabold text-white text-base tracking-tight block">BVRIT Narsapur</span>
                <span className="text-xs text-amber-400 font-semibold">Autonomous • NAAC &apos;A+&apos; Grade</span>
              </div>
            </div>

            <div className="space-y-2 pt-4">
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                Campus Placement &amp; Academic Portal
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Centralized access for BVRIT students, faculty mentors, department heads, and the Training &amp; Placement Cell.
              </p>
            </div>

            <div className="space-y-3 pt-3 text-xs text-slate-200">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>1,540+ Campus Placement Offers</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>27 Academic Sections Turnout Tracking</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>AI Grounded in Official Campus Records</span>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 text-[11px] text-slate-400 relative z-10">
            Sri Vishnu Educational Society &bull; Vishnupur, Narsapur, Telangana &bull; Est. 1997
          </div>
        </div>

        {/* ── Right Form & Role Switcher Panel ──────────────────────────── */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                Sign In to Your Account
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                Select your campus role or use your institutional email.
              </p>
            </div>

            {/* 5-Role Pill Switcher */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Select Campus Role
              </label>
              <div className="grid grid-cols-5 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
                {ROLE_TABS.map((tab) => {
                  const active = selectedRole === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => handleRoleChange(tab.id)}
                      className={cn(
                        "py-2 px-1 text-xs font-bold rounded-lg transition-all text-center select-none truncate",
                        active
                          ? "bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 shadow-xs"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                      )}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-500 text-right">
                Current demo account: <strong className="text-slate-800 dark:text-slate-200">{ROLE_TABS.find(t => t.id === selectedRole)?.desc}</strong>
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-300">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Institutional Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. student@college.edu"
                    required
                    className="w-full h-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 pr-4 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full h-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 pr-10 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={keepSignedIn}
                    onChange={(e) => setKeepSignedIn(e.target.checked)}
                    className="rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                  />
                  <span>Keep me signed in</span>
                </label>
                <span className="text-slate-500 hover:underline cursor-pointer">Need help logging in?</span>
              </div>

              <Button
                type="submit"
                size="lg"
                fullWidth
                isLoading={loading}
                className="mt-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-sm"
              >
                Sign In as {ROLE_TABS.find(t => t.id === selectedRole)?.label} &rarr;
              </Button>
            </form>
          </div>

          <div className="text-center text-xs text-slate-500 pt-4 border-t border-slate-100 dark:border-slate-800">
            For technical support or institutional credentials, contact the BVRIT IT Helpdesk at{" "}
            <span className="text-slate-800 dark:text-slate-200 font-semibold">helpdesk@bvrit.ac.in</span>
          </div>
        </div>
      </div>
    </div>
  );
}
