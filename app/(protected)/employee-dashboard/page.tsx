import { auth } from "@/auth";
import { getLeaveDashboard } from "@/lib/actions/leave-requests";
import { prisma } from "@/lib/prisma";
import {
  ArrowRightLeft,
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  ChevronRight,
  FileText,
  HeartHandshake,
  Plus,
  MapPin,
  Phone,
  UserCircle2,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

const formatDate = (value?: Date | null) =>
  value ? new Date(value).toLocaleDateString("en-GB") : "-";

export default async function EmployeeDashboardPage() {
  const session = await auth();
  const isEmployee = session?.user?.role?.toLowerCase() === "employee";

  if (!session?.user?.email) {
    redirect("/");
  }

  if (!isEmployee) {
    const employeeProfiles = await prisma.employeeProfile.findMany({
      orderBy: [{ employeeName: "asc" }, { employeeCode: "asc" }],
      include: {
        department: {
          select: {
            name: true,
          },
        },
        jobRole: {
          select: {
            name: true,
          },
        },
        workLocation: {
          select: {
            name: true,
          },
        },
        manager: {
          select: {
            employeeName: true,
          },
        },
      },
    });

    const activeEmployees = employeeProfiles.filter(
      (profile) => profile.status === "ACTIVE",
    ).length;

    return (
      <div className="space-y-6">
        <section className="rounded-[28px] border bg-[linear-gradient(135deg,#0f766e_0%,#0f172a_55%,#1d4ed8_100%)] p-6 text-white shadow-sm lg:p-8">
          <p className="text-sm uppercase tracking-[0.25em] text-cyan-100">
            Employee Dashboard
          </p>
          <h1 className="mt-3 text-3xl font-semibold">All Employees Overview</h1>
          <p className="mt-3 max-w-2xl text-sm text-cyan-50">
            Admin and HR users can review every employee from one place.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
              <p className="text-sm text-cyan-100">Total Employees</p>
              <p className="mt-2 text-2xl font-semibold">{employeeProfiles.length}</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
              <p className="text-sm text-cyan-100">Active Employees</p>
              <p className="mt-2 text-2xl font-semibold">{activeEmployees}</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
              <p className="text-sm text-cyan-100">View Full Records</p>
              <Link
                href="/employee-profiles"
                className="mt-2 inline-flex text-sm font-medium text-white underline underline-offset-4"
              >
                Open employee profiles
              </Link>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Employee List
              </h2>
              <p className="text-sm text-slate-500">
                Quick visibility into every employee linked to the HRMS.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {employeeProfiles.map((profile) => (
              <div
                key={profile.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">
                      {profile.employeeName}
                    </h3>
                    <p className="text-sm text-slate-500">{profile.employeeCode}</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700">
                    {profile.status}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  <p>Email: {profile.email || "-"}</p>
                  <p>Phone: {profile.phone || "-"}</p>
                  <p>Department: {profile.department?.name || "Not assigned"}</p>
                  <p>Manager: {profile.manager?.employeeName || "Not assigned"}</p>
                  <p>Job Role: {profile.jobRole?.name || "Not assigned"}</p>
                  <p>Location: {profile.workLocation?.name || "Not assigned"}</p>
                  <p>Joining Date: {formatDate(profile.joiningDate)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  const employeeProfile = await prisma.employeeProfile.findFirst({
    where: {
      email: session.user.email,
    },
    include: {
      department: {
        select: {
          name: true,
        },
      },
      jobRole: {
        select: {
          name: true,
        },
      },
      manager: {
        select: {
          employeeName: true,
        },
      },
      workLocation: {
        select: {
          name: true,
        },
      },
      employeeDocuments: {
        select: {
          id: true,
          aadhaarNumber: true,
          panNumber: true,
          experienceType: true,
          status: true,
          updatedAt: true,
        },
        orderBy: {
          updatedAt: "desc",
        },
        take: 5,
      },
      transferPromotions: {
        select: {
          id: true,
          movementType: true,
          effectiveDate: true,
        },
        orderBy: {
          effectiveDate: "desc",
        },
        take: 3,
      },
    },
  });

  if (!employeeProfile) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-5xl rounded-3xl border bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">
            Employee Dashboard
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            Your account is logged in, but no employee profile is linked yet.
            Please contact HR or admin to complete your profile setup.
          </p>
        </div>
      </div>
    );
  }

  const displayName =
    employeeProfile.employeeName ||
    [
      session.user.firstName,
      session.user.lastName,
      session.user.name,
    ]
      .filter(Boolean)
      .join(" ") ||
    "Employee";
  const leaveSummary = await getLeaveDashboard();

  const quickStats = [
    {
      title: "Employee ID",
      value: employeeProfile.employeeCode,
      icon: BadgeCheck,
      tone: "bg-sky-50 text-sky-700",
    },
    {
      title: "Department",
      value: employeeProfile.department?.name || "Not assigned",
      icon: BriefcaseBusiness,
      tone: "bg-emerald-50 text-emerald-700",
    },
    {
      title: "Location",
      value: employeeProfile.workLocation?.name || "Not assigned",
      icon: MapPin,
      tone: "bg-amber-50 text-amber-700",
    },
    {
      title: "Documents",
      value: String(employeeProfile.employeeDocuments.length),
      icon: FileText,
      tone: "bg-rose-50 text-rose-700",
    },
    {
      title: "Pending Leave",
      value: String(leaveSummary.pending),
      icon: CalendarDays,
      tone: "bg-violet-50 text-violet-700",
    },
  ];

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#eef8ff_0%,#f8fafc_22%,#ffffff_100%)] p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-[28px] border bg-gradient-to-br from-cyan-500 via-sky-600 to-blue-700 text-white shadow-sm">
          <div className="grid gap-6 p-6 lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-cyan-100">
                Employee Dashboard
              </p>
              <h1 className="mt-3 text-3xl font-semibold">{displayName}</h1>
              <p className="mt-3 max-w-xl text-sm text-cyan-50">
                Your work profile, key details, and latest updates all in one
                place.
              </p>

              <div className="mt-6 flex flex-wrap gap-3 text-sm text-cyan-50">
                <div className="rounded-full border border-white/20 bg-white/10 px-4 py-2">
                  {employeeProfile.jobRole?.name || "Role not assigned"}
                </div>
                <div className="rounded-full border border-white/20 bg-white/10 px-4 py-2">
                  Joined {formatDate(employeeProfile.joiningDate)}
                </div>
                <Link
                  href="/leave-requests/my"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 font-medium text-blue-700 shadow-sm transition hover:bg-cyan-50"
                >
                  <Plus className="h-4 w-4" />
                  Apply Leave
                </Link>
              </div>
            </div>

            <div className="rounded-[24px] border border-white/20 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-sm font-medium text-cyan-50">Profile Snapshot</p>
              <div className="mt-4 space-y-4 text-sm">
                <div className="flex items-center gap-3">
                  <UserCircle2 className="h-4 w-4 text-cyan-100" />
                  <span>{displayName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-cyan-100" />
                  <span>{employeeProfile.phone || "Phone not added"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <CalendarDays className="h-4 w-4 text-cyan-100" />
                  <span>{formatDate(employeeProfile.joiningDate)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <HeartHandshake className="h-4 w-4 text-cyan-100" />
                  <span>
                    {employeeProfile.emergencyContactName
                      ? `${employeeProfile.emergencyContactName} (${employeeProfile.emergencyContactPhone || "No number"})`
                      : "Emergency contact not added"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {quickStats.map((item) => (
            <div key={item.title} className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{item.title}</p>
                  <p className="mt-2 text-xl font-semibold text-slate-900">
                    {item.value}
                  </p>
                </div>
                <div className={`rounded-2xl p-3 ${item.tone}`}>
                  <item.icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Employment Details
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Email</p>
                <p className="mt-1 font-medium text-slate-900">
                  {session.user.email || "-"}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Job Role</p>
                <p className="mt-1 font-medium text-slate-900">
                  {employeeProfile.jobRole?.name || "Not assigned"}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Department</p>
                <p className="mt-1 font-medium text-slate-900">
                  {employeeProfile.department?.name || "Not assigned"}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Manager</p>
                <p className="mt-1 font-medium text-slate-900">
                  {employeeProfile.manager?.employeeName || "Not assigned"}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Work Location</p>
                <p className="mt-1 font-medium text-slate-900">
                  {employeeProfile.workLocation?.name || "Not assigned"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-700">
                <ArrowRightLeft className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Recent Movement
                </h2>
                <p className="text-sm text-slate-500">
                  Latest transfer and promotion activity linked to your profile.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {employeeProfile.transferPromotions.length ? (
                employeeProfile.transferPromotions.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-200 p-4"
                  >
                    <p className="font-medium text-slate-900">
                      {item.movementType.replaceAll("_", " ")}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Effective {formatDate(item.effectiveDate)}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                  No movement history found yet.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-cyan-50 p-3 text-cyan-700">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  My Documents
                </h2>
                <p className="text-sm text-slate-500">
                  Add or update your identity, education, and experience
                  records.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/employee-documents/create?from=employee-dashboard"
                className="inline-flex h-10 items-center gap-2 rounded-2xl bg-cyan-600 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-cyan-700"
              >
                <Plus className="h-4 w-4" />
                Add Document
              </Link>
              <Link
                href="/employee-documents"
                className="inline-flex h-10 items-center gap-2 rounded-2xl border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                View All
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {employeeProfile.employeeDocuments.length ? (
              employeeProfile.employeeDocuments.map((document) => (
                <div
                  key={document.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900">
                        {document.experienceType.replaceAll("_", " ")}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Updated {formatDate(document.updatedAt)}
                      </p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700">
                      {document.status}
                    </span>
                  </div>

                  <div className="mt-4 space-y-1 text-sm text-slate-600">
                    <p>Aadhaar: {document.aadhaarNumber || "-"}</p>
                    <p>PAN: {document.panNumber || "-"}</p>
                  </div>

                  <Link
                    href={`/employee-documents/edit/${document.id}`}
                    className="mt-4 inline-flex text-sm font-medium text-cyan-700 hover:text-cyan-800"
                  >
                    Update document
                  </Link>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 p-5 text-sm text-slate-500 md:col-span-2 xl:col-span-3">
                No documents added yet. Add your first document to complete
                your employee records.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
