"use client"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { logoutUser } from "@/lib/actions/users"
import { userLogoutRequest } from "@/store/actions/user-actions"
import {
  ChevronsUpDownIcon,
  LogOutIcon,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useDispatch } from "react-redux"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()
  const dispatch = useDispatch()
  const router = useRouter()

  const handleLogout = async () => {
    dispatch(userLogoutRequest())
    await logoutUser()
    router.push("/login")
  }

  const fullName = user.name.trim().split(" ").slice(0, 2).join(" ")

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="rounded-2xl text-white hover:bg-white/15 hover:text-white data-[state=open]:bg-white/25 data-[state=open]:text-white"
            >
              <Avatar className="h-8 w-8 rounded-xl border border-white/20 bg-white/10">
                <AvatarImage
                  src={user.avatar}
                  alt={fullName}
                />
                <AvatarFallback className="rounded-xl bg-white text-indigo-700 font-semibold">
                  {fullName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium text-white">
                  {fullName}
                </span>
              </div>

              <ChevronsUpDownIcon className="ml-auto size-4 text-white/80" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-2xl border border-slate-200 bg-white/95 shadow-2xl backdrop-blur-xl"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={8}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-3 px-3 py-3 text-left text-sm">
                <Avatar className="h-9 w-9 rounded-xl border border-slate-200">
                  <AvatarImage
                    src={user.avatar}
                    alt={fullName}
                  />
                  <AvatarFallback className="rounded-xl bg-indigo-50 text-indigo-700 font-semibold">
                    {fullName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-slate-800">
                    {fullName}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator className="bg-slate-100" />

            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer rounded-xl text-red-600 focus:bg-red-50 focus:text-red-700"
            >
              <LogOutIcon className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}