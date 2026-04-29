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

import { ChevronRight } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"

export function Switcher({ menu }: any) {
  const router = useRouter()
  const pathname = usePathname()
  const { isMobile } = useSidebar()

  const isActive = menu.children?.some((item: any) =>
    pathname.startsWith(item.url)
  )

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className={`
                rounded-2xl transition-all duration-200
                ${
                  isActive
                    ? "bg-indigo-800 text-white shadow-lg ring-1 ring-white/20"
                    : "text-white hover:bg-white/15 hover:text-white"
                }
              `}
            >
              <div
                className={`
                  flex aspect-square size-8 items-center justify-center rounded-xl
                  ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "border border-white/30 bg-white/20 text-white"
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

          <DropdownMenuContent
            className="min-w-56 rounded-2xl border border-white/20 bg-white shadow-xl"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={10}
          >
            {menu.children.map((m: any, index: number) => (
              <DropdownMenuItem
                key={m.name}
                className="gap-2 rounded-xl p-2 cursor-pointer text-slate-700 hover:bg-indigo-50 focus:bg-indigo-50"
                onSelect={() => router.push(m.url)}
              >
                <div className="flex size-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
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
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}