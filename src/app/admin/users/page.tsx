"use client";

import * as React from "react";
import Link from "next/link";
import { Users, Search, UserCheck, Shield, GraduationCap, MoreHorizontal, UserPlus } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { TableContainer, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { UserRole } from "@/types/database";

interface DirectoryUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  status: "active" | "pending";
}

const mockUsers: DirectoryUser[] = [
  { id: "1", name: "Alex Johnson", email: "alex.j@college.edu", role: "student", department: "CSE", status: "active" },
  { id: "2", name: "Prof. K. Sharma", email: "k.sharma@college.edu", role: "faculty", department: "CSE", status: "active" },
  { id: "3", name: "Dr. Ananya Roy", email: "a.roy@college.edu", role: "faculty", department: "ECE", status: "active" },
  { id: "4", name: "Dean IT Office", email: "admin@college.edu", role: "admin", department: "All", status: "active" },
  { id: "5", name: "Rohit Verma", email: "rohit.v@college.edu", role: "student", department: "MECH", status: "pending" },
];

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = React.useState("");

  const filtered = mockUsers.filter((u) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardShell role="admin" userName="Dean / Admin Office">
      <PageHeader
        title="User Management"
        description="Manage roles, departmental assignments, and authentication status across the campus."
        badge={<Badge variant="blue">{mockUsers.length} Total Users</Badge>}
        action={
          <div className="flex items-center gap-2">
            <Link href="/admin/students">
              <Button variant="outline" size="sm">
                Students
              </Button>
            </Link>
            <Link href="/admin/faculty">
              <Button variant="outline" size="sm">
                Faculty
              </Button>
            </Link>
          </div>
        }
      />

      <div className="max-w-md">
        <Input
          placeholder="Search users by name, email, or dept..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
        />
      </div>

      {/* 1. Mobile View (< 640px): Responsive Stacked Cards */}
      <div className="sm:hidden space-y-3">
        {filtered.map((user) => (
          <Card key={user.id}>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{user.name}</h3>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
                <Badge
                  variant={user.role === "admin" ? "purple" : user.role === "faculty" ? "warning" : "blue"}
                  size="sm"
                >
                  {user.role}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800 text-slate-500">
                <span>Dept: <strong>{user.department}</strong></span>
                <span className="capitalize">{user.status}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 2. Desktop View (>= 640px): Responsive Table */}
      <div className="hidden sm:block">
        <TableContainer>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="font-medium text-slate-900 dark:text-slate-100">{user.name}</div>
                    <div className="text-xs text-slate-500">{user.email}</div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.role === "admin" ? "purple" : user.role === "faculty" ? "warning" : "blue"}
                      size="sm"
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-300 font-mono text-xs">
                    {user.department}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs capitalize font-medium bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      {user.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <button
                      type="button"
                      onClick={() => alert(`Manage user: ${user.name}`)}
                      className="text-xs text-blue-600 hover:underline font-semibold"
                    >
                      Edit Role
                    </button>
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
