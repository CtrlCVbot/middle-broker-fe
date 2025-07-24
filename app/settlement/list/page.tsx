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
import { useShipperSettlementStore } from "@/store/shipper-settlement-store";

//component
import { BundleMatchingFilter } from "@/components/shipper/settlement/settlement-bundle-matching-filter";
import { BundleMatchingList } from "@/components/shipper/settlement/settlement-bundle-matching-list";
import { SettlementEditFormSheet } from "@/components/shipper/settlement/settlement-edit-form-sheet";

//types
import { SalesMode } from "@/types/broker-charge";
import { getCurrentUser } from "@/utils/auth";

export default function IncomePage() {
 
  // 정산 스토어 접근 (새로운 구현)
  const {
    tabMode,
    setTabMode,

    // sales bundles 관련 추가
    salesBundlesAsIncomes,
    salesBundlesTotal,
    salesBundlesPage,
    salesBundlesPageSize,
    salesBundlesTotalPages,
    salesBundlesIsLoading,
    salesBundlesFilter,    
    fetchSalesBundles,
    updateSalesBundlesPage,
    updateSalesBundlesFilter,
    resetSalesBundlesFilter,
    
  } = useShipperSettlementStore();

  
  // sales bundles 데이터 로드 (정산 대사용)
  useEffect(() => {
    console.log('useEffect 실행됨 - sales bundles 데이터 로드');
    const loadData = async () => {
      try {
        const user = getCurrentUser();
        console.log('user', user);
        salesBundlesFilter.companyId = user?.companyId;
        await fetchSalesBundles();
        console.log('sales bundles 데이터 로드 완료');
      } catch (error) {
        console.error('sales bundles 데이터 로드 중 오류 발생:', error);
      }
    };
    loadData();
    
  }, [salesBundlesPage, salesBundlesPageSize, salesBundlesFilter, fetchSalesBundles]); 

  // sales bundles 페이지 변경 처리 (정산 대사용)
  const handleSalesBundlesPageChange = (page: number) => {
    updateSalesBundlesPage(page);
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
    if (value === "MATCHING" || value === "COMPLETED") {
      //setFilter({ status: value as IncomeStatusType });
      setTabMode({ mode: value as SalesMode });
      
      // sales bundles 필터도 업데이트
      if (value === "MATCHING") {
        const salesBundleStatus = value === "MATCHING" ? 'draft' : 'issued';
        updateSalesBundlesFilter({ status: salesBundleStatus });
      } else if (value === "COMPLETED") {
        const salesBundleStatus = 'paid';
        updateSalesBundlesFilter({ status: salesBundleStatus });
      } 
    }
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
              <BreadcrumbItem>
                <BreadcrumbPage>운송 정산</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      
      <main>
        <Card  className="border-none shadow-none">
          <CardHeader className="flex flex-row items-center justify-between">
            <div> 
              <CardTitle>운송 정산 관리</CardTitle>
              <CardDescription className="hidden md:block">운송 정산 목록을 확인할 수 있습니다.
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
                  defaultValue="MATCHING" 
                  value={tabMode.mode || "MATCHING"}
                  onValueChange={handleTabChange}
                  className="w-full"
                >                  
                  <TabsList className="grid grid-cols-2 md:w-auto">                    
                    <TabsTrigger value="MATCHING">진행중</TabsTrigger>
                    <TabsTrigger value="COMPLETED">완료</TabsTrigger>
                  </TabsList>
                  
                  {/* 정산 대사 탭 */}
                  <TabsContent value="MATCHING">
                    {salesBundlesIsLoading ? (
                      <div className="flex h-24 items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                          <div>
                            
                            <p className="text-sm text-muted-foreground">
                             정산이 진행 중인 정보를 확인할 수 있습니다.
                            </p>
                          </div>
                        </div>
                        <BundleMatchingFilter
                          tabStatus="MATCHING"
                        />
                        {salesBundlesAsIncomes.filter(income => income.status === 'MATCHING').length === 0 ? (
                          <div className="flex h-24 items-center justify-center flex-col">
                            <p className="text-muted-foreground mb-2">정산 진행 중인 데이터가 없습니다</p>
                            <Button variant="outline" onClick={resetSalesBundlesFilter}>
                              필터 초기화
                            </Button>
                          </div>
                        ) : (
                          <BundleMatchingList
                            incomes={salesBundlesAsIncomes.filter(income => income.status === 'MATCHING')}
                            currentPage={salesBundlesPage}
                            totalPages={salesBundlesTotalPages}
                            onPageChange={handleSalesBundlesPageChange}
                            //onStatusChange={handleStatusChange}
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
                    {salesBundlesIsLoading ? (
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
                        {salesBundlesAsIncomes.filter(income => income.status === 'COMPLETED').length === 0 ? (
                          <div className="flex h-24 items-center justify-center flex-col">
                            <p className="text-muted-foreground mb-2">정산 완료된 데이터가 없습니다</p>
                            <Button variant="outline" onClick={resetSalesBundlesFilter}>
                              필터 초기화
                            </Button>
                          </div>
                        ) : (
                          <BundleMatchingList
                            incomes={salesBundlesAsIncomes.filter(income => income.status === 'COMPLETED')}
                            currentPage={salesBundlesPage}
                            totalPages={salesBundlesTotalPages}
                            onPageChange={handleSalesBundlesPageChange}                            
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