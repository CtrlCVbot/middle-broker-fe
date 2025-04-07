"use client";

import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useSettlementStore } from "@/store/settlement-store";
import { getSettlementById, getSettlementLogs } from "@/utils/mockdata/mock-settlements";
import { ISettlement, ISettlementLog, SettlementStatus } from "@/types/settlement";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import {
  MapPin,
  Clock,
  Phone,
  CalendarClock,
  AlertTriangle
} from "lucide-react";

// 정산 상태에 따른 배지 스타일 지정
const statusVariants: Record<SettlementStatus, string> = {
  '정산대기': 'bg-gray-200 text-gray-800',
  '정산요청': 'bg-blue-100 text-blue-800',
  '정산진행중': 'bg-amber-100 text-amber-800',
  '정산완료': 'bg-green-100 text-green-800',
  '정산취소': 'bg-red-100 text-red-800',
};

// 정산 진행 상태 컴포넌트
function SettlementProgress({ logs }: { logs: ISettlementLog[] }) {
  return (
    <div className="space-y-4">
      {logs.map((log, index) => (
        <div key={index} className="relative pl-6 pb-4">
          {/* 연결선 */}
          {index < logs.length - 1 && (
            <div className="absolute top-2 left-[0.625rem] bottom-0 w-px bg-muted-foreground/20" />
          )}
          {/* 상태 원 */}
          <div className={`absolute top-1 left-0 w-3 h-3 rounded-full ${
            statusVariants[log.status].replace('text-', 'bg-').replace('bg-', 'border-')
          } bg-background border-2`} />
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              <Badge variant="outline" className={statusVariants[log.status]}>
                {log.status}
              </Badge>
            </span>
            <span className="text-xs text-muted-foreground flex items-center mt-1">
              <Clock className="mr-1 h-3 w-3" />
              {log.date} {log.time}
            </span>
            {log.handler && (
              <span className="text-xs text-muted-foreground mt-1">
                처리자: {log.handler}
              </span>
            )}
            {log.remark && (
              <span className="text-xs mt-1 p-1 bg-muted rounded">
                {log.remark}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// 운송 정보 카드 컴포넌트
function SettlementRouteCard({ settlement }: { settlement: ISettlement }) {
  return (
    <div className="space-y-3 text-sm">
      <div className="flex items-start">
        <MapPin className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
        <div>
          <h4 className="font-semibold">출발지</h4>
          <p>{settlement.departureLocation}</p>
          <p className="text-muted-foreground">{formatDate(settlement.departureDateTime)}</p>
        </div>
      </div>
      <div className="flex items-start">
        <MapPin className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
        <div>
          <h4 className="font-semibold">도착지</h4>
          <p>{settlement.arrivalLocation}</p>
          <p className="text-muted-foreground">{formatDate(settlement.arrivalDateTime)}</p>
        </div>
      </div>
    </div>
  );
}

// 정산 정보 컴포넌트
function SettlementInfoPanel({ settlement }: { settlement: ISettlement }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* 차주 정보 */}
      <div className="space-y-2 bg-secondary/30 rounded-md p-3">
        <h4 className="font-medium">차주 정보</h4>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="text-muted-foreground">차주명</div>
          <div className="col-span-2 font-medium">{settlement.driver.name}</div>
          
          <div className="text-muted-foreground">연락처</div>
          <div className="col-span-2 font-medium flex items-center">
            <Phone className="h-3 w-3 mr-1" />
            {settlement.driver.contact}
          </div>
          
          <div className="text-muted-foreground">계좌 정보</div>
          <div className="col-span-2 font-medium">{settlement.driver.bankInfo}</div>
        </div>
      </div>
      
      {/* 정산 정보 */}
      <div className="space-y-2 bg-secondary/30 rounded-md p-3">
        <h4 className="font-medium">정산 정보</h4>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="text-muted-foreground">운송비</div>
          <div className="col-span-2 font-medium">{formatCurrency(settlement.amount)}원</div>
          
          <div className="text-muted-foreground">수수료</div>
          <div className="col-span-2 font-medium">{formatCurrency(settlement.fee)}원</div>
          
          {settlement.tax && (
            <>
              <div className="text-muted-foreground">세금</div>
              <div className="col-span-2 font-medium">{formatCurrency(settlement.tax)}원</div>
            </>
          )}
          
          <div className="text-muted-foreground">최종 정산액</div>
          <div className="col-span-2 font-medium text-lg">{formatCurrency(settlement.finalAmount)}원</div>
          
          {settlement.paymentMethod && (
            <>
              <div className="text-muted-foreground">지불 방법</div>
              <div className="col-span-2 font-medium">{settlement.paymentMethod}</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function SettlementDetailSheet() {
  const { isDetailSheetOpen, selectedSettlementId, closeDetailSheet } = useSettlementStore();
  
  // TanStack Query를 사용하여 정산 상세 정보 조회
  const { 
    data: settlement, 
    isLoading, 
    isError,
    error 
  } = useQuery({
    queryKey: ["settlementDetail", selectedSettlementId],
    queryFn: () => selectedSettlementId ? getSettlementById(selectedSettlementId) : null,
    enabled: !!selectedSettlementId && isDetailSheetOpen,
    staleTime: 1000 * 60 * 5, // 5분
  });

  // 정산 로그 조회
  const { 
    data: logs = [], 
    isLoading: isLogsLoading 
  } = useQuery({
    queryKey: ["settlementLogs", selectedSettlementId],
    queryFn: () => selectedSettlementId ? getSettlementLogs(selectedSettlementId) : [],
    enabled: !!selectedSettlementId && isDetailSheetOpen,
    staleTime: 1000 * 60 * 5, // 5분
  });

  // 모바일 화면 감지
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;

  return (
    <Sheet open={isDetailSheetOpen} onOpenChange={(open) => !open && closeDetailSheet()}>
      <SheetContent 
        side={isMobile ? "bottom" : "right"} 
        className={cn(
          "sm:max-w-xl md:max-w-2xl overflow-auto p-0",
          isMobile ? "h-[80vh]" : "w-full"
        )}
      >
        {/* 화면에 노출되지 않지만 접근성을 위한 타이틀 */}
        <SheetTitle className="sr-only">정산 상세 정보</SheetTitle>
        
        {isLoading ? (
          // 로딩 상태
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">정산 정보를 불러오는 중...</p>
            </div>
          </div>
        ) : isError ? (
          // 에러 상태
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-destructive">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
              <p className="text-lg font-semibold">오류가 발생했습니다</p>
              <p className="text-sm text-muted-foreground mt-2">
                {error instanceof Error ? error.message : "정산 정보를 불러오는데 실패했습니다."}
              </p>
            </div>
          </div>
        ) : settlement ? (
          // 데이터 로드 완료
          <ScrollArea className="h-full max-h-screen">
            {/* 헤더 - 기본 정보 */}
            <SheetHeader className="px-6 py-4 sticky top-0 bg-background z-10 border-b">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-xl font-bold">
                  정산번호: {settlement.id}
                </SheetTitle>
                <Badge 
                  className={cn(
                    statusVariants[settlement.status],
                    "text-sm px-3 py-1"
                  )}
                >
                  {settlement.status}
                </Badge>
              </div>
              <div className="flex flex-col gap-1 mt-1">
                <div className="flex items-center text-sm text-muted-foreground">
                  <CalendarClock className="h-4 w-4 mr-2" />
                  등록일: {formatDate(settlement.createdAt)}
                </div>
                <p className="text-lg font-semibold mt-1">
                  화물번호: {settlement.orderId}
                </p>
              </div>
            </SheetHeader>
            
            <div className="px-6 py-4 space-y-6">
              {/* 정산 진행 상태 */}
              <div>
                <h3 className="text-base font-medium mb-3">정산 진행 상태</h3>
                <SettlementProgress logs={logs} />
              </div>
              
              <Separator />
              
              {/* 운송 정보 */}
              <div>
                <h3 className="text-base font-medium mb-3">운송 정보</h3>
                <SettlementRouteCard settlement={settlement} />
              </div>
              
              <Separator />
              
              {/* 정산 및 차주 정보 */}
              <div>
                <h3 className="text-base font-medium mb-3">정산 및 차주 정보</h3>
                <SettlementInfoPanel settlement={settlement} />
              </div>
            </div>
            
            {/* 푸터 - 닫기 버튼 */}
            <SheetFooter className="px-6 py-4 border-t mt-4">
              <Button variant="outline" onClick={closeDetailSheet}>
                닫기
              </Button>
            </SheetFooter>
          </ScrollArea>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-muted-foreground">정산 정보가 없습니다</p>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
} 