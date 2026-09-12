"use client";

import * as React from "react";
import Link from "next/link";
import { GraduationCap, Search } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { TableContainer, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";

const students = [
  { id: "1", name: "Alex Johnson", email: "alex.j@college.edu", dept: "CSE", year: "3", section: "A" },
  { id: "2", name: "Priya Sharma", email: "priya.s@college.edu", dept: "ECE", year: "4", section: "B" },
  { id: "3", name: "Rahul Patel", email: "rahul.p@college.edu", dept: "IT", year: "2", section: "A" },
  { id: "4", name: "Sneha Reddy", email: "sneha.r@college.edu", dept: "AIML", year: "1", section: "C" },
];

export default function AdminStudentsPage() {
  const [query, setQuery] = React.useState("");

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.dept.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <DashboardShell role="admin" userName="Dean / Admin Office">
      <PageHeader
        title="Student Directory"
        description="All registered students categorized by Department, Year, and Section."
        badge={<Badge variant="blue">{students.length} Students</Badge>}
      />

      <div className="max-w-md">
        <Input
          placeholder="Search student or department..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
        />
      </div>

      {/* Mobile Stacked Cards */}
      <div className="sm:hidden space-y-3">
        {filtered.map((s) => (
          <Card key={s.id}>
            <CardContent className="p-4 space-y-1.5">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{s.name}</h3>
              <p className="text-xs text-slate-500">{s.email}</p>
              <div className="flex items-center gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Badge variant="secondary" size="sm">{s.dept}</Badge>
                <span>Year {s.year}</span>
                <span>Section {s.section}</span>
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
                <TableHead>Student Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Section</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="text-xs text-slate-500">{s.email}</TableCell>
                  <TableCell><Badge variant="secondary" size="sm">{s.dept}</Badge></TableCell>
                  <TableCell className="text-xs">Year {s.year}</TableCell>
                  <TableCell className="text-xs">Section {s.section}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </DashboardShell>
  );
}
