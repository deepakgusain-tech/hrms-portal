import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { ComponentType, ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarCheck,
  CalendarDays,
  FileCheck2,
  FileClock,
  FolderKanban,
  IdCard,
  MapPin,
  Settings,
  ShieldCheck,
  UserCog,
  Users,
} from "lucide-react";

const toDateOnly = (value = new Date()) =>
  new Date(Date.UTC(value.getFullYear(), value.getMonth(), value.getDate()));

const formatDate = (value?: Date | null) =>
  value ? new Date(value).toLocaleDateString("en-GB") : "-";

function percent(value: number, total: number) {
  if (!total) return "0%";
  return `${Math.round((value / total) * 100)}%`;
}

function DashboardHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-gradient-to-r from-sky-50 via-white to-cyan-50 shadow-sm">
      <div className="grid gap-6 p-5 md:p-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-2xl font-semibold text-slate-900 md:text-3xl">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            {description}
          </p>
        </div>
        {children}
      </div>
    </section>
  );
}

function MetricCard({
  label,
  value,
  detail,
  href,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  detail: string;
  href?: string;
  icon: ComponentType<{ className?: string }>;
}) {
  const content = (
    <div className="h-full rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-cyan-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 break-words text-2xl font-semibold text-slate-950">
            {value}
          </p>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700">
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-4 text-sm leading-5 text-slate-600">{detail}</p>
    </div>
  );

  return href ? (
    <Link href={href} className="block h-full">
      {content}
    </Link>
  ) : (
    content
  );
}

function SectionCard({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: { label: string; href: string };
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-950">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          ) : null}
        </div>
        {action ? (
          <Link
            href={action.href}
            className="inline-flex items-center gap-2 text-sm font-medium text-cyan-700 hover:text-cyan-900"
          >
            {action.label}
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : null}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
      {children}
    </div>
  );
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) redirect("/");
  if (session.user.role?.toLowerCase() === "employee") {
    redirect("/employee-dashboard");
  }

  const today = toDateOnly();

  if (session.user.role?.toLowerCase() === "employer") {
    const employer = await prisma.employer.findUnique({
      where: { id: session.user.id },
      include: {
        company: {
          include: {
            employeeProfiles: {
              include: {
                department: { select: { name: true } },
                jobRole: { select: { name: true } },
                employeeDocuments: { select: { reviewStatus: true } },
                leaveRequests: {
                  select: { id: true, status: true, leaveType: true, startDate: true, totalDays: true },
                  orderBy: { createdAt: "desc" },
                  take: 3,
                },
                attendances: {
                  where: { date: today },
                  select: { id: true, status: true },
                },
              },
              orderBy: [{ employeeName: "asc" }, { employeeCode: "asc" }],
            },
            employers: {
              select: { id: true, employerName: true, designation: true, status: true },
              orderBy: { employerName: "asc" },
            },
          },
        },
      },
    });

    if (!employer) {
      return (
        <div className="min-h-full bg-slate-50 p-3 md:p-5">
          <EmptyState>Employer account was not found.</EmptyState>
        </div>
      );
    }

    const employees = employer.company.employeeProfiles;
    const activeEmployees = employees.filter((item) => item.status === "ACTIVE");
    const departments = new Set(
      employees.map((item) => item.department?.name).filter(Boolean),
    );
    const pendingDocuments = employees.reduce(
      (total, item) =>
        total +
        item.employeeDocuments.filter((doc) => doc.reviewStatus === "PENDING").length,
      0,
    );
    const pendingLeaves = employees.flatMap((item) =>
      item.leaveRequests
        .filter((request) => request.status === "PENDING")
        .map((request) => ({ ...request, employeeName: item.employeeName })),
    );
    const attendanceMarked = employees.reduce(
      (total, item) => total + item.attendances.length,
      0,
    );

    return (
      <div className="min-h-full bg-slate-50 p-3 md:p-5">
        <div className="w-full space-y-5">
          <DashboardHero
            eyebrow="Employer Dashboard"
            title={employer.company.companyName}
            description="A company-level view using employee profiles, document reviews, leave requests, and attendance records already connected in this HRMS."
          >
            <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700">
              <div className="grid gap-3">
                <div className="flex items-center justify-between gap-4">
                  <span>Employer</span>
                  <strong className="text-slate-900">{employer.employerName}</strong>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>Email</span>
                  <strong className="truncate text-slate-900">{employer.email}</strong>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>Company code</span>
                  <strong className="text-slate-900">{employer.company.companyCode}</strong>
                </div>
              </div>
            </div>
          </DashboardHero>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Employees"
              value={employees.length}
              detail={`${activeEmployees.length} active, ${employees.length - activeEmployees.length} inactive`}
              icon={Users}
            />
            <MetricCard
              label="Departments"
              value={departments.size}
              detail="Departments represented by this company's employees"
              icon={Building2}
            />
            <MetricCard
              label="Pending Documents"
              value={pendingDocuments}
              detail="Employee document uploads waiting for HR review"
              icon={FileClock}
            />
            <MetricCard
              label="Today Attendance"
              value={attendanceMarked}
              detail={`${percent(attendanceMarked, employees.length)} of company employees have records today`}
              icon={CalendarCheck}
            />
          </section>

          <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <SectionCard title="Company Employees" description="Latest live profile data for this employer account.">
              <div className="grid gap-3 md:grid-cols-2">
                {employees.slice(0, 6).map((employee) => (
                  <div key={employee.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-950">{employee.employeeName}</p>
                        <p className="text-sm text-slate-500">{employee.employeeCode}</p>
                      </div>
                      <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-700">
                        {employee.status}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-slate-600">
                      {employee.jobRole?.name || "Role not assigned"} - {employee.department?.name || "Department not assigned"}
                    </p>
                  </div>
                ))}
                {!employees.length ? <EmptyState>No employees are linked to this company yet.</EmptyState> : null}
              </div>
            </SectionCard>

            <SectionCard title="Pending Leave" description="Recent company leave requests awaiting action by HR.">
              <div className="space-y-3">
                {pendingLeaves.slice(0, 5).map((request) => (
                  <div key={request.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-slate-950">{request.employeeName}</p>
                      <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
                        {request.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      {request.leaveType.replaceAll("_", " ")} - {request.totalDays} day(s) from {formatDate(request.startDate)}
                    </p>
                  </div>
                ))}
                {!pendingLeaves.length ? <EmptyState>No pending leave requests for this company.</EmptyState> : null}
              </div>
            </SectionCard>
          </section>
        </div>
      </div>
    );
  }

  const [
    employees,
    departments,
    jobRoles,
    workLocations,
    companies,
    employers,
    userCount,
    roles,
    modules,
    projects,
    projectMembers,
    tasksByStatus,
    leaveRequests,
    documents,
    todayAttendance,
    transfers,
  ] = await Promise.all([
    prisma.employeeProfile.findMany({
      orderBy: [{ employeeName: "asc" }, { employeeCode: "asc" }],
      include: {
        department: { select: { name: true } },
        jobRole: { select: { name: true } },
        company: { select: { companyName: true } },
        workLocation: { select: { name: true } },
      },
    }),
    prisma.department.findMany({ orderBy: { name: "asc" } }),
    prisma.jobRole.findMany({ orderBy: { name: "asc" } }),
    prisma.workLocation.findMany({ orderBy: { name: "asc" } }),
    prisma.company.findMany({ orderBy: { companyName: "asc" } }),
    prisma.employer.findMany({ orderBy: { employerName: "asc" }, include: { company: { select: { companyName: true } } } }),
    prisma.user.count(),
    prisma.role.findMany({ orderBy: { name: "asc" } }),
    prisma.module.findMany({ orderBy: { name: "asc" } }),
    prisma.project.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.projectMember.count(),
    prisma.task.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.leaveRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { employee: { select: { employeeName: true, employeeCode: true, department: { select: { name: true } } } } },
    }),
    prisma.employeeDocument.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { employee: { select: { employeeName: true, employeeCode: true } } },
    }),
    prisma.attendance.findMany({
      where: { date: today },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { employee: { select: { employeeName: true, employeeCode: true } } },
    }),
    prisma.transferPromotion.findMany({
      orderBy: { effectiveDate: "desc" },
      take: 5,
      include: { employee: { select: { employeeName: true, employeeCode: true } } },
    }),
  ]);

  const activeEmployees = employees.filter((employee) => employee.status === "ACTIVE");
  const activeProjects = projects.filter((project) => project.status === "ACTIVE");
  const pendingLeaves = leaveRequests.filter((request) => request.status === "PENDING");
  const pendingDocs = documents.filter((document) => document.reviewStatus === "PENDING");
  const completedTasks =
    tasksByStatus.find((item) => item.status === "DONE")?._count._all ?? 0;
  const totalTasks = tasksByStatus.reduce((total, item) => total + item._count._all, 0);

  const metrics = [
    {
      label: "Employee Profiles",
      value: employees.length,
      detail: `${activeEmployees.length} active profiles across ${departments.length} departments`,
      href: "/employee-profiles",
      icon: Users,
    },
    {
      label: "Employers",
      value: employers.length,
      detail: `${companies.length} companies connected to employer accounts`,
      href: "/employers",
      icon: Building2,
    },
    {
      label: "Projects",
      value: projects.length,
      detail: `${activeProjects.length} active projects and ${projectMembers} member assignment(s)`,
      href: "/projects",
      icon: FolderKanban,
    },
    {
      label: "Attendance Today",
      value: todayAttendance.length,
      detail: `${percent(todayAttendance.length, activeEmployees.length)} of active employees have a record today`,
      href: "/attendance",
      icon: CalendarCheck,
    },
    {
      label: "Leave Requests",
      value: pendingLeaves.length,
      detail: `${pendingLeaves.length} pending in the current review queue`,
      href: "/leave-requests",
      icon: CalendarDays,
    },
    {
      label: "Document Reviews",
      value: pendingDocs.length,
      detail: `${pendingDocs.length} pending uploads in employee documents`,
      href: "/employee-documents",
      icon: IdCard,
    },
    {
      label: "Roles & Modules",
      value: `${roles.length}/${modules.length}`,
      detail: "Configured role records and application modules",
      href: "/roles",
      icon: ShieldCheck,
    },
    {
      label: "Task Completion",
      value: percent(completedTasks, totalTasks),
      detail: `${completedTasks} done out of ${totalTasks} project task(s)`,
      href: "/projects",
      icon: FileCheck2,
    },
  ];

  const setupLinks = [
    { label: "Departments", value: departments.length, href: "/department", icon: Building2 },
    { label: "Job Roles", value: jobRoles.length, href: "/job-roles", icon: BadgeCheck },
    { label: "Work Locations", value: workLocations.length, href: "/work-location", icon: MapPin },
    { label: "Users", value: userCount, href: "/users", icon: UserCog },
    { label: "Configuration", value: "Open", href: "/configuration", icon: Settings },
  ];

  return (
    <div className="min-h-full bg-slate-50 p-3 md:p-5">
        <div className="w-full space-y-5">
        <DashboardHero
          eyebrow="HRMS Dashboard"
          title={`Welcome back, ${session.user.name || session.user.firstName || "User"}`}
          description="A live overview of the modules already built in this portal: employees, employers, attendance, leave, documents, projects, transfers, users, roles, and configuration."
        >
          <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700">
            <div className="flex items-center justify-between gap-4">
              <span>Active employee ratio</span>
              <strong className="text-slate-900">{percent(activeEmployees.length, employees.length)}</strong>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>Pending approvals</span>
              <strong className="text-slate-900">{pendingLeaves.length + pendingDocs.length}</strong>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>Project members</span>
              <strong className="text-slate-900">{projectMembers}</strong>
            </div>
          </div>
        </DashboardHero>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((item) => (
            <MetricCard key={item.label} {...item} />
          ))}
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <SectionCard
            title="Pending Work"
            description="Leave and document items that already have review flows in the app."
            action={{ label: "Open leave", href: "/leave-requests" }}
          >
            <div className="grid gap-3 lg:grid-cols-2">
              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-700">Leave Requests</p>
                {pendingLeaves.slice(0, 4).map((request) => (
                  <div key={request.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-slate-950">{request.employee.employeeName}</p>
                      <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
                        {request.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      {request.leaveType.replaceAll("_", " ")} - {request.totalDays} day(s)
                    </p>
                  </div>
                ))}
                {!pendingLeaves.length ? <EmptyState>No pending leave requests.</EmptyState> : null}
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-700">Document Reviews</p>
                {pendingDocs.slice(0, 4).map((document) => (
                  <div key={document.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-slate-950">
                        {document.employee?.employeeName || document.employeeCode}
                      </p>
                      <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
                        {document.reviewStatus}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      {document.experienceType.replaceAll("_", " ")} - {document.status}
                    </p>
                  </div>
                ))}
                {!pendingDocs.length ? <EmptyState>No pending document reviews.</EmptyState> : null}
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Today Attendance" description="Recent attendance records marked for the current date." action={{ label: "Open attendance", href: "/attendance" }}>
            <div className="space-y-3">
              {todayAttendance.map((record) => (
                <div key={record.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div>
                    <p className="font-medium text-slate-950">{record.employee.employeeName}</p>
                    <p className="text-sm text-slate-500">{record.employee.employeeCode}</p>
                  </div>
                  <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-700">
                    {record.status.replaceAll("_", " ")}
                  </span>
                </div>
              ))}
              {!todayAttendance.length ? <EmptyState>No attendance records are marked for today.</EmptyState> : null}
            </div>
          </SectionCard>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <SectionCard title="People Setup" description="Org structure and access modules.">
            <div className="grid gap-3">
              {setupLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm transition hover:border-cyan-300 hover:bg-cyan-50"
                >
                  <span className="flex items-center gap-3 font-medium text-slate-800">
                    <item.icon className="h-4 w-4 text-cyan-700" />
                    {item.label}
                  </span>
                  <span className="text-slate-600">{item.value}</span>
                </Link>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Recent Projects" description="Project records and their current status." action={{ label: "Open projects", href: "/projects" }}>
            <div className="space-y-3">
              {projects.map((project) => (
                <div key={project.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium text-slate-950">{project.name}</p>
                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-700">
                      {project.status.replaceAll("_", " ")}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    {formatDate(project.startDate)} - {formatDate(project.endDate)}
                  </p>
                </div>
              ))}
              {!projects.length ? <EmptyState>No projects have been created yet.</EmptyState> : null}
            </div>
          </SectionCard>

          <SectionCard title="Recent Movement" description="Transfer and promotion history connected to employees." action={{ label: "Open module", href: "/transfer-promotion" }}>
            <div className="space-y-3">
              {transfers.map((movement) => (
                <div key={movement.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium text-slate-950">{movement.employee.employeeName}</p>
                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-700">
                      {movement.movementType.replaceAll("_", " ")}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    Effective {formatDate(movement.effectiveDate)}
                  </p>
                </div>
              ))}
              {!transfers.length ? <EmptyState>No transfer or promotion activity yet.</EmptyState> : null}
            </div>
          </SectionCard>
        </section>
      </div>
    </div>
  );
}
