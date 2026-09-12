"use client";

import * as React from "react";
import Link from "next/link";
import { Briefcase, ArrowLeft, ArrowRight } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function FacultyNewOpportunityRestrictedPage() {
  return (
    <DashboardShell role="faculty" userName="Prof. K. Sharma">
      <PageHeader
        title="Post Opportunity (Restricted)"
        description="Recruitment drives are managed by the Placement Coordinator."
      />

      <div className="max-w-2xl mx-auto my-12">
        <Card className="border-blue-200 dark:border-blue-900 shadow-sm">
          <CardContent className="p-6 sm:p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
              <Briefcase className="h-7 w-7" />
            </div>

            <div className="space-y-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
                Placement Drives Managed by Coordinator
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                Posting new internships and job opportunities is restricted to the <strong>Placement Coordinator (TPO)</strong> to ensure centralized tracking of section turnout and WhatsApp broadcasts.
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                To post an academic assignment or circular, visit the Faculty Dashboard.
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/faculty/dashboard">
                <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />}>
                  Back to Faculty Dashboard
                </Button>
              </Link>
              <Link href="/coordinator/opportunities/new">
                <Button variant="primary" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Go to Coordinator Drive Creation
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
