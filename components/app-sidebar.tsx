"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRightLeft,
  Briefcase,
  Building2,
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
} from "@/components/ui/sidebar";

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
        ],
      },
    ];
  }

  return menu;
}

export function AppSidebar({
  user,
  role,
  config,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user?: SidebarUser;
  role?: SidebarRole;
  config?: AppConfig;
}) {
  const navUser = {
    name: user?.name || "User",
    email: user?.email || "user@example.com",
    avatar: user?.avatar || "",
  };

  const filteredMenu = getMenuByRole(role);

  const homeHref =
    role?.toLowerCase() === "employee"
      ? "/employee-dashboard"
      : "/dashboard";

  const companyName = config?.name?.trim() || "SY ASSOCIATES";
  const logoSrc = config?.logo?.trim() || "";

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* Header */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="p-2 h-auto">
              <Link href={homeHref}>
                <div className="flex items-center gap-2 min-w-0">
                  {logoSrc ? (
                    <Image
                      src={logoSrc}
                      alt="Company Logo"
                      width={28}
                      height={28}
                      className="rounded-md object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-md bg-gray-300 shrink-0" />
                  )}

                  <span className="text-sm font-semibold truncate group-data-[collapsible=icon]:hidden">
                    {companyName}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Menu */}
      <SidebarContent className="p-2 space-y-2">
        {filteredMenu.map((group) =>
          group.children ? (
            <Switcher key={group.name} menu={group} />
          ) : (
            <SidebarMenu key={group.name}>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href={group.url!}>
                    {group.icon}
                    <span>{group.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          )
        )}
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter>
        <NavUser user={navUser} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}