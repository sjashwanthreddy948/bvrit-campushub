import { Building, Plus, Users, BookOpen } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const departments = [
  { code: "CSE", name: "Computer Science & Engineering", students: 960, faculty: 42, activeCircs: 14 },
  { code: "ECE", name: "Electronics & Communication Engineering", students: 720, faculty: 36, activeCircs: 8 },
  { code: "EEE", name: "Electrical & Electronics Engineering", students: 480, faculty: 24, activeCircs: 6 },
  { code: "MECH", name: "Mechanical Engineering", students: 420, faculty: 28, activeCircs: 5 },
  { code: "CIVIL", name: "Civil Engineering", students: 360, faculty: 22, activeCircs: 4 },
  { code: "IT", name: "Information Technology", students: 300, faculty: 18, activeCircs: 9 },
  { code: "AIML", name: "Artificial Intelligence & Machine Learning", students: 120, faculty: 8, activeCircs: 6 },
  { code: "AIDS", name: "Artificial Intelligence & Data Science", students: 60, faculty: 6, activeCircs: 4 },
];

export default function AdminDepartmentsPage() {
  return (
    <DashboardShell role="admin" userName="Dean / Admin Office">
      <PageHeader
        title="College Departments"
        description="Departmental hierarchy, faculty distribution, and cohort routing codes."
        badge={<Badge variant="blue">{departments.length} Departments</Badge>}
        action={
          <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>
            Add Department
          </Button>
        }
      />

      {/* Responsive Grid: 1 col on mobile, 2 cols on tablet, 3 cols on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {departments.map((dept) => (
          <Card key={dept.code} className="hover:border-blue-300 dark:hover:border-blue-800 transition-colors">
            <CardContent className="p-4 sm:p-5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Badge variant="blue" size="sm">{dept.code}</Badge>
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mt-1">
                    {dept.name}
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/40">
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Students</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{dept.students}</span>
                </div>
                <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/40">
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Faculty</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{dept.faculty}</span>
                </div>
                <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/40">
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Circulars</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{dept.activeCircs}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardShell>
  );
}
