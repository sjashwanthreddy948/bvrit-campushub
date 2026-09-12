import Link from "next/link";
import { FileText, Plus, Calendar, Download } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { TableContainer, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const circulars = [
  { id: "1", refNo: "ACAD-2026-08", title: "Mid-Semester Examination Schedule Autumn 2026", dept: "Dean Academics", priority: "urgent", date: "Sep 07, 2026" },
  { id: "2", refNo: "CSE-2026-14", title: "Department Elective Selection for Upcoming Semester", dept: "CSE", priority: "normal", date: "Sep 05, 2026" },
  { id: "3", refNo: "DISC-2026-02", title: "Strict Campus Anti-Ragging Notification", dept: "Principal Office", priority: "critical", date: "Aug 20, 2026" },
];

export default function AdminCircularsPage() {
  return (
    <DashboardShell role="admin" userName="Dean / Admin Office">
      <PageHeader
        title="Circular Archives & Management"
        description="Comprehensive repository of all issued official circulars and notices across departments."
        action={
          <Link href="/faculty/circulars/new">
            <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>
              Issue Circular
            </Button>
          </Link>
        }
      />

      {/* Mobile Cards */}
      <div className="sm:hidden space-y-3">
        {circulars.map((c) => (
          <Card key={c.id}>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-xs font-mono text-slate-500">{c.refNo}</span>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{c.title}</h3>
                </div>
                <Badge variant={c.priority === "critical" ? "danger" : c.priority === "urgent" ? "warning" : "secondary"} size="sm">
                  {c.priority}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span>{c.dept}</span>
                <span>{c.date}</span>
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
                <TableHead>Ref No</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {circulars.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono text-xs">{c.refNo}</TableCell>
                  <TableCell className="font-medium text-slate-900 dark:text-slate-100">{c.title}</TableCell>
                  <TableCell className="text-xs">{c.dept}</TableCell>
                  <TableCell>
                    <Badge variant={c.priority === "critical" ? "danger" : c.priority === "urgent" ? "warning" : "secondary"} size="sm">
                      {c.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">{c.date}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/circulars/${c.id}`} className="text-xs text-blue-600 hover:underline font-semibold">
                      View Notice
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
