"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRightLeft,
  BadgeCheck,
  Briefcase,
  Building2,
  CalendarCheck,
  CalendarPlus,
  Search,
  FolderArchive,
  Gauge,
  IdCard,
  ListChecks,
  LayoutGrid,
  NotebookText,
  Settings,
  User2Icon,
  UserCog,
  Users2Icon,
} from "lucide-react";

import { NavUser } from "@/components/nav-user";
import { Switcher } from "@/components/switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePathname } from "next/navigation";

type SidebarUser = {
  name?: string;
  email?: string;
  avatar?: string;
};

type SidebarRole = string | undefined;
type SidebarJobRole = string | undefined;

type AppConfig = {
  name?: string | null;
  logo?: string | null;
};

type MenuItem = {
  name: string;
  url: string;
  icon: React.ReactNode;
};

type MenuGroup = {
  name: string;
  icon: React.ReactNode;
  children?: MenuItem[];
  url?: string;
};

const menu: MenuGroup[] = [
  {
    name: "Dashboard",
    icon: <Gauge size={18} />,
    children: [
      { name: "Overview", url: "/dashboard", icon: <Gauge size={18} /> },
      {
        name: "Employee Search",
        url: "/dashboard-design",
        icon: <Search size={18} />,
      },
      {
        name: "Employee Dashboard",
        url: "/employee-dashboard",
        icon: <Users2Icon size={18} />,
      },
    ],
  },
  {
    name: "Employee Management",
    icon: <Users2Icon size={18} />,
    children: [
      {
        name: "Employee Profiles",
        url: "/employee-profiles",
        icon: <Users2Icon size={18} />,
      },
      {
        name: "Dept & Org Chart",
        url: "/department",
        icon: <Building2 size={18} />,
      },
      {
        name: "Job Roles",
        url: "/job-roles",
        icon: <BadgeCheck size={18} />,
      },
      {
        name: "Work Location",
        url: "/work-location",
        icon: <Briefcase size={18} />,
      },
      {
        name: "Employee ID & Docs",
        url: "/employee-documents",
        icon: <IdCard size={18} />,
      },
      {
        name: "Transfer & Promotion",
        url: "/transfer-promotion",
        icon: <ArrowRightLeft size={18} />,
      },
      {
        name: "Attendance",
        url: "/attendance",
        icon: <CalendarCheck size={18} />,
      },
      {
        name: "Leave Requests",
        url: "/leave-requests",
        icon: <CalendarPlus size={18} />,
      },
      {
        name: "EOD Reporting",
        url: "/eod-reporting",
        icon: <NotebookText size={18} />,
      },
    ],
  },
  {
    name: "User Management",
    icon: <User2Icon size={18} />,
    children: [
      { name: "User", url: "/users", icon: <User2Icon size={18} /> },
      { name: "Role", url: "/roles", icon: <UserCog size={18} /> },
      { name: "Module", url: "/module", icon: <LayoutGrid size={18} /> },
    ],
  },
  {
    name: "Employer Management",
    icon: <Building2 size={18} />,
    children: [
      { name: "Company", url: "/companies", icon: <Building2 size={18} /> },
      { name: "Employer", url: "/employers", icon: <UserCog size={18} /> },
    ],
  },
  {
    name: "Project Management",
    icon: <FolderArchive size={18} />,
    children: [
      {
        name: "Project Creation",
        url: "/projects",
        icon: <Building2 size={18} />,
      },
      {
        name: "Project Members",
        url: "/project-members",
        icon: <UserCog size={18} />,
      },
      {
        name: "Project Tracking",
        url: "/project-tracking",
        icon: <FolderArchive size={18} />,
      },
      {
        name: "Task Creation",
        url: "/tasks",
        icon: <UserCog size={18} />,
      },
    ],
  },
  {
    name: "Configuration",
    icon: <Settings size={18} />,
    url: "/configuration",
  },
];

function isHrJobRole(jobRole?: SidebarJobRole) {
  return !!jobRole?.toLowerCase().includes("hr");
}

function isManagerJobRole(jobRole?: SidebarJobRole) {
  return !!jobRole?.toLowerCase().includes("manager");
}

function getMenuByRole(
  role?: SidebarRole,
  jobRole?: SidebarJobRole,
  isManager?: boolean,
): MenuGroup[] {
  if (role?.toLowerCase() === "employee") {
    if (isHrJobRole(jobRole)) {
      return [
        {
          name: "HR Dashboard",
          url: "/employee-dashboard",
          icon: <Gauge size={18} />,
        },
        {
          name: "Employee Profiles",
          url: "/employee-profiles",
          icon: <Users2Icon size={18} />,
        },
        {
          name: "Dept & Org Chart",
          url: "/department",
          icon: <Building2 size={18} />,
        },
        {
          name: "Job Roles",
          url: "/job-roles",
          icon: <BadgeCheck size={18} />,
        },
        {
          name: "Work Location",
          url: "/work-location",
          icon: <Briefcase size={18} />,
        },
        {
          name: "Attendance",
          url: "/attendance",
          icon: <CalendarCheck size={18} />,
        },
        {
          name: "Leave Requests",
          url: "/leave-requests",
          icon: <CalendarPlus size={18} />,
        },
        {
          name: "Task Tracking",
          url: "/employee-task-tracking",
          icon: <ListChecks size={18} />,
        },
        {
          name: "EOD Reporting",
          url: "/eod-reporting",
          icon: <NotebookText size={18} />,
        },
        {
          name: "Transfer & Promotion",
          url: "/transfer-promotion",
          icon: <ArrowRightLeft size={18} />,
        },
        {
          name: "Employee Documents",
          url: "/employee-documents",
          icon: <IdCard size={18} />,
        },
      ];
    }

    if (isManager || isManagerJobRole(jobRole)) {
      return [
        {
          name: "Manager Dashboard",
          url: "/employee-dashboard",
          icon: <Gauge size={18} />,
        },
        {
          name: "My Attendance",
          url: "/attendance/my",
          icon: <CalendarCheck size={18} />,
        },
        {
          name: "My Leave Requests",
          url: "/leave-requests/my",
          icon: <CalendarPlus size={18} />,
        },
        {
          name: "My Documents",
          url: "/employee-documents",
          icon: <IdCard size={18} />,
        },
        {
          name: "My Task Tracking",
          url: "/employee-task-tracking",
          icon: <ListChecks size={18} />,
        },
        {
          name: "EOD Reporting",
          url: "/eod-reporting",
          icon: <NotebookText size={18} />,
        },
        {
          name: "Project Management",
          icon: <FolderArchive size={18} />,
          children: [
            {
              name: "Project Creation",
              url: "/projects",
              icon: <Building2 size={18} />,
            },
            {
              name: "Project Members",
              url: "/project-members",
              icon: <UserCog size={18} />,
            },
            {
              name: "Project Tracking",
              url: "/project-tracking",
              icon: <FolderArchive size={18} />,
            },
          ],
        },
      ];
    }

    return [
      {
        name: "Employee Dashboard",
        url: "/employee-dashboard",
        icon: <Gauge size={18} />,
      },
      {
        name: "My Attendance",
        url: "/attendance/my",
        icon: <CalendarCheck size={18} />,
      },
      {
        name: "My Leave Requests",
        url: "/leave-requests/my",
        icon: <CalendarPlus size={18} />,
      },
      {
        name: "My Documents",
        url: "/employee-documents",
        icon: <IdCard size={18} />,
      },
      {
        name: "My Task Tracking",
        url: "/employee-task-tracking",
        icon: <ListChecks size={18} />,
      },
      {
        name: "EOD Reporting",
        url: "/eod-reporting",
        icon: <NotebookText size={18} />,
      },
    ];
  }

  if (role?.toLowerCase() === "employer") {
    return [
      {
        name: "Dashboard",
        icon: <Gauge size={18} />,
        children: [
          {
            name: "Employer Dashboard",
            url: "/dashboard",
            icon: <Gauge size={18} />,
          },
          {
            name: "Employee Search",
            url: "/dashboard-design",
            icon: <Search size={18} />,
          },
        ],
      },
    ];
  }

  return menu;
}

function filterMenuByAccess(
  menuGroups: MenuGroup[],
  role: SidebarRole,
  accessibleRoutes: string[]
) {
  if (role?.toLowerCase() === "employee" || role?.toLowerCase() === "employer") {
    return menuGroups;
  }

  const routeSet = new Set(accessibleRoutes);

  return menuGroups
    .map((group) => {
      if (group.children?.length) {
        const children = group.children.filter((item) =>
          routeSet.has(item.url)
        );

        if (!children.length) return null;

        return { ...group, children };
      }

      if (group.url && routeSet.has(group.url)) {
        return group;
      }

      return null;
    })
    .filter((group): group is MenuGroup => !!group);
}

export function AppSidebar({
  user,
  role,
  jobRole,
  isManager,
  config,
  accessibleRoutes = [],
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user?: SidebarUser;
  role?: SidebarRole;
  jobRole?: SidebarJobRole;
  isManager?: boolean;
  config?: AppConfig;
  accessibleRoutes?: string[];
}) {
  const navUser = {
    name: user?.name || "User",
    email: user?.email || "user@example.com",
    avatar: user?.avatar || "",
  };

  const filteredMenu = filterMenuByAccess(
    getMenuByRole(role, jobRole, isManager),
    role,
    accessibleRoutes
  );

  const homeHref =
    role?.toLowerCase() === "employee"
      ? "/employee-dashboard"
      : "/dashboard";

  const companyName = config?.name?.trim() || "SY ASSOCIATES";
  const logoSrc = config?.logo?.trim() || "";
  const [failedLogoSrc, setFailedLogoSrc] = React.useState<string | null>(null);
  const showLogo = Boolean(logoSrc) && failedLogoSrc !== logoSrc;

  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const pathname = usePathname();

  return (
    <Sidebar
      collapsible="icon"
      className="z-100 border-r border-slate-200 shadow-sm"
      {...props}
    >
      <SidebarHeader className="border-b border-slate-200 px-3 py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="h-auto rounded-lg p-2 transition-all duration-200 hover:bg-white"
            >
              <Link href={homeHref}>
                <div className="flex items-center gap-3 min-w-0">
                  {showLogo && logoSrc ? (
                    <Image
                      src={logoSrc}
                      alt="Company Logo"
                      width={30}
                      height={30}
                      className="rounded-lg object-cover shrink-0 border border-slate-200"
                      onError={() => setFailedLogoSrc(logoSrc)}
                    />
                  ) : (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-cyan-100 bg-cyan-50 text-sm font-semibold text-cyan-700">
                      {companyName.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <span className="truncate text-sm font-semibold tracking-wide text-slate-900 group-data-[collapsible=icon]:hidden">
                    {companyName}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="p-2 space-y-2">
        {filteredMenu.map((group) =>
          group.children ? (
            <Switcher key={group.name} menu={group} />
          ) : (
            <SidebarMenu key={group.name}>
              <SidebarMenuItem>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SidebarMenuButton
                        asChild
                        size="lg"
                        className={`
                        rounded-lg cursor-pointer transition-all duration-200
                        ${pathname === group.url
                            ? "bg-cyan-600 text-white shadow-sm"
                            : "text-slate-700 hover:bg-white hover:text-slate-900"
                          }
                      `}
                      >
                        <Link href={group.url!}>
                          <div
                            className={`
                              flex aspect-square size-8 items-center justify-center rounded-lg
                              ${pathname === group.url
                                ? "bg-white/20 text-white"
                                : "border border-slate-200 bg-slate-50 text-cyan-700"
                              }
                            `}
                          >
                            {group.icon}
                          </div>
                          <span>{group.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </TooltipTrigger>
                    {isCollapsed && (
                      <TooltipContent side="right" className="border-0 bg-slate-900 text-white">
                        {group.name}
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </SidebarMenuItem>
            </SidebarMenu>
          )
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-200 p-2">
        <div className="rounded-lg bg-white ring-1 ring-slate-200">
          <NavUser user={navUser} />
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
