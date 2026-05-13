import { redirect } from "next/navigation";

import EodWorkspace from "@/components/eod-reporting/eod-workspace";
import { getEodWorkspaceData } from "@/lib/actions/eod-reporting";
import { getRoutePermissions } from "@/lib/rbac";

export default async function EodReportingPage() {
  const permissions = await getRoutePermissions("/eod-reporting");

  if (!permissions.canView) {
    redirect("/404");
  }

  const data = await getEodWorkspaceData();

  return <EodWorkspace data={data} />;
}
