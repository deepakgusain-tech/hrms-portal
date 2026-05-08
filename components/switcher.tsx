"use client"

import * as React from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { ChevronRight } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"

type SwitcherMenuItem = {
  name: string
  url: string
  icon: React.ReactNode
}

type SwitcherMenu = {
  name: string
  icon: React.ReactNode
  children: SwitcherMenuItem[]
}

export function Switcher({ menu }: { menu: SwitcherMenu }) {
  const router = useRouter()
  const pathname = usePathname()
  const { isMobile, state } = useSidebar()

  const isActive = menu.children?.some((item: SwitcherMenuItem) =>
    pathname.startsWith(item.url)
  )

  const isCollapsed = state === "collapsed"

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className={`
                rounded-lg cursor-pointer transition-all duration-200
                ${isActive
                        ? "bg-cyan-600 text-white shadow-sm"
                        : "text-slate-700 hover:bg-white hover:text-slate-900"
                      }
              `}
                  >
                    <div
                      className={`
                  flex aspect-square size-8 items-center justify-center rounded-lg
                  ${isActive
                          ? "bg-white/20 text-white"
                          : "border border-slate-200 bg-slate-50 text-cyan-700"
                        }
                `}
                    >
                      {menu.icon}
                    </div>

                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">{menu.name}</span>
                    </div>

                    <ChevronRight className="ml-auto h-4 w-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right" className="bg-slate-900 text-white border-0">
                  {menu.name}
                </TooltipContent>
              )}

              <DropdownMenuContent
                className="min-w-56 rounded-lg border border-slate-200 bg-white shadow-xl"
                align="start"
                side={isMobile ? "bottom" : "right"}
                sideOffset={10}
              >
                {menu.children.map((m: SwitcherMenuItem, index: number) => (
                  <DropdownMenuItem
                    key={m.name}
                    className="cursor-pointer gap-2 rounded-lg p-2 text-slate-700 hover:bg-cyan-50 focus:bg-cyan-50"
                    onSelect={() => router.push(m.url)}
                  >
                    <div className="flex size-7 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700">
                      {m.icon}
                    </div>

                    {m.name}

                    <DropdownMenuShortcut className="text-slate-400">
                      ⌘{index + 1}
                    </DropdownMenuShortcut>
                  </DropdownMenuItem>
                ))}

                <DropdownMenuSeparator />
              </DropdownMenuContent>
            </Tooltip>
          </TooltipProvider>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
