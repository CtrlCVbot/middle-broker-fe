"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { ISettlement, SettlementStatus } from "@/types/settlement";
import { useSettlementStore } from "@/store/settlement-store";
import { ChevronLeft, ChevronRight, CalendarIcon, MapPinIcon, UserIcon, Banknote, CreditCard } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

// 정산 상태에 따른 배지 스타일 지정
const statusVariants: Record<SettlementStatus, string> = {
  '정산대기': 'bg-gray-200 text-gray-800',
  '정산요청': 'bg-blue-100 text-blue-800',
  '정산진행중': 'bg-amber-100 text-amber-800',
  '정산완료': 'bg-green-100 text-green-800',
  '정산취소': 'bg-red-100 text-red-800',
};

interface SettlementCardProps {
  settlements: ISettlement[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function SettlementCard({
  settlements,
  currentPage,
  totalPages,
  onPageChange,
}: SettlementCardProps) {
  const { selectSettlement } = useSettlementStore();

  // 이전 페이지로 이동
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  // 다음 페이지로 이동
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  // 정산 카드 클릭 시 상세 정보 시트 열기
  const handleCardClick = (settlement: ISettlement) => {
    selectSettlement(settlement.id);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {settlements.map((settlement) => (
          <Card 
            key={settlement.id} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleCardClick(settlement)}
          >
            <CardHeader className="p-4 pb-2 flex flex-row justify-between items-start">
              <div>
                <div className="text-sm text-muted-foreground mb-1">정산번호: {settlement.id}</div>
                <div className="text-sm text-muted-foreground mb-2">화물번호: {settlement.orderId}</div>
                <Badge className={statusVariants[settlement.status]}>
                  {settlement.status}
                </Badge>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold">{formatCurrency(settlement.finalAmount)}</div>
                <div className="text-sm text-muted-foreground">최종 정산액</div>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2 pb-2 grid gap-2">
              <div className="flex items-center text-sm">
                <MapPinIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="font-medium mr-1">출발:</span> {settlement.departureCity} → <span className="font-medium ml-1">도착:</span> {settlement.arrivalCity}
              </div>
              <div className="flex items-center text-sm">
                <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="font-medium mr-1">출발일:</span> {formatDate(settlement.departureDateTime)}
              </div>
              <div className="flex items-center text-sm">
                <UserIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="font-medium mr-1">차주:</span> {settlement.driver.name} ({settlement.driver.contact})
              </div>
              <div className="flex items-center text-sm">
                <Banknote className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="font-medium mr-1">운송비:</span> {formatCurrency(settlement.amount)}
              </div>
              <div className="flex items-center text-sm">
                <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="font-medium mr-1">수수료:</span> {formatCurrency(settlement.fee)}
              </div>
              {settlement.completedDate && (
                <div className="text-sm mt-1 text-muted-foreground">
                  정산완료일: {settlement.completedDate}
                </div>
              )}
            </CardContent>
            <CardFooter className="p-4 pt-2 border-t flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCardClick(settlement);
                }}
              >
                상세보기
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* 페이지네이션 */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          전체 {totalPages} 페이지 중 {currentPage} 페이지
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={goToPreviousPage}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={goToNextPage}
            disabled={currentPage >= totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
} 