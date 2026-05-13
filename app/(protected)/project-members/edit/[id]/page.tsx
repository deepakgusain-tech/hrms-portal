import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";

import { canAccess } from "@/lib/rbac";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getProjects } from "@/lib/actions/projects";
import { getEmployeeProfiles } from "@/lib/actions/employee-profiles";
import { getProjectMemberById } from "@/lib/actions/project-members";
import ProjectMemberForm from "@/components/project/project-member-form";

const ProjectEditPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const route = "/project-members";
  const canEdit = await canAccess(route, "edit");

  if (!canEdit) {
    redirect("/404");
  }

  const { id } = await params;

  if (!id) {
    notFound();
  }

  const res = await getProjectMemberById(id);

  if (!res?.success || !res.data) {
    notFound();
  }

  const projects = await getProjects();
  const employees = await getEmployeeProfiles();

  return (
    <Card className="rounded-3xl border border-white/60 bg-white/80 shadow-xl backdrop-blur-md">
      <CardHeader className="border-b border-slate-100 pb-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-cyan-500 text-white shadow-md">
              <Pencil size={20} />
            </div>

            <div>
              <CardTitle className="text-2xl font-bold text-slate-800">
                Edit Project Member
              </CardTitle>
              <p className="mt-1 text-sm text-slate-500">
                Update project member details and assignment
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

      <CardContent className="pt-6">
        <ProjectMemberForm
          data={res.data}
          update={true}
          projects={projects} 
          employees={employees}
        />
      </CardContent>
    </Card>
  );
};

export default ProjectEditPage;
