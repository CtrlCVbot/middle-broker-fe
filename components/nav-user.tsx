"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Settings,
  User,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
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
import { logout } from "@/utils/auth"
import { useToast } from "@/components/ui/use-toast"

export function NavUser({
  user,
  className,
  ...props
}: React.ComponentProps<typeof SidebarMenu> & {
  user: {
    name: string
    email: string
    avatar: string | null
  }
}) {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const { toast } = useToast()

  // 사용자 정보가 없을 때의 안전한 처리
  const safeUser = {
    name: user?.name || "사용자",
    email: user?.email || "user@example.com",
    avatar: user?.avatar || null
  }

  // 사용자 이름의 이니셜 생성 (안전한 처리)
  const getInitials = (name: string) => {
    if (!name || name.trim() === "") return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault()
    
    try {
      const success = await logout()
      
      if (success) {
        toast({
          title: "로그아웃 되었습니다",
          description: "성공적으로 로그아웃 되었습니다.",
          variant: "default",
        })
        
        // 짧은 지연 후 로그인 페이지로 리디렉션 (토스트 메시지를 볼 수 있도록)
        setTimeout(() => {
          router.push("/login")
        }, 1000)
      } else {
        toast({
          title: "로그아웃 실패",
          description: "로그아웃 중 오류가 발생했습니다. 다시 시도해주세요.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Logout error:", error)
      toast({
        title: "로그아웃 실패",
        description: "로그아웃 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      })
    }
  }

  return (
    <SidebarMenu className={className} {...props}>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={safeUser.avatar || ""} alt={safeUser.name} />
                <AvatarFallback className="rounded-lg">
                  {getInitials(safeUser.name)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{safeUser.name}</span>
                <span className="truncate text-xs">{safeUser.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={safeUser.avatar || ""} alt={safeUser.name} />
                  <AvatarFallback className="rounded-lg">
                    {getInitials(safeUser.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{safeUser.name}</span>
                  <span className="truncate text-xs">{safeUser.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck className="mr-2 size-4" />
                계정
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard className="mr-2 size-4" />
                결제
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell className="mr-2 size-4" />
                알림
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a href="/profile">
                <User className="mr-2 size-4" />
                <span>프로필</span>
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href="#">
                <Settings className="mr-2 size-4" />
                <span>설정</span>
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 size-4" />
              로그아웃
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
