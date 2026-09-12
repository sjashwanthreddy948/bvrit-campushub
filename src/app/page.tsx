import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Briefcase,
  Sparkles,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  GraduationCap,
  Building,
  ShieldCheck,
  TrendingUp,
  Search,
  Users,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LandingNav } from "@/components/layout/LandingNav";
import { Footer } from "@/components/layout/Footer";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 selection:bg-amber-500 selection:text-white">
      <LandingNav />

      {/* ── Institutional Accreditation Notice Bar ────────────────────── */}
      <div className="bg-slate-900 text-white text-xs py-2 px-4 text-center font-medium border-b border-slate-800 flex items-center justify-center gap-2 flex-wrap">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-bold text-[10px] uppercase">
          Placement Season 2025–2026
        </span>
        <span>B.V. Raju Institute of Technology • Autonomous • NAAC &apos;A+&apos; Grade • JNTU Hyderabad</span>
        <span className="hidden md:inline text-slate-400">|</span>
        <span className="text-amber-400 font-semibold hidden md:inline">1,540+ Campus Offers Confirmed</span>
      </div>

      {/* ── 1. HERO SECTION ────────────────────────────────────────────── */}
      <section className="relative pt-8 sm:pt-14 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Clear Academic Value & Actions */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs font-semibold text-amber-800 dark:text-amber-300">
              <Sparkles className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              <span>Official Centralized Career &amp; Academic Hub</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-slate-50 leading-[1.15]">
              BVRIT Campus Placement &amp; Academic <span className="text-amber-600 dark:text-amber-400">Coordination Portal</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              One unified platform for BVRITians. Track real-time placement drives across all 27 academic sections, calculate exact AI eligibility match scores, prepare ATS resumes, and access official department circulars.
            </p>

            {/* Quick Search Bar */}
            <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-xl">
              <div className="flex items-center gap-2.5 px-3 flex-1">
                <Search className="h-5 w-5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search 80+ active drives (Microsoft, Amazon, Qualcomm)..."
                  className="w-full text-sm bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
                  readOnly
                />
              </div>
              <Link href="/opportunities">
                <Button variant="primary" size="md" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-5 shrink-0 w-full sm:w-auto">
                  Search Drives
                </Button>
              </Link>
            </div>

            {/* Direct Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link href="/login">
                <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 shadow-sm">
                  Student Portal Login &rarr;
                </Button>
              </Link>
              <Link href="/coordinator/dashboard">
                <Button variant="outline" size="lg" className="border-slate-300 dark:border-slate-700 font-semibold">
                  TPO Officer Console
                </Button>
              </Link>
              <Link href="/ai">
                <Button variant="ghost" size="lg" className="text-amber-700 dark:text-amber-400 font-semibold gap-1.5">
                  <Sparkles className="h-4 w-4" /> Ask CampusHub AI
                </Button>
              </Link>
            </div>

            {/* Institutional Trust Indicators */}
            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" /> BVRIT Single Sign-On
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-blue-600" /> 27 Cohort Sections Tracked
              </span>
              <span className="flex items-center gap-1.5">
                <Award className="h-4 w-4 text-amber-600" /> Verified JNTUH Syllabus &amp; Placement Criteria
              </span>
            </div>
          </div>

          {/* Right Column: Featured Live Placement Drive Card */}
          <div className="lg:col-span-5">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-amber-500/40 p-6 sm:p-7 shadow-lg space-y-5 relative">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  Today&apos;s Featured Campus Drive
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                  Registration Open
                </span>
              </div>

              {/* Company & Role */}
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-slate-900 text-white font-black text-xl flex items-center justify-center shrink-0 shadow-sm border border-slate-800">
                  MS
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    Microsoft India
                  </h3>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Software Development Engineer (SDE-1)
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Hyderabad &bull; Full-Time Campus Hire
                  </p>
                </div>
              </div>

              {/* Package & Eligibility Grid */}
              <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-100 dark:border-slate-800">
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl">
                  <span className="text-slate-500 dark:text-slate-400 block text-xs font-medium">Annual CTC Package</span>
                  <span className="text-lg font-black text-slate-900 dark:text-slate-100">₹44.00 LPA</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl">
                  <span className="text-slate-500 dark:text-slate-400 block text-xs font-medium">Cutoff CGPA</span>
                  <span className="text-lg font-black text-slate-900 dark:text-slate-100">7.50+ / 10.0</span>
                </div>
              </div>

              {/* Schedule & Hall Info */}
              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-500 shrink-0" />
                  <span>Online Assessment: <strong>Today at 10:00 AM &bull; Kalam Block Lab 304</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>Target Branches: <strong>CSE, CSM, CSD, AIDS, IT, ECE</strong></span>
                </div>
              </div>

              {/* Action Button */}
              <Link href="/login" className="block w-full">
                <Button size="md" className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-xs">
                  Login &amp; Check Eligibility Match &rarr;
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* ── 4 Flagship Academic & Placement Metrics ─────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs text-center space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">₹44.0 LPA</div>
            <div className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Highest CTC Package</div>
            <div className="text-xs text-slate-500">Tier-1 Global Tech Offers</div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs text-center space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">1,540+</div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Total Campus Offers</div>
            <div className="text-xs text-slate-500">2025–26 Graduating Batch</div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs text-center space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">120+</div>
            <div className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Recruiting Partners</div>
            <div className="text-xs text-slate-500">Amazon, Microsoft, TCS, Qualcomm</div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs text-center space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">27</div>
            <div className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">Academic Sections</div>
            <div className="text-xs text-slate-500">Real-Time Turnout Tracking</div>
          </div>
        </div>
      </section>

      {/* ── 2. ACTIVE PLACEMENT DRIVES DIRECTORY ────────────────────────── */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Active Hiring Season
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              Featured Campus Placement Drives
            </h2>
          </div>
          <Link href="/opportunities" className="text-sm font-bold text-slate-900 dark:text-slate-100 hover:text-amber-600 flex items-center gap-1">
            <span>View All 80+ Drives</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Drive 1: Amazon */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:border-slate-400 dark:hover:border-slate-700 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                  Internship + PPO
                </span>
                <span className="text-xs text-slate-500">Due in 5 days</span>
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Amazon Web Services</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">SDE Cloud &amp; DevOps Intern</p>
              </div>
              <div className="text-sm font-black text-amber-600 dark:text-amber-400">
                ₹28.00 LPA CTC
              </div>
              <div className="text-xs text-slate-500">
                Eligible: B.Tech CSE, IT, ECE (CGPA ≥ 7.5)
              </div>
            </div>
            <Link href="/login" className="w-full">
              <Button variant="outline" size="sm" fullWidth className="font-semibold text-xs">
                View &amp; Prepare
              </Button>
            </Link>
          </div>

          {/* Drive 2: Microsoft */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-amber-500/40 p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded">
                  Active Spotlight
                </span>
                <span className="text-xs text-slate-500">Live Today</span>
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Microsoft India</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Software Development Engineer</p>
              </div>
              <div className="text-sm font-black text-amber-600 dark:text-amber-400">
                ₹44.00 LPA CTC
              </div>
              <div className="text-xs text-slate-500">
                Eligible: CSE, CSM, CSD, AIDS, ECE
              </div>
            </div>
            <Link href="/login" className="w-full">
              <Button size="sm" fullWidth className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs">
                Apply Now
              </Button>
            </Link>
          </div>

          {/* Drive 3: Qualcomm */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:border-slate-400 dark:hover:border-slate-700 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded">
                  Full Time Role
                </span>
                <span className="text-xs text-slate-500">Due in 8 days</span>
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Qualcomm India</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Embedded Software Engineer</p>
              </div>
              <div className="text-sm font-black text-amber-600 dark:text-amber-400">
                ₹18.50 LPA CTC
              </div>
              <div className="text-xs text-slate-500">
                Eligible: ECE, EEE, CSE (CGPA ≥ 7.0)
              </div>
            </div>
            <Link href="/login" className="w-full">
              <Button variant="outline" size="sm" fullWidth className="font-semibold text-xs">
                View &amp; Prepare
              </Button>
            </Link>
          </div>

          {/* Drive 4: Cognizant */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:border-slate-400 dark:hover:border-slate-700 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded">
                  Mass Hiring Drive
                </span>
                <span className="text-xs text-slate-500">Due in 12 days</span>
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Cognizant Technology</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">GenC Next Digital Specialist</p>
              </div>
              <div className="text-sm font-black text-amber-600 dark:text-amber-400">
                ₹6.75 LPA CTC
              </div>
              <div className="text-xs text-slate-500">
                Eligible: All 27 B.Tech Sections (CGPA ≥ 6.5)
              </div>
            </div>
            <Link href="/login" className="w-full">
              <Button variant="outline" size="sm" fullWidth className="font-semibold text-xs">
                View &amp; Prepare
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 3. FOUR ROLE-BASED PORTALS (Easy to Understand) ─────────────── */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8 bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Unified Institutional Access
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
            Dedicated Portals for the BVRIT Community
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Built specifically to solve placement, attendance, assignment, and communication challenges.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Portal 1 */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-3 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                <Briefcase className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Student Career Hub</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Discover matched drives, view eligibility breakdowns, calculate 100% profile match, and build ATS-verified resumes.
              </p>
            </div>
            <Link href="/login" className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline inline-flex items-center gap-1">
              <span>Enter as Student</span> &rarr;
            </Link>
          </div>

          {/* Portal 2 */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-3 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">TPO Officer Console</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Coordinate multi-round hiring drives, advance student shortlists, and broadcast reminders to class CR WhatsApp groups.
              </p>
            </div>
            <Link href="/coordinator/dashboard" className="text-xs font-bold text-blue-700 dark:text-blue-400 hover:underline inline-flex items-center gap-1">
              <span>Open TPO Dashboard</span> &rarr;
            </Link>
          </div>

          {/* Portal 3 */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-3 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                <GraduationCap className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Faculty &amp; Notices</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Publish official department circulars, assign academic homework, and monitor section-by-section submissions.
              </p>
            </div>
            <Link href="/faculty/dashboard" className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-1">
              <span>Faculty Portal</span> &rarr;
            </Link>
          </div>

          {/* Portal 4 */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-3 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">CampusHub AI Mentor</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                24/7 technical interviewer &amp; senior mentor answering campus queries, DSA problems, and company preparation roadmaps.
              </p>
            </div>
            <Link href="/ai" className="text-xs font-bold text-purple-700 dark:text-purple-400 hover:underline inline-flex items-center gap-1">
              <span>Launch AI Chat</span> &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* ── 4. FINAL CTA BANNER ─────────────────────────────────────────── */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 text-center space-y-5 shadow-lg">
          <h2 className="text-2xl sm:text-4xl font-black max-w-2xl mx-auto">
            Ready to Accelerate Your Career at BVRIT?
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
            Join 4,000+ students actively tracking on-campus drives, ATS resume scores, and academic circulars.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link href="/login">
              <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-8 shadow-sm">
                Login with Roll Number
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
