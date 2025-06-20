"use client";

import React, { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2,
  ListFilter,
  Grid3x3
} from "lucide-react";
import { useIncomeStore } from "@/store/income-store";
import { useIncomeWaitingStore } from "@/store/income-waiting-store";
import { useBrokerChargeStore } from "@/store/broker-charge-store";

import { SettlementBundleDetailSheet } from "@/components/broker/sale/settlement-bundle-detail-sheet";

import { IncomeStatusType } from "@/types/income";

import { WaitingTable } from "@/components/broker/sale/settlement-waiting-table";
import { WaitingSearch } from "@/components/broker/sale/settlement-waiting-search";

import WaitingSummary from "@/components/broker/sale/settlement-waiting-summary";

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleGroupItem } from "@/components/ui/toggle-group";
import { ToggleGroup } from "@/components/ui/toggle-group";
import { BundleMatchingFilter } from "@/components/broker/sale/settlement-bundle-matching-filter";
import { BundleMatchingList } from "@/components/broker/sale/settlement-bundle-matching-list";
import { SettlementEditFormSheet } from "@/components/broker/sale/settlement-edit-form-sheet";
export default function IncomePage() {
  // 정산 데이터 스토어 접근
  const {
    incomes,
    currentPage,
    totalPages,
    isLoading,
    filter,
    setFilter,
    fetchIncomes,
    setPage,
    updateIncomeStatus,
    resetFilter
  } = useIncomeStore();
  
  // 정산 대기 화물 스토어 접근 (기존)
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

  // broker-charge-store 사용 (새로운 구현)
  const {
    waitingItems,
    selectedWaitingItemIds,
    waitingItemsTotal,
    waitingItemsPage,
    waitingItemsPageSize,
    waitingItemsTotalPages,
    waitingItemsIsLoading,
    waitingItemsFilter,
    settlementSummary,
    fetchWaitingItems,
    selectWaitingItem,
    selectAllWaitingItems,
    updateWaitingItemsPage,
    updateWaitingItemsFilter,
    calculateSettlementSummary,
    createOrderSaleFromWaitingItems,
    openSettlementForm,
    // sales bundles 관련 추가
    salesBundlesAsIncomes,
    salesBundlesTotal,
    salesBundlesPage,
    salesBundlesTotalPages,
    salesBundlesIsLoading,
    salesBundlesFilter,
    fetchSalesBundles,
    updateSalesBundlesPage,
    updateSalesBundlesFilter,
    resetSalesBundlesFilter
  } = useBrokerChargeStore();

  console.log('waitingItems:', waitingItems);

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
      filter.manager,
      fetchIncomes]);
      
  // 정산 대기 화물 데이터 로드 (기존)
  useEffect(() => {
    console.log('useEffect 실행됨 - 정산 대기 화물 데이터 로드');
    fetchWaitingOrders();
  }, [fetchWaitingOrders]);

  // 정산 대기 화물 데이터 로드 (새로운 구현)
  useEffect(() => {
    console.log('useEffect 실행됨 - 새로운 정산 대기 화물 데이터 로드');
    fetchWaitingItems();
  }, [fetchWaitingItems]);

  // sales bundles 데이터 로드 (정산 대사용)
  useEffect(() => {
    console.log('useEffect 실행됨 - sales bundles 데이터 로드');
    fetchSalesBundles();
  }, [fetchSalesBundles]);

  // 페이지 변경 처리
  const handlePageChange = (page: number) => {
    setPage(page);
  };
  
  // 정산 대기 화물 페이지 변경 처리 (기존)
  const handleWaitingPageChange = (page: number) => {
    setWaitingPage(page);
  };

  // 정산 대기 화물 페이지 변경 처리 (새로운 구현)
  const handleBrokerWaitingPageChange = (page: number) => {
    updateWaitingItemsPage(page);
  };

  // sales bundles 페이지 변경 처리 (정산 대사용)
  const handleSalesBundlesPageChange = (page: number) => {
    updateSalesBundlesPage(page);
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
  
  // sales bundles 필터 변경 처리
  const handleSalesBundlesFilterChange = (newFilter: Partial<typeof filter>) => {
    // IIncomeFilter를 ISalesBundleFilter로 변환
    const salesBundleFilter = {
      companyId: newFilter.shipperName, // 임시로 shipperName을 companyId로 사용
      startDate: newFilter.startDate,
      endDate: newFilter.endDate,
      status: newFilter.status === 'MATCHING' ? 'draft' as const : 
              newFilter.status === 'COMPLETED' ? 'issued' as const : undefined
    };
    updateSalesBundlesFilter(salesBundleFilter);
  };
  
  // 상태별 탭 처리
  const handleTabChange = (value: string) => {
    if (value === "WAITING" || value === "MATCHING" || value === "COMPLETED") {
      setFilter({ status: value as IncomeStatusType });
      
      // sales bundles 필터도 업데이트
      if (value === "MATCHING" || value === "COMPLETED") {
        const salesBundleStatus = value === "MATCHING" ? 'draft' : 'issued';
        updateSalesBundlesFilter({ status: salesBundleStatus });
      }
    }
  };
  
  // 현재 페이지의 정산 대기 화물 목록 (기존)
  const currentWaitingOrders = getOrdersByPage(waitingCurrentPage);

  // 정산 대기 화물에서 선택 처리 (새로운 구현)
  const handleWaitingItemSelect = (id: string, selected: boolean) => {
    selectWaitingItem(id, selected);
  };

  // 정산 대기 화물 전체 선택 처리 (새로운 구현)
  const handleSelectAllWaitingItems = (selected: boolean) => {
    selectAllWaitingItems(selected);
  };

  // 정산 대기 화물로 정산 생성 처리 (새로운 구현)
  const handleCreateOrderSale = () => {
    openSettlementForm();
  };

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b">
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
      
      <main>
        <Card  className="border-none shadow-none">
          <CardHeader className="flex flex-row items-center justify-between">
            <div> 
              <CardTitle>매출 정산 관리</CardTitle>
              <CardDescription className="hidden md:block">매출 정산 목록을 확인할 수 있습니다.
                <span className="text-xs text-muted-foreground px-4">
                  
                </span>
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              
            </div>
            <ToggleGroup type="single">
              <ToggleGroupItem value="table" aria-label="테이블 보기">
                <ListFilter className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="card" aria-label="카드 보기">
                <Grid3x3 className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </CardHeader>
          <CardContent>
            {/* 상태별 탭 영역 */}
            <Card>
              <CardContent>
                <Tabs 
                  defaultValue="WAITING" 
                  value={filter.status || "WAITING"}
                  onValueChange={handleTabChange}
                  className="w-full"
                >
                  
                  <TabsList className="grid grid-cols-3 md:w-auto">
                    <TabsTrigger value="WAITING">대기</TabsTrigger>
                    <TabsTrigger value="MATCHING">대사(진행중)</TabsTrigger>
                    <TabsTrigger value="COMPLETED">완료</TabsTrigger>
                  </TabsList>
                            
                  
                  {/* 정산 대기 탭 - 새로운 구현 사용 */}
                  <TabsContent value="WAITING" className="">
                    <div className="flex flex-col space-y-4 relative">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          {/* <h2 className="text-md font-semibold">정산 대기 화물</h2> */}
                          <p className="text-sm text-muted-foreground">
                            운송 마감된 화물 중 정산 대기 상태인 화물을 선택하여 정산을 진행할 수 있습니다.
                          </p>
                        </div>
                        
                      </div>
                      
                      {/* 검색 필터 */}
                      <WaitingSearch
                        filter={{
                          startDate: waitingItemsFilter.startDate,
                          endDate: waitingItemsFilter.endDate,
                          company: waitingItemsFilter.companyId
                        }}
                        setFilter={(newFilter) => {
                          updateWaitingItemsFilter({
                            startDate: newFilter.startDate,
                            endDate: newFilter.endDate,
                            companyId: newFilter.company
                          });
                        }}
                        filterOptions={{
                          cities: [],
                          vehicleTypes: [],
                          weightTypes: [],
                          statuses: [],
                          companies: [],
                          managers: []
                        }}
                      />
                      
                      {/* 로딩 상태 또는 화물 테이블 */}
                      <div className="min-h-[300px]">
                        {waitingItemsIsLoading ? (
                          <div className="flex h-[300px] items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
                          </div>
                        ) : (
                          <WaitingTable
                            orders={waitingItems.map(item => ({
                              id: item.id,
                              orderId: item.orderId,
                              company: item.companyName,
                              companyCeo: item.companyCeo,
                              status: item.isClosed,
                              statusProgress: item.flowStatus,
                              amount: item.amount,
                              chargeAmount: item.chargeAmount,
                              fee: item.dispatchAmount,
                              departureLocation: item.pickupName,
                              arrivalLocation: item.deliveryName,
                              pickupAddressSnapshot: item.pickupAddressSnapshot,
                              deliveryAddressSnapshot: item.deliveryAddressSnapshot,
                              departureCity: "-",
                              arrivalCity: "-",
                              departureDateTime: item.pickupDate,
                              arrivalDateTime: item.deliveryDate,
                              pickupTime: item.pickupTime,
                              deliveryTime: item.deliveryTime,
                              vehicle: { type: item.requestedVehicleType, weight: item.requestedVehicleWeight },
                              driver: { name: item.assignedDriverSnapshot?.name, contact: item.assignedDriverSnapshot?.contact },
                              paymentMethod: "계좌이체",
                              manager: "-"
                            }) as any)}
                            currentPage={waitingItemsPage}
                            totalPages={waitingItemsTotalPages}
                            onPageChange={handleBrokerWaitingPageChange}
                            selectedOrders={selectedWaitingItemIds}
                            onOrderSelect={handleWaitingItemSelect}
                            onSelectAll={handleSelectAllWaitingItems}
                          />
                        )}
                      </div>
                      
                      {/* 선택된 화물 요약 정보 */}
                      {selectedWaitingItemIds.length > 0 && settlementSummary && (
                        <WaitingSummary
                          selectedOrders={waitingItems
                            .filter(item => selectedWaitingItemIds.includes(item.id))
                            .map(item => ({
                              id: item.id,
                              company: item.companyName,
                              amount: item.amount,
                              fee: item.dispatchAmount,
                              status: "운송완료",
                              statusProgress: "운송완료",
                              departureDateTime: item.createdAt,
                              arrivalDateTime: item.createdAt,
                              departureLocation: "-",
                              arrivalLocation: "-",
                              departureCity: "-", 
                              arrivalCity: "-",
                              vehicle: { type: "-", weight: "-" },
                              driver: { name: "-" },
                              paymentMethod: "계좌이체",
                              manager: "-",
                              chargeAmount: item.chargeAmount
                            }) as any )}
                          onCreateIncome={handleCreateOrderSale}
                        />
                      )}
                    </div>
                  </TabsContent>
                  
                  {/* 정산 대사 탭 */}
                  <TabsContent value="MATCHING">
                    {salesBundlesIsLoading ? (
                      <div className="flex h-24 items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
                      </div>
                    ) : salesBundlesAsIncomes.filter(income => income.status === 'MATCHING').length === 0 ? (
                      <div className="flex h-24 items-center justify-center flex-col">
                        <p className="text-muted-foreground mb-2">정산 대사 데이터가 없습니다</p>
                        <Button variant="outline" onClick={resetSalesBundlesFilter}>
                          필터 초기화
                        </Button>
                      </div>
                    ) : (
                      <>
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                        <div>
                          
                          <p className="text-sm text-muted-foreground">
                            매출 정산을 위해 그룹화된 화물 목록을 선택하여 정산을 진행할 수 있습니다.
                          </p>
                        </div>                
                      </div>
                      <BundleMatchingFilter 
                        onFilterChange={handleSalesBundlesFilterChange}
                        onResetFilter={resetSalesBundlesFilter}
                        tabStatus="MATCHING"
                      />
                      <BundleMatchingList
                        incomes={salesBundlesAsIncomes.filter(income => income.status === 'MATCHING')}
                        currentPage={salesBundlesPage}
                        totalPages={salesBundlesTotalPages}
                        onPageChange={handleSalesBundlesPageChange}
                        onStatusChange={handleStatusChange}
                        onIssueInvoice={handleIssueInvoice}
                        onExportExcel={handleExportExcel}
                        currentTab="MATCHING"
                      />
                      </>
                    )}
                  </TabsContent>
                  
                  {/* 정산 완료 탭 */}
                  <TabsContent value="COMPLETED">
                    {salesBundlesIsLoading ? (
                      <div className="flex h-24 items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
                      </div>
                    ) : salesBundlesAsIncomes.filter(income => income.status === 'COMPLETED').length === 0 ? (
                      <div className="flex h-24 items-center justify-center flex-col">
                        <p className="text-muted-foreground mb-2">정산 완료된 데이터가 없습니다</p>
                        <Button variant="outline" onClick={resetSalesBundlesFilter}>
                          필터 초기화
                        </Button>
                      </div>
                    ) : (
                      <>
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                        <div>
                          
                          <p className="text-sm text-muted-foreground">
                            정산 완료된 목록을 선택하여 정산을 진행할 수 있습니다.
                          </p>
                        </div>
                      </div>
                      <BundleMatchingFilter 
                        onFilterChange={handleSalesBundlesFilterChange}
                        onResetFilter={resetSalesBundlesFilter}
                        tabStatus="COMPLETED"
                      />
                      <BundleMatchingList
                        incomes={salesBundlesAsIncomes.filter(income => income.status === 'COMPLETED')}
                        currentPage={salesBundlesPage}
                        totalPages={salesBundlesTotalPages}
                        onPageChange={handleSalesBundlesPageChange}
                        onStatusChange={handleStatusChange}
                        onIssueInvoice={handleIssueInvoice}
                        onExportExcel={handleExportExcel}
                        currentTab="COMPLETED"
                      />
                      </>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
        
        {/* 정산 상세 정보 시트 */}
        <SettlementBundleDetailSheet />
        
        {/* 정산 폼 시트 */}
        <SettlementEditFormSheet />
      </main>
    </>
  );
} 