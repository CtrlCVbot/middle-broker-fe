"use client"

import * as React from "react"
import {
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
  NotebookTabs,
  Truck,
  PackagePlus,
  CreditCard,
  Building,
  DollarSign,
} from "lucide-react"
import Link from 'next/link'

import { NavMain } from "@/components/nav-main"
import { NavBroker } from "@/components/nav-broker"
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

import { getCurrentUser } from "@/utils/auth"

const user = getCurrentUser();


export const data = {


  user: {
    name: user?.name || "",
    email: user?.email || "",
    avatar: null,
  },
  navMain: [
    {
      title: "홈",
      url: "/",
      icon: Home,
      isActive: true,
    },
    
    {
      title: "주소록",
      url: "/address",
      icon: NotebookTabs,
    },

    {
      title: "운송 요청",
      url: "/order/register",
      icon: PackagePlus,
    },

    {
      title: "운송 현황",
      url: "/order/list",
      icon: Truck,
      items: [
        {
          title: "운송 목록",
          url: "/order/list",
        },
        {
          title: "운송 요청",
          url: "/order/register",
        }
      ],
    },
    
    
    {
      title: "운송 정산",
      url: "/settlement/list",
      icon: CreditCard,
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
    {
      title: "프로필",
      url: "/profile",
      icon: User,
    },
  ],

  navBroker: [
    {
      title: "실시간 화물 현황",
      url: "/broker/order/list",
      icon: LifeBuoy,
    },
    {
      title: "업체 관리",
      url: "/broker/company/list",
      icon: Building,
    },
    {
      title: "차주 관리",
      url: "/broker/driver/list",
      icon: Truck,
    },
    {
      title: "매출 정산",
      url: "/broker/income",
      icon: DollarSign,
      items: [
        {
          title: "정산 목록",
          url: "/broker/income",
        },
        {
          title: "정산 대기 화물",
          url: "/broker/income/first-settlement",
        }
      ],
    },
    {
      title: "매입 정산",
      url: "/broker/expenditure",
      icon: DollarSign,
      items: [
        {
          title: "정산 목록",
          url: "/broker/expenditure",
        },
      ],
    },
    {
      title: "매입 정산2",
      url: "/broker/expenditure2",
      icon: DollarSign,
      items: [
        {
          title: "정산 목록",
          url: "/broker/expenditure2",
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
              <Link href="/">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">MiddleMile Shipper</span>
                  <span className="truncate text-xs">프론트엔드</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavBroker items={data.navBroker} />
        <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
