"use client";

import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList,
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";
import { Home, Truck, Info, Grid3x3, ListFilter, Menu, BarChart2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useBrokerDriverStore } from "@/store/broker-driver-store";
import { TONNAGE_TYPES, getBrokerDriversByPage } from "@/utils/mockdata/mock-broker-drivers";
import { BrokerDriverSearch } from "@/components/broker/driver/broker-driver-search";
import { BrokerDriverTable } from "@/components/broker/driver/broker-driver-table";
import { BrokerDriverCardGrid } from "@/components/broker/driver/broker-driver-card";
import { BrokerDriverPagination } from "@/components/broker/driver/broker-driver-pagination";
import { BrokerDriverActionButtons } from "@/components/broker/driver/broker-driver-action-buttons";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { IBrokerDriver, TonnageType } from "@/types/broker-driver";
import { toast } from "sonner";
import { ToggleGroup } from "@/components/ui/toggle-group";
import { ToggleGroupItem } from "@/components/ui/toggle-group";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// 결과 타입 정의
interface DriverQueryResult {
  data: IBrokerDriver[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 톤수별 통계 인터페이스
interface TonnageStatItem {
  type: string;
  count: number;
  label: string;
  color: string;
  percentage: number;
}

export default function BrokerDriverPage() {
  // 마지막 새로고침 시간
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // Zustand 스토어에서 상태 및 액션 가져오기
  const {
    viewMode = 'table', // 기본값 설정
    setViewMode,
    filter,
    currentPage,
    pageSize,
    setCurrentPage,
    setPageSize,
    selectedDriverIds,
    clearSelectedDriverIds,
  } = useBrokerDriverStore();

  // 선택된 차주 상태 관리
  const [selectedDriver, setSelectedDriver] = useState<IBrokerDriver | null>(null);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);

  // 상태 통계 탭
  const [statsTab, setStatsTab] = useState<string>("all");

  // 탭 변경 시 필터 적용
  const handleTabChange = (tab: string) => {
    setStatsTab(tab);
    
    // 스토어에 필터 적용
    if (tab === "active") {
      useBrokerDriverStore.getState().setFilter({
        status: "활성"
      });
    } else if (tab === "inactive") {
      useBrokerDriverStore.getState().setFilter({
        status: "비활성"
      });
    } else {
      // "all"인 경우 상태 필터 제거
      useBrokerDriverStore.getState().setFilter({
        status: ""
      });
    }
    
    // 페이지 초기화
    setCurrentPage(1);
  };

  // 차주 목록 데이터 조회
  const { data, isLoading, isError, refetch } = useQuery<DriverQueryResult>({
    queryKey: ["brokerDrivers", filter, currentPage, pageSize, lastRefreshed],
    queryFn: () => getBrokerDriversByPage(currentPage, pageSize, filter),
    staleTime: 1000 * 60 * 5, // 5분
  });

  // 디버깅을 위한 로그 추가
  useEffect(() => {
    console.log('Filter in BrokerDriverPage:', filter);
  }, [filter]);

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 페이지 크기 변경 핸들러
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
  };

  // 수동 새로고침 핸들러
  const handleManualRefresh = () => {
    setLastRefreshed(new Date());
    refetch();
    toast.success('차주 목록이 새로고침되었습니다.');
  };

  // 차주 클릭 핸들러
  const handleDriverClick = (driver: IBrokerDriver) => {
    setSelectedDriver(driver);
    setIsEditSheetOpen(true);
  };

  // 차주 수정 완료 핸들러
  const handleUpdateSuccess = () => {
    setLastRefreshed(new Date());
    refetch();
    setIsEditSheetOpen(false);
    toast.success('차주 정보가 업데이트되었습니다.');
  };

  // 엑셀 다운로드 핸들러
  const handleExportExcel = () => {
    toast.success(`${selectedDriverIds.length > 0 ? selectedDriverIds.length + '명의 차주가' : '모든 차주가'} 엑셀로 다운로드되었습니다.`);
  };

  // 차주 등록 핸들러
  const handleRegisterDriver = () => {
    toast.info('차주 등록 기능은 아직 개발 중입니다.');
  };

  // 다중 차주 등록 핸들러
  const handleRegisterMultipleDrivers = () => {
    toast.info('다중 차주 등록 기능은 아직 개발 중입니다.');
  };

  // 뷰 모드 변경 핸들러
  const handleViewModeChange = (value: string) => {
    if (value === "table" || value === "card") {
      setViewMode(value);
    }
  };

  // 메뉴 버튼 클릭 핸들러
  const handleMenuClick = () => {
    // 사이드바를 직접 컨트롤할 수 없으므로 대안으로 메시지 표시
    toast.info('메뉴 버튼이 클릭되었습니다.');
    // 나중에 사이드바 상태를 전역 상태로 관리하면 여기서 토글할 수 있습니다
  };

  // 톤수별 통계 계산
  const calculateTonnageStats = (): TonnageStatItem[] => {
    if (!data?.data || data.data.length === 0) return [];
    
    const allDrivers = data.data;
    const total = allDrivers.length;
    
    const tonnageCount: Record<string, number> = {};
    
    // 각 톤수별 카운트
    TONNAGE_TYPES.forEach((type) => {
      tonnageCount[type] = allDrivers.filter(d => d.tonnage === type).length;
    });
    
    // 색상 맵핑
    const getColorByIndex = (index: number): string => {
      const colors = [
        "bg-blue-100 text-blue-800",
        "bg-green-100 text-green-800",
        "bg-purple-100 text-purple-800",
        "bg-orange-100 text-orange-800",
        "bg-teal-100 text-teal-800",
        "bg-rose-100 text-rose-800",
        "bg-amber-100 text-amber-800",
        "bg-indigo-100 text-indigo-800",
        "bg-emerald-100 text-emerald-800",
        "bg-sky-100 text-sky-800",
      ];
      return colors[index % colors.length];
    };
    
    // 결과 생성
    return TONNAGE_TYPES.map((type, index) => ({
      type,
      count: tonnageCount[type],
      label: `${type} (${tonnageCount[type]}명)`,
      color: getColorByIndex(index),
      percentage: Math.round((tonnageCount[type] / total) * 100) || 0
    })).filter(item => item.count > 0);
  };
  
  // 활성/비활성 차주 통계 계산
  const calculateStatusStats = () => {
    if (!data?.data || data.data.length === 0) 
      return { active: 0, inactive: 0, total: 0, activePercentage: 0, inactivePercentage: 0 };
    
    const allDrivers = data.data;
    const total = allDrivers.length;
    const active = allDrivers.filter(d => d.isActive).length;
    const inactive = total - active;
    
    return {
      active,
      inactive,
      total,
      activePercentage: Math.round((active / total) * 100) || 0,
      inactivePercentage: Math.round((inactive / total) * 100) || 0
    };
  };

  // 톤수 필터 적용 핸들러
  const handleTonnageFilter = (tonnage: TonnageType) => {
    useBrokerDriverStore.getState().setFilter({
      tonnage: tonnage
    });
    
    // 페이지 초기화
    setCurrentPage(1);
    
    toast.success(`'${tonnage}' 차량 목록을 조회합니다.`);
  };

  // 데이터 및 페이지네이션 정보 가져오기
  const totalItems = data?.total || 0;
  const totalPages = data?.totalPages || 0;
  const currentPageData = data?.page || currentPage;
  const currentPageSize = data?.pageSize || pageSize;
  const driversList = data?.data || [];
  const hasDrivers = driversList.length > 0;
  
  // 통계 데이터
  const tonnageStats = calculateTonnageStats();
  const statusStats = calculateStatusStats();

  return (
    <>
    <header className="flex h-16 shrink-0 items-center gap-2">
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
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/broker">                  
                  주선
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />              
              <BreadcrumbItem>
                <BreadcrumbPage>차주 관리</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="ml-auto flex items-center gap-2 px-4">
          <BrokerDriverActionButtons
            isLoading={isLoading}
            onRefresh={handleManualRefresh}
            onExportExcel={handleExportExcel}
            onRegisterDriver={handleRegisterDriver}
            onRegisterMultipleDrivers={handleRegisterMultipleDrivers}
            disabledExportExcel={!data || totalItems === 0}
          />
        </div>
      </header>
      <main className="flex flex-1 flex-col p-4 pt-0">
        <Card>
          {/* 검색 및 필터 */}          
          <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>차주 목록</CardTitle>
                <CardDescription className="hidden md:block">
                  {isLoading
                    ? "차주 목록을 불러오는 중..."
                    : totalItems > 0
                    ? `총 ${totalItems}명의 차주가 있습니다.`
                    : "등록된 차주가 없습니다."}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
              
              </div>
              <ToggleGroup
                type="single"
                value={viewMode}
                onValueChange={handleViewModeChange}
                size="sm"
              >
                <ToggleGroupItem value="table" aria-label="테이블 보기">
                  <ListFilter className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="card" aria-label="카드 보기">
                  <Grid3x3 className="h-4 w-4" />
                </ToggleGroupItem>
              </ToggleGroup>            
          </CardHeader>

          <CardContent>
            {/* 통계 카드 */}
            {!isLoading && !isError && hasDrivers && (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 mb-4">
                {/* 활성/비활성 통계 */}
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">차주 상태</CardTitle>
                      <BarChart2 className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <CardDescription>활성 및 비활성 차주 비율</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="relative pt-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="text-xs font-semibold inline-block py-1 px-2 rounded-full bg-green-100 text-green-800">
                            활성: {statusStats.active}명 ({statusStats.activePercentage}%)
                          </span>
                        </div>
                        <div>
                          <span className="text-xs font-semibold inline-block py-1 px-2 rounded-full bg-red-100 text-red-800">
                            비활성: {statusStats.inactive}명 ({statusStats.inactivePercentage}%)
                          </span>
                        </div>
                      </div>
                      <div className="flex h-2 mb-4 overflow-hidden rounded-full bg-gray-200">
                        <div 
                          style={{ width: `${statusStats.activePercentage}%` }} 
                          className="bg-green-500 transition-all duration-300"
                        ></div>
                        <div 
                          style={{ width: `${statusStats.inactivePercentage}%` }} 
                          className="bg-red-500 transition-all duration-300"
                        ></div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <div className="flex justify-center gap-2 w-full">
                      <Button 
                        variant={statsTab === "all" ? "default" : "outline"} 
                        size="sm"
                        onClick={() => handleTabChange("all")}
                        className="flex-1"
                      >
                        전체 ({statusStats.total}명)
                      </Button>
                      <Button 
                        variant={statsTab === "active" ? "default" : "outline"} 
                        size="sm"
                        onClick={() => handleTabChange("active")}
                        className="flex-1 bg-green-100 text-green-800 hover:bg-green-200 hover:text-green-900"
                      >
                        활성 ({statusStats.active}명)
                      </Button>
                      <Button 
                        variant={statsTab === "inactive" ? "default" : "outline"} 
                        size="sm"
                        onClick={() => handleTabChange("inactive")}
                        className="flex-1 bg-red-100 text-red-800 hover:bg-red-200 hover:text-red-900"
                      >
                        비활성 ({statusStats.inactive}명)
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
                
                {/* 톤수별 통계 */}
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">톤수별 차주 분포</CardTitle>
                      <Truck className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <CardDescription>차량 톤수별 차주 분포</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3">
                      {tonnageStats.map((stat) => (
                        <div 
                          key={stat.type} 
                          className={cn(
                            "relative flex flex-col items-center justify-center p-2 rounded-md text-center cursor-pointer hover:opacity-80 transition-opacity",
                            stat.color
                          )}
                          onClick={() => handleTonnageFilter(stat.type as TonnageType)}
                        >
                          <span className="font-semibold">{stat.type}</span>
                          <span className="text-xs">{stat.count}명</span>
                          <span className="text-xs">({stat.percentage}%)</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* 검색 및 필터 */}
            {/* <div className="flex flex-col md:flex-row items-center justify-between">
              <BrokerDriverSearch />
            </div> */}
            <BrokerDriverSearch />

            {/* 차주 목록 */}
            <div className="py-0 sm:px-0 lg:px-0">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Truck className="mx-auto h-10 w-10 text-muted-foreground animate-pulse" />
                    <h3 className="mt-4 text-lg font-medium">차주 목록을 불러오는 중...</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      잠시만 기다려주세요.
                    </p>
                  </div>
                </div>
              ) : isError ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Info className="mx-auto h-10 w-10 text-destructive" />
                    <h3 className="mt-4 text-lg font-medium">데이터를 불러오는 중 오류가 발생했습니다.</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      새로고침을 시도하거나 관리자에게 문의하세요.
                    </p>
                    <button
                      onClick={() => refetch()}
                      className="mt-4 inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
                    >
                      다시 시도
                    </button>
                  </div>
                </div>
              ) : !hasDrivers ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Truck className="mx-auto h-10 w-10 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">등록된 차주가 없습니다.</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      새로운 차주를 등록하거나 검색 조건을 변경해보세요.
                    </p>
                    <button
                      onClick={handleRegisterDriver}
                      className="mt-4 inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
                    >
                      차주 등록
                    </button>
                  </div>
                </div>
              ) : viewMode === "table" ? (
                <BrokerDriverTable
                  drivers={driversList}
                  onDriverClick={handleDriverClick}
                />
              ) : (
                <BrokerDriverCardGrid
                  drivers={driversList}
                  onDriverClick={handleDriverClick}
                />
              )}
            </div>

            {/* 페이지네이션 */}
            {!isLoading && !isError && hasDrivers && (
              <div className="px-4 sm:px-6 lg:px-8">
                <BrokerDriverPagination
                  currentPage={currentPageData}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  pageSize={currentPageSize}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                />
              </div>
            )}

          </CardContent>

          
          
        </Card>

        {/* 차주 수정 시트 (추후 구현) */}
        {/* <BrokerDriverEditSheet
          driver={selectedDriver}
          open={isEditSheetOpen}
          onOpenChange={setIsEditSheetOpen}
          onSuccess={handleUpdateSuccess}
        /> */}
      </main>
    </>
  );
} 