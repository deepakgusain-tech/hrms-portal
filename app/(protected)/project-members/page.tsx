import { getRoutePermissions } from '@/lib/rbac';
import { redirect } from 'next/navigation';
import ProjectDataTable from './project-datatable';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getProjectMembers } from '@/lib/actions/project-members';

const ProjectPage = async () => {
  const route = "/project-members";
  const permissions = await getRoutePermissions(route);

  if (!permissions.canView) {
    redirect("/404");
  }

  const projectMembers = await getProjectMembers();

  return (
    <ProjectDataTable
      data={projectMembers}
      canEdit={permissions.canEdit}
      canDelete={permissions.canDelete}
      title="Project Members"
      actions={
        permissions.canCreate && (
          <Button className="bg-blue-500 hover:bg-blue-600">
            <Link href="/project-members/create">Add Project Member</Link>
          </Button>
        )
      }
    />
  );
}

export default ProjectPage
