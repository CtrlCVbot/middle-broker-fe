"use client";

import React, { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useSettlementStore } from "@/store/settlement-store";
import { getSettlementById, getSettlementLogs } from "@/utils/mockdata/mock-settlements";
import { ISettlement, ISettlementLog, SettlementStatus } from "@/types/settlement";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Calendar,
  CreditCard,
  MapPin,
  Truck,
  User,
  Clock,
  ClipboardList,
  Banknote,
  Phone
} from "lucide-react";

// 정산 상태에 따른 배지 스타일 지정
const statusVariants: Record<SettlementStatus, string> = {
  '정산대기': 'bg-gray-200 text-gray-800',
  '정산요청': 'bg-blue-100 text-blue-800',
  '정산진행중': 'bg-amber-100 text-amber-800',
  '정산완료': 'bg-green-100 text-green-800',
  '정산취소': 'bg-red-100 text-red-800',
};

export function SettlementDetailSheet() {
  const { isDetailSheetOpen, selectedSettlementId, closeDetailSheet } = useSettlementStore();
  const [settlement, setSettlement] = useState<ISettlement | null>(null);
  const [logs, setLogs] = useState<ISettlementLog[]>([]);
  const [loading, setLoading] = useState(true);

  // 선택된 정산 ID가 변경될 때 데이터 로드
  useEffect(() => {
    if (selectedSettlementId && isDetailSheetOpen) {
      setLoading(true);
      
      // 정산 상세 정보 조회
      const settlementData = getSettlementById(selectedSettlementId);
      setSettlement(settlementData);
      
      // 정산 로그 조회
      const logsData = getSettlementLogs(selectedSettlementId);
      setLogs(logsData);
      
      setLoading(false);
    } else {
      setSettlement(null);
      setLogs([]);
    }
  }, [selectedSettlementId, isDetailSheetOpen]);

  return (
    <Sheet open={isDetailSheetOpen} onOpenChange={closeDetailSheet}>
      <SheetContent className="sm:max-w-md md:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>정산 상세 정보</SheetTitle>
          <SheetDescription>
            정산 정보와 진행 상태를 확인할 수 있습니다.
          </SheetDescription>
        </SheetHeader>
        
        {loading ? (
          <div className="py-8 text-center">데이터를 불러오는 중...</div>
        ) : settlement ? (
          <ScrollArea className="h-[calc(100vh-10rem)] pr-4">
            <div className="space-y-6 py-6">
              {/* 기본 정보 */}
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground">정산번호</h3>
                    <p className="text-lg font-medium">{settlement.id}</p>
                  </div>
                  <Badge className={statusVariants[settlement.status]}>
                    {settlement.status}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground">화물번호</h3>
                  <p>{settlement.orderId}</p>
                </div>
              </div>
              
              <Separator />
              
              {/* 차주 정보 */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  차주 정보
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-semibold text-muted-foreground">차주명</h4>
                    <p>{settlement.driver.name}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-muted-foreground">연락처</h4>
                    <div className="flex items-center">
                      <Phone className="h-3 w-3 mr-1" />
                      <p>{settlement.driver.contact}</p>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <h4 className="font-semibold text-muted-foreground">계좌 정보</h4>
                    <p>{settlement.driver.bankInfo}</p>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* 운송 정보 */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium flex items-center">
                  <Truck className="mr-2 h-5 w-5" />
                  운송 정보
                </h3>
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
              </div>
              
              <Separator />
              
              {/* 정산 정보 */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium flex items-center">
                  <CreditCard className="mr-2 h-5 w-5" />
                  정산 정보
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-semibold text-muted-foreground">운송비</h4>
                    <p>{formatCurrency(settlement.amount)}원</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-muted-foreground">수수료</h4>
                    <p>{formatCurrency(settlement.fee)}원</p>
                  </div>
                  {settlement.tax && (
                    <div>
                      <h4 className="font-semibold text-muted-foreground">세금</h4>
                      <p>{formatCurrency(settlement.tax)}원</p>
                    </div>
                  )}
                  <div className={settlement.tax ? "col-span-1" : "col-span-2"}>
                    <h4 className="font-semibold text-muted-foreground">지불 방법</h4>
                    <p>{settlement.paymentMethod || '-'}</p>
                  </div>
                  <div className="col-span-2">
                    <h4 className="font-semibold text-muted-foreground">최종 정산액</h4>
                    <p className="text-xl font-bold">{formatCurrency(settlement.finalAmount)}원</p>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* 정산 진행 상태 */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium flex items-center">
                  <ClipboardList className="mr-2 h-5 w-5" />
                  정산 진행 내역
                </h3>
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
              </div>
              
              {/* 정산 정보 생성일 */}
              <div className="text-xs text-muted-foreground text-right pt-4">
                등록일: {formatDate(settlement.createdAt)}
              </div>
            </div>
          </ScrollArea>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            정산 정보가 없습니다.
          </div>
        )}
        
        <div className="mt-6 flex justify-end">
          <Button variant="outline" onClick={closeDetailSheet}>
            닫기
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
} 