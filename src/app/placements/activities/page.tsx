"use client";

import * as React from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  Search,
  Filter,
  ArrowLeft,
  ChevronRight,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  PlacementActivityWithMatch,
  PlacementActivityType,
  ALL_ACTIVITY_TYPES,
} from "@/lib/placements/types";
import { getAllPlacementActivitiesAction } from "@/lib/placements/actions";

export default function PlacementActivitiesDirectoryPage() {
  const [activities, setActivities] = React.useState<PlacementActivityWithMatch[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedType, setSelectedType] = React.useState<string>("all");

  React.useEffect(() => {
    let isMounted = true;
    getAllPlacementActivitiesAction()
      .then((data) => {
        if (isMounted) {
          setActivities(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load activities:", err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const todayStr = new Date().toISOString().slice(0, 10);

  const filtered = activities.filter((act) => {
    const matchesSearch =
      act.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.requiredSkills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = selectedType === "all" || act.activityType === selectedType;

    return matchesSearch && matchesType;
  });

  return (
    <DashboardShell role="student" userName="Alex Johnson">
      <div className="max-w-5xl mx-auto space-y-6 pb-16">
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors py-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
        </div>

        <PageHeader
          title="Placement Activities &amp; Drives"
          description="Live verified schedule of company drives, assessments, interviews, and pre-placement talks."
          badge={<Badge variant="amber">TPO Official Awareness</Badge>}
        />

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search company, role, or skills..."
              className="pl-9 h-10 rounded-xl text-xs"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1B1C22] text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/50"
          >
            <option value="all">All Activity Types ({ALL_ACTIVITY_TYPES.length})</option>
            {ALL_ACTIVITY_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Activities List */}
        {loading ? (
          <LoadingState message="Loading placement schedule..." />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No Activities Found"
            description="No placement activities found matching your filters. Check back soon for new circulars."
          />
        ) : (
          <div className="space-y-3.5">
            {filtered.map((act) => {
              const isToday = act.date === todayStr;
              const formattedDate = new Date(act.date).toLocaleDateString("en-IN", {
                weekday: "short",
                month: "short",
                day: "numeric",
              });

              return (
                <Card
                  key={act.id}
                  className={`border-slate-200 dark:border-slate-800 hover:border-[#F59E0B]/60 transition-all ${
                    isToday ? "ring-1 ring-[#F59E0B]/40 bg-[#FFF5F4]/20 dark:bg-[#231A1B]/20" : ""
                  }`}
                >
                  <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-[#2A2B33] border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-base text-slate-700 dark:text-slate-200 shrink-0 overflow-hidden">
                        {act.companyLogo ? (
                          <img
                            src={act.companyLogo}
                            alt={act.companyName}
                            className="w-full h-full object-contain p-2"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        ) : (
                          act.companyName.slice(0, 2).toUpperCase()
                        )}
                      </div>

                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 truncate">
                            {act.companyName}
                          </h3>
                          {isToday && (
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-[#F59E0B] text-white">
                              Today
                            </span>
                          )}
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {act.activityType}
                          </span>
                          {act.match && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60">
                              ⚡ {act.match.score}% • {act.match.tier}
                            </span>
                          )}
                        </div>

                        <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                          {act.role} {act.packageCtc && `• ${act.packageCtc}`}
                        </p>

                        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                          <span className="inline-flex items-center gap-1 font-semibold text-[#F59E0B]">
                            <Clock className="h-3.5 w-3.5" /> {formattedDate} at {act.startTime}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" /> {act.venue}
                          </span>
                        </div>

                        {act.requiredSkills.length > 0 && (
                          <div className="pt-1 flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] text-slate-400 font-semibold">Skills:</span>
                            {act.requiredSkills.map((s) => (
                              <span
                                key={s}
                                className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center self-start sm:self-center shrink-0">
                      <Link href={`/placements/activities/${act.id}`}>
                        <Button
                          size="sm"
                          className="bg-[#F59E0B] hover:bg-[#D97706] text-white rounded-xl text-xs font-semibold px-4"
                          rightIcon={<ChevronRight className="h-4 w-4" />}
                        >
                          View Drive
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
