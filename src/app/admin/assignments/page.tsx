import Link from "next/link";
import { BookOpen, Calendar, Clock, Plus } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { TableContainer, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const assignments = [
  { id: "1", subject: "CS304 Operating Systems", title: "Lab Assignment 2", faculty: "Prof. K. Sharma", classCohort: "CSE 3-A", dueDate: "Sep 14, 2026", daysLeft: 5 },
  { id: "2", subject: "CS302 DBMS", title: "Problem Set 3", faculty: "Prof. R. Sundaram", classCohort: "CSE 3-A", dueDate: "Sep 18, 2026", daysLeft: 9 },
  { id: "3", subject: "CS306 Networks", title: "Wireshark Packet Analysis", faculty: "Dr. Ananya Roy", classCohort: "ECE 3-B", dueDate: "Sep 22, 2026", daysLeft: 13 },
];

export default function AdminAssignmentsPage() {
  return (
    <DashboardShell role="admin" userName="Dean / Admin Office">
      <PageHeader
        title="Assignment Reminder Logs"
        description="Monitor academic tasks scheduled across all college departments. Submissions run via Vedic.ai."
        badge={<Badge variant="blue">{assignments.length} Scheduled</Badge>}
        action={
          <Link href="/faculty/assignments/new">
            <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>
              Create Reminder
            </Button>
          </Link>
        }
      />

      {/* Mobile Stacked Cards */}
      <div className="sm:hidden space-y-3">
        {assignments.map((a) => (
          <Card key={a.id}>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-blue-600">{a.subject}</span>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{a.title}</h3>
                </div>
                <Badge variant={a.daysLeft <= 5 ? "warning" : "default"} size="sm">
                  Due in {a.daysLeft}d
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span>{a.classCohort} • {a.faculty}</span>
                <span>{a.dueDate}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden sm:block">
        <TableContainer>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Task Title</TableHead>
                <TableHead>Faculty</TableHead>
                <TableHead>Cohort</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium text-xs text-blue-600">{a.subject}</TableCell>
                  <TableCell className="font-medium text-slate-900 dark:text-slate-100">{a.title}</TableCell>
                  <TableCell className="text-xs">{a.faculty}</TableCell>
                  <TableCell><Badge variant="secondary" size="sm">{a.classCohort}</Badge></TableCell>
                  <TableCell className="text-xs text-red-600 font-medium">{a.dueDate}</TableCell>
                  <TableCell className="text-right">
                    <Link href="/assignments" className="text-xs text-blue-600 hover:underline font-semibold">
                      View
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </DashboardShell>
  );
}
