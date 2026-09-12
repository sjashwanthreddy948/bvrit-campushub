"use client";

import * as React from "react";
import Link from "next/link";
import {
  Briefcase,
  Users,
  Clock,
  Send,
  ExternalLink,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  MapPin,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Share2,
  Copy,
  Check,
  Building,
  UserX,
  Filter,
} from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { CoordinatorWhatsAppModal } from "@/components/coordinator/CoordinatorWhatsAppModal";
import {
  getCoordinatorOpportunities,
  OpportunityCoordinatorData,
  SectionBreakdown,
} from "@/lib/coordinator/actions";
import {
  COLLEGE_DEPARTMENTS,
  ALL_COLLEGE_SECTIONS,
} from "@/lib/coordinator/constants";
import { PillTag } from "@/components/ui/PillTag";
import { TpoDrivesManager } from "@/components/coordinator/TpoDrivesManager";
import { TpoActivitiesManager } from "@/components/coordinator/TpoActivitiesManager";
import { TpoAiConsole } from "@/components/coordinator/TpoAiConsole";
import { PlacementDrive } from "@/lib/tpo/types";
import { Sparkles, Calendar as CalendarIcon } from "lucide-react";

export default function CoordinatorDashboardPage() {
  const [opportunities, setOpportunities] = React.useState<OpportunityCoordinatorData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [totalDrives, setTotalDrives] = React.useState(0);
  const [totalApplications, setTotalApplications] = React.useState(0);
  const [overallRate, setOverallRate] = React.useState(0);
  const [availableSections, setAvailableSections] = React.useState<string[]>([]);

  // Search and filter
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedDept, setSelectedDept] = React.useState<string>("all");
  const [selectedSection, setSelectedSection] = React.useState<string>("all");
  const [activeTab, setActiveTab] = React.useState<"drives" | "activities" | "sections" | "ai">("drives");

  // Expanded student drawer per opportunity
  const [expandedOppId, setExpandedOppId] = React.useState<string | null>(null);
  const [activeStudentTab, setActiveStudentTab] = React.useState<Record<string, "applied" | "not_applied">>({});

  // WhatsApp Reminder Modal state
  const [reminderModalOpen, setReminderModalOpen] = React.useState(false);
  const [activeReminderOpp, setActiveReminderOpp] = React.useState<OpportunityCoordinatorData | null>(null);
  const [activeReminderSection, setActiveReminderSection] = React.useState<string>("all");

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCoordinatorOpportunities();
      setOpportunities(res.opportunities);
      setTotalDrives(res.totalDrives);
      setTotalApplications(res.totalApplications);
      setOverallRate(res.overallRate);
      setAvailableSections(res.availableSections);

      // Default expand the first opportunity
      if (res.opportunities.length > 0) {
        setExpandedOppId(res.opportunities[0].id);
      }
    } catch (err) {
      console.error("Failed to load coordinator data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenReminder = (opp: OpportunityCoordinatorData, sectionKey: string = "all") => {
    setActiveReminderOpp(opp);
    setActiveReminderSection(sectionKey);
    setReminderModalOpen(true);
  };

  const handleOpenDriveBroadcast = (drive: PlacementDrive) => {
    const existing = opportunities.find(
      (o) => o.id === drive.id || o.company.toLowerCase() === drive.company.toLowerCase()
    );
    if (existing) {
      handleOpenReminder(existing, "all");
    } else {
      const baseOpp = opportunities[0];
      const fallback: OpportunityCoordinatorData = {
        id: drive.id,
        title: drive.role,
        company: drive.company,
        type: "job",
        eligibility: `Min CGPA: ${drive.minCgpa}+, Depts: ${drive.eligibleDepartments.join(", ")}`,
        skills: drive.requiredSkills,
        deadline: drive.registrationDeadline,
        location: drive.location,
        work_mode: drive.workMode,
        package: drive.packageCtc,
        stipend: drive.stipend || null,
        totalEligible: drive.totalEligibleStudents,
        totalApplied: drive.registeredStudentIds.length,
        totalNotApplied: drive.totalEligibleStudents - drive.registeredStudentIds.length,
        overallParticipationRate: Math.round(
          (drive.registeredStudentIds.length / drive.totalEligibleStudents) * 100
        ),
        sections: baseOpp?.sections || {},
        isSaved: false,
        daysRemaining: 3,
        isClosed: false,
        description: `Campus placement drive for ${drive.company} - ${drive.role}`,
        application_url: `/opportunities/${drive.id}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      handleOpenReminder(fallback, "all");
    }
  };

  const filteredOpportunities = opportunities.filter((opp) => {
    const matchesSearch =
      opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.eligibility.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  return (
    <DashboardShell role="coordinator" userName="Dr. Lakshmi (Placement Officer)">
      <div className="space-y-6 pb-12 max-w-7xl mx-auto">
        {/* Executive TPO Coordination Header */}
        <div className="academic-card p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 font-bold text-xs">
                TPO Placement Cell
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs">
                BVRIT Narsapur &bull; Autonomous
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Coordination Suite
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
              Placement &amp; Career Coordination Hub
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              Track college-wide student application turnout across all 27 sections (CSE A-I, CSM A-C, CSD A-B, AIDS A-B, DS A-B, ECE A-C, EEE, MECH, CIVIL A-C, PHE) and broadcast targeted WhatsApp reminders.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <Link href="/coordinator/opportunities/new">
              <Button variant="primary" size="md" leftIcon={<Plus className="h-4 w-4" />} className="font-semibold shadow-xs">
                New Placement Drive
              </Button>
            </Link>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab("drives")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === "drives"
                ? "border-[#F59E0B] text-[#F59E0B]"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Briefcase className="h-4 w-4" />
            <span>Placement Drives &amp; Multi-Round</span>
          </button>

          <button
            onClick={() => setActiveTab("activities")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === "activities"
                ? "border-[#F59E0B] text-[#F59E0B]"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <CalendarIcon className="h-4 w-4 text-[#F59E0B]" />
            <span>Today's Placement Activities &amp; Schedules</span>
          </button>

          <button
            onClick={() => setActiveTab("sections")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === "sections"
                ? "border-[#F59E0B] text-[#F59E0B]"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Users className="h-4 w-4" />
            <span>27 Sections Turnout</span>
          </button>

          <button
            onClick={() => setActiveTab("ai")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === "ai"
                ? "border-[#F59E0B] text-[#F59E0B]"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Sparkles className="h-4 w-4 text-[#F59E0B]" />
            <span>TPO Placement AI Assistant</span>
          </button>
        </div>

        {/* TAB 1: PLACEMENT DRIVES & MULTI-ROUND MANAGEMENT */}
        {activeTab === "drives" && (
          <TpoDrivesManager onOpenBroadcast={handleOpenDriveBroadcast} />
        )}

        {/* TAB 2: TODAY'S PLACEMENT ACTIVITIES & SCHEDULES */}
        {activeTab === "activities" && (
          <TpoActivitiesManager />
        )}

        {/* TAB 2: 27 SECTIONS TURNOUT & CR REMINDERS */}
        {activeTab === "sections" && (
          <div className="space-y-6">
            {/* 1. Summary Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">Active Placement Drives</p>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
                  {totalDrives}
                </h3>
                <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
                  Across BVRIT Campus
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                <Briefcase className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">Total Applications</p>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
                  {totalApplications}
                </h3>
                <p className="text-[11px] text-blue-600 font-medium mt-0.5">
                  Tracked in CampusHub
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">Participation Rate</p>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
                  {overallRate}%
                </h3>
                <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
                  Cohort average
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">Closing Soon (≤ 3 Days)</p>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
                  {opportunities.filter((o) => o.daysRemaining <= 3 && !o.isClosed).length}
                </h3>
                <p className="text-[11px] text-red-600 font-medium mt-0.5">
                  Reminders Recommended
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950 text-red-600 flex items-center justify-center">
                <Clock className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 2. Search & Section Filter with Capsule Pills */}
        <div className="academic-card p-4 sm:p-5 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search drives by company (Amazon, Google...), role, or eligibility..."
                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Branch & Section Filtering */}
          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-slate-500 shrink-0">Branch:</span>
              <PillTag
                label="All Branches (10)"
                active={selectedDept === "all"}
                onClick={() => {
                  setSelectedDept("all");
                  setSelectedSection("all");
                }}
                size="sm"
              />
              {COLLEGE_DEPARTMENTS.map((dept) => (
                <PillTag
                  key={dept.code}
                  label={`${dept.code} (${dept.sections.length})`}
                  active={selectedDept === dept.code}
                  onClick={() => {
                    setSelectedDept(dept.code);
                    setSelectedSection("all");
                  }}
                  size="sm"
                />
              ))}
            </div>

            <div className="flex items-center gap-1.5 flex-wrap pt-1.5 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-500 shrink-0">Target Section:</span>
              <PillTag
                label={selectedDept === "all" ? "All 27 Sections (Broadcast)" : `All ${selectedDept} Sections`}
                active={selectedSection === "all"}
                onClick={() => setSelectedSection("all")}
                size="sm"
              />
              {(selectedDept === "all"
                ? ALL_COLLEGE_SECTIONS
                : COLLEGE_DEPARTMENTS.find((d) => d.code === selectedDept)?.sections || []
              ).map((sec) => (
                <PillTag
                  key={sec}
                  label={sec}
                  active={selectedSection === sec}
                  onClick={() => setSelectedSection(sec)}
                  size="sm"
                />
              ))}
            </div>
          </div>
        </div>

        {/* 3. Opportunities List with Detailed Section Breakdown */}
        {loading ? (
          <LoadingState message="Aggregating section participation records..." />
        ) : filteredOpportunities.length === 0 ? (
          <EmptyState
            icon={<Briefcase className="h-6 w-6" />}
            title="No placement drives found"
            description="No recruitment opportunities match your current filter."
          />
        ) : (
          <div className="space-y-5">
            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span>
                Showing <strong>{filteredOpportunities.length}</strong> active placement drives
              </span>
              <span>Click any drive to view student shortlists &amp; send WhatsApp reminders</span>
            </div>

            {filteredOpportunities.map((opp) => {
              const isExpanded = expandedOppId === opp.id;
              const activeTab = activeStudentTab[opp.id] || "applied";

              // Get targeted sections
              const targetSectionKeys =
                selectedSection !== "all"
                  ? [selectedSection].filter((k) => opp.sections[k])
                  : selectedDept !== "all"
                  ? (COLLEGE_DEPARTMENTS.find((d) => d.code === selectedDept)?.sections || []).filter(
                      (k) => opp.sections[k]
                    )
                  : Object.keys(opp.sections);

              // Aggregate counts for targeted sections
              let displayAppliedCount = 0;
              let displayNotAppliedCount = 0;
              let displayTotal = 0;
              let displayAppliedList: any[] = [];
              let displayNotAppliedList: any[] = [];

              targetSectionKeys.forEach((k) => {
                const sec = opp.sections[k];
                if (sec) {
                  displayAppliedCount += sec.appliedCount;
                  displayNotAppliedCount += sec.notAppliedCount;
                  displayTotal += sec.totalStudents;
                  displayAppliedList = [...displayAppliedList, ...sec.appliedStudents];
                  displayNotAppliedList = [...displayNotAppliedList, ...sec.notAppliedStudents];
                }
              });

              const displayRate =
                displayTotal > 0 ? Math.round((displayAppliedCount / displayTotal) * 100) : 0;

              return (
                <Card
                  key={opp.id}
                  className={`overflow-hidden transition-all border-slate-200 dark:border-slate-800 ${
                    isExpanded ? "ring-2 ring-blue-500/20 shadow-md" : "hover:border-blue-300"
                  }`}
                >
                  <CardContent className="p-0">
                    {/* Header Row */}
                    <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-800">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                            {opp.company}
                          </span>
                          <Badge variant={opp.type === "internship" ? "purple" : "blue"} size="sm">
                            {opp.type}
                          </Badge>
                          <Badge
                            variant={
                              opp.daysRemaining <= 1
                                ? "danger"
                                : opp.daysRemaining <= 3
                                ? "warning"
                                : "secondary"
                            }
                            size="sm"
                          >
                            {opp.daysRemaining <= 1
                              ? "🚨 Deadline Tomorrow"
                              : `Due in ${opp.daysRemaining} days`}
                          </Badge>
                          {opp.work_mode && (
                            <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {opp.location} ({opp.work_mode})
                            </span>
                          )}
                        </div>

                        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                          {opp.title}
                        </h3>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                          {opp.stipend || opp.package ? (
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                              💰 {opp.stipend || opp.package}
                            </span>
                          ) : null}
                          <span>•</span>
                          <span>🎯 {opp.eligibility}</span>
                        </div>
                      </div>

                      {/* Right Action Bar */}
                      <div className="flex items-center gap-2 shrink-0 self-start lg:self-center">
                        {/* Primary WhatsApp Reminder Button for this drive */}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenReminder(opp, selectedSection)}
                          leftIcon={<MessageCircle className="h-4 w-4 text-emerald-600" />}
                          className="bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 min-h-[40px]"
                        >
                          Send WhatsApp Reminder
                        </Button>

                        <button
                          type="button"
                          onClick={() => setExpandedOppId(isExpanded ? null : opp.id)}
                          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
                          title={isExpanded ? "Collapse section details" : "Expand section details"}
                        >
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Section Breakdown Mini Bar */}
                    <div className="px-4 sm:px-5 py-3 bg-white dark:bg-slate-950 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 text-xs">
                      {/* Section-wise pill stats */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          Section Participation:
                        </span>
                        {targetSectionKeys.map((secKey) => {
                          const sec = opp.sections[secKey];
                          if (!sec) return null;
                          return (
                            <div
                              key={secKey}
                              className={`px-2.5 py-1 rounded-lg border text-xs flex items-center gap-1.5 ${
                                selectedSection === secKey
                                  ? "bg-blue-50 border-blue-300 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold"
                                  : "bg-slate-50 border-slate-200 dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                              }`}
                            >
                              <span>{secKey}:</span>
                              <span className="text-emerald-600 font-semibold">{sec.appliedCount} Applied</span>
                              <span>/</span>
                              <span className="text-red-500 font-semibold">{sec.notAppliedCount} Pending</span>
                              <span className="text-slate-400 font-mono">({sec.participationRate}%)</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenReminder(opp, secKey);
                                }}
                                title={`Send WhatsApp Reminder to ${secKey}`}
                                className="ml-1 text-emerald-600 hover:text-emerald-700 p-0.5 hover:bg-emerald-100 rounded cursor-pointer"
                              >
                                <MessageCircle className="h-3 w-3" />
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      {/* Total progress */}
                      <div className="flex items-center gap-2.5 shrink-0">
                        <span className="font-semibold text-slate-600 dark:text-slate-400">
                          Total: <strong className="text-slate-900 dark:text-slate-100">{opp.totalApplied}</strong> / {opp.totalEligible} Applied ({opp.overallParticipationRate}%)
                        </span>
                        <div className="w-24 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${opp.overallParticipationRate}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Expandable Section Details: Applied vs Not Applied Lists */}
                    {isExpanded && (
                      <div className="p-4 sm:p-6 bg-slate-50/40 dark:bg-slate-900/20 space-y-4">
                        {/* Selector Tabs: Applied vs Not Applied */}
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setActiveStudentTab((prev) => ({ ...prev, [opp.id]: "applied" }))
                              }
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer min-h-[36px] flex items-center gap-1.5 ${
                                activeTab === "applied"
                                  ? "bg-emerald-600 text-white shadow-xs"
                                  : "text-slate-600 hover:bg-slate-200/60 dark:hover:bg-slate-800"
                              }`}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Applied Students ({displayAppliedCount})</span>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setActiveStudentTab((prev) => ({ ...prev, [opp.id]: "not_applied" }))
                              }
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer min-h-[36px] flex items-center gap-1.5 ${
                                activeTab === "not_applied"
                                  ? "bg-red-600 text-white shadow-xs"
                                  : "text-slate-600 hover:bg-slate-200/60 dark:hover:bg-slate-800"
                              }`}
                            >
                              <UserX className="h-3.5 w-3.5" />
                              <span>Not Applied / Pending ({displayNotAppliedCount})</span>
                            </button>
                          </div>

                          <span className="text-xs text-slate-500 hidden sm:inline">
                            {selectedSection === "all" ? "Showing all sections" : `Filtered to Section ${selectedSection}`}
                          </span>
                        </div>

                        {/* Student Records Grid / Cards */}
                        {activeTab === "applied" ? (
                          displayAppliedList.length === 0 ? (
                            <p className="text-xs text-slate-500 italic p-3 text-center">
                              No students have applied from this section yet.
                            </p>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                              {displayAppliedList.map((st: any) => (
                                <div
                                  key={st.id}
                                  className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs shadow-xs"
                                >
                                  <div className="space-y-0.5">
                                    <span className="font-bold text-slate-900 dark:text-slate-100 block">
                                      {st.name}
                                    </span>
                                    <span className="text-[11px] text-slate-500 block">
                                      Roll: <code>{st.rollNumber}</code> • Sec {st.section} • CGPA: {st.cgpa}
                                    </span>
                                  </div>
                                  <Badge
                                    variant={
                                      st.status === "selected"
                                        ? "success"
                                        : st.status === "interview"
                                        ? "purple"
                                        : "blue"
                                    }
                                    size="sm"
                                    className="uppercase text-[10px]"
                                  >
                                    {st.status || "Applied"}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          )
                        ) : displayNotAppliedList.length === 0 ? (
                          <p className="text-xs text-emerald-600 font-semibold italic p-3 text-center">
                            🎉 100% of students from this section have applied!
                          </p>
                        ) : (
                          <div className="space-y-3">
                            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between">
                              <span>
                                ⚠️ <strong>{displayNotAppliedCount} eligible students</strong> have not yet applied for <strong>{opp.company}</strong>.
                              </span>
                              <Button
                                size="sm"
                                onClick={() => handleOpenReminder(opp, selectedSection)}
                                leftIcon={<MessageCircle className="h-3.5 w-3.5" />}
                                className="bg-amber-600 hover:bg-amber-700 text-white text-xs min-h-[34px]"
                              >
                                Send Section Reminder
                              </Button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                              {displayNotAppliedList.map((st: any) => (
                                <div
                                  key={st.id}
                                  className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-red-100 dark:border-red-950/40 flex items-center justify-between text-xs shadow-xs"
                                >
                                  <div className="space-y-0.5">
                                    <span className="font-bold text-slate-900 dark:text-slate-100 block">
                                      {st.name}
                                    </span>
                                    <span className="text-[11px] text-slate-500 block">
                                      Roll: <code>{st.rollNumber}</code> • Sec {st.section} • CGPA: {st.cgpa}
                                    </span>
                                  </div>
                                  <Badge variant="danger" size="sm" className="text-[10px]">
                                    Not Applied
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
          </div>
        )}

        {/* TAB 3: TPO PLACEMENT AI ASSISTANT */}
        {activeTab === "ai" && <TpoAiConsole />}

        {/* Advanced TPO WhatsApp Reminder Dispatch Modal */}
        <CoordinatorWhatsAppModal
          isOpen={reminderModalOpen}
          onClose={() => setReminderModalOpen(false)}
          opportunity={activeReminderOpp}
          initialSectionKey={activeReminderSection}
        />
      </div>
    </DashboardShell>
  );
}
