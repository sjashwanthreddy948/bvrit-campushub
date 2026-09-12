"use client";

import * as React from "react";
import Link from "next/link";
import { Bookmark, ExternalLink, Trash2, Calendar, IndianRupee, Sparkles } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

interface SavedItem {
  id: string;
  opportunityId: string;
  title: string;
  company: string;
  role: string;
  deadline: string;
  stipend: string;
  type: "internship" | "job";
  matchScore: number;
  matchCategory: string;
}

const initialSaved: SavedItem[] = [
  {
    id: "s1",
    opportunityId: "opp-1",
    title: "Amazon SDE Summer Intern 2026",
    company: "Amazon",
    role: "Software Development Engineer Intern",
    deadline: "Tomorrow, 11:59 PM",
    stipend: "₹1,10,000 / month",
    type: "internship",
    matchScore: 100,
    matchCategory: "Strong Match",
  },
  {
    id: "s2",
    opportunityId: "opp-3",
    title: "Microsoft Graduate Full-Time SDE",
    company: "Microsoft",
    role: "Software Engineer",
    deadline: "In 7 Days",
    stipend: "CTC: 44 LPA",
    type: "job",
    matchScore: 60,
    matchCategory: "Requirements Not Fully Matched",
  },
];

export default function SavedOpportunitiesPage() {
  const [items, setItems] = React.useState(initialSaved);

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <DashboardShell role="student" userName="Alex Johnson">
      <PageHeader
        title="Saved Opportunities"
        description="Bookmarked internships and jobs you plan to apply for before their deadlines."
        badge={<Badge variant="blue">{items.length} Saved</Badge>}
      />

      {items.length === 0 ? (
        <EmptyState
          icon={<Bookmark className="h-6 w-6" />}
          title="No saved opportunities yet"
          description="Save opportunities from the feed to track deadlines and apply when you are ready."
          action={
            <Link href="/opportunities">
              <Button size="sm">Explore Opportunities</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id} className="hover:border-blue-200 dark:hover:border-blue-900 transition-colors">
              <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                      {item.company}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-2xs ${
                        item.matchScore >= 85
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                          : item.matchScore >= 70
                          ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800"
                          : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
                      }`}
                    >
                      <Sparkles className="h-2.5 w-2.5 shrink-0" />
                      ⚡ {item.matchScore}% Match
                    </span>
                    <Badge variant={item.type === "internship" ? "purple" : "blue"} size="sm">
                      {item.type}
                    </Badge>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    <Link href={`/opportunities/${item.opportunityId}`} className="hover:underline">
                      {item.title}
                    </Link>
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 font-medium">
                      <Calendar className="h-3.5 w-3.5" />
                      Deadline: {item.deadline}
                    </span>
                    <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
                      <IndianRupee className="h-3.5 w-3.5" />
                      {item.stipend}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center justify-center transition-colors"
                    aria-label="Remove from saved"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <Link href={`/opportunities/${item.opportunityId}`}>
                    <Button size="sm" rightIcon={<ExternalLink className="h-3.5 w-3.5" />}>
                      Apply Now
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
