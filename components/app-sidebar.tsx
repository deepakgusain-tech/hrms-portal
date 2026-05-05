"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRightLeft,
  Briefcase,
  Building2,
  CalendarCheck,
  CalendarPlus,
  FolderArchive,
  Gauge,
  IdCard,
  LayoutGrid,
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

function getMenuByRole(role?: SidebarRole): MenuGroup[] {
  if (role?.toLowerCase() === "employee") {
    return [
      {
        name: "Dashboard",
        icon: <Gauge size={18} />,
        children: [
          {
            name: "Employee Dashboard",
            url: "/employee-dashboard",
            icon: <Users2Icon size={18} />,
          },
          {
            name: "My Attendance",
            url: "/attendance/my",
            icon: <CalendarCheck size={18} />,
          },
          {
            name: "Leave Requests",
            url: "/leave-requests/my",
            icon: <CalendarPlus size={18} />,
          },
        ],
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
  config,
  accessibleRoutes = [],
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user?: SidebarUser;
  role?: SidebarRole;
  config?: AppConfig;
  accessibleRoutes?: string[];
}) {
  const navUser = {
    name: user?.name || "User",
    email: user?.email || "user@example.com",
    avatar: user?.avatar || "",
  };

  const filteredMenu = filterMenuByAccess(
    getMenuByRole(role),
    role,
    accessibleRoutes
  );

  const homeHref =
    role?.toLowerCase() === "employee"
      ? "/employee-dashboard"
      : "/dashboard";

  const companyName = config?.name?.trim() || "SY ASSOCIATES";
  const logoSrc = config?.logo?.trim() || "";

  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const pathname = usePathname()

  console.log(pathname);


  return (
    <Sidebar
      collapsible="icon"
      className="border-r z-100 border-indigo-200/40 bg-gradient-to-b from-indigo-400 via-blue-400 to-cyan-300 text-white shadow-xl"
      {...props}
    >
      <SidebarHeader className="border-b border-white/20 px-3 py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="h-auto rounded-2xl p-2 hover:bg-white/15 transition-all duration-200"
            >
              <Link href={homeHref}>
                <div className="flex items-center gap-3 min-w-0">
                  {logoSrc ? (
                    <Image
                      src={logoSrc}
                      alt="Company Logo"
                      width={30}
                      height={30}
                      className="rounded-xl object-cover shrink-0 border border-white/30"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-xl bg-white/25 shrink-0" />
                  )}

                  <span className="text-sm font-semibold tracking-wide truncate text-white group-data-[collapsible=icon]:hidden">
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
                        rounded-2xl cursor-pointer transition-all duration-200
                        ${pathname === group.url
                            ? "bg-indigo-800 text-white shadow-lg ring-1 ring-white/20"
                            : "text-white hover:bg-white/15 hover:text-white"
                          }
                      `}
                      >
                        <Link href={group.url!}>
                          <div
                            className={`
                              flex aspect-square size-8 items-center justify-center rounded-xl
                              ${pathname === group.url
                                ? "bg-white/20 text-white"
                                : "border border-white/30 bg-white/20 text-white"
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
                      <TooltipContent side="right" className="bg-slate-900 text-white border-0">
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

      <SidebarFooter className="border-t border-white/20 p-2">
        <div className="rounded-2xl bg-white/25 backdrop-blur-md ring-1 ring-white/20">
          <NavUser user={navUser} />
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
