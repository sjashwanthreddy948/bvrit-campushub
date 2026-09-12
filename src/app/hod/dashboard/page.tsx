"use client";

import * as React from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  Users,
  ShieldCheck,
  Briefcase,
  Layers,
  Award,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ArrowRight,
} from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface AggregateSectionTurnout {
  section: string;
  totalStudents: number;
  participationRate: number; // percentage
  drivesRegistered: number;
}

export default function HodDashboardPage() {
  const departmentName = "Computer Science & Engineering";
  const departmentCode = "CSE";

  const aggregateTurnout: AggregateSectionTurnout[] = [
    { section: "CSE-A", totalStudents: 68, participationRate: 88, drivesRegistered: 54 },
    { section: "CSE-B", totalStudents: 66, participationRate: 85, drivesRegistered: 51 },
    { section: "CSE-C", totalStudents: 70, participationRate: 82, drivesRegistered: 52 },
    { section: "CSE-D", totalStudents: 65, participationRate: 79, drivesRegistered: 48 },
    { section: "CSE-E", totalStudents: 68, participationRate: 84, drivesRegistered: 53 },
    { section: "CSE-F", totalStudents: 64, participationRate: 76, drivesRegistered: 44 },
    { section: "CSE-G", totalStudents: 67, participationRate: 81, drivesRegistered: 50 },
    { section: "CSE-H", totalStudents: 65, participationRate: 75, drivesRegistered: 45 },
    { section: "CSE-I", totalStudents: 62, participationRate: 78, drivesRegistered: 46 },
  ];

  const skillGaps = [
    { skill: "Data Structures & Algorithms (DSA)", demand: 88, gapPercent: 32, priority: "High" },
    { skill: "System Design & Distributed Systems", demand: 74, gapPercent: 46, priority: "High" },
    { skill: "Relational Query Optimization (SQL)", demand: 68, gapPercent: 24, priority: "Medium" },
    { skill: "Cloud Fundamentals (AWS/Azure)", demand: 62, gapPercent: 41, priority: "Medium" },
    { skill: "Linux CLI Troubleshooting", demand: 54, gapPercent: 38, priority: "Medium" },
  ];

  return (
    <DashboardShell role="hod" userName="Dr. Ramesh (HOD - CSE)">
      <PageHeader
        title="Department Academic & Placement Telemetry"
        description={`Aggregated privacy-conscious metrics for ${departmentName} (${departmentCode}).`}
        badge={<Badge variant="powder">HOD Executive Console</Badge>}
        action={
          <Link href="/coordinator/dashboard">
            <Button size="sm" variant="outline" rightIcon={<ArrowRight className="h-4 w-4" />}>
              View TPO Drives Hub
            </Button>
          </Link>
        }
      />

      <div className="space-y-6">
        {/* Privacy Protection Notice */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-blue-500/10 dark:bg-blue-950/30 border border-blue-500/20 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h4 className="font-bold text-blue-900 dark:text-blue-200">
              Privacy-Conscious Aggregated Analytics
            </h4>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              In accordance with institutional data policies, this dashboard displays aggregated telemetry across sections and batches. Individual student names, CGPA records, and private contact information are strictly protected.
            </p>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card>
            <CardContent className="p-4">
              <span className="text-xs text-slate-500 font-medium">Department Enrollment</span>
              <h3 className="text-2xl sm:text-3xl font-black mt-1 text-slate-900 dark:text-slate-100">
                595
              </h3>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                Across Sections A through I
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <span className="text-xs text-slate-500 font-medium">Overall Drive Participation</span>
              <h3 className="text-2xl sm:text-3xl font-black mt-1 text-slate-900 dark:text-slate-100">
                80.8%
              </h3>
              <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-1">
                481 students actively registered
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <span className="text-xs text-slate-500 font-medium">Active Placement Partners</span>
              <h3 className="text-2xl sm:text-3xl font-black mt-1 text-slate-900 dark:text-slate-100">
                12
              </h3>
              <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold mt-1">
                Microsoft, AWS, JPMorgan, Cisco...
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <span className="text-xs text-slate-500 font-medium">Average Department CTC</span>
              <h3 className="text-2xl sm:text-3xl font-black mt-1 text-emerald-600 dark:text-emerald-400">
                ₹18.2 LPA
              </h3>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                Across confirmed offers
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Aggregated Skill Gap Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm sm:text-base font-extrabold flex items-center gap-2">
              <Award className="h-4 w-4 text-[#F59E0B]" />
              Cohort Technical Demand vs. Profile Skill Gaps
            </CardTitle>
            <CardDescription className="text-xs">
              Comparison between skills required by active placement recruiters and frequency of student profile endorsements.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {skillGaps.map((item) => (
              <div key={item.skill} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {item.skill}
                    </span>
                    <span
                      className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-md ${
                        item.priority === "High"
                          ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                      }`}
                    >
                      {item.priority} Priority
                    </span>
                  </div>
                  <span className="text-slate-500 text-[11px]">
                    Recruiter Demand: <strong>{item.demand}%</strong> | Cohort Gap:{" "}
                    <strong className="text-rose-600 dark:text-rose-400">{item.gapPercent}%</strong>
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-[#F59E0B] rounded-full transition-all"
                    style={{ width: `${item.demand}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Section Turnout Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm sm:text-base font-extrabold flex items-center gap-2">
              <Layers className="h-4 w-4 text-blue-600" />
              Section Turnout Breakdown (CSE A – I)
            </CardTitle>
            <CardDescription className="text-xs">
              Aggregated engagement rates across class sections without individual identity disclosure.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Section</th>
                    <th className="py-2.5 px-3">Total Enrollment</th>
                    <th className="py-2.5 px-3">Registered Applicants</th>
                    <th className="py-2.5 px-3">Participation Rate</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {aggregateTurnout.map((sec) => (
                    <tr key={sec.section} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-slate-100">
                        {sec.section}
                      </td>
                      <td className="py-2.5 px-3">{sec.totalStudents} students</td>
                      <td className="py-2.5 px-3">{sec.drivesRegistered} students</td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{sec.participationRate}%</span>
                          <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${sec.participationRate}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge
                          variant={sec.participationRate >= 80 ? "success" : "warning"}
                          size="sm"
                        >
                          {sec.participationRate >= 80 ? "Optimal Turnout" : "Review Turnout"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
