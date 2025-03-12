"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSettlementStore } from "@/store/settlement-store";
import { ISettlement, SettlementStatus } from "@/types/settlement";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

// 정산 상태에 따른 배지 스타일 지정
const statusVariants: Record<SettlementStatus, string> = {
  '정산대기': 'bg-gray-200 text-gray-800',
  '정산요청': 'bg-blue-100 text-blue-800',
  '정산진행중': 'bg-amber-100 text-amber-800',
  '정산완료': 'bg-green-100 text-green-800',
  '정산취소': 'bg-red-100 text-red-800',
};

interface SettlementTableProps {
  settlements: ISettlement[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function SettlementTable({
  settlements,
  currentPage,
  totalPages,
  onPageChange,
}: SettlementTableProps) {
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

  // 정산 행 클릭 시 상세 정보 시트 열기
  const handleRowClick = (settlement: ISettlement) => {
    selectSettlement(settlement.id);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="w-[80px]">정산번호</TableHead>
              <TableHead className="w-[80px]">화물번호</TableHead>
              <TableHead className="w-[80px]">상태</TableHead>
              <TableHead className="hidden md:table-cell">출발지</TableHead>
              <TableHead className="hidden md:table-cell">도착지</TableHead>
              <TableHead className="hidden lg:table-cell">차주</TableHead>
              <TableHead className="w-[120px] text-right">금액</TableHead>
              <TableHead className="w-[100px] text-right">수수료</TableHead>
              <TableHead className="w-[120px] text-right">최종 정산액</TableHead>
              <TableHead className="w-[80px] text-center">상세</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {settlements.map((settlement) => (
              <TableRow
                key={settlement.id}
                className="cursor-pointer"
                onClick={() => handleRowClick(settlement)}
              >
                <TableCell className="font-medium">{settlement.id}</TableCell>
                <TableCell>{settlement.orderId}</TableCell>
                <TableCell>
                  <Badge className={statusVariants[settlement.status]}>
                    {settlement.status}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {settlement.departureCity}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {settlement.arrivalCity}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {settlement.driver.name}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(settlement.amount)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(settlement.fee)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(settlement.finalAmount)}
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRowClick(settlement);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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