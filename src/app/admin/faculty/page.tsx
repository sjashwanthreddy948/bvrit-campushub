"use client";

import * as React from "react";
import { UserCheck, Search, Plus } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { TableContainer, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const facultyList = [
  { id: "1", name: "Prof. K. Sharma", email: "k.sharma@college.edu", dept: "CSE", designation: "Associate Professor", canPublish: true },
  { id: "2", name: "Dr. Ananya Roy", email: "a.roy@college.edu", dept: "ECE", designation: "Professor & HOD", canPublish: true },
  { id: "3", name: "Prof. R. Sundaram", email: "r.sundaram@college.edu", dept: "CSE", designation: "Assistant Professor", canPublish: true },
];

export default function AdminFacultyPage() {
  const [query, setQuery] = React.useState("");

  const filtered = facultyList.filter(
    (f) =>
      f.name.toLowerCase().includes(query.toLowerCase()) ||
      f.dept.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <DashboardShell role="admin" userName="Dean / Admin Office">
      <PageHeader
        title="Faculty Management"
        description="Authorized departmental faculty permitted to issue circulars and publish opportunities."
        badge={<Badge variant="purple">{facultyList.length} Faculty</Badge>}
        action={
          <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>
            Add Faculty
          </Button>
        }
      />

      <div className="max-w-md">
        <Input
          placeholder="Search faculty by name or dept..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
        />
      </div>

      {/* Mobile Cards */}
      <div className="sm:hidden space-y-3">
        {filtered.map((f) => (
          <Card key={f.id}>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{f.name}</h3>
                  <p className="text-xs text-slate-500">{f.email}</p>
                </div>
                <Badge variant="purple" size="sm">{f.dept}</Badge>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">{f.designation}</p>
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
                <TableHead>Faculty Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Publishing Rights</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((f) => (
                <TableRow key={f.id}>
                  <TableCell className="font-medium">{f.name}</TableCell>
                  <TableCell className="text-xs text-slate-500">{f.email}</TableCell>
                  <TableCell><Badge variant="secondary" size="sm">{f.dept}</Badge></TableCell>
                  <TableCell className="text-xs">{f.designation}</TableCell>
                  <TableCell>
                    <Badge variant="success" size="sm">Authorized</Badge>
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
