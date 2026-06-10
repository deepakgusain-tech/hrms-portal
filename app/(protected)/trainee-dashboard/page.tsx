import { auth } from "@/auth";
import { getTrainees } from "@/lib/actions/trainees";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CalendarDays, CheckCircle2, ClipboardList, FileText, LayoutDashboard, Target, Users } from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/trainee-dashboard", icon: LayoutDashboard },
  { label: "Attendance", href: "/trainee-dashboard#attendance", icon: CalendarDays },
  { label: "Tasks", href: "/trainee-dashboard#tasks", icon: ClipboardList },
  { label: "Training Materials", href: "/trainee-dashboard#materials", icon: FileText },
  { label: "Assessments", href: "/trainee-dashboard#assessments", icon: Target },
  { label: "Profile", href: "/trainee-dashboard#profile", icon: Users },
];

export default async function TraineeDashboardPage() {
  const session = await auth();

  if (!session?.user?.id || session.user.accountType !== "trainee") {
    redirect("/404");
  }

  const [trainees, currentTrainee] = await Promise.all([
    getTrainees(),
    prisma.trainee.findFirst({
      where: { email: session.user.email ?? "" },
    }),
  ]);

  const total = trainees.length;
  const active = trainees.filter((item) => item.traineeStatus === "ACTIVE").length;
  const completed = trainees.filter((item) => item.traineeStatus === "COMPLETED").length;
  const readyForConversion = trainees.filter(
    (item) =>
      item.traineeStatus === "COMPLETED" &&
      item.evaluationRecommendation === "RECOMMENDED" &&
      !item.employeeId,
  ).length;

  const cards = [
    { label: "Training Progress", value: `${currentTrainee?.trainingProgress ?? 0}%` },
    { label: "Attendance %", value: `${currentTrainee?.attendancePercentage ?? 0}%` },
    { label: "Pending Tasks", value: "0" },
    { label: "Assessment Score", value: `${currentTrainee?.assessmentScore ?? 0}` },
    { label: "Training Days Left", value: "15" },
    { label: "Trainer Feedback", value: currentTrainee?.evaluationRecommendation || "Pending" },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-700">
            Trainee Workspace
          </p>
          <h1 className="mt-2 text-xl font-bold text-slate-900">
            {currentTrainee?.fullName || session.user.name || "Trainee"}
          </h1>
          <p className="text-sm text-slate-500">{session.user.email}</p>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-cyan-50 hover:text-cyan-700"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
          <div className="flex items-center gap-2 font-medium text-slate-900">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            Training Summary
          </div>
          <p className="mt-2">Batch: {currentTrainee?.trainingBatch || "-"}</p>
          <p>Department: {currentTrainee?.departmentId || "-"}</p>
          <p>Manager: {currentTrainee?.reportingManagerId || "-"}</p>
        </div>
      </aside>

      <section className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => (
            <div key={card.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">{card.label}</p>
              <p className="mt-3 text-2xl font-bold text-slate-900">{card.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <div id="attendance" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
            <h2 className="text-lg font-semibold text-slate-900">Attendance</h2>
            <p className="mt-2 text-sm text-slate-500">
              Trainee attendance tracking will live here, alongside working hours and lateness rules.
            </p>
          </div>

          <div id="profile" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Profile</h2>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <p>Employee link: {currentTrainee?.employeeCode || "Not converted yet"}</p>
              <p>Status: {currentTrainee?.traineeStatus || "PENDING"}</p>
              <p>Training batch: {currentTrainee?.trainingBatch || "-"}</p>
            </div>

            {!currentTrainee?.employeeId &&
            currentTrainee?.traineeStatus === "COMPLETED" &&
            currentTrainee?.evaluationRecommendation === "RECOMMENDED" ? (
              <Button asChild className="mt-4 bg-emerald-600 hover:bg-emerald-700">
                <Link href={`/employee-profiles/create?traineeId=${currentTrainee.id}`}>
                  Convert To Employee
                </Link>
              </Button>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div id="tasks" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Tasks</h2>
            <p className="mt-2 text-sm text-slate-500">Task assignment and submission workflow will be connected here.</p>
          </div>

          <div id="materials" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Training Materials</h2>
            <p className="mt-2 text-sm text-slate-500">Shared PDFs, videos, and links will be surfaced here.</p>
          </div>
        </div>

        <div id="assessments" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Assessments</h2>
          <p className="mt-2 text-sm text-slate-500">Assessment history and trainer remarks will appear here.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total Trainees</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{total}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Active Trainees</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{active}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Completed Training</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{completed}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Ready For Conversion</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{readyForConversion}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
