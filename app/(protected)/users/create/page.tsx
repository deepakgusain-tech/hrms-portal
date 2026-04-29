import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import UserForm from "@/components/user/user-form";
import { canAccess } from "@/lib/rbac";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  UserPlus,
  Sparkles,
} from "lucide-react";

const UserCreatePage = async () => {
  const route = "/users";
  const canCreate = await canAccess(route, "create");

  if (!canCreate) {
    redirect("/404");
  }

  return (
    <div className="relative">
      {/* Background Glow */}
      <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-indigo-50 via-white to-cyan-50" />

      <Card className="overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-2xl backdrop-blur-xl">
        <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-white to-slate-50 pb-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            {/* Left */}
            <div className="flex items-center gap-4">
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-cyan-500 text-white shadow-lg">
                <UserPlus size={24} />
                <span className="absolute -right-1 -top-1 rounded-full bg-white p-1 text-cyan-500 shadow">
                  <Sparkles size={12} />
                </span>
              </div>

              <div>
                <CardTitle className="text-2xl font-bold tracking-tight text-slate-800">
                  Add User
                </CardTitle>
                <p className="mt-1 text-sm text-slate-500">
                  Create a new system user account
                </p>
              </div>
            </div>

            {/* Right */}
            <Button
              asChild
              className="h-11 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-5 text-white shadow-md transition-all duration-200 hover:scale-[1.02] hover:shadow-xl"
            >
              <Link href="/users">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="bg-white/70 p-6 md:p-8">
          <UserForm update={false} />
        </CardContent>
      </Card>
    </div>
  );
};

export default UserCreatePage;