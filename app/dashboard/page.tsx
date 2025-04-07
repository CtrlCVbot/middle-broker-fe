"use client";

import { useEffect } from "react";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { DashboardStatus } from "@/components/dashboard/dashboard-status";
import { DashboardLog } from "@/components/dashboard/dashboard-log";
import { DashboardTrends } from "@/components/dashboard/dashboard-trends";
import { DashboardGeo } from "@/components/dashboard/dashboard-geo";
import { DashboardWeight } from "@/components/dashboard/dashboard-weight";
import { DashboardTable } from "@/components/dashboard/dashboard-table";
import { useDashboardStore } from "@/store/dashboard-store";
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList,
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";


export default function DashboardPage() {
  const { initDashboard } = useDashboardStore();
  
  // 대시보드 데이터 초기화
  useEffect(() => {
    initDashboard();
  }, [initDashboard]);
  
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 px-4">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/">                  
                  홈
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />              
              <BreadcrumbItem>
                <BreadcrumbPage>대시보드</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      
      <main className="flex flex-1 flex-col p-4 pt-0">
        <div className="container mx-auto">
          <div className="space-y-6">
            {/* KPI 카드 */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <DashboardOverview />
              </div>
              <div className="lg:col-span-1">
                <DashboardStatus />
              </div>
              <div className="lg:col-span-1">
                <DashboardLog />
              </div>
            </section>
            
            {/* 운송 상태 및 트렌드 */}            
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <DashboardWeight />
              </div>
              <div className="lg:col-span-2">
                <DashboardTrends />
              </div>
              
            </section>
            
            {/* 운송 지역별, 중량별 통계 및 로그 */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="lg:col-span-1">
                <DashboardGeo />
              </div>
              <div className="lg:col-span-2">
              <DashboardTable />
              </div>
             
            </section>
            
            
          </div>
        </div>
      </main>
    </>
  );
} 