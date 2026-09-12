import Link from "next/link";
import { Briefcase, Eye, Trash2, CheckCircle, Plus } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { TableContainer, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const opportunities = [
  { id: "1", title: "Amazon SDE Summer Intern 2026", company: "Amazon", type: "internship", deadline: "Sep 10, 2026", status: "active", views: 412 },
  { id: "2", title: "Smart India Hackathon Internal Round", company: "Innovation Cell", type: "hackathon", deadline: "Sep 12, 2026", status: "active", views: 320 },
  { id: "3", title: "Microsoft Graduate Full-Time SDE", company: "Microsoft", type: "job", deadline: "Sep 16, 2026", status: "active", views: 580 },
  { id: "4", title: "ISRO Student Research Scheme", company: "ISRO", type: "scholarship", deadline: "Sep 23, 2026", status: "active", views: 195 },
];

export default function AdminOpportunitiesPage() {
  return (
    <DashboardShell role="admin" userName="Dean / Admin Office">
      <PageHeader
        title="Opportunity Moderation"
        description="Oversee college-wide internship notices, job placements, and external competitions."
        badge={<Badge variant="blue">{opportunities.length} Listings</Badge>}
        action={
          <Link href="/coordinator/opportunities/new">
            <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>
              Create Opportunity
            </Button>
          </Link>
        }
      />

      {/* Mobile Stacked Cards */}
      <div className="sm:hidden space-y-3">
        {opportunities.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-blue-600">{item.company}</span>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{item.title}</h3>
                </div>
                <Badge variant="success" size="sm">{item.status}</Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span>Deadline: {item.deadline}</span>
                <span>{item.views} Views</span>
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
                <TableHead>Opportunity</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {opportunities.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium text-slate-900 dark:text-slate-100">{item.title}</TableCell>
                  <TableCell className="text-xs">{item.company}</TableCell>
                  <TableCell><Badge variant="secondary" size="sm">{item.type}</Badge></TableCell>
                  <TableCell className="text-xs text-slate-500">{item.deadline}</TableCell>
                  <TableCell className="text-xs font-mono">{item.views}</TableCell>
                  <TableCell><Badge variant="success" size="sm">{item.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    <Link href={`/opportunities/${item.id}`} className="text-xs text-blue-600 hover:underline font-semibold">
                      View Post
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
