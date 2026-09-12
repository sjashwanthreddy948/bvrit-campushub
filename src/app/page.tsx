"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowLeft,
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
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LandingNav } from "@/components/layout/LandingNav";
import { Footer } from "@/components/layout/Footer";

interface HeroSlide {
  id: number;
  breadcrumb: string;
  highlightCategory: string;
  title: string;
  highlightWord: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  stat1Value: string;
  stat1Label: string;
  stat2Value: string;
  stat2Label: string;
  badgeText: string;
  ctaText: string;
  ctaLink: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 0,
    breadcrumb: "Home/",
    highlightCategory: "CAMPUS PLACEMENT",
    title: "TECH ACHIEVERS",
    highlightWord: "ACHIEVERS",
    description:
      "B.V. Raju Institute of Technology engineering graduates leading top multinational tech teams. With a highest package of ₹44.00 LPA and 1,540+ campus offers, BVRIT equips students with the algorithmic mastery and industry readiness required by tier-1 global recruiters.",
    imageSrc: "/images/hero_student.jpg",
    imageAlt: "BVRIT Tech Achiever holding laptop displaying code",
    stat1Value: "₹44.0 LPA",
    stat1Label: "Highest CTC Package",
    stat2Value: "1,540+",
    stat2Label: "Campus Offers Confirmed",
    badgeText: "Placement Season 2025–26",
    ctaText: "Explore 80+ Placement Drives",
    ctaLink: "/opportunities",
  },
  {
    id: 1,
    breadcrumb: "Home/",
    highlightCategory: "AI CAREER ACCELERATOR",
    title: "INNOVATION LEADERS",
    highlightWord: "LEADERS",
    description:
      "Empowered by Vedic.ai, single-column ATS resume verification, and automated placement eligibility algorithms. Over 120+ top engineering employers recruit annually from BVRIT's 27 academic cohorts with real-time match intelligence.",
    imageSrc: "/images/hero_student_2.jpg",
    imageAlt: "BVRIT Innovation Leader with analytics ultrabook",
    stat1Value: "120+",
    stat1Label: "Recruiting Partners",
    stat2Value: "100%",
    stat2Label: "ATS Parser Compliant",
    badgeText: "Vedic.ai & Career Studio",
    ctaText: "Launch CampusHub AI",
    ctaLink: "/ai",
  },
  {
    id: 2,
    breadcrumb: "Home/",
    highlightCategory: "ACADEMIC EXCELLENCE",
    title: "SUPER 27 COHORTS",
    highlightWord: "COHORTS",
    description:
      "JNTU Hyderabad autonomous syllabus with NAAC 'A+' grade accreditation. Real-time section monitoring across CSE, CSM, CSD, AIDS, IT, ECE, and core engineering sections with instant WhatsApp circular and assignment broadcasts.",
    imageSrc: "/images/hero_student.jpg",
    imageAlt: "BVRIT Academic Excellence Student",
    stat1Value: "27 Sections",
    stat1Label: "Cohort CR Telemetry",
    stat2Value: "NAAC 'A+'",
    stat2Label: "Autonomous JNTUH",
    badgeText: "Sri Vishnu Educational Society",
    ctaText: "Open TPO Console",
    ctaLink: "/coordinator/dashboard",
  },
];

export default function LandingPage() {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [isTransitioning, setIsTransitioning] = React.useState(false);

  const slide = HERO_SLIDES[currentSlide];

  const handleNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    setTimeout(() => setIsTransitioning(false), 250);
  };

  const handlePrev = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
    setTimeout(() => setIsTransitioning(false), 250);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 overflow-x-hidden selection:bg-[#E23636] selection:text-white">
      <LandingNav />

      {/* ── Institutional Accreditation Notice Bar ────────────────────── */}
      <div className="bg-slate-900 text-white text-xs py-2 px-4 text-center font-medium border-b border-slate-800 flex items-center justify-center gap-2 flex-wrap z-20">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#E23636] text-white font-bold text-[10px] uppercase">
          Placement Season 2025–2026
        </span>
        <span>B.V. Raju Institute of Technology • Autonomous • NAAC &apos;A+&apos; Grade • JNTU Hyderabad</span>
        <span className="hidden md:inline text-slate-400">|</span>
        <span className="text-amber-400 font-semibold hidden md:inline">1,540+ Campus Offers Confirmed</span>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* ── 1. MARVEL-STYLE EDITORIAL HERO SHOWCASE ───────────────────────── */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[580px] lg:min-h-[700px] w-full flex items-center overflow-hidden bg-white dark:bg-[#0B0F17] border-b border-slate-100 dark:border-slate-800/80">
        
        {/* ── GIANT BACKGROUND TYPOGRAPHY WATERMARK ("BVRIT") ────────────── */}
        <div
          aria-hidden="true"
          className="absolute -top-4 lg:top-6 left-4 lg:left-8 select-none pointer-events-none font-black text-[120px] sm:text-[200px] lg:text-[260px] leading-none tracking-tighter text-slate-900/[0.04] dark:text-white/[0.04] z-0 uppercase font-sans"
        >
          BVRIT
        </div>

        {/* ── DYNAMIC ANGLED DIAGONAL SLASH (Right Side Polygon) ─────────── */}
        <div
          className="hidden lg:block absolute top-0 right-0 h-full w-[55%] z-0"
          style={{
            clipPath: "polygon(28% 0, 100% 0, 100% 100%, 0% 100%)",
            background: "linear-gradient(135deg, #E23636 0%, #B91C1C 60%, #991B1B 100%)",
          }}
        >
          {/* Subtle geometric dot grid inside diagonal slash */}
          <div
            className="w-full h-full opacity-15"
            style={{
              backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.5) 1px, transparent 1px)`,
              backgroundSize: "28px 28px",
            }}
          />
        </div>

        {/* Secondary diagonal accent border */}
        <div
          className="hidden lg:block absolute top-0 right-[41.5%] h-full w-[2px] z-0 bg-white/20 pointer-events-none"
          style={{
            transform: "skewX(-16deg)",
          }}
        />

        {/* ── RIGHTMOST VERTICAL DASH PAGINATION INDICATOR ───────────────── */}
        <div className="absolute right-4 sm:right-6 lg:right-8 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-3">
          {HERO_SLIDES.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentSlide(idx)}
              className="group py-1.5 focus:outline-none cursor-pointer"
              aria-label={`Jump to slide ${idx + 1}`}
            >
              <div
                className={`transition-all duration-300 rounded-full ${
                  currentSlide === idx
                    ? "w-8 h-1.5 bg-white lg:bg-white shadow-md"
                    : "w-4 h-1 bg-slate-300 dark:bg-slate-700 lg:bg-white/40 hover:w-6 hover:bg-white/80"
                }`}
              />
            </button>
          ))}
        </div>

        {/* ── MAIN CONTENT CONTAINER ─────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-10 sm:py-16 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 items-center">
            
            {/* ── LEFT COLUMN: EDITORIAL NARRATIVE & CONTROLS ─────────────── */}
            <div className="lg:col-span-6 space-y-6 sm:space-y-7 pr-0 lg:pr-6">
              
              {/* Top Red Brand Stamp (Echoing the Iconic Marvel Red Box) */}
              <div className="flex items-center gap-3">
                <div className="bg-[#E23636] text-white font-black tracking-tight text-xl sm:text-2xl px-3.5 py-1 uppercase shadow-md inline-block rounded-xs">
                  BVRIT
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Sri Vishnu Educational Society
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    Autonomous &bull; NAAC &apos;A+&apos; Grade
                  </span>
                </div>
              </div>

              {/* Breadcrumb & Giant Red Hero Headline */}
              <div className="space-y-2">
                <div className="text-xs sm:text-sm font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
                  <span>{slide.breadcrumb}</span>
                  <span className="text-slate-900 dark:text-slate-100 font-black ml-0.5">
                    {slide.highlightCategory}
                  </span>
                </div>

                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[#E23636] uppercase leading-[0.95] drop-shadow-xs transition-opacity duration-300">
                  {slide.title}
                </h1>
              </div>

              {/* Editorial Paragraph */}
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg transition-opacity duration-300">
                {slide.description}
              </p>

              {/* Quick Stat Highlights */}
              <div className="grid grid-cols-2 gap-3 max-w-md pt-1">
                <div className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-3 rounded-xl">
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-medium">
                    {slide.stat1Label}
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
                    {slide.stat1Value}
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-3 rounded-xl">
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-medium">
                    {slide.stat2Label}
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
                    {slide.stat2Value}
                  </span>
                </div>
              </div>

              {/* Primary Call-to-Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link href={slide.ctaLink}>
                  <Button size="lg" className="bg-[#E23636] hover:bg-[#c52d2d] text-white font-bold px-7 shadow-md">
                    {slide.ctaText} &rarr;
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg" className="border-slate-300 dark:border-slate-700 font-semibold">
                    Student Login
                  </Button>
                </Link>
              </div>

              {/* ── BOTTOM ROW: SOCIAL ICONS & ANGLED PARALLELOGRAM CONTROLS ── */}
              <div className="flex items-center justify-between pt-5 border-t border-slate-100 dark:border-slate-800/80 max-w-lg">
                
                {/* Minimalist Social / Official Links (as seen in Marvel reference) */}
                <div className="flex items-center gap-4 text-slate-700 dark:text-slate-300 text-xs font-bold">
                  <a
                    href="https://bvrit.ac.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#E23636] transition-colors"
                    title="Official BVRIT Website"
                  >
                    BVRIT.AC.IN
                  </a>
                  <span className="text-slate-300 dark:text-slate-700">&bull;</span>
                  <Link href="/coordinator/dashboard" className="hover:text-[#E23636] transition-colors">
                    TPO DESK
                  </Link>
                  <span className="text-slate-300 dark:text-slate-700">&bull;</span>
                  <Link href="/ai" className="hover:text-[#E23636] transition-colors">
                    AI CHAT
                  </Link>
                </div>

                {/* ── ANGLED PARALLELOGRAM CONTROLS [ ← ] [ → ] ────────────── */}
                <div className="flex items-center gap-2">
                  {/* Left Button (Dark Skewed Parallelogram) */}
                  <button
                    type="button"
                    onClick={handlePrev}
                    aria-label="Previous story"
                    className="h-11 w-14 bg-slate-900 dark:bg-black text-white hover:bg-slate-800 transition-all flex items-center justify-center -skew-x-12 shadow-sm cursor-pointer active:scale-95"
                  >
                    <ArrowLeft className="h-5 w-5 skew-x-12" />
                  </button>

                  {/* Right Button (White/Red Skewed Parallelogram) */}
                  <button
                    type="button"
                    onClick={handleNext}
                    aria-label="Next story"
                    className="h-11 w-14 bg-white text-slate-900 border-2 border-slate-900 hover:bg-[#E23636] hover:text-white hover:border-[#E23636] transition-all flex items-center justify-center -skew-x-12 shadow-sm cursor-pointer active:scale-95"
                  >
                    <ArrowRight className="h-5 w-5 skew-x-12" />
                  </button>
                </div>

              </div>

            </div>

            {/* ── RIGHT COLUMN: DYNAMIC HERO CENTERPIECE ─────────────────── */}
            <div className="lg:col-span-6 relative flex items-center justify-center lg:justify-end">
              
              {/* Background Glow Circle behind Achiever */}
              <div className="absolute w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-red-500/20 blur-3xl pointer-events-none" />

              {/* Dynamic Centerpiece Frame breaking through diagonal */}
              <div className="relative z-10 w-full max-w-[440px] sm:max-w-[480px] lg:max-w-[500px]">
                
                {/* Hero Student Image */}
                <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 bg-slate-900 group">
                  <Image
                    src={slide.imageSrc}
                    alt={slide.imageAlt}
                    fill
                    priority
                    className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Dramatic Gradient Overlay at base */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent pointer-events-none" />

                  {/* Floating Live Badge inside image */}
                  <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/20 text-white text-xs font-bold">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{slide.badgeText}</span>
                  </div>

                  {/* Floating Bottom Card inside image */}
                  <div className="absolute bottom-4 left-4 right-4 z-10 p-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/60 dark:border-slate-700/60 shadow-lg flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#E23636] text-white flex items-center justify-center font-black text-sm shrink-0">
                        BV
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          BVRIT Placement Intelligence
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          Autonomous &bull; 27 Engineering Cohorts
                        </div>
                      </div>
                    </div>
                    <Link href="/opportunities">
                      <span className="text-xs font-black text-[#E23636] hover:underline flex items-center gap-0.5">
                        <span>View</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    </Link>
                  </div>
                </div>

                {/* Floating External Metric Chip (Top Right) */}
                <div className="absolute -top-3 -right-3 sm:-right-5 z-20 bg-white dark:bg-slate-900 p-3 rounded-2xl border-2 border-[#E23636] shadow-xl text-center hidden sm:block">
                  <div className="text-base font-black text-[#E23636]">₹44.0 LPA</div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Highest CTC
                  </div>
                </div>

                {/* Floating External Metric Chip (Bottom Left) */}
                <div className="absolute -bottom-3 -left-3 sm:-left-5 z-20 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl hidden sm:flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900 dark:text-slate-100">1,540+ Offers</div>
                    <div className="text-[10px] text-slate-500">2025–26 Batch</div>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* ── 2. QUICK SEARCH BAR & STATS SUMMARY ───────────────────────────── */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="bg-slate-50 dark:bg-slate-900/60 p-4 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-10 h-10 rounded-2xl bg-[#E23636]/10 text-[#E23636] flex items-center justify-center shrink-0">
              <Search className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Direct Drive &amp; Circular Lookup
              </h3>
              <p className="text-xs text-slate-500">
                Search Microsoft, Amazon, Qualcomm, TCS Digital, and all 80+ active drives.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Link href="/opportunities" className="w-full sm:w-auto">
              <Button size="md" className="bg-slate-900 hover:bg-slate-800 text-white font-bold w-full sm:w-auto shadow-xs">
                Browse All Drives &rarr;
              </Button>
            </Link>
            <Link href="/ai" className="w-full sm:w-auto">
              <Button variant="outline" size="md" className="border-slate-300 dark:border-slate-700 font-semibold w-full sm:w-auto">
                <Sparkles className="h-4 w-4 text-[#E23636] mr-1.5" />
                Ask AI Mentor
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* ── 3. ACTIVE PLACEMENT DRIVES DIRECTORY ──────────────────────────── */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#E23636]">
              Active Hiring Season
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 mt-1">
              Featured Campus Placement Drives
            </h2>
          </div>
          <Link
            href="/opportunities"
            className="text-sm font-bold text-[#E23636] hover:underline flex items-center gap-1"
          >
            <span>View All 80+ Drives</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Drive 1: Amazon */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:border-slate-400 dark:hover:border-slate-700 transition-all flex flex-col justify-between space-y-4">
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
              <div className="text-sm font-black text-[#E23636]">
                ₹28.00 LPA CTC
              </div>
              <div className="text-xs text-slate-500">
                Eligible: B.Tech CSE, IT, ECE (CGPA &ge; 7.5)
              </div>
            </div>
            <Link href="/login" className="w-full">
              <Button variant="outline" size="sm" fullWidth className="font-semibold text-xs">
                View &amp; Prepare
              </Button>
            </Link>
          </div>

          {/* Drive 2: Microsoft */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-[#E23636]/40 p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#E23636] bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded">
                  Active Spotlight
                </span>
                <span className="text-xs text-slate-500">Live Today</span>
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Microsoft India</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Software Development Engineer</p>
              </div>
              <div className="text-sm font-black text-[#E23636]">
                ₹44.00 LPA CTC
              </div>
              <div className="text-xs text-slate-500">
                Eligible: CSE, CSM, CSD, AIDS, ECE
              </div>
            </div>
            <Link href="/login" className="w-full">
              <Button size="sm" fullWidth className="bg-[#E23636] hover:bg-[#c52d2d] text-white font-bold text-xs">
                Apply Now
              </Button>
            </Link>
          </div>

          {/* Drive 3: Qualcomm */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:border-slate-400 dark:hover:border-slate-700 transition-all flex flex-col justify-between space-y-4">
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
              <div className="text-sm font-black text-[#E23636]">
                ₹18.50 LPA CTC
              </div>
              <div className="text-xs text-slate-500">
                Eligible: ECE, EEE, CSE (CGPA &ge; 7.0)
              </div>
            </div>
            <Link href="/login" className="w-full">
              <Button variant="outline" size="sm" fullWidth className="font-semibold text-xs">
                View &amp; Prepare
              </Button>
            </Link>
          </div>

          {/* Drive 4: Cognizant */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:border-slate-400 dark:hover:border-slate-700 transition-all flex flex-col justify-between space-y-4">
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
              <div className="text-sm font-black text-[#E23636]">
                ₹6.75 LPA CTC
              </div>
              <div className="text-xs text-slate-500">
                Eligible: All 27 B.Tech Sections (CGPA &ge; 6.5)
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

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* ── 4. FOUR ROLE-BASED PORTALS (Institutional Architecture) ──────── */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8 bg-slate-50 dark:bg-slate-900/40 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#E23636]">
            Unified Institutional Ecosystem
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
            Dedicated Consoles for the BVRIT Community
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Designed to address recruitment, coursework, assignments, and placement telemetry.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Portal 1 */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between shadow-xs">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/60 text-[#E23636] flex items-center justify-center font-bold">
                <Briefcase className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Student Career Hub</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Discover matched drives, view eligibility breakdowns, calculate profile match, and export ATS-verified resumes.
              </p>
            </div>
            <Link href="/login" className="text-xs font-bold text-[#E23636] hover:underline inline-flex items-center gap-1">
              <span>Enter as Student</span> &rarr;
            </Link>
          </div>

          {/* Portal 2 */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between shadow-xs">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center font-bold">
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
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between shadow-xs">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold">
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
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between shadow-xs">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center font-bold">
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

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* ── 5. FINAL ACCELERATOR CALL TO ACTION ───────────────────────────── */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 text-center space-y-5 shadow-xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#E23636]/20 rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-2xl sm:text-4xl font-black max-w-2xl mx-auto relative z-10">
            Ready to Accelerate Your Career at BVRIT?
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto relative z-10">
            Join 4,000+ students actively tracking on-campus drives, ATS resume scores, and academic circulars.
          </p>
          <div className="flex justify-center gap-3 pt-2 relative z-10">
            <Link href="/login">
              <Button size="lg" className="bg-[#E23636] hover:bg-[#c52d2d] text-white font-bold px-8 shadow-md">
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
