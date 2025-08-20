"use client"

import * as React from "react"
import {
  Command,
  Frame,
  Home,
  LifeBuoy,
  Loader,
  Loader2,
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
  BanknoteArrowUp,
  BanknoteArrowDown,
  Banknote,
  
} from "lucide-react"
import Link from 'next/link'

import { NavMain } from "@/components/nav-main"
import { NavBroker } from "@/components/nav-broker"
import { NavProjects } from "@/components/nav-projects"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import { NavTest } from "@/components/nav-test"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import { useAuthStore } from "@/store/auth-store"

// 사이드바 데이터 분기 함수 (companyType 기준)
function getSidebarDataByUser(user: any) {
  if (!user || !user.companyType) {
    // 미로그인 또는 회사 타입 없음: 빈 메뉴 반환
    return {
      user: { name: "", email: "", avatar: null },
      navMain: [],
      navBroker: [],
      navTest: [],
    }
  }
  switch (user.companyType) {
    case "broker":
      return {
        user: { name: user.name || "", email: user.email || "", avatar: null },
        navMain: [],
        navBroker: getBrokerData().navBroker,
        navTest: getBrokerData().navTest,
      }
    case "shipper":
      return {
        user: { name: user.name || "", email: user.email || "", avatar: null },
        navMain: getShipperData().navMain,
        navBroker: [],
        navTest: getShipperData().navTest,
      }
    default:
      // 알 수 없는 타입: 빈 메뉴
      return {
        user: { name: user.name || "", email: user.email || "", avatar: null },
        navMain: [],
        navBroker: [],
        navTest: [],
      }
  }
}

function getData(user: any) {
  return {
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
        title: "프로필",
        url: "/profile",
        icon: User,
      },
    ],

    navBroker: [
      {
        title: "실시간 화물 현황 ver01",
        url: "/broker/order-ver01/list",
        icon: LifeBuoy,
      },
      {
        title: "오더 등록",
        url: "/broker/order-ver01/register",
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
        title: "매출 정산-ver01",
        url: "/broker/sale",
        icon: DollarSign,
        items: [
          {
            title: "정산 목록",
            url: "/broker/sale",
          },
          {
            title: "정산 대기 화물",
            url: "/broker/sale/waiting",
          }
        ],
      },

      {
        title: "매입 정산-ver01",
        url: "/broker/purchase",
        icon: DollarSign,
        items: [
          {
            title: "정산 목록",
            url: "/broker/purchase",
          },
          {
            title: "정산 대기 화물",
            url: "/broker/purchase/waiting",
          }
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

    navTest: [
      {
        title: "테스트",
        url: "#",
        icon: LifeBuoy,
        items: [
          {
            title: "엑셀 기능",
            url: "/test/excel",
          } ,
          {
            title: "카카오",
            url: "/test/kakao",
          } , 
          {
            title: "api 모니터링",
            url: "/test/api-monitor",
          } ,
          {
            title: "문자 메시지 발송",
            url: "/test/sms",
          },
          {
            title: "오더 등록 ver02",
            url: "/broker/order-ver02/register",
          }
        ],
      }
    ]
  }
}

function getShipperData(user?: any) {
  return {
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
        title: "요청",
        url: "/order/register",
        icon: PackagePlus,
      },

      {
        title: "현황",
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
        title: "정산",
        url: "/settlement/list",
        icon: Banknote,
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
        title: "프로필",
        url: "/profile",
        icon: User,
      },
    ],

    

    navTest: [
      {
        title: "테스트",
        url: "#",
        icon: LifeBuoy,
        items: [
          {
            title: "엑셀 기능",
            url: "/test/excel",
          } ,
          {
            title: "카카오",
            url: "/test/kakao",
          } , 
          {
            title: "api 모니터링",
            url: "/test/api-monitor",
          } ,
          {
            title: "문자 메시지 발송",
            url: "/test/sms",
          }
        ],
      }
    ]
  }
}

function getBrokerData(user?: any) {
  return {
    user: {
      name: user?.name || "",
      email: user?.email || "",
      avatar: null,
    },
    
    navBroker: [
      {
        title: "실시간 화물 현황 ver01",
        url: "/broker/order-ver01/list",
        icon: Loader,
      },
      {
        title: "오더 등록",
        url: "/broker/order-ver01/register",
        icon: PackagePlus,
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
        title: "매출 정산-ver01",
        url: "/broker/sale",
        icon: BanknoteArrowUp,
        items: [
          {
            title: "정산 목록",
            url: "/broker/sale",
          },
          {
            title: "정산 대기 화물",
            url: "/broker/sale/waiting",
          }
        ],
      },

      {
        title: "매입 정산-ver01",
        url: "/broker/purchase",
        icon: BanknoteArrowDown,
        items: [
          {
            title: "정산 목록",
            url: "/broker/purchase",
          },
          {
            title: "정산 대기 화물",
            url: "/broker/purchase/waiting",
          }
        ],
      },
    ], 

    navTest: [
      {
        title: "테스트",
        url: "#",
        icon: LifeBuoy,
        items: [
          {
            title: "엑셀 기능",
            url: "/test/excel",
          } ,
          {
            title: "카카오",
            url: "/test/kakao",
          } , 
          {
            title: "api 모니터링",
            url: "/test/api-monitor",
          } ,
          {
            title: "문자 메시지 발송",
            url: "/test/sms",
          },
          {
            title: "오더 등록 ver02",
            url: "/broker/order-ver02/register",
          }
        ],
      }
    ]
  }
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // 클라이언트 상태로 사용자 정보 관리
  const { user, loggedIn } = useAuthStore()
  const [isClient, setIsClient] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)

  // Hydration 완료 후 클라이언트 상태로 전환
  React.useEffect(() => {
    setIsClient(true)
    // 짧은 지연 후 로딩 완료 (상태 동기화를 위한 시간)
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 100)
    
    return () => clearTimeout(timer)
  }, [])

  // 서버사이드 렌더링 중에는 기본 UI 표시
  if (!isClient) {
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
                    <span className="truncate font-medium">로딩 중...</span>
                    <span className="truncate text-xs">시스템</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          {/* 로딩 중에는 빈 컨텐츠 */}
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={{ name: "", email: "", avatar: null }} />
        </SidebarFooter>
      </Sidebar>
    )
  }

  // 클라이언트에서 로딩 중일 때
  if (isLoading) {
    return (
      <Sidebar variant="inset" {...props}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <Link href="/">
                  <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                    <Loader2 className="size-4 animate-spin" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">초기화 중...</span>
                    <span className="truncate text-xs">시스템</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          {/* 로딩 중에는 빈 컨텐츠 */}
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={{ name: "", email: "", avatar: null }} />
        </SidebarFooter>
      </Sidebar>
    )
  }

  console.log("user", user);
  const sidebarData = getSidebarDataByUser(user);
  console.log("sidebarData", sidebarData);

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
                  <span className="truncate font-medium">{user?.companyName || "시스템"}</span>
                  {user?.companyType === "broker" && <span className="truncate text-xs">주선사</span>}
                  {user?.companyType === "shipper" && <span className="truncate text-xs">화주</span>}
                  {!user?.companyType && <span className="truncate text-xs">시스템</span>}
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* 회사 타입에 따라 동적으로 메뉴 분기 */}
        {sidebarData.navMain.length > 0 && <NavMain items={sidebarData.navMain} />}
        {sidebarData.navBroker.length > 0 && <NavBroker items={sidebarData.navBroker} />}
        {sidebarData.navTest.length > 0 && <NavTest items={sidebarData.navTest} />}
        
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarData.user} />
      </SidebarFooter>
    </Sidebar>
  )
}