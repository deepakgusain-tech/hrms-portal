import TraineeForm from "@/components/trainees/trainee-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getApplicantDocumentById } from "@/lib/actions/employee-documents";
import { isCurrentEmployeeHr } from "@/lib/employee-job-role";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, UserPlus } from "lucide-react";
import { getUserPermissions, isAdminRole } from "@/lib/rbac";

const TraineeCreatePage = async ({
  searchParams,
}: {
  searchParams?: Promise<{
    applicantDocumentId?: string | string[];
  }>;
}) => {
  const user = await getUserPermissions();

  const isHr = await isCurrentEmployeeHr();
  const isAdmin = isAdminRole(user?.role?.name);

  if (!isHr && !isAdmin) {
    redirect("/404");
  }

  const params = await searchParams;
  const applicantDocumentId =
    typeof params?.applicantDocumentId === "string"
      ? params.applicantDocumentId
      : "";
  const applicantDocument = applicantDocumentId
    ? await getApplicantDocumentById(applicantDocumentId)
    : null;

  if (applicantDocumentId && !applicantDocument) {
    redirect("/employee-documents");
  }

  return (
    <Card className="rounded-3xl border border-white/60 bg-white/80 shadow-xl backdrop-blur-md">
      <CardHeader className="border-b border-slate-100 pb-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-cyan-500 text-white shadow-md">
              <UserPlus size={20} />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-slate-800">
                Create Trainee
              </CardTitle>
              <p className="mt-1 text-sm text-slate-500">
                Convert an approved applicant into a trainee profile
              </p>
            </div>
          </div>

          <Button
            asChild
            className="rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-5 text-white shadow-md transition-all hover:scale-[1.02] hover:shadow-lg"
          >
            <Link href="/employee-documents">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <TraineeForm initialApplicantDocument={applicantDocument} />
      </CardContent>
    </Card>
  );
};

export default TraineeCreatePage;
