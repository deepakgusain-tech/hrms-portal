import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getProjectMemberDetails } from "@/lib/actions/project-members";
import { getRoutePermissions } from "@/lib/rbac";

const formatDate = (date?: Date | string | null) =>
  date ? new Date(date).toLocaleDateString() : "-";

export default async function ProjectMemberDetailsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const permissions = await getRoutePermissions("/project-members");

  if (!permissions.canView) {
    redirect("/404");
  }

  const { projectId } = await params;
  const project = await getProjectMemberDetails(projectId);

  if (!project) {
    notFound();
  }

  return (
    <Card className="rounded-3xl border border-white/60 bg-white/80 shadow-xl backdrop-blur-md">
      <CardHeader className="border-b border-slate-100 pb-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-cyan-500 text-white shadow-md">
              <Users size={20} />
            </div>

            <div className="min-w-0">
              <CardTitle className="truncate text-2xl font-bold text-slate-800">
                {project.name}
              </CardTitle>
              <p className="mt-1 text-sm text-slate-500">
                Involved employees for this project
              </p>
            </div>
          </div>

          <Button
            asChild
            className="rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-5 text-white shadow-md transition-all hover:scale-[1.02] hover:shadow-lg"
          >
            <Link href="/project-members">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 pt-6">
        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-medium uppercase text-slate-500">
              Total Employees
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {project.employees.length}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-medium uppercase text-slate-500">
              Status
            </p>
            <Badge className="mt-2 bg-cyan-600">{project.status}</Badge>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-medium uppercase text-slate-500">
              Start Date
            </p>
            <p className="mt-2 font-semibold text-slate-800">
              {formatDate(project.startDate)}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-medium uppercase text-slate-500">
              End Date
            </p>
            <p className="mt-2 font-semibold text-slate-800">
              {formatDate(project.endDate)}
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="bg-gradient-to-r from-cyan-600 to-sky-500">
                <TableRow className="border-b-0 hover:bg-transparent">
                  <TableHead className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-white">
                    Employee
                  </TableHead>
                  <TableHead className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-white">
                    Employee ID
                  </TableHead>
                  <TableHead className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-white">
                    Email
                  </TableHead>
                  <TableHead className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-white">
                    Phone
                  </TableHead>
                  <TableHead className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-white">
                    Joining Date
                  </TableHead>
                  <TableHead className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-white">
                    Assigned At
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {project.employees.length > 0 ? (
                  project.employees.map((employee, index) => (
                    <TableRow
                      key={employee.memberId}
                      className={`border-b border-slate-100 transition-all hover:bg-cyan-50/50 ${
                        index % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                      }`}
                    >
                      <TableCell className="whitespace-nowrap px-4 py-4 text-sm font-medium text-slate-800">
                        {employee.name}
                      </TableCell>
                      <TableCell className="whitespace-nowrap px-4 py-4 text-sm text-slate-700">
                        {employee.code}
                      </TableCell>
                      <TableCell className="whitespace-nowrap px-4 py-4 text-sm text-slate-700">
                        {employee.email}
                      </TableCell>
                      <TableCell className="whitespace-nowrap px-4 py-4 text-sm text-slate-700">
                        {employee.phone}
                      </TableCell>
                      <TableCell className="whitespace-nowrap px-4 py-4 text-sm text-slate-700">
                        {formatDate(employee.joiningDate)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap px-4 py-4 text-sm text-slate-700">
                        {formatDate(employee.assignedAt)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-28 text-center text-slate-500"
                    >
                      No employees found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
