import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getRoutePermissions } from "@/lib/rbac";
import { getProjectTrackingRows } from "@/lib/actions/project-tracking";
import ProjectTrackingTable from "./project-tracking-table";
import { Button } from "@/components/ui/button";

export default async function ProjectTrackingPage() {
  const permissions = await getRoutePermissions("/project-tracking");

  if (!permissions.canView) {
    redirect("/404");
  }

  const rows = await getProjectTrackingRows();

  return (
    <ProjectTrackingTable
      data={rows}
      actions={
        permissions.canCreate && (
          <Button asChild className="rounded-xl bg-cyan-600 hover:bg-cyan-700">
            <Link href="/project-tracking/create">
              <Plus className="size-4" />
              Assign Task
            </Link>
          </Button>
        )
      }
    />
  );
}
