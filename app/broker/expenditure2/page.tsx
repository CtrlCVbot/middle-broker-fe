"use client";

import React, { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2,
} from "lucide-react";
import { useExpenditureStore } from "@/store/expenditure-store";
import { useExpenditureWaitingStore } from "@/store/expenditure-waiting-store";
import { ExpenditureList } from "@/components/broker/expenditure2/expenditure-list";
import { ExpenditureDetailSheet } from "@/components/broker/expenditure2/expenditure-detail-sheet";
import { ExpenditureFormSheet } from "@/components/broker/expenditure2/expenditure-form-sheet";
import { ExpenditureFilter } from "@/components/broker/expenditure2/expenditure-filter";
import { ExpenditureStatusType } from "@/types/expenditure";

import { ExpenditureWaitingTable } from "@/components/broker/expenditure2/expenditure-waiting-table";
import { ExpenditureWaitingSearch } from "@/components/broker/expenditure2/expenditure-waiting-search";
import ExpenditureWaitingSummary from "@/components/broker/expenditure2/expenditure-waiting-summary";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function ExpenditurePage() {
  const {
    expenditures,
    currentPage,
    totalPages,
    //totalItems,
    isLoading,
    // error,
    filter,
    fetchExpenditures,
    setFilter,
    resetFilter,
    setPage,
    updateExpenditureStatus
  } = useExpenditureStore();

  const {
    //waitingOrders,
    selectedOrderIds,
    filter: waitingFilter,
    filterOptions,
    currentPage: waitingCurrentPage,
    totalPages: waitingTotalPages,
    isLoading: waitingIsLoading,
    fetchWaitingOrders,
    getOrdersByPage,
    setFilter: setWaitingFilter,
    setCurrentPage: setWaitingPage,
    selectOrder,
    selectAllOrders,
    createExpenditure,
    getSelectedOrders
  } = useExpenditureWaitingStore();

  useEffect(() => {
    console.log('초기 데이터 로딩 시작');
    fetchExpenditures(1);
  }, [fetchExpenditures]);

  useEffect(() => {
    console.log('정산 대기 데이터 로딩 시작');
    fetchWaitingOrders();
  }, [fetchWaitingOrders]);

  // 페이지 변경 처리
  const handlePageChange = (page: number) => {
    setPage(page);
  };
  
  // 정산 대기 화물 페이지 변경 처리
  const handleWaitingPageChange = (page: number) => {
    setWaitingPage(page);
  };

  // 정산 상태 변경 처리
  const handleStatusChange = (ExpenditureId: string, newStatus: ExpenditureStatusType) => {
    updateExpenditureStatus(ExpenditureId, newStatus);
  };

  // 세금계산서 발행 처리
  const handleIssueInvoice = (ExpenditureId: string) => {
    console.log("세금계산서 발행:", ExpenditureId);
    // 실제 구현은 백엔드 연동 시 추가
  };

  // 엑셀 내보내기
  const handleExportExcel = (ExpenditureId: string) => {
    console.log("엑셀 내보내기:", ExpenditureId);
    // 실제 구현은 백엔드 연동 시 추가
  };
  
  // 필터 변경 처리
  const handleFilterChange = (newFilter: Partial<typeof filter>) => {
    setFilter(newFilter);
  };
  
  // 상태별 탭 처리
  const handleTabChange = (value: string) => {
    if (value === "pending" || value === "approved" || value === "rejected") {
      setFilter({ status: value as ExpenditureStatusType });
    }
  };
  
  // 현재 페이지의 정산 대기 화물 목록
  const currentWaitingOrders = getOrdersByPage(waitingCurrentPage);
  
  // 요약 정보 계산 - useMemo로 캐싱하여 무한 루프 방지
  // const summary = useMemo(() => {
  //   if (!expenditures || expenditures.length === 0) {
  //     return { totalAmount: 0, totalCount: 0, totalOrderCount: 0 };
  //   }
    
  //   return expenditures.reduce(
  //     (acc, expenditure) => ({
  //       totalAmount: acc.totalAmount + expenditure.finalAmount,
  //       totalCount: acc.totalCount + 1,
  //       totalOrderCount: acc.totalOrderCount + expenditure.orderCount
  //     }),
  //     { totalAmount: 0, totalCount: 0, totalOrderCount: 0 }
  //   );
  // }, [expenditures]);

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
                <BreadcrumbPage>매입 정산 관리</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      
      <main className="flex flex-1 flex-col p-4 pt-0">
        
        {/* 상태별 탭 영역 */}
        <Tabs 
          defaultValue="pending" 
          value={filter.status || "pending"}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 md:w-auto">
            <TabsTrigger value="pending">정산대기</TabsTrigger>
            <TabsTrigger value="approved">정산완료</TabsTrigger>
            <TabsTrigger value="rejected">정산거절</TabsTrigger>
          </TabsList>
                    
          
          {/* 정산 대기 탭 */}
          <TabsContent value="pending" className="mt-6">
            <div className="flex flex-col space-y-4 relative">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">정산 대기 화물</h2>
                  <p className="text-sm text-muted-foreground">
                    운송 마감된 화물 중 정산 대기 상태인 화물을 선택하여 정산을 진행할 수 있습니다.
                  </p>
                </div>
                
              </div>
              
              {/* 검색 필터 */}
              <ExpenditureWaitingSearch
                filter={waitingFilter}
                setFilter={setWaitingFilter}
                filterOptions={filterOptions}
              />
              
              {/* 로딩 상태 또는 화물 테이블 */}
              <div className="min-h-[300px]">
                {waitingIsLoading ? (
                  <div className="flex h-[300px] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
                  </div>
                ) : (
                  <ExpenditureWaitingTable
                    orders={currentWaitingOrders}
                    currentPage={waitingCurrentPage}
                    totalPages={waitingTotalPages}
                    onPageChange={handleWaitingPageChange}
                    selectedOrders={selectedOrderIds}
                    onOrderSelect={selectOrder}
                    onSelectAll={selectAllOrders}
                  />
                )}
              </div>
              
              {/* 선택된 화물 요약 정보 */}
              {selectedOrderIds.length > 0 && (
                <ExpenditureWaitingSummary
                  selectedOrders={getSelectedOrders()}
                  onCreateExpenditure={createExpenditure}
                />
              )}
            </div>
          </TabsContent>
          
          {/* 정산 대사 탭 */}
          <TabsContent value="approved" className="mt-6">
            {isLoading ? (
              <div className="flex h-24 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
              </div>
            ) : expenditures.length === 0 ? (
              <div className="flex h-24 items-center justify-center flex-col">
                <p className="text-muted-foreground mb-2">정산 데이터가 없습니다</p>
                <Button variant="outline" onClick={resetFilter}>
                  필터 초기화
                </Button>
              </div>
            ) : (
              <>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-xl font-semibold">정산 대사 화물</h2>
                  <p className="text-sm text-muted-foreground">
                    정산 대사중인 목록을 선택하여 정산을 진행할 수 있습니다.
                  </p>
                </div>                
              </div>
              <ExpenditureFilter 
                onFilterChange={handleFilterChange}
                onResetFilter={resetFilter}
                tabStatus="processing"
              />
              <ExpenditureList
                expenditures={expenditures}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                onStatusChange={handleStatusChange}
                onIssueInvoice={handleIssueInvoice}
                onExportExcel={handleExportExcel}
                currentTab="processing"
              />
              </>
            )}
          </TabsContent>
          
          {/* 정산 완료 탭 */}
          <TabsContent value="rejected" className="mt-6">
            {isLoading ? (
              <div className="flex h-24 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
              </div>
            ) : expenditures.length === 0 ? (
              <div className="flex h-24 items-center justify-center flex-col">
                <p className="text-muted-foreground mb-2">정산 완료된 데이터가 없습니다</p>
                <Button variant="outline" onClick={resetFilter}>
                  필터 초기화
                </Button>
              </div>
            ) : (
              <>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-xl font-semibold">정산 완료 화물</h2>
                  <p className="text-sm text-muted-foreground">
                    정산 완료된 목록을 선택하여 정산을 진행할 수 있습니다.
                  </p>
                </div>
              </div>
              <ExpenditureFilter 
                onFilterChange={handleFilterChange}
                onResetFilter={resetFilter}
                tabStatus="completed"
              />
              <ExpenditureList
                expenditures={expenditures}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                onStatusChange={handleStatusChange}
                onIssueInvoice={handleIssueInvoice}
                onExportExcel={handleExportExcel}
                currentTab="completed"
              />
              </>
            )}
          </TabsContent>
        </Tabs>
        
        {/* 정산 상세 정보 시트 */}
        <ExpenditureDetailSheet />
        
        {/* 정산 폼 시트 */}
        <ExpenditureFormSheet />
      </main>
    </>
  );
} 