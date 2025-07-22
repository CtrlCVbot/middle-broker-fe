"use client";

//use client
import React, { useEffect, useState } from "react";

//ui
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleGroupItem } from "@/components/ui/toggle-group";
import { ToggleGroup } from "@/components/ui/toggle-group";
import { 
  Loader2,
  ListFilter,
  Grid3x3
} from "lucide-react";

//store
import { useBrokerChargeStore } from "@/store/broker-charge-purchase-store";

//component
import { WaitingTable } from "@/components/broker/purchase/settlement-waiting-table";
import { WaitingSearch } from "@/components/broker/purchase/settlement-waiting-search";
import WaitingSummary from "@/components/broker/purchase/settlement-waiting-summary";
import { BundleMatchingFilter } from "@/components/broker/purchase/settlement-bundle-matching-filter";
import { BundleMatchingList } from "@/components/broker/purchase/settlement-bundle-matching-list";
import { SettlementEditFormSheet } from "@/components/broker/purchase/settlement-edit-form-sheet";

//types

import { ISettlementWaitingItem, PurchaseMode } from "@/types/broker-charge-purchase";

export default function IncomePage() {
  
  // 정산 스토어 접근 (새로운 구현)
  const {
    tabMode,
    setTabMode,
    
    // 정산 대기 화물 관련 추가
    waitingItems,
    selectedWaitingItemIds,
    selectedWaitingItems, // 새로 추가된 선택된 항목 전체 데이터
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
    createOrderPurchaseFromWaitingItems,
    openSettlementForm,

    // purchase bundles 관련 추가
    purchaseBundlesAsIncomes,
    purchaseBundlesTotal,
    purchaseBundlesPage,
    purchaseBundlesPageSize,
    purchaseBundlesTotalPages,
    purchaseBundlesIsLoading,
    purchaseBundlesFilter,    
    fetchPurchaseBundles,
    updatePurchaseBundlesPage,
    updatePurchaseBundlesFilter,
    resetPurchaseBundlesFilter
  } = useBrokerChargeStore();

  console.log('waitingItems:', waitingItems);



  // 정산 대기 필터 변경 시 데이터 다시 조회
  useEffect(() => {
    console.log('useEffect 실행됨 - 정산 대기 화물 데이터 로드');
    const loadData = async () => {
      try {
        await fetchWaitingItems();
        console.log('정산 대기 화물 데이터 로드 완료');
      } catch (error) {
        console.error('정산 대기 화물 데이터 로드 중 오류 발생:', error);
      }
    };
    loadData();
  }, [waitingItemsPage, waitingItemsPageSize, waitingItemsFilter, fetchWaitingItems]);
 
  // sales bundles 데이터 로드 (정산 대사용)
  useEffect(() => {
    console.log('useEffect 실행됨 - sales bundles 데이터 로드');
    const loadData = async () => {
      try {
        await fetchPurchaseBundles();
        console.log('sales bundles 데이터 로드 완료');
      } catch (error) {
        console.error('sales bundles 데이터 로드 중 오류 발생:', error);
      }
    };
    loadData();
    
  }, [purchaseBundlesPage, purchaseBundlesPageSize, purchaseBundlesFilter, fetchPurchaseBundles]);

  
  // 정산 대기 화물 페이지 변경 처리 (새로운 구현)
  const handleBrokerWaitingPageChange = (page: number) => {
    updateWaitingItemsPage(page);
  };

  // sales bundles 페이지 변경 처리 (정산 대사용)
  const handlePurchaseBundlesPageChange = (page: number) => {
    updatePurchaseBundlesPage(page);
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
  
  
  // 상태별 탭 처리
  const handleTabChange = (value: string) => {
    if (value === "WAITING" || value === "MATCHING" || value === "COMPLETED") {
      
      setTabMode({ mode: value as PurchaseMode });
      
      // sales bundles 필터도 업데이트
      if (value === "MATCHING") {
        const purchaseBundleStatus = value === "MATCHING" ? 'draft' : 'issued';
        updatePurchaseBundlesFilter({ status: purchaseBundleStatus });
      } else if (value === "COMPLETED") {
        const purchaseBundleStatus = 'paid';
        updatePurchaseBundlesFilter({ status: purchaseBundleStatus });
      } else if (value === "WAITING") {
        
        updateWaitingItemsFilter({ });
      }
    }
  };
  
 
  // 정산 대기 화물에서 선택 처리 (새로운 구현)
  const handleWaitingItemSelect = (id: string, selected: boolean) => {
    selectWaitingItem(id, selected);
  };

  // 정산 대기 화물 전체 선택 처리 (새로운 구현)
  const handleSelectAllWaitingItems = (selected: boolean) => {
    selectAllWaitingItems(selected);
  };

  // 정산 대기 화물로 정산 생성 처리 (새로운 구현)
  const handleCreateOrderPurchase = () => {
    openSettlementForm();
  };
  console.log("selectedWaitingItems:", selectedWaitingItems);

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
                <BreadcrumbPage>매입 정산 관리</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      
      <main>
        <Card  className="border-none shadow-none">
          <CardHeader className="flex flex-row items-center justify-between">
            <div> 
              <CardTitle>매입 정산 관리</CardTitle>
              <CardDescription className="hidden md:block">매입 정산 목록을 확인할 수 있습니다.
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
                  value={tabMode.mode || "WAITING"}
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
                              paymentMethod: "bank_transfer",
                              manager: "-",
                              bankName: item.companyBankCode,
                              accountHolder: item.companyBankAccountHolder,
                              accountNumber: item.companyBankAccount
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
                          selectedOrders={selectedWaitingItems
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
                              driver: { id: item.assignedDriverId || "-", name: item.assignedDriverSnapshot?.name || "-" },
                              paymentMethod: "bank_transfer",
                              manager: "-",
                              chargeAmount: item.chargeAmount
                            }) as any )}
                          onCreateIncome={handleCreateOrderPurchase}
                        />
                      )}
                    </div>
                  </TabsContent>
                  
                  {/* 정산 대사 탭 */}
                  <TabsContent value="MATCHING">
                    {purchaseBundlesIsLoading ? (
                      <div className="flex h-24 items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
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
                          //onFilterChange={handleSalesBundlesFilterChange}
                          //onResetFilter={resetSalesBundlesFilter}
                          tabStatus="MATCHING"
                        />
                        {purchaseBundlesAsIncomes.filter(income => income.status === 'MATCHING').length === 0 ? (
                          <div className="flex h-24 items-center justify-center flex-col">
                            <p className="text-muted-foreground mb-2">정산 대사 데이터가 없습니다</p>
                            <Button variant="outline" onClick={resetPurchaseBundlesFilter}>
                              필터 초기화
                            </Button>
                          </div>
                        ) : (
                          <BundleMatchingList
                            purchases={purchaseBundlesAsIncomes.filter(purchase => purchase.status === 'MATCHING')}
                            currentPage={purchaseBundlesPage}
                            totalPages={purchaseBundlesTotalPages}
                            onPageChange={handlePurchaseBundlesPageChange}
                            onIssueInvoice={handleIssueInvoice}
                            onExportExcel={handleExportExcel}
                            currentTab="MATCHING"
                          />
                        )}
                      </>
                    
                    )}
                  </TabsContent>
                  
                  {/* 정산 완료 탭 */}
                  <TabsContent value="COMPLETED">
                    {purchaseBundlesIsLoading ? (
                      <div className="flex h-24 items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
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
                          //onFilterChange={handleSalesBundlesFilterChange}
                          //onResetFilter={resetSalesBundlesFilter}
                          tabStatus="COMPLETED"
                        />
                        {purchaseBundlesAsIncomes.filter(income => income.status === 'COMPLETED').length === 0 ? (
                          <div className="flex h-24 items-center justify-center flex-col">
                            <p className="text-muted-foreground mb-2">정산 완료된 데이터가 없습니다</p>
                            <Button variant="outline" onClick={resetPurchaseBundlesFilter}>
                              필터 초기화
                            </Button>
                          </div>
                        ) : (
                          <BundleMatchingList
                            purchases={purchaseBundlesAsIncomes.filter(purchase => purchase.status === 'COMPLETED')}
                            currentPage={purchaseBundlesPage}
                            totalPages={purchaseBundlesTotalPages}
                            onPageChange={handlePurchaseBundlesPageChange}
                            //onStatusChange={handleStatusChange}
                            onIssueInvoice={handleIssueInvoice}
                            onExportExcel={handleExportExcel}
                            currentTab="COMPLETED"
                          />
                        )}
                      </>
                    
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
             
        {/* 정산 폼 시트 */}
        <SettlementEditFormSheet />
      </main>
    </>
  );
} 