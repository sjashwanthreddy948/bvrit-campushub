"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  Briefcase,
  FileText,
  BookOpen,
  ArrowRight,
  X,
  History,
  Sparkles,
  Layers,
  Calendar,
  Rocket,
  Tag,
} from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LoadingState } from "@/components/ui/LoadingState";
import { getOpportunities } from "@/lib/opportunities/actions";
import { getAllPlacementActivitiesAction } from "@/lib/placements/actions";
import { getStudentCirculars } from "@/lib/circulars/actions";
import { getStudentAssignments } from "@/lib/assignments/actions";

interface UniversalSearchResult {
  id: string;
  category: "placement_drive" | "opportunity" | "circular" | "assignment" | "workshop";
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: "rose" | "blue" | "emerald" | "amber" | "purple";
  href: string;
  keywords: string;
}

const STORAGE_KEY_RECENT = "campushub_universal_recent_searches";

export default function SearchPage() {
  const [query, setQuery] = React.useState("");
  const [activeCategory, setActiveCategory] = React.useState<string>("all");
  const [items, setItems] = React.useState<UniversalSearchResult[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [recentSearches, setRecentSearches] = React.useState<string[]>([]);

  // Load recent searches from localStorage
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_RECENT);
      if (saved) setRecentSearches(JSON.parse(saved));
    } catch {}
  }, []);

  // Fetch live searchable data from database & stores
  React.useEffect(() => {
    let isMounted = true;
    async function loadSearchData() {
      try {
        const [oppsRes, drivesRes, circRes, asgRes] = await Promise.all([
          getOpportunities({ pageSize: 50, deadlineFilter: "all" }).catch(() => ({ opportunities: [] })),
          getAllPlacementActivitiesAction().catch(() => []),
          getStudentCirculars({}).catch(() => ({ circulars: [] })),
          getStudentAssignments({ statusFilter: "all" }).catch(() => ({ assignments: [] })),
        ]);

        if (!isMounted) return;

        const results: UniversalSearchResult[] = [];

        // 1. Placement drives & activities
        drivesRes.forEach((drive) => {
          results.push({
            id: `drive-${drive.id}`,
            category: "placement_drive",
            title: `${drive.companyName} — ${drive.role}`,
            subtitle: `${drive.activityType} • ${drive.date} • ${drive.packageCtc || drive.venue}`,
            badge: "Placement Drive",
            badgeColor: "rose",
            href: `/placements/activities/${drive.id}`,
            keywords: `${drive.companyName} ${drive.role} ${drive.requiredSkills.join(" ")} ${drive.activityType} placement drive`,
          });
        });

        // 2. Opportunities (Internships, Jobs, Hackathons, Workshops)
        oppsRes.opportunities.forEach((opp) => {
          const typeLabel = opp.type ? opp.type.charAt(0).toUpperCase() + opp.type.slice(1) : "Opportunity";
          results.push({
            id: `opp-${opp.id}`,
            category: "opportunity",
            title: `${opp.company} — ${opp.title}`,
            subtitle: `${typeLabel} • ${opp.location} • ${opp.package || opp.stipend || "Open"}`,
            badge: typeLabel,
            badgeColor: opp.type === "internship" ? "emerald" : "blue",
            href: `/opportunities/${opp.id}`,
            keywords: `${opp.company} ${opp.title} ${opp.skills.join(" ")} ${opp.type}`,
          });
        });

        // 3. Circulars
        circRes.circulars.forEach((circ) => {
          results.push({
            id: `circ-${circ.id}`,
            category: "circular",
            title: circ.title,
            subtitle: `${circ.department || "Campus"} • Ref: ${circ.circular_no} • Issued ${new Date(circ.published_date).toLocaleDateString()}`,
            badge: "Official Notice",
            badgeColor: "amber",
            href: `/circulars/${circ.id}`,
            keywords: `${circ.title} ${circ.circular_no} ${circ.department || ""} circular notice`,
          });
        });

        // 4. Assignments & Coursework
        asgRes.assignments.forEach((asg) => {
          results.push({
            id: `asg-${asg.id}`,
            category: "assignment",
            title: asg.title,
            subtitle: `${asg.subject_name} • Due ${new Date(asg.deadline).toLocaleDateString()} • Vedic.ai`,
            badge: "Coursework",
            badgeColor: "purple",
            href: `/assignments`,
            keywords: `${asg.title} ${asg.subject_name} assignment coursework vedic`,
          });
        });

        setItems(results);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load search data:", err);
        if (isMounted) setLoading(false);
      }
    }

    loadSearchData();
    return () => {
      isMounted = false;
    };
  }, []);

  const addRecentSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    const updated = [trimmed, ...recentSearches.filter((s) => s.toLowerCase() !== trimmed.toLowerCase())].slice(0, 6);
    setRecentSearches(updated);
    try {
      localStorage.setItem(STORAGE_KEY_RECENT, JSON.stringify(updated));
    } catch {}
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(STORAGE_KEY_RECENT);
    } catch {}
  };

  // Filter items based on query & category
  const filtered = items.filter((item) => {
    if (activeCategory !== "all" && item.category !== activeCategory) {
      return false;
    }
    if (!query.trim()) return true;

    const q = query.toLowerCase().trim();
    return (
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.keywords.toLowerCase().includes(q)
    );
  });

  const categories = [
    { id: "all", label: "All Items" },
    { id: "placement_drive", label: "Placement Drives" },
    { id: "opportunity", label: "Opportunities" },
    { id: "circular", label: "Circulars" },
    { id: "assignment", label: "Assignments" },
  ];

  return (
    <DashboardShell role="student" userName="Alex Johnson">
      <PageHeader
        title="Universal Search"
        description="Instant search across verified campus placement drives, opportunities, circulars, and academic coursework."
        badge={<Badge variant="amber">Live Catalog ({items.length} items)</Badge>}
      />

      <div className="space-y-4 max-w-3xl">
        {/* Search Input Bar */}
        <div className="relative w-full">
          <Input
            placeholder="Search by company, role, skill, circular no, or course..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && query.trim()) {
                addRecentSearch(query);
              }
            }}
            leftIcon={<Search className="h-5 w-5 text-[#F59E0B]" />}
            rightIcon={
              query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="p-1 hover:text-slate-800 dark:hover:text-slate-100"
                  aria-label="Clear search query"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null
            }
            className="h-12 text-sm sm:text-base rounded-2xl bg-white dark:bg-[#161820] border-slate-200 dark:border-slate-800 shadow-xs"
          />
        </div>

        {/* Recent Searches Pills */}
        {recentSearches.length > 0 && !query && (
          <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500 pt-1">
            <span className="flex items-center gap-1 font-bold text-slate-400">
              <History className="h-3.5 w-3.5" /> Recent:
            </span>
            {recentSearches.map((term, idx) => (
              <button
                key={idx}
                onClick={() => setQuery(term)}
                className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-[#F59E0B]/10 hover:text-[#F59E0B] transition-colors cursor-pointer"
              >
                {term}
              </button>
            ))}
            <button
              onClick={clearRecentSearches}
              className="text-[11px] text-slate-400 hover:text-rose-500 transition-colors ml-1 cursor-pointer"
            >
              Clear
            </button>
          </div>
        )}

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#F59E0B] text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span>
            {query
              ? `Search results for "${query}" (${filtered.length})`
              : `All campus items (${filtered.length})`}
          </span>
        </div>

        {/* Results List */}
        {loading ? (
          <LoadingState message="Searching live verified campus records..." />
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-[#161820]/50 space-y-2">
            <Search className="h-8 w-8 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              No results found matching &quot;{query}&quot;
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try searching with different keywords like &quot;Microsoft&quot;, &quot;SDE&quot;, &quot;Exam&quot;, or &quot;Python&quot;.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filtered.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => {
                  if (query.trim()) addRecentSearch(query);
                }}
                className="block group"
              >
                <Card className="hover:border-[#F59E0B]/60 dark:hover:border-[#F59E0B]/60 transition-all shadow-2xs">
                  <CardContent className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 group-hover:bg-[#F59E0B]/10 transition-colors">
                        {item.category === "placement_drive" ? (
                          <Rocket className="h-5 w-5 text-[#F59E0B]" />
                        ) : item.category === "opportunity" ? (
                          <Briefcase className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        ) : item.category === "circular" ? (
                          <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        ) : (
                          <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        )}
                      </div>

                      <div className="min-w-0 space-y-0.5">
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#F59E0B] transition-colors truncate">
                          {item.title}
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="default" size="sm" className="hidden xs:inline-flex">
                        {item.badge}
                      </Badge>
                      <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-[#F59E0B] group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
