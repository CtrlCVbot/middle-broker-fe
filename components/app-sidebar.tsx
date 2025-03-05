"use client"

import * as React from "react"
import {
  BookOpen,
  Bot,
  Command,
  Frame,
  Home,
  LifeBuoy,
  Map,
  PieChart,
  Send,
  Settings2,
  SquareTerminal,
  User,
  NotebookTabs
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "홍길동",
    email: "user@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "홈",
      url: "/",
      icon: Home,
      isActive: true,
    },
    {
      title: "대시보드",
      url: "/dashboard",
      icon: SquareTerminal,
      items: [
        {
          title: "통계",
          url: "/dashboard/stats",
        },
        {
          title: "보고서",
          url: "/dashboard/reports",
        },
        {
          title: "설정",
          url: "/dashboard/settings",
        },
      ],
    },
    {
      title: "주소록",
      url: "/address",
      icon: NotebookTabs,
    },
    {
      title: "프로필",
      url: "/profile",
      icon: User,
    },
    {
      title: "모델",
      url: "#",
      icon: Bot,
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
      title: "문서",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "소개",
          url: "#",
        },
        {
          title: "시작하기",
          url: "#",
        },
        {
          title: "튜토리얼",
          url: "#",
        },
        {
          title: "변경 로그",
          url: "#",
        },
      ],
    },
    {
      title: "설정",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "일반",
          url: "#",
        },
        {
          title: "팀",
          url: "#",
        },
        {
          title: "결제",
          url: "#",
        },
        {
          title: "제한",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "지원",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "피드백",
      url: "#",
      icon: Send,
    },
  ],
  projects: [
    {
      name: "디자인 엔지니어링",
      url: "#",
      icon: Frame,
    },
    {
      name: "영업 및 마케팅",
      url: "#",
      icon: PieChart,
    },
    {
      name: "여행",
      url: "#",
      icon: Map,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Middle Shipper</span>
                  <span className="truncate text-xs">프론트엔드</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
