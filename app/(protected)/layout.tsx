import { auth } from "@/auth";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { redirect } from "next/navigation";
import { getConfiguration } from "@/lib/actions/configuration";
import {
  getCurrentEmployeeProfileForPortal,
  isCurrentEmployeeManager,
} from "@/lib/employee-job-role";
import { getAccessibleRoutes } from "@/lib/rbac";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/");
  }

  const config = await getConfiguration();
  const accessibleRoutes = await getAccessibleRoutes();
  const employeeProfile = await getCurrentEmployeeProfileForPortal();
  const isManager = await isCurrentEmployeeManager();

  const sidebarUser = {
    name:
      session.user.firstName ||
      session.user.username ||
      session.user.name ||
      "User",
    email: session.user.email || "user@example.com",
    avatar: "",
  };

  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar
        user={sidebarUser}
        role={session.user.role}
        jobRole={employeeProfile?.jobRole?.name || session.user.jobRole}
        isManager={isManager}
        config={config || undefined}
        accessibleRoutes={accessibleRoutes}
      />

      <SidebarInset className="flex h-screen flex-col overflow-hidden">
        <header className="sticky top-0 z-40 flex h-14 items-center border-b bg-white px-4">
          <SidebarTrigger />
        </header>

        {/* ✅ Make this the scroll area */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex min-w-0 flex-col gap-4 p-2 mt-2">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
