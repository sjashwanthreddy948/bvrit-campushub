import { BarChart3, TrendingUp, Users, CheckCircle, Clock } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function AdminAnalyticsPage() {
  return (
    <DashboardShell role="admin" userName="Dean / Admin Office">
      <PageHeader
        title="Campus Engagement Analytics"
        description="Platform usage, notice read receipts, and opportunity application metrics."
        badge={<Badge variant="success">Real-time Telemetry</Badge>}
      />

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <Card>
            <CardContent className="p-4">
              <span className="text-xs text-slate-500 font-medium">Weekly Active Students</span>
              <h3 className="text-2xl font-bold mt-1">2,840</h3>
              <p className="text-xs text-emerald-600 font-medium mt-1">83% of total student body</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <span className="text-xs text-slate-500 font-medium">Avg Time to Read Urgent Notice</span>
              <h3 className="text-2xl font-bold mt-1">42 mins</h3>
              <p className="text-xs text-blue-600 font-medium mt-1">Down from 3 days on WhatsApp</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <span className="text-xs text-slate-500 font-medium">Opportunity Applications Tracked</span>
              <h3 className="text-2xl font-bold mt-1">1,120</h3>
              <p className="text-xs text-purple-600 font-medium mt-1">Across 18 live postings</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cohort Delivery & Read Rates</CardTitle>
            <CardDescription>
              Percentage of verified students viewing official circulars within 24 hours of issuance.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { dept: "Computer Science & Engineering", rate: 94, count: "902 / 960 students" },
              { dept: "Information Technology", rate: 91, count: "273 / 300 students" },
              { dept: "Electronics & Communication", rate: 88, count: "634 / 720 students" },
              { dept: "Mechanical Engineering", rate: 81, count: "340 / 420 students" },
            ].map((item) => (
              <div key={item.dept} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{item.dept}</span>
                  <span className="text-slate-500 font-mono">{item.rate}% ({item.count})</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all"
                    style={{ width: `${item.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
