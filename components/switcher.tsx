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
import { cn } from "@/lib/utils"

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
  children?: SwitcherMenuItem[]
}

export function Switcher({ menu }: { menu: SwitcherMenu }) {
  const router = useRouter()
  const pathname = usePathname()
  const { isMobile, state } = useSidebar()
  const [open, setOpen] = React.useState(false)

  const isActive = menu.children?.some((item: SwitcherMenuItem) =>
    pathname.startsWith(item.url)
  )
  const children = menu.children ?? []

  const isCollapsed = state === "collapsed"

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu onOpenChange={setOpen}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className={cn(
                      `
                rounded-[1.25rem] cursor-pointer transition-all duration-200
                ${isActive
                        ? "bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25"
                        : "text-slate-700 hover:bg-white/70 hover:text-slate-900"
                      }
              `,
                      isCollapsed && "justify-center px-0"
                    )}
                  >
                    <div
                      className={cn(
                        `
                  flex aspect-square size-9 items-center justify-center rounded-2xl
                  ${isActive
                          ? "bg-white/20 text-white"
                          : "border border-white/50 bg-white/55 text-cyan-700"
                        }
                `,
                        isCollapsed && "size-10"
                      )}
                    >
                      {menu.icon}
                    </div>

                    <div className={cn("grid min-w-0 flex-1 text-left text-sm leading-tight", isCollapsed && "hidden")}>
                      <span className="truncate font-medium">{menu.name}</span>
                    </div>

                    <div className={cn("flex items-center gap-2 group-data-[collapsible=icon]:hidden", isCollapsed && "hidden")}>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          isActive
                            ? "bg-white/15 text-white"
                            : "bg-sky-500/10 text-sky-700 ring-1 ring-sky-200/70"
                        }`}
                      >
                        {children.length}
                      </span>
                      <ChevronRight
                        className={`h-4 w-4 transition-transform duration-200 ${
                          open ? "rotate-90" : ""
                        }`}
                      />
                    </div>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right" className="border-0 bg-slate-900 text-white">
                  {menu.name}
                </TooltipContent>
              )}

              <DropdownMenuContent
                className="min-w-60 rounded-[1.5rem] border border-white/50 bg-white/85 p-1.5 shadow-2xl backdrop-blur-xl"
                align="start"
                side={isMobile ? "bottom" : "right"}
                sideOffset={10}
              >
                <div className="px-2 py-1.5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                    {menu.name}
                  </p>
                </div>

                {children.map((m: SwitcherMenuItem, index: number) => (
                  <DropdownMenuItem
                    key={m.name}
                    className="cursor-pointer gap-3 rounded-[1rem] p-2.5 text-slate-700 hover:bg-cyan-50/80 focus:bg-cyan-50/80"
                    onSelect={() => router.push(m.url)}
                  >
                    <div className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
                      {m.icon}
                    </div>

                    <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                      <span className="truncate">{m.name}</span>
                      {pathname.startsWith(m.url) ? (
                        <span className="h-2 w-2 rounded-full bg-cyan-600" />
                      ) : null}
                    </div>

                    <DropdownMenuShortcut className="text-slate-400">
                      {index + 1}
                    </DropdownMenuShortcut>
                  </DropdownMenuItem>
                ))}

                <DropdownMenuSeparator className="my-1 bg-slate-200/70" />
              </DropdownMenuContent>
            </Tooltip>
          </TooltipProvider>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
