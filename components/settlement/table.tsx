"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ISettlement, SettlementStatus } from "@/types/settlement";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  FileText,
} from "lucide-react";

// 정산 상태 뱃지 스타일 정의
const getStatusBadge = (status: SettlementStatus) => {
  switch (status) {
    case "COMPLETED":
      return <Badge className="bg-green-500">완료</Badge>;
    case "PENDING":
      return <Badge className="bg-yellow-500">미완료</Badge>;
    default:
      return <Badge className="bg-gray-500">알 수 없음</Badge>;
  }
};

// 금액 포맷팅 함수
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('ko-KR', { 
    style: 'currency', 
    currency: 'KRW',
    maximumFractionDigits: 0 
  }).format(amount);
};

// 날짜 포맷팅 함수
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

// 테이블 페이지네이션 인터페이스
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
  const router = useRouter();

  // 상세 페이지로 이동
  const handleSettlementClick = (settlementId: string) => {
    router.push(`/settlement/detail/${settlementId}`);
  };

  // 페이지네이션 핸들러
  const handleFirstPage = () => {
    onPageChange(1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handleLastPage = () => {
    onPageChange(totalPages);
  };

  return (
    <div className="w-full">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">정산 ID</TableHead>
              <TableHead>업체명</TableHead>
              <TableHead>정산 기간</TableHead>
              <TableHead>총 정산 금액</TableHead>
              <TableHead>정산 요청일</TableHead>
              <TableHead>정산 상태</TableHead>
              <TableHead className="text-right">상세</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {settlements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  정산 내역이 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              settlements.map((settlement) => (
                <TableRow 
                  key={settlement.id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSettlementClick(settlement.id)}
                >
                  <TableCell className="font-medium">{settlement.id}</TableCell>
                  <TableCell>{settlement.companyName}</TableCell>
                  <TableCell>
                    {formatDate(settlement.startDate)} ~ {formatDate(settlement.endDate)}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(settlement.totalAmount)}
                  </TableCell>
                  <TableCell>{formatDate(settlement.requestDate)}</TableCell>
                  <TableCell>{getStatusBadge(settlement.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSettlementClick(settlement.id);
                      }}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      상세보기
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleFirstPage}
            disabled={currentPage === 1}
          >
            <ChevronFirst className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            페이지 {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLastPage}
            disabled={currentPage === totalPages}
          >
            <ChevronLast className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
} 