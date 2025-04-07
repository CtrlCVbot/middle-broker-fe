'use client';

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { MatchingTab } from "@/components/broker/expenditure/tabs/matching-tab";
import { CompletedTab } from "@/components/broker/expenditure/tabs/completed-tab";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle } from "lucide-react";
import { useInvoiceStore } from "@/store/expenditure/invoice-store";
import { InvoiceFilter } from "@/components/broker/expenditure/invoice/invoice-filter";
import { InvoiceTable } from "@/components/broker/expenditure/invoice/invoice-table";
import { InvoiceMatchingSheet } from "@/components/broker/expenditure/invoice/invoice-matching-sheet";

export default function ExpenditurePage() {
  const { 
    invoices,
    currentPage,
    //totalPages,
    isLoading,
    filter,
    //updateFilter,
    resetFilter,
    fetchInvoices,
    //setMatchingSheetOpen,
    setCreateMode
  } = useInvoiceStore();
  
  const [isCardView, setIsCardView] = useState(false);

  // 초기 데이터 로드
  useEffect(() => {
    fetchInvoices();
  }, [currentPage, filter]);

  const handleCreateInvoice = () => {
    //setMatchingSheetOpen(true);
    setCreateMode();
  };

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
        <Tabs defaultValue="waiting" className="space-y-4">
          <div className="flex flex-col space-y-4">
            <div>
              <h1 className="text-2xl font-bold">화물 매입 정산</h1>
              <p className="text-muted-foreground">
                세금계산서 기준으로 화물을 매칭하고 정산을 관리합니다.
              </p>
            </div>

            <TabsList className="grid w-full grid-cols-3 md:w-auto">
              <TabsTrigger value="waiting">정산 대기</TabsTrigger>
              <TabsTrigger value="matching">정산 대사</TabsTrigger>
              <TabsTrigger value="completed">정산 완료</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="waiting" className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div>
                <h2 className="text-xl font-semibold">정산 대기 세금계산서</h2>
                <p className="text-sm text-muted-foreground">
                  매입 세금계산서와 화물을 매칭하여 정산을 진행할 수 있습니다.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-2">
              <div className="w-full md:flex-1">
                <InvoiceFilter />
              </div>
              
              <div className="flex items-center gap-2 mt-2 md:mt-0 h-9">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-9"
                  onClick={() => setIsCardView(!isCardView)}
                >
                  {isCardView ? '테이블 뷰' : '카드 뷰'}
                </Button>
                <Button 
                  variant="default" 
                  size="sm"
                  className="h-9"
                  onClick={handleCreateInvoice}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  세금계산서 생성
                </Button>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex h-[300px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
              </div>
            ) : invoices.length === 0 ? (
              <div className="flex h-[300px] items-center justify-center flex-col">
                <p className="text-muted-foreground mb-2">정산 대기중인 세금계산서가 없습니다</p>
                <Button variant="outline" onClick={resetFilter}>
                  필터 초기화
                </Button>
              </div>
            ) : (
              <InvoiceTable isCardView={isCardView} />
            )}
          </TabsContent>
          
          <TabsContent value="matching">
            <MatchingTab />
          </TabsContent>
          
          <TabsContent value="completed">
            <CompletedTab />
          </TabsContent>
        </Tabs>
        
        <InvoiceMatchingSheet />
      </main>
    </>
  );
} 