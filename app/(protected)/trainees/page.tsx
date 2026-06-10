import { Button } from "@/components/ui/button";
import { getTrainees } from "@/lib/actions/trainees";
import { isCurrentEmployeeHr } from "@/lib/employee-job-role";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserPermissions, isAdminRole } from "@/lib/rbac";

export default async function TraineesPage() {
const user = await getUserPermissions();

if (
  !isAdminRole(user?.role?.name) &&
  !(await isCurrentEmployeeHr())
) {
  redirect("/404");
}

  const trainees = await getTrainees();

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-700">
            Trainee Management
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">
            All Trainees
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track onboarding, training progress, and conversion readiness.
          </p>
        </div>

        <Button asChild className="bg-cyan-600 hover:bg-cyan-700">
          <Link href="/trainees/create">Create Trainee</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {trainees.map((trainee) => (
          <div
            key={trainee.id}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-medium text-slate-500">
              {trainee.traineeCode}
            </p>
            <h2 className="mt-2 text-lg font-semibold text-slate-900">
              {trainee.fullName}
            </h2>
            <p className="mt-1 text-sm text-slate-500">{trainee.email}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-cyan-50 px-3 py-1 text-cyan-700">
                {trainee.traineeStatus}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                Progress {trainee.trainingProgress}%
              </span>
            </div>

            {!trainee.employeeId &&
            trainee.traineeStatus === "COMPLETED" &&
            trainee.evaluationRecommendation === "RECOMMENDED" ? (
              <Button asChild className="mt-4 bg-emerald-600 hover:bg-emerald-700">
                <Link href={`/employee-profiles/create?traineeId=${trainee.id}`}>
                  Convert To Employee
                </Link>
              </Button>
            ) : null}
          </div>
        ))}

        {!trainees.length && (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500 md:col-span-2 xl:col-span-3">
            No trainees have been created yet.
          </div>
        )}
      </div>
    </section>
  );
}
