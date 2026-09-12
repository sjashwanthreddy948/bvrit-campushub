"use client";

import * as React from "react";
import Link from "next/link";
import {
  Briefcase,
  SlidersHorizontal,
  Search,
  Bookmark,
  ExternalLink,
  Calendar,
  MapPin,
  Clock,
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  Building,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { TeamworkLaptopIllustration } from "@/components/illustrations/CollegiateScenes";
import { PillTag } from "@/components/ui/PillTag";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import {
  getOpportunities,
  saveOpportunity,
  unsaveOpportunity,
  OpportunityCardData,
  OpportunityFilterParams,
} from "@/lib/opportunities/actions";

const opportunityTypes = [
  { value: "all", label: "All Types" },
  { value: "internship", label: "Internship" },
  { value: "job", label: "Full-Time Job" },
  { value: "hackathon", label: "Hackathon" },
  { value: "competition", label: "Competition" },
  { value: "scholarship", label: "Scholarship" },
  { value: "workshop", label: "Workshop" },
];

const workModes = [
  { value: "all", label: "All Work Modes" },
  { value: "On-site", label: "On-site" },
  { value: "Remote", label: "Remote" },
  { value: "Hybrid", label: "Hybrid" },
];

const deadlineFilters = [
  { value: "all", label: "All Deadlines" },
  { value: "active", label: "Active Only" },
  { value: "closing_soon", label: "Closing Soon (≤ 7 days)" },
  { value: "closed", label: "Closed / Expired" },
];

const sortOptions = [
  { value: "match_highest", label: "Highest Match % (Best Fit)" },
  { value: "newest", label: "Newest First" },
  { value: "deadline_soonest", label: "Deadline Soonest" },
  { value: "recently_updated", label: "Recently Updated" },
];

export default function OpportunitiesDiscoveryPage() {
  const [opportunities, setOpportunities] = React.useState<OpportunityCardData[]>([]);
  const [total, setTotal] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(1);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [feedbackMessage, setFeedbackMessage] = React.useState<string | null>(null);

  // Search state (with debounce)
  const [searchInput, setSearchInput] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");

  // Filter & sort states
  const [selectedType, setSelectedType] = React.useState("all");
  const [selectedWorkMode, setSelectedWorkMode] = React.useState("all");
  const [selectedDeadline, setSelectedDeadline] = React.useState<"all" | "active" | "closing_soon" | "closed">("all");
  const [selectedSort, setSelectedSort] = React.useState<"newest" | "deadline_soonest" | "recently_updated" | "match_highest">("match_highest");
  const [isFilterModalOpen, setIsFilterModalOpen] = React.useState(false);

  // Debounce search input by 300ms
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setCurrentPage(1); // Reset to page 1 on search change
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Load opportunities
  const loadOpportunities = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await getOpportunities({
        search: debouncedSearch,
        type: selectedType,
        workMode: selectedWorkMode,
        deadlineFilter: selectedDeadline,
        sortBy: selectedSort,
        page: currentPage,
        pageSize: 6,
      });

      setOpportunities(res.opportunities);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err) {
      console.error("Failed to load opportunities:", err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedType, selectedWorkMode, selectedDeadline, selectedSort, currentPage]);

  React.useEffect(() => {
    loadOpportunities();
  }, [loadOpportunities]);

  const handleToggleSave = async (opp: OpportunityCardData) => {
    try {
      if (opp.isSaved) {
        const res = await unsaveOpportunity(opp.id);
        setFeedbackMessage(res.message);
        setOpportunities((prev) =>
          prev.map((o) => (o.id === opp.id ? { ...o, isSaved: false } : o))
        );
      } else {
        const res = await saveOpportunity(opp.id);
        setFeedbackMessage(res.message);
        setOpportunities((prev) =>
          prev.map((o) => (o.id === opp.id ? { ...o, isSaved: true } : o))
        );
      }
      setTimeout(() => setFeedbackMessage(null), 3000);
    } catch {
      setFeedbackMessage("Unable to update save status.");
    }
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setDebouncedSearch("");
    setSelectedType("all");
    setSelectedWorkMode("all");
    setSelectedDeadline("all");
    setSelectedSort("match_highest");
    setCurrentPage(1);
    setIsFilterModalOpen(false);
  };

  const activeFiltersCount =
    (selectedType !== "all" ? 1 : 0) +
    (selectedWorkMode !== "all" ? 1 : 0) +
    (selectedDeadline !== "all" ? 1 : 0) +
    (debouncedSearch.trim() ? 1 : 0);

  const renderDeadlineBadge = (opp: OpportunityCardData) => {
    if (opp.isClosed) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 px-2 py-0.5 rounded">
          <Clock className="h-3 w-3" /> Closed
        </span>
      );
    }
    if (opp.daysRemaining === 0) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 px-2 py-0.5 rounded">
          <Clock className="h-3 w-3" /> Deadline Today
        </span>
      );
    }
    if (opp.daysRemaining === 1) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded">
          <Clock className="h-3 w-3" /> Deadline Tomorrow
        </span>
      );
    }
    if (opp.daysRemaining <= 7) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded">
          <Clock className="h-3 w-3" /> Deadline in {opp.daysRemaining} days
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
        <Calendar className="h-3.5 w-3.5" /> Due in {opp.daysRemaining} days
      </span>
    );
  };

  return (
    <DashboardShell role="student" userName="Alex Johnson">
      {/* 0. ILLUSTRATED OPPORTUNITY DISCOVERY HERO */}
      <div className="w-full rounded-3xl bg-white dark:bg-[#1B1C22] border border-[#F0E4E2] dark:border-[#2B2C35] p-5 sm:p-7 shadow-xs relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
        <div className="space-y-2.5 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="amber">Recruitment &amp; Internships</Badge>
            <Badge variant="powder">BVRIT Verified</Badge>
            <span className="text-xs text-slate-500 font-semibold">{total} Active Drives</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1A1D20] dark:text-[#F4EBE9] leading-tight">
            Campus Opportunity Discovery <span className="text-[#F59E0B]">✦</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-lg leading-relaxed">
            Verified full-time software engineering roles, summer internships, and technical hackathons posted directly by the campus placement cell.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-2">
            <PillTag
              label="All Opportunities"
              active={selectedType === "all"}
              onClick={() => setSelectedType("all")}
              size="sm"
            />
            <PillTag
              label="Internships"
              active={selectedType === "internship"}
              onClick={() => setSelectedType("internship")}
              size="sm"
            />
            <PillTag
              label="Full-Time Jobs"
              active={selectedType === "job"}
              onClick={() => setSelectedType("job")}
              size="sm"
            />
            <PillTag
              label="Hackathons"
              active={selectedType === "hackathon"}
              onClick={() => setSelectedType("hackathon")}
              size="sm"
            />
          </div>
        </div>

        <div className="shrink-0 max-w-[240px] hidden md:block">
          <TeamworkLaptopIllustration className="max-h-[160px]" />
        </div>
      </div>

      {/* 1. HEADER */}
      <div className="flex flex-col gap-2 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Opportunities
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Discover internships, jobs, hackathons and more.
            </p>
          </div>
          <Link href="/saved">
            <Button variant="outline" size="sm" leftIcon={<Bookmark className="h-4 w-4" />}>
              Saved Items
            </Button>
          </Link>
        </div>

        {feedbackMessage && (
          <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-900 text-xs flex items-center gap-2 animate-in fade-in">
            <Check className="h-4 w-4 text-blue-600 shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
        )}
      </div>

      {/* 2. FAST DEBOUNCED SEARCH & FILTERS BAR */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
          {/* Search Input */}
          <div className="flex-1 max-w-lg relative">
            <Input
              placeholder="Search by title, company, skills, or description..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              leftIcon={<Search className="h-4 w-4 text-slate-400" />}
              rightIcon={
                searchInput ? (
                  <button
                    type="button"
                    onClick={() => setSearchInput("")}
                    className="p-1 hover:text-slate-700 dark:hover:text-slate-200"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null
              }
            />
          </div>

          {/* Desktop Filter & Sort Controls */}
          <div className="hidden sm:flex items-center gap-2">
            <Select
              options={opportunityTypes}
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setCurrentPage(1);
              }}
              className="h-11 text-xs w-36"
            />

            <Select
              options={workModes}
              value={selectedWorkMode}
              onChange={(e) => {
                setSelectedWorkMode(e.target.value);
                setCurrentPage(1);
              }}
              className="h-11 text-xs w-36"
            />

            <Select
              options={sortOptions}
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value as any)}
              className="h-11 text-xs w-44"
            />

            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
              >
                Clear
              </Button>
            )}
          </div>

          {/* Mobile Filter & Sort Button */}
          <div className="sm:hidden flex items-center gap-2">
            <Button
              variant="outline"
              size="md"
              fullWidth
              onClick={() => setIsFilterModalOpen(true)}
              leftIcon={<SlidersHorizontal className="h-4 w-4" />}
            >
              Filters & Sort {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ""}
            </Button>
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="md"
                onClick={handleClearFilters}
                className="shrink-0 px-3"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Active Filter Chips Bar */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
            <span className="text-slate-500 mr-1 font-medium">Active:</span>
            {selectedType !== "all" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                Type: {selectedType}
                <button type="button" onClick={() => setSelectedType("all")}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {selectedWorkMode !== "all" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                Mode: {selectedWorkMode}
                <button type="button" onClick={() => setSelectedWorkMode("all")}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {selectedDeadline !== "all" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                Deadline: {selectedDeadline}
                <button type="button" onClick={() => setSelectedDeadline("all")}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {debouncedSearch && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                Search: &quot;{debouncedSearch}&quot;
                <button type="button" onClick={() => setSearchInput("")}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Mobile Filter Modal / Drawer */}
      <Modal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        title="Filter & Sort Opportunities"
        description="Refine opportunities by type, work mode, and deadline"
        footer={
          <div className="flex gap-2 w-full">
            <Button variant="outline" fullWidth onClick={handleClearFilters}>
              Reset
            </Button>
            <Button fullWidth onClick={() => setIsFilterModalOpen(false)}>
              Apply Filters
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Select
            label="Sort By"
            options={sortOptions}
            value={selectedSort}
            onChange={(e) => setSelectedSort(e.target.value as any)}
          />

          <Select
            label="Opportunity Type"
            options={opportunityTypes}
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          />

          <Select
            label="Work Mode"
            options={workModes}
            value={selectedWorkMode}
            onChange={(e) => setSelectedWorkMode(e.target.value)}
          />

          <Select
            label="Deadline Urgency"
            options={deadlineFilters}
            value={selectedDeadline}
            onChange={(e) => setSelectedDeadline(e.target.value as any)}
          />
        </div>
      </Modal>

      {/* 3. OPPORTUNITIES LIST (RESPONSIVE CARDS) */}
      {loading ? (
        <LoadingState message="Finding relevant campus opportunities..." />
      ) : opportunities.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="h-6 w-6" />}
          title="No opportunities found"
          description={
            activeFiltersCount > 0
              ? "No opportunities match your selected search or filter criteria. Try resetting filters."
              : "No opportunities have been posted yet. Check back soon for new openings."
          }
          action={
            activeFiltersCount > 0 ? (
              <Button size="sm" onClick={handleClearFilters}>
                Clear All Filters
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3.5">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              Showing {opportunities.length} of {total} opportunities
            </span>
            <span>Page {currentPage} of {totalPages}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {opportunities.map((opp) => (
              <Card
                key={opp.id}
                className={`hover:border-blue-300 dark:hover:border-blue-800 transition-all flex flex-col justify-between ${
                  opp.isClosed ? "opacity-75 bg-slate-50/50 dark:bg-slate-900/40" : ""
                }`}
              >
                <CardContent className="p-4 sm:p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    {/* Header: Company, Title & Type Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                            {opp.company}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border shadow-2xs ${
                              (opp.matchScore ?? 85) >= 85
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                                : (opp.matchScore ?? 85) >= 70
                                ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800"
                                : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
                            }`}
                          >
                            <Sparkles className="h-3 w-3 shrink-0" />
                            ⚡ {opp.matchScore ?? 85}% Match • {opp.matchCategory || "Strong Match"}
                          </span>
                        </div>
                        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                          <Link href={`/opportunities/${opp.id}`} className="hover:underline">
                            {opp.title}
                          </Link>
                        </h2>
                        {/* Profile Match Score Progress Bar */}
                        <div
                          className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5"
                          title={`AI Profile Match: ${opp.matchScore ?? 85}%`}
                        >
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              (opp.matchScore ?? 85) >= 85
                                ? "bg-emerald-500"
                                : (opp.matchScore ?? 85) >= 70
                                ? "bg-blue-500"
                                : "bg-amber-500"
                            }`}
                            style={{ width: `${opp.matchScore ?? 85}%` }}
                          />
                        </div>
                      </div>
                      <Badge
                        variant={
                          opp.type === "internship"
                            ? "purple"
                            : opp.type === "job"
                            ? "blue"
                            : opp.type === "hackathon"
                            ? "warning"
                            : "secondary"
                        }
                        size="sm"
                      >
                        {opp.type}
                      </Badge>
                    </div>

                    {/* Short Description */}
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                      {opp.description}
                    </p>

                    {/* Eligibility */}
                    <div className="text-[11px] bg-slate-50 dark:bg-slate-800/60 p-2 rounded border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 line-clamp-1">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Eligibility: </span>
                      {opp.eligibility}
                    </div>

                    {/* Skills Chips */}
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {opp.skills.slice(0, 4).map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 text-[10px] font-medium rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        >
                          {skill}
                        </span>
                      ))}
                      {opp.skills.length > 4 && (
                        <span className="px-1.5 py-0.5 text-[10px] text-slate-400">
                          +{opp.skills.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Metadata Row: Location, Work Mode & Deadline Status */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1 truncate max-w-[180px]">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        {opp.location} ({opp.work_mode})
                      </span>
                      {renderDeadlineBadge(opp)}
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleSave(opp)}
                          className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors min-h-[38px] ${
                            opp.isSaved
                              ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800"
                              : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                          }`}
                          aria-label={opp.isSaved ? "Unsave opportunity" : "Save opportunity"}
                        >
                          <Bookmark className={`h-3.5 w-3.5 ${opp.isSaved ? "fill-current" : ""}`} />
                          <span>{opp.isSaved ? "Saved" : "Save"}</span>
                        </button>
                      </div>

                      <Link href={`/opportunities/${opp.id}`}>
                        <Button size="sm" variant="outline" rightIcon={<ExternalLink className="h-3.5 w-3.5" />}>
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 4. PAGINATION */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                leftIcon={<ChevronLeft className="h-4 w-4" />}
              >
                Previous
              </Button>

              <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setCurrentPage(p)}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                      currentPage === p
                        ? "bg-blue-600 text-white"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                rightIcon={<ChevronRight className="h-4 w-4" />}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </DashboardShell>
  );
}
