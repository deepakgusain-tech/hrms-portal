import { auth } from "@/auth";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { redirect } from "next/navigation";
import { getConfiguration } from "@/lib/actions/configuration";

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
    <SidebarProvider>
      <AppSidebar
        user={sidebarUser}
        role={session.user.role}
        config={config || undefined}
      />

      <SidebarInset>
        <header className="sticky top-0 z-40 flex h-14 items-center border-b bg-white px-4">
          <SidebarTrigger />

          <div className="ml-3">
            <p className="text-sm font-medium text-slate-900">
              {session.user.role || "Workspace"}
            </p>
          </div>
        </header>

        <div className="flex flex-1 flex-col">
          <div className="flex flex-col gap-4 p-4 md:p-6">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}