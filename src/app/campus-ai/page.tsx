"use client";

import * as React from "react";
import {
  Sparkles,
  Building2,
  GraduationCap,
  Briefcase,
  Bus,
  Home,
  FileCheck,
  Lightbulb,
  BookOpen,
  PhoneCall,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  FileText,
} from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CampusAiChat } from "@/components/campus-ai/CampusAiChat";
import { BVRIT_INSTITUTION_PROFILE, BVRIT_QUICK_CATEGORIES } from "@/lib/campus-ai/knowledge";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  academics: <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
  placements: <Briefcase className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />,
  transport: <Bus className="h-5 w-5 text-amber-600 dark:text-amber-400" />,
  hostels: <Home className="h-5 w-5 text-purple-600 dark:text-purple-400" />,
  exams: <FileCheck className="h-5 w-5 text-rose-600 dark:text-rose-400" />,
  innovation: <Lightbulb className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />,
  library: <BookOpen className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />,
  contacts: <PhoneCall className="h-5 w-5 text-red-600 dark:text-red-400" />,
  circulars: <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400" />,
  opportunities: <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
  assignments: <BookOpen className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />,
  digest: <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />,
};

export default function CampusAiPage() {
  const [selectedPrompt, setSelectedPrompt] = React.useState<string | undefined>(undefined);

  const handleCardClick = (query: string) => {
    setSelectedPrompt(query);
    // Scroll smoothly to chat section
    const chatElement = document.getElementById("bvrit-chat-section");
    if (chatElement) {
      chatElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <DashboardShell>
      <div className="space-y-6 pb-12">
        {/* 1. Page Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-xs border-0 text-xs">
                Sri Vishnu Educational Society (SVES)
              </Badge>
              <Badge className="bg-emerald-500/20 text-emerald-200 border-0 text-xs">
                UGC Autonomous • NAAC A+ • NBA
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
              CampusHub AI — BVRIT Narsapur Intelligence
            </h1>

            <p className="text-sm sm:text-base text-blue-100 leading-relaxed">
              Your official campus intelligence hub for students and faculty. Ask anything about departments, autonomous exam regulations, placements, bus routes, hostels, AIC-BVRIT incubation, and key campus contacts.
            </p>

            {/* Quick Metrics Bar */}
            <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5 border border-white/10">
                <span className="block text-[11px] text-blue-200">Established</span>
                <span className="text-base font-bold">1997</span>
              </div>
              <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5 border border-white/10">
                <span className="block text-[11px] text-blue-200">Campus Area</span>
                <span className="text-base font-bold">110 Acres</span>
              </div>
              <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5 border border-white/10">
                <span className="block text-[11px] text-blue-200">Highest Offer</span>
                <span className="text-base font-bold">₹44.14 LPA</span>
              </div>
              <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5 border border-white/10">
                <span className="block text-[11px] text-blue-200">College Buses</span>
                <span className="text-base font-bold">60+ Routes</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Interactive Category Exploration Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Explore BVRIT Campus Domains
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Select any domain to load verified institutional information and prompt the assistant.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {BVRIT_QUICK_CATEGORIES.map((cat) => (
              <Card
                key={cat.id}
                className="hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500 transition-all cursor-pointer group"
                onClick={() => handleCardClick(cat.sampleQueries[0])}
              >
                <CardContent className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:scale-110 transition-transform">
                      {CATEGORY_ICONS[cat.id]}
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {cat.label}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {cat.summary}
                    </p>
                  </div>

                  <div className="pt-1 text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                    Tap to ask: &ldquo;{cat.sampleQueries[0]}&rdquo;
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* 3. Main Conversational AI Interface */}
        <div id="bvrit-chat-section" className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Live Campus Intelligence Assistant
              </h2>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Grounded in BVRIT Narsapur Data
            </span>
          </div>

          <CampusAiChat initialQuestion={selectedPrompt} />
        </div>

        {/* 4. Quick Portals & Emergency Helpline Callout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Vedic.ai Callout */}
          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600 text-white shrink-0 mt-0.5">
              <FileCheck className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-blue-900 dark:text-blue-100">
                Vedic.ai Academic Portal (Edwisely)
              </h4>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5 leading-relaxed">
                Submit course assignments, track Outcome-Based Education (OBE) course outcomes, and review faculty evaluations on the official portal.
              </p>
              <div className="mt-2.5">
                <a
                  href={BVRIT_INSTITUTION_PROFILE.vedicPortalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <span>Launch Vedic.ai Portal</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Emergency Helpline Callout */}
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-red-600 text-white shrink-0 mt-0.5">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-red-900 dark:text-red-100">
                24/7 Campus Emergency Helplines
              </h4>
              <p className="text-xs text-red-700 dark:text-red-300 mt-0.5 leading-relaxed">
                Campus Ambulance: <span className="font-semibold">+91 94400 99108</span> • Anti-Ragging: <span className="font-semibold">1800-180-5522</span> • Security: <span className="font-semibold">+91 8458 222099</span>
              </p>
              <div className="mt-2.5">
                <button
                  type="button"
                  onClick={() => handleCardClick("What are the 24/7 campus emergency contact numbers?")}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 dark:text-red-400 hover:underline"
                >
                  <span>View All Directory Contacts</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
