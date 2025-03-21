"use client";

import React, { useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart4, 
  Calendar, 
  DollarSign, 
  FileText, 
  Loader2,
  Package, 
  PlusCircle,
  TrendingUp 
} from "lucide-react";
import { useIncomeStore } from "@/store/income-store";
import { useIncomeWaitingStore } from "@/store/income-waiting-store";
import { IncomeList } from "@/components/broker/income/income-list";
import { IncomeDetailSheet } from "@/components/broker/income/income-detail-sheet";
import { IncomeFormSheet } from "@/components/broker/income/income-form-sheet";
import { IncomeFilter } from "@/components/broker/income/income-filter";
import { IncomeStatusType } from "@/types/income";
import { formatCurrency } from "@/lib/utils";
import { IncomeWaitingTable } from "@/components/broker/income/income-waiting-table";
import { IncomeWaitingSearch } from "@/components/broker/income/income-waiting-search";
import { IncomeWaitingSummary } from "@/components/broker/income/income-waiting-summary";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function IncomePage() {
  // 정산 데이터 스토어 접근
  const {
    incomes,
    currentPage,
    totalPages,
    totalItems,
    isLoading,
    error,
    filter,
    setFilter,
    fetchIncomes,
    setPage,
    updateIncomeStatus,
    resetFilter
  } = useIncomeStore();
  
  // 정산 대기 화물 스토어 접근
  const {
    filter: waitingFilter,
    filterOptions,
    currentPage: waitingCurrentPage,
    totalPages: waitingTotalPages,
    isLoading: waitingIsLoading,
    selectedOrderIds,
    fetchWaitingOrders,
    getOrdersByPage,
    setFilter: setWaitingFilter,
    setCurrentPage: setWaitingPage,
    selectOrder,
    selectAllOrders,
    createIncome,
    getSelectedOrders,
  } = useIncomeWaitingStore();

  // 초기 데이터 로드
  useEffect(() => {
    console.log('useEffect 실행됨 - 정산 데이터 로드');
    const loadData = async () => {
      try {
        await fetchIncomes(currentPage);
        console.log('정산 데이터 로드 완료');
      } catch (error) {
        console.error('정산 데이터 로드 중 오류 발생:', error);
      }
    };
    
    loadData();
  }, [currentPage, 
      filter.status, 
      filter.startDate, 
      filter.endDate, 
      filter.searchTerm, 
      filter.shipperName, 
      filter.invoiceStatus, 
      filter.manager]);
      
  // 정산 대기 화물 데이터 로드
  useEffect(() => {
    console.log('useEffect 실행됨 - 정산 대기 화물 데이터 로드');
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
  const handleStatusChange = (incomeId: string, newStatus: IncomeStatusType) => {
    updateIncomeStatus(incomeId, newStatus);
  };

  // 세금계산서 발행 처리
  const handleIssueInvoice = (incomeId: string) => {
    console.log("세금계산서 발행:", incomeId);
    // 실제 구현은 백엔드 연동 시 추가
  };

  // 엑셀 내보내기
  const handleExportExcel = (incomeId: string) => {
    console.log("엑셀 내보내기:", incomeId);
    // 실제 구현은 백엔드 연동 시 추가
  };
  
  // 필터 변경 처리
  const handleFilterChange = (newFilter: Partial<typeof filter>) => {
    setFilter(newFilter);
  };
  
  // 상태별 탭 처리
  const handleTabChange = (value: string) => {
    if (value === "WAITING" || value === "MATCHING" || value === "COMPLETED") {
      setFilter({ status: value as IncomeStatusType });
    }
  };
  
  // 현재 페이지의 정산 대기 화물 목록
  const currentWaitingOrders = getOrdersByPage(waitingCurrentPage);
  
  // 요약 정보 계산 - useMemo로 캐싱하여 무한 루프 방지
  const incomeData = useIncomeStore(state => state.incomes);
  const summary = useMemo(() => {
    return incomeData.reduce(
      (acc, income) => {
        acc.totalAmount += income.finalAmount;
        acc.totalCount += 1;
        acc.totalOrderCount += income.orderCount;
        return acc;
      },
      { totalAmount: 0, totalCount: 0, totalOrderCount: 0 }
    );
  }, [incomeData]);

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
                <BreadcrumbPage>매출 정산 관리</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      
      <main className="flex flex-1 flex-col p-4 pt-0">
        {/* 요약 카드 영역 */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">전체 정산 수</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalItems}건</div>
              <p className="text-xs text-muted-foreground">
                {filter.status ? `${filter.status} 상태` : "모든 상태 포함"}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">화물 건수</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalOrderCount}건</div>
              <p className="text-xs text-muted-foreground">
                정산별 평균 {summary.totalCount > 0 ? (summary.totalOrderCount / summary.totalCount).toFixed(1) : 0}건
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 정산 금액</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(summary.totalAmount)}원
              </div>
              <p className="text-xs text-muted-foreground">
                정산별 평균 {summary.totalCount > 0 ? formatCurrency(summary.totalAmount / summary.totalCount) : 0}원
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">정산 기간</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filter.startDate ? filter.startDate : "전체"}
              </div>
              <p className="text-xs text-muted-foreground">
                {filter.endDate ? `~ ${filter.endDate}` : "기간 제한 없음"}
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* 상태별 탭 영역 */}
        <Tabs 
          defaultValue="WAITING" 
          value={filter.status || "WAITING"}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 md:w-auto">
            <TabsTrigger value="WAITING">정산대기</TabsTrigger>
            <TabsTrigger value="MATCHING">정산대사</TabsTrigger>
            <TabsTrigger value="COMPLETED">정산완료</TabsTrigger>
          </TabsList>
          
          {/* 필터 영역 */}
          {filter.status !== "WAITING" && (
            <IncomeFilter 
              onFilterChange={handleFilterChange} 
              onResetFilter={resetFilter}
            />
          )}
          
          {/* 정산 대기 탭 */}
          <TabsContent value="WAITING" className="mt-6">
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">정산 대기 화물</h2>
                  <p className="text-sm text-muted-foreground">
                    운송 마감된 화물 중 정산 대기 상태인 화물을 선택하여 정산을 진행할 수 있습니다.
                  </p>
                </div>
                <Button
                  onClick={createIncome}
                  disabled={selectedOrderIds.length === 0}
                  className="gap-1"
                >
                  <PlusCircle className="h-4 w-4" />
                  선택한 화물 정산하기 ({selectedOrderIds.length})
                </Button>
              </div>
              
              {/* 검색 필터 */}
              <IncomeWaitingSearch
                filter={waitingFilter}
                setFilter={setWaitingFilter}
                filterOptions={filterOptions}
              />
              
              {/* 로딩 상태 */}
              {waitingIsLoading ? (
                <div className="flex h-[300px] items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
                </div>
              ) : (
                <IncomeWaitingTable
                  orders={currentWaitingOrders}
                  currentPage={waitingCurrentPage}
                  totalPages={waitingTotalPages}
                  onPageChange={handleWaitingPageChange}
                  selectedOrders={selectedOrderIds}
                  onOrderSelect={selectOrder}
                  onSelectAll={selectAllOrders}
                />
              )}
              
              {/* 선택된 화물 요약 정보 */}
              {selectedOrderIds.length > 0 && (
                <IncomeWaitingSummary
                  selectedOrders={getSelectedOrders()}
                  onCreateIncome={createIncome}
                />
              )}
            </div>
          </TabsContent>
          
          {/* 정산 대사 탭 */}
          <TabsContent value="MATCHING" className="mt-6">
            {isLoading ? (
              <div className="flex h-24 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
              </div>
            ) : incomes.length === 0 ? (
              <div className="flex h-24 items-center justify-center flex-col">
                <p className="text-muted-foreground mb-2">정산 데이터가 없습니다</p>
                <Button variant="outline" onClick={resetFilter}>
                  필터 초기화
                </Button>
              </div>
            ) : (
              <IncomeList
                incomes={incomes}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                onStatusChange={handleStatusChange}
                onIssueInvoice={handleIssueInvoice}
                onExportExcel={handleExportExcel}
              />
            )}
          </TabsContent>
          
          {/* 정산 완료 탭 */}
          <TabsContent value="COMPLETED" className="mt-6">
            {isLoading ? (
              <div className="flex h-24 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
              </div>
            ) : incomes.length === 0 ? (
              <div className="flex h-24 items-center justify-center flex-col">
                <p className="text-muted-foreground mb-2">정산 완료된 데이터가 없습니다</p>
                <Button variant="outline" onClick={resetFilter}>
                  필터 초기화
                </Button>
              </div>
            ) : (
              <IncomeList
                incomes={incomes}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                onStatusChange={handleStatusChange}
                onIssueInvoice={handleIssueInvoice}
                onExportExcel={handleExportExcel}
              />
            )}
          </TabsContent>
        </Tabs>
        
        {/* 정산 상세 정보 시트 */}
        <IncomeDetailSheet />
        
        {/* 정산 폼 시트 */}
        <IncomeFormSheet />
      </main>
    </>
  );
} 