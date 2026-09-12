"use client";

import * as React from "react";
import { Settings, Shield, Bell, Save, Check } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function AdminSettingsPage() {
  const [collegeName, setCollegeName] = React.useState("National Institute of Technology");
  const [domain, setDomain] = React.useState("college.edu");
  const [academicYear, setAcademicYear] = React.useState("2026-2027");
  const [saved, setSaved] = React.useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <DashboardShell role="admin" userName="Dean / Admin Office">
      <PageHeader
        title="College Platform Settings"
        description="Configure institution details, verified student email domains, and academic terms."
      />

      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Institutional Configuration</CardTitle>
            <CardDescription>
              Details displayed across all official circulars, student dashboards, and footers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              {saved && (
                <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span>Settings updated successfully!</span>
                </div>
              )}

              <Input
                label="College / University Name *"
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
                required
              />

              <Input
                label="Allowed Institutional Email Domain *"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                required
                helperText="Only students with this email domain will be permitted to complete registration."
              />

              <Input
                label="Current Academic Year *"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                required
              />

              <div className="pt-2">
                <Button type="submit" leftIcon={<Save className="h-4 w-4" />}>
                  Save Platform Settings
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
