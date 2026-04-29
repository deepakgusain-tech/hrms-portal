import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import RoleForm from "@/components/role/role-form";
import Link from "next/link";
import { getRoleById } from "@/lib/actions/role";
import { notFound, redirect } from "next/navigation";
import { getModules } from "@/lib/actions/module-action";
import { canAccess } from "@/lib/rbac";
import {
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  PencilLine,
} from "lucide-react";

const RoleEditPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const route = "/roles";
  const canEdit = await canAccess(route, "edit");

  if (!canEdit) {
    redirect("/404");
  }

  const { id } = await params;

  if (!id) return notFound();

  const role = await getRoleById(id);

  if (!role?.data) return notFound();

  const modules = await getModules();

  return (
    <div className="relative">
      {/* Background Glow */}
      <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-indigo-50 via-white to-cyan-50" />

      <Card className="overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-2xl backdrop-blur-xl">
        <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-white to-slate-50 pb-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            {/* Left Side */}
            <div className="flex items-center gap-4">
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-cyan-500 text-white shadow-lg">
                <ShieldCheck size={24} />
                <span className="absolute -right-1 -top-1 rounded-full bg-white p-1 text-cyan-500 shadow">
                  <Sparkles size={12} />
                </span>
              </div>

              <div>
                <CardTitle className="text-2xl font-bold tracking-tight text-slate-800">
                  Edit Role
                </CardTitle>
                <p className="mt-1 text-sm text-slate-500">
                  Update role details and manage permissions
                </p>
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              <Button
                asChild
                variant="outline"
                className="h-11 rounded-2xl border-slate-200 px-4 shadow-sm hover:bg-slate-50"
              >
                <Link href="/roles">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Link>
              </Button>

              <div className="hidden items-center gap-2 rounded-2xl bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 md:flex">
                <PencilLine className="h-4 w-4" />
                Editing Mode
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="bg-white/70 p-6 md:p-8">
          <RoleForm
            update={true}
            data={role.data}
            modules={modules}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleEditPage;