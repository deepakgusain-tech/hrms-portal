import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
  AlertTriangle,
  Briefcase,
  Building,
  CalendarCheck,
  Clock,
  IndianRupee,
  ShieldCheck,
  TrendingUp,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) redirect("/");
  if (session.user.role?.toLowerCase() === "employee") {
    redirect("/employee-dashboard");
  }

  const stats = [
    { title: "Total Employees", value: "120", icon: Users },
    { title: "Active Employees", value: "105", icon: Users },
    { title: "New Hires", value: "6", icon: UserPlus },
    { title: "Attrition", value: "2", icon: UserMinus },
    { title: "Departments", value: "5", icon: Building },
    { title: "Projects", value: "8", icon: Briefcase },
    { title: "Payroll", value: "₹5.2L", icon: IndianRupee },
    { title: "Compliance", value: "92%", icon: ShieldCheck },
    { title: "Approvals", value: "7", icon: Clock },
    { title: "Attendance", value: "98", icon: CalendarCheck },
    { title: "Growth", value: "+12%", icon: TrendingUp },
    { title: "Alerts", value: "3", icon: AlertTriangle },
  ];

  const approvals = [
    { name: "Jane Smith", action: "Leave Request" },
    { name: "Amit Verma", action: "Promotion" },
    { name: "Riya Sharma", action: "Transfer" },
    { name: "Rahul Singh", action: "Document Upload" },
  ];

  const alerts = [
    "Payroll pending for April",
    "3 inactive employees detected",
    "2 documents pending verification",
  ];

  const hiring = [
    { dept: "IT", open: 3 },
    { dept: "Sales", open: 2 },
    { dept: "HR", open: 1 },
  ];

  return (
    <div className="space-y-6 bg-gradient-to-br from-slate-50 via-cyan-50 to-indigo-50 p-1">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-cyan-500 px-6 py-7 text-white shadow-2xl">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-10 h-24 w-24 rounded-full bg-cyan-300/20 blur-2xl" />

        <h1 className="relative text-2xl font-bold md:text-3xl">
          Admin Dashboard
        </h1>
        <p className="relative mt-2 text-sm text-cyan-100">
          Organization-wide control and insights
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {stats.map((item) => (
          <div
            key={item.title}
            className="rounded-3xl border border-white/60 bg-white/80 p-4 backdrop-blur-md shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-2xl bg-gradient-to-br from-indigo-100 to-cyan-100 p-2 text-indigo-600">
                <item.icon size={18} />
              </div>
            </div>

            <p className="text-xs font-medium text-slate-500">{item.title}</p>
            <p className="mt-1 text-xl font-bold text-slate-800">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Row 1 */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Approvals */}
        <div className="rounded-3xl border border-white/60 bg-white/80 p-5 backdrop-blur-md shadow-md">
          <h2 className="mb-4 font-semibold text-slate-800">
            Pending Approvals
          </h2>

          <div className="space-y-3 text-sm">
            {approvals.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2"
              >
                <span className="font-medium text-slate-700">{item.name}</span>
                <span className="rounded-full bg-cyan-100 px-2 py-1 text-xs font-semibold text-indigo-700">
                  {item.action}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="rounded-3xl border border-white/60 bg-white/80 p-5 backdrop-blur-md shadow-md">
          <h2 className="mb-4 font-semibold text-slate-800">System Alerts</h2>

          <div className="space-y-3 text-sm">
            {alerts.map((alert) => (
              <div
                key={alert}
                className="rounded-2xl border border-cyan-100 bg-gradient-to-r from-cyan-50 to-indigo-50 px-3 py-2 text-slate-700"
              >
                ⚠ {alert}
              </div>
            ))}
          </div>
        </div>

        {/* Hiring */}
        <div className="rounded-3xl border border-white/60 bg-white/80 p-5 backdrop-blur-md shadow-md">
          <h2 className="mb-4 font-semibold text-slate-800">Hiring Status</h2>

          <div className="space-y-3 text-sm">
            {hiring.map((item) => (
              <div
                key={item.dept}
                className="flex justify-between rounded-2xl bg-slate-50 px-3 py-2"
              >
                <span className="font-medium text-slate-700">{item.dept}</span>
                <span className="font-semibold text-cyan-600">
                  {item.open} Open Roles
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Attendance */}
        <div className="rounded-3xl border border-white/60 bg-white/80 p-5 backdrop-blur-md shadow-md">
          <h2 className="mb-4 font-semibold text-slate-800">
            Attendance Insights
          </h2>

          <div className="space-y-3 text-sm">
            {[
              { label: "Present", value: "98" },
              { label: "On Leave", value: "15" },
              { label: "Absent", value: "7" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex justify-between rounded-2xl bg-slate-50 px-3 py-2"
              >
                <span>{item.label}</span>
                <span className="font-semibold text-indigo-600">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="rounded-3xl border border-white/60 bg-white/80 p-5 backdrop-blur-md shadow-md">
          <h2 className="mb-4 font-semibold text-slate-800">
            Quick Admin Actions
          </h2>

          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              "Add Employee",
              "Add Department",
              "Manage Roles",
              "Run Payroll",
              "View Reports",
              "System Settings",
            ].map((btn) => (
              <button
                key={btn}
                className="rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-3 py-2 font-medium text-white shadow transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
              >
                {btn}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Compliance */}
      <div className="rounded-3xl border border-white/60 bg-white/80 p-5 backdrop-blur-md shadow-md">
        <h2 className="mb-4 font-semibold text-slate-800">
          Compliance & Documents
        </h2>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { title: "KYC Pending", value: "4" },
            { title: "Docs Verified", value: "110" },
            { title: "Expiring Contracts", value: "3" },
            { title: "Violations", value: "2" },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl bg-gradient-to-br from-indigo-50 to-cyan-50 p-4"
            >
              <p className="text-sm text-slate-500">{item.title}</p>
              <p className="mt-1 text-xl font-bold text-indigo-700">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Activity */}
      <div className="rounded-3xl border border-white/60 bg-white/80 p-5 backdrop-blur-md shadow-md">
        <h2 className="mb-4 font-semibold text-slate-800">System Activity</h2>

        <div className="space-y-3 text-sm text-slate-600">
          {[
            "Admin updated payroll • 09:00 AM",
            "New employee added • 11:00 AM",
            "Role permissions changed • 01:30 PM",
            "Leave approved • 03:00 PM",
          ].map((activity) => (
            <div
              key={activity}
              className="rounded-2xl bg-slate-50 px-3 py-2"
            >
              {activity}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}