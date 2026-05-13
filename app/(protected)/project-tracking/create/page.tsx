import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ListChecks } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import TaskAssignmentForm from "@/components/project/task-assignment-form";
import { getTaskAssignmentOptions } from "@/lib/actions/tasks";
import { canAccess } from "@/lib/rbac";

export default async function CreateProjectTaskPage() {
  const canCreate = await canAccess("/project-tracking", "create");

  if (!canCreate) {
    redirect("/404");
  }

  const projects = await getTaskAssignmentOptions();

  return (
    <Card className="rounded-3xl border border-white/60 bg-white/80 shadow-xl backdrop-blur-md">
      <CardHeader className="border-b border-slate-100 pb-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-cyan-500 text-white shadow-md">
              <ListChecks size={20} />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-slate-800">
                Assign Project Task
              </CardTitle>
              <p className="mt-1 text-sm text-slate-500">
                Assign work to employees already involved in the project
              </p>
            </div>
          </div>

          <Button asChild variant="outline">
            <Link href="/project-tracking">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <TaskAssignmentForm projects={projects} />
      </CardContent>
    </Card>
  );
}
