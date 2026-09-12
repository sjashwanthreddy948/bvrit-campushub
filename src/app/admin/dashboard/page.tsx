import Link from "next/link";
import {
  Users,
  GraduationCap,
  UserCheck,
  Briefcase,
  FileText,
  Building,
  TrendingUp,
  Shield,
  Activity,
  ArrowRight,
} from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function AdminDashboardPage() {
  return (
    <DashboardShell role="admin" userName="Dean / Admin Office">
      <PageHeader
        title="Admin Control Center"
        description="High-level college overview, user management, and department circular distribution."
        badge={<Badge variant="purple">Admin Access</Badge>}
        action={
          <Link href="/admin/settings">
            <Button size="sm" variant="outline">
              Platform Settings
            </Button>
          </Link>
        }
      />

      {/* Metric Cards (Responsive: 1 on xs, 2 on sm, 4 on lg) */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Enrolled Students</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">3,420</h3>
              <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Across 8 departments</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
              <GraduationCap className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Faculty Members</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">184</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Verified coordinators</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center">
              <UserCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Opportunities</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">42</h3>
              <p className="text-[11px] text-blue-600 font-medium mt-0.5">18 currently active</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
              <Briefcase className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Circulars Issued</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">56</h3>
              <p className="text-[11px] text-amber-600 font-medium mt-0.5">4 urgent this month</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
              <FileText className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Modules Quick Grid */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
          Management Sections
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Link href="/admin/users" className="block">
            <Card className="hover:border-blue-300 dark:hover:border-blue-700 p-4 flex items-center justify-between transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center shrink-0">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">User Directory</h3>
                  <p className="text-xs text-slate-500">Role assignment & verification</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Card>
          </Link>

          <Link href="/admin/departments" className="block">
            <Card className="hover:border-blue-300 dark:hover:border-blue-700 p-4 flex items-center justify-between transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center shrink-0">
                  <Building className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Department Matrix</h3>
                  <p className="text-xs text-slate-500">Branches, sections, and codes</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Card>
          </Link>

          <Link href="/admin/analytics" className="block">
            <Card className="hover:border-blue-300 dark:hover:border-blue-700 p-4 flex items-center justify-between transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center shrink-0">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Platform Analytics</h3>
                  <p className="text-xs text-slate-500">Engagement & read receipts</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Card>
          </Link>
        </div>
      </section>

      {/* System Status on mobile */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-600" />
            <span>CampusHub System Health & Integration</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="font-medium text-slate-700 dark:text-slate-300">Vedic.ai Coexistence Status</span>
            <Badge variant="success" size="sm">Operational (Attendance & Grades Active)</Badge>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="font-medium text-slate-700 dark:text-slate-300">Supabase Row Level Security (RLS)</span>
            <Badge variant="success" size="sm">Enforced (8 Policies Active)</Badge>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="font-medium text-slate-700 dark:text-slate-300">WhatsApp Share Gateway</span>
            <Badge variant="blue" size="sm">Deep Link Ready</Badge>
          </div>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
