import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getProjectInteraction } from "@/lib/actions/project-tracking";
import ProjectWorkspace from "./project-workspace";

export default async function ProjectInteractionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getProjectInteraction(id);

  if (!data) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <Button asChild variant="outline" className="w-fit">
        <Link href="/project-tracking">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Link>
      </Button>
      <ProjectWorkspace
        project={data.project}
        canManage={data.canManage}
        currentEmployeeId={data.currentEmployeeId}
      />
    </div>
  );
}
