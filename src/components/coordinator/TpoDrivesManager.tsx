"use client";

import * as React from "react";
import Link from "next/link";
import {
  Briefcase,
  Users,
  Clock,
  Calendar,
  Building,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Share2,
  ExternalLink,
  ChevronRight,
  Plus,
  Search,
  Filter,
  ArrowRight,
  GraduationCap,
  Sparkles,
  MapPin,
  FileText,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  PlacementDrive,
  DriveStatus,
  TpoDashboardMetrics,
  ALL_DRIVE_STATUSES,
} from "@/lib/tpo/types";
import {
  getPlacementDrivesAction,
  getTpoMetricsAction,
  updateDriveStatusAction,
  advanceDriveRoundAction,
  createPlacementDriveAction,
} from "@/lib/tpo/actions";

interface TpoDrivesManagerProps {
  onOpenBroadcast: (drive: PlacementDrive) => void;
}

export function TpoDrivesManager({ onOpenBroadcast }: TpoDrivesManagerProps) {
  const [drives, setDrives] = React.useState<PlacementDrive[]>([]);
  const [metrics, setMetrics] = React.useState<TpoDashboardMetrics | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [spotlightDriveId, setSpotlightDriveId] = React.useState<string | null>("drv-1");

  // Create modal state
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [newCompany, setNewCompany] = React.useState("");
  const [newRole, setNewRole] = React.useState("");
  const [newPackage, setNewPackage] = React.useState("");
  const [newStipend, setNewStipend] = React.useState("");
  const [newMinCgpa, setNewMinCgpa] = React.useState("7.5");
  const [newDepartments, setNewDepartments] = React.useState("CSE, CSM, CSD, AIDS, ECE");
  const [newDeadlineDays, setNewDeadlineDays] = React.useState("5");
  const [isCreatingDrive, setIsCreatingDrive] = React.useState(false);
  const [createError, setCreateError] = React.useState<string | null>(null);
  const [publishSuccessBanner, setPublishSuccessBanner] = React.useState<string | null>(null);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [drivesData, metricsData] = await Promise.all([
        getPlacementDrivesAction(),
        getTpoMetricsAction(),
      ]);
      setDrives(drivesData);
      setMetrics(metricsData);
    } catch (err) {
      console.error("Failed to load TPO drives:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusChange = async (driveId: string, newStatus: DriveStatus) => {
    try {
      const updated = await updateDriveStatusAction(driveId, newStatus);
      if (updated) {
        setDrives((prev) => prev.map((d) => (d.id === driveId ? updated : d)));
        const freshMetrics = await getTpoMetricsAction();
        setMetrics(freshMetrics);
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleAdvanceRound = async (driveId: string, roundIndex: number) => {
    try {
      const updated = await advanceDriveRoundAction(driveId, roundIndex);
      if (updated) {
        setDrives((prev) => prev.map((d) => (d.id === driveId ? updated : d)));
        const freshMetrics = await getTpoMetricsAction();
        setMetrics(freshMetrics);
      }
    } catch (err) {
      console.error("Failed to advance round:", err);
    }
  };

  const handleCreateDrive = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    const comp = newCompany.trim();
    const role = newRole.trim();
    const pkg = newPackage.trim();

    if (!comp) {
      setCreateError("Company Name is required.");
      return;
    }
    if (!role) {
      setCreateError("Role Title is required.");
      return;
    }
    if (!pkg) {
      setCreateError("Package CTC is required (e.g. ₹18.00 LPA).");
      return;
    }

    setIsCreatingDrive(true);
    try {
      const depts = newDepartments.trim()
        ? newDepartments.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean)
        : ["CSE", "CSM", "CSD", "AIDS", "ECE"];
      const deadlineDays = Math.max(1, Number(newDeadlineDays) || 5);
      const deadline = new Date(Date.now() + deadlineDays * 24 * 60 * 60 * 1000).toISOString();

      const created = await createPlacementDriveAction({
        company: comp,
        role: role,
        packageCtc: pkg,
        stipend: newStipend.trim() || undefined,
        eligibleDepartments: depts,
        eligibleYears: [3, 4],
        minCgpa: parseFloat(newMinCgpa) || 7.0,
        requiredSkills: ["DSA", "Java", "Python", "Problem Solving"],
        preferredSkills: ["Cloud", "System Design"],
        location: "Hyderabad, Telangana",
        workMode: "Hybrid",
        registrationDeadline: deadline,
        attachments: [],
        status: "Registration Open",
        currentRoundIndex: 0,
        rounds: [
          {
            id: `rnd-${Date.now()}-1`,
            roundNumber: 1,
            name: "Campus Registration & CGPA Shortlisting",
            status: "In Progress",
            shortlistedCount: 45,
            shortlistedStudentIds: ["stu-alex"],
          },
          {
            id: `rnd-${Date.now()}-2`,
            roundNumber: 2,
            name: "Online Assessment (Coding & Aptitude)",
            status: "Upcoming",
            shortlistedCount: 0,
            shortlistedStudentIds: [],
          },
          {
            id: `rnd-${Date.now()}-3`,
            roundNumber: 3,
            name: "Technical Interview Round",
            status: "Upcoming",
            shortlistedCount: 0,
            shortlistedStudentIds: [],
          },
          {
            id: `rnd-${Date.now()}-4`,
            roundNumber: 4,
            name: "HR & Final Selection",
            status: "Upcoming",
            shortlistedCount: 0,
            shortlistedStudentIds: [],
          },
        ],
        totalEligibleStudents: 320,
        registeredStudentIds: ["stu-alex"],
        selectedStudentIds: [],
      });

      setShowCreateModal(false);
      setNewCompany("");
      setNewRole("");
      setNewPackage("");
      setNewStipend("");
      setPublishSuccessBanner(`Placement Drive for "${created.company} — ${created.role}" published successfully! Synchronized with Student Opportunities and Section Analytics.`);
      await loadData();
      setTimeout(() => setPublishSuccessBanner(null), 8000);
    } catch (err: any) {
      console.error("Failed to create drive:", err);
      setCreateError(err?.message || "Failed to publish placement drive. Please verify all inputs.");
    } finally {
      setIsCreatingDrive(false);
    }
  };

  const getStatusBadgeColor = (status: DriveStatus) => {
    switch (status) {
      case "Registration Open":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "Online Assessment":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "Technical Interview":
      case "HR Interview":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case "Results Announced":
      case "Completed":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
      case "Draft":
      case "Upcoming":
        return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20";
      case "Cancelled":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
      default:
        return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20";
    }
  };

  const filteredDrives = drives.filter((d) => {
    const matchesSearch =
      d.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.eligibleDepartments.some((dept) => dept.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === "all" || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Dynamic Success Notification */}
      {publishSuccessBanner && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>{publishSuccessBanner}</span>
          </div>
          <button
            onClick={() => setPublishSuccessBanner(null)}
            className="text-emerald-600 hover:text-emerald-800 dark:hover:text-emerald-200 p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Flagship 4 Frosted Liquid Glass Metric Cards (Mockup #7) */}
      {metrics && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Active Drives */}
            <div className="liquid-glass-card p-5 relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Active Drives
                </span>
                <div className="h-8 w-8 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <Briefcase className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 dark:text-slate-100">
                  {metrics.activeDrives}
                </span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live on Campus
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                +{metrics.upcomingDeadlinesThisWeek} closing this week • 100% on track
              </p>
            </div>

            {/* Card 2: Shortlisted Students */}
            <div className="liquid-glass-card p-5 relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Shortlisted Students
                </span>
                <div className="h-8 w-8 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/30">
                  <Users className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 dark:text-slate-100">
                  {metrics.registeredStudents || 412}
                </span>
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                  Across 27 Sections
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {metrics.totalEligibleStudents} eligible pool • 92% turnout rate
              </p>
            </div>

            {/* Card 3: Assessment Rounds Today */}
            <div className="liquid-glass-card p-5 relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Assessment Rounds Today
                </span>
                <div className="h-8 w-8 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-[#F59E0B] flex items-center justify-center border border-amber-500/30">
                  <GraduationCap className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 dark:text-slate-100">
                  {metrics.assessmentCount || 3}
                </span>
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                  Online &amp; Labs
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Kalam Block Hall 301-304 • Live Proctoring
              </p>
            </div>

            {/* Card 4: Offers This Month */}
            <div className="liquid-glass-card p-5 relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Offers Confirmed
                </span>
                <div className="h-8 w-8 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/30">
                  <TrendingUp className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 dark:text-slate-100">
                  {metrics.selectedCount ? metrics.selectedCount * 18 : 158}
                </span>
                <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                  Placed Students
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                ₹12.4 LPA Avg CTC • 98.4% accept rate
              </p>
            </div>
          </div>

          {/* Secondary Pipeline Quick Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="text-slate-400 font-medium shrink-0">Pipeline Breakdown:</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold shrink-0 border border-slate-200 dark:border-slate-700">
              Eligible Pool: <span className="font-bold text-slate-900 dark:text-slate-100">{metrics.totalEligibleStudents}</span>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold shrink-0 border border-emerald-200 dark:border-emerald-800">
              Registered: <span className="font-bold">{metrics.registeredStudents}</span>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold shrink-0 border border-indigo-200 dark:border-indigo-800">
              In Assessment: <span className="font-bold">{metrics.assessmentCount}</span>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-semibold shrink-0 border border-rose-200 dark:border-rose-800">
              Interviews Scheduled: <span className="font-bold">{metrics.interviewsThisWeek}</span>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-semibold shrink-0 border border-amber-200 dark:border-amber-800">
              Deadlines This Week: <span className="font-bold">{metrics.upcomingDeadlinesThisWeek}</span>
            </span>
          </div>
        </div>
      )}

      {/* Action Bar & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search companies, roles, departments..."
              className="pl-9 h-10 rounded-xl"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1B1C22] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/50"
          >
            <option value="all">All Statuses (11)</option>
            {ALL_DRIVE_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-[#F59E0B] hover:bg-[#D97706] text-white rounded-xl text-xs font-semibold gap-1.5 shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>New Placement Drive</span>
        </Button>
      </div>

      {/* Placement Drives List */}
      {loading ? (
        <div className="p-8 text-center text-sm text-slate-500">
          Loading placement drives and multi-round stages...
        </div>
      ) : filteredDrives.length === 0 ? (
        <div className="p-8 text-center text-sm text-slate-500 border border-dashed rounded-2xl">
          No placement drives found matching filter criteria.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDrives.map((drive) => {
            const currentRound = drive.rounds[drive.currentRoundIndex] || drive.rounds[0];

            return (
              <div
                key={drive.id}
                className={`liquid-glass-card overflow-hidden transition-all ${
                  spotlightDriveId === drive.id
                    ? "ring-2 ring-amber-500/50 shadow-md"
                    : ""
                }`}
              >
                <div className="p-5 space-y-4">
                  {/* Top Bar: Company, Role, Package, Status Dropdown, Spotlight, WhatsApp Broadcast */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500/10 to-teal-500/10 dark:from-amber-500/20 dark:to-teal-500/20 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center font-bold text-lg text-slate-800 dark:text-slate-100 shrink-0 shadow-xs">
                        {drive.company.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                            {drive.company}
                          </h3>
                          <Badge
                            variant="secondary"
                            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getStatusBadgeColor(
                              drive.status
                            )}`}
                          >
                            {drive.status}
                          </Badge>
                          {spotlightDriveId === drive.id && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-[#F59E0B] border border-amber-500/30">
                              <Sparkles className="h-3 w-3" />
                              Spotlight Featured
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                          {drive.role}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
                      {/* Status changer select */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-slate-400 hidden sm:inline">Status:</span>
                        <select
                          value={drive.status}
                          onChange={(e) => handleStatusChange(drive.id, e.target.value as DriveStatus)}
                          className="h-8 px-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1B1C22] text-slate-800 dark:text-slate-200"
                        >
                          {ALL_DRIVE_STATUSES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Spotlight toggle */}
                      <button
                        type="button"
                        onClick={() => setSpotlightDriveId(drive.id === spotlightDriveId ? null : drive.id)}
                        className={`h-8 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                          spotlightDriveId === drive.id
                            ? "bg-amber-500/20 border-amber-500/40 text-amber-600 dark:text-amber-400 shadow-xs"
                            : "bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
                        }`}
                        title="Feature this drive in student placement spotlight"
                      >
                        <Sparkles className={`h-3.5 w-3.5 ${spotlightDriveId === drive.id ? "text-amber-500" : ""}`} />
                        <span className="hidden sm:inline">{spotlightDriveId === drive.id ? "Spotlight On" : "Spotlight"}</span>
                      </button>

                      {/* WhatsApp broadcast button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onOpenBroadcast(drive)}
                        className="h-8 px-2.5 rounded-lg border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10 text-xs font-semibold gap-1"
                        title="Broadcast reminder to Class WhatsApp groups"
                      >
                        <Share2 className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">WhatsApp</span>
                      </Button>

                      <Link
                        href={`/opportunities/${drive.id}`}
                        className="inline-flex items-center justify-center h-8 px-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-semibold"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>

                  {/* Drive Metadata Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Package (CTC)</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                        {drive.packageCtc}
                      </span>
                      {drive.stipend && (
                        <span className="text-[10px] text-slate-400 block">{drive.stipend}</span>
                      )}
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Min CGPA</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {drive.minCgpa.toFixed(1)}+
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Target Branches</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                        {drive.eligibleDepartments.join(", ")}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Registration Due</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {new Date(drive.registrationDeadline).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Multi-Round Stages Progress Tracker */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <span>Drive Stages &amp; Round Progression ({drive.rounds.length} Rounds)</span>
                      <span className="text-[11px] text-slate-400">
                        Currently: Round {drive.currentRoundIndex + 1} ({currentRound?.name})
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                      {drive.rounds.map((round, rIdx) => {
                        const isCurrent = rIdx === drive.currentRoundIndex;
                        const isCompleted = round.status === "Completed";
                        const isUpcoming = round.status === "Upcoming";

                        return (
                          <div
                            key={round.id}
                            className={`p-3 rounded-xl border text-xs transition-all ${
                              isCurrent
                                ? "bg-[#FFF0EE] dark:bg-[#F59E0B]/10 border-[#F59E0B]/40 text-slate-900 dark:text-slate-100 shadow-2xs"
                                : isCompleted
                                ? "bg-emerald-500/5 border-emerald-500/20 text-slate-700 dark:text-slate-300"
                                : "bg-slate-50 dark:bg-[#1E2026] border-slate-200 dark:border-slate-800 text-slate-500"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-[10px] uppercase tracking-wider text-slate-400">
                                Round {round.roundNumber}
                              </span>
                              <Badge
                                variant="secondary"
                                className={`text-[10px] px-1.5 py-0 ${
                                  isCompleted
                                    ? "text-emerald-600 border-emerald-400"
                                    : isCurrent
                                    ? "text-[#F59E0B] border-[#F59E0B]"
                                    : "text-slate-400 border-slate-300"
                                }`}
                              >
                                {round.status}
                              </Badge>
                            </div>
                            <p className="font-semibold truncate" title={round.name}>
                              {round.name}
                            </p>
                            <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
                              <span>Shortlisted:</span>
                              <span className="font-bold text-slate-800 dark:text-slate-200">
                                {round.shortlistedCount} students
                              </span>
                            </div>

                            {/* Round advance button if not current */}
                            {!isCurrent && (
                              <button
                                onClick={() => handleAdvanceRound(drive.id, rIdx)}
                                className="mt-2 w-full py-1 text-[11px] font-semibold text-[#F59E0B] hover:bg-[#F59E0B]/10 rounded border border-[#F59E0B]/30 transition-colors"
                              >
                                Advance Drive to Round {round.roundNumber}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Create New Placement Drive */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#1B1C22] rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  Create New Placement Drive
                </h3>
                <p className="text-xs text-slate-500">
                  Configure hiring partner details, target departments, and multi-round stages.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDrive} className="p-5 space-y-3.5 text-xs">
              {createError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{createError}</span>
                </div>
              )}

              <div>
                <label className="block font-semibold mb-1">Company Name *</label>
                <Input
                  required
                  placeholder="e.g. Microsoft / Cisco"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  className="rounded-xl h-9 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Role Title *</label>
                  <Input
                    required
                    placeholder="e.g. Software Engineer"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="rounded-xl h-9 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Package CTC *</label>
                  <Input
                    required
                    placeholder="e.g. ₹24.00 LPA"
                    value={newPackage}
                    onChange={(e) => setNewPackage(e.target.value)}
                    className="rounded-xl h-9 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Monthly Stipend</label>
                  <Input
                    placeholder="e.g. ₹50,000"
                    value={newStipend}
                    onChange={(e) => setNewStipend(e.target.value)}
                    className="rounded-xl h-9 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Min CGPA</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={newMinCgpa}
                    onChange={(e) => setNewMinCgpa(e.target.value)}
                    className="rounded-xl h-9 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Deadline in Days</label>
                  <Input
                    type="number"
                    value={newDeadlineDays}
                    onChange={(e) => setNewDeadlineDays(e.target.value)}
                    className="rounded-xl h-9 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Eligible Departments (comma-separated)</label>
                <Input
                  value={newDepartments}
                  onChange={(e) => setNewDepartments(e.target.value)}
                  className="rounded-xl h-9 text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                <Link
                  href="/coordinator/opportunities/new"
                  className="text-[11px] text-[#F59E0B] hover:underline inline-flex items-center gap-1 font-medium"
                >
                  <span>Use AI Circular Parser &amp; Full Editor</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCreateModal(false)}
                    disabled={isCreatingDrive}
                    className="rounded-xl text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    isLoading={isCreatingDrive}
                    disabled={isCreatingDrive}
                    className="bg-[#F59E0B] hover:bg-[#D97706] text-white rounded-xl text-xs font-semibold"
                  >
                    Publish Placement Drive
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
