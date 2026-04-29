import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getUsers } from "@/lib/actions/users"
import { getRoutePermissions } from "@/lib/rbac"
import { redirect } from "next/navigation"
import UserDataTable from "./user-datatable"

export default async function UsersPage() {
  const route = "/users"
  const permissions = await getRoutePermissions(route)

  if (!permissions.canView) {
    redirect("/404")
  }

  const users = await getUsers()

  return (
    <UserDataTable data={users}
      canEdit={permissions.canEdit}
      canDelete={permissions.canDelete}
      title="User"
      actions={
        permissions.canCreate && (
          <Button className="bg-blue-500 hover:bg-blue-600">
            <Link href="/users/create">Add User</Link>
          </Button>
        )
      } />
  )
}
