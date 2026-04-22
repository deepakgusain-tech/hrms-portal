"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { GalleryVerticalEndIcon, AudioLinesIcon, TerminalIcon, TerminalSquareIcon, BotIcon, BookOpenIcon, Settings2Icon, FrameIcon, PieChartIcon, MapIcon, User2Icon, Users2Icon, Building2, Briefcase, IdCard, ArrowRightLeft, UserCog, LayoutGrid } from "lucide-react"
import { Switcher } from "./switcher"
import Link from "next/link"
import Image from "next/image"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: (
        <GalleryVerticalEndIcon
        />
      ),
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: (
        <AudioLinesIcon
        />
      ),
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: (
        <TerminalIcon
        />
      ),
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Playground",
      url: "#",
      icon: (
        <TerminalSquareIcon
        />
      ),
      isActive: true,
      items: [
        {
          title: "History",
          url: "#",
        },
        {
          title: "Starred",
          url: "#",
        },
        {
          title: "Settings",
          url: "#",
        },
      ],
    },
    {
      title: "Models",
      url: "#",
      icon: (
        <BotIcon
        />
      ),
      items: [
        {
          title: "Genesis",
          url: "#",
        },
        {
          title: "Explorer",
          url: "#",
        },
        {
          title: "Quantum",
          url: "#",
        },
      ],
    },
    {
      title: "Documentation",
      url: "#",
      icon: (
        <BookOpenIcon
        />
      ),
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: (
        <Settings2Icon
        />
      ),
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: (
        <FrameIcon
        />
      ),
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: (
        <PieChartIcon
        />
      ),
    },
    {
      name: "Travel",
      url: "#",
      icon: (
        <MapIcon
        />
      ),
    },
  ],
}

const menu = [
  {
    name: "Employee Management",
    url: "#",
    icon: (
      <Users2Icon
      />
    ),
    children: [
      {
        name: "Employee profiles",
        url: "#",
        icon: (
          <Users2Icon
          />
        ),
      },
      {
        name: "Dept & org chart",
        url: "#",
        icon: (
          <Building2
          />
        ),
      },
      {
        name: "Job roles & grades",
        url: "#",
        icon: (
          <MapIcon
          />
        ),
      },
      {
        name: "Work location",
        url: "/work-location",
        icon: (
          <Briefcase
          />
        ),
      },
      {
        name: "Employee ID & docs",
        url: "#",
        icon: (
          <IdCard
          />
        ),
      },
      {
        name: "Transfer & promotion",
        url: "#",
        icon: (
          <ArrowRightLeft
          />
        ),
      }
    ]
  },
  {
    name: "User Management",
    url: "#",
    icon: (
      <User2Icon
      />
    ),
    children: [
      {
        name: "User",
        url: "/users",
        icon: (
          <User2Icon
          />
        ),
      },
      {
        name: "Role",
        url: "/roles",
        icon: (
          <UserCog
          />
        ),
      },
      {
        name: "Module",
        url: "/module",
        icon: (
          <LayoutGrid
          />
        ),
      }
    ]
  },

]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="p-2">
              <Link href="/admin/home">
                <div className="flex items-center gap-2">

                  {/* LOGO */}
                  <Image
                    src={"/sy.png"}
                    alt="logo"
                    width={28}
                    height={28}
                    className="rounded-md"
                  />

                  {/* TEXT (hidden when collapsed) */}
                  <span className="text-sm font-semibold whitespace-nowrap group-data-[collapsible=icon]:hidden">
                    {"SY ASSOCIATES"}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="p-2 space-y-2">
        {
          menu.map((m: any, index: number) => (
            <Switcher key={index} menu={m} />
          ))
        }
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
