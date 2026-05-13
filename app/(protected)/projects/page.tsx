import { getProjects } from '@/lib/actions/projects';
import { getRoutePermissions } from '@/lib/rbac';
import { redirect } from 'next/navigation';
import React from 'react'
import ProjectDataTable from './project-datatable';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const ProjectPage = async () => {
  const route = "/projects";
  const permissions = await getRoutePermissions(route);

  if (!permissions.canView) {
    redirect("/404");
  }

  const projects = await getProjects();

  return (
    <ProjectDataTable
      data={projects}
      canEdit={permissions.canEdit}
      canDelete={permissions.canDelete}
      title="Project"
      actions={
        permissions.canCreate && (
          <Button className="bg-blue-500 hover:bg-blue-600">
            <Link href="/projects/create">Add Project</Link>
          </Button>
        )
      }
    />
  );
}

export default ProjectPage
