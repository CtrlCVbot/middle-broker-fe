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
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { IIncome, IncomeStatusType } from "@/types/income";
import { formatCurrency } from "@/lib/utils";
import { useIncomeDetailStore } from "@/store/income-store";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface BundleMatchingListProps {
  incomes: IIncome[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onStatusChange?: (incomeId: string, newStatus: IncomeStatusType) => void;
  onIssueInvoice?: (incomeId: string) => void;
  onExportExcel?: (incomeId: string) => void;
  currentTab?: IncomeStatusType; // 현재 선택된 탭
}

export function BundleMatchingList({
  incomes,
  currentPage,
  totalPages,
  onPageChange,
  onStatusChange,
  onIssueInvoice,
  onExportExcel,
  currentTab = "MATCHING", // 기본값은 정산대사
}: BundleMatchingListProps) {
  // 상세 정보 모달을 위한 스토어 액세스
  const { openSheet } = useIncomeDetailStore();
  
  // 정산 상세 정보 열기
  const handleIncomeClick = (incomeId: string) => {
    openSheet(incomeId);
  };
  
  // 첫 페이지로 이동
  const handleFirstPage = () => {
    onPageChange(1);
  };

  // 이전 페이지로 이동
  const handlePrevPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  // 다음 페이지로 이동
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  // 마지막 페이지로 이동
  const handleLastPage = () => {
    onPageChange(totalPages);
  };

  // 정산 상태에 따른 배지 렌더링
  const renderStatusBadge = (status: IncomeStatusType) => {
    switch (status) {
      case 'WAITING':
        return <Badge variant="outline" className="bg-slate-100">대기</Badge>;
      case 'MATCHING':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">진행중</Badge>;
      case 'COMPLETED':
        return <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-100">완료</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // 세금계산서 상태에 따른 배지 렌더링
  const renderInvoiceStatusBadge = (status?: string) => {
    if (!status) return null;
    
    switch (status) {
      case '미발행':
        return <Badge variant="outline" className="bg-slate-100">미발행</Badge>;
      case '발행대기':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-700">발행대기</Badge>;
      case '발행완료':
        return <Badge variant="outline" className="bg-green-100 text-green-700">발행완료</Badge>;
      case '발행오류':
        return <Badge variant="outline" className="bg-red-100 text-red-700">발행오류</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // 현재 탭에 따른 상태 컬럼 이름 설정
  const getStatusColumnName = () => {
    switch (currentTab) {
      case "MATCHING":
        return "정산대사 상태";
      case "COMPLETED":
        return "정산완료 상태";
      default:
        return "상태";
    }
  };

  const getSchedule = (from: string, to: string,) => {
    const fromDateObj = format(from, "MM.dd", { locale: ko });
    const toDateObj = format(to, "MM.dd", { locale: ko });
    if (from === to) {
      return fromDateObj;
    } else {
      return fromDateObj + ' - ' + toDateObj;
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="w-[80px] text-center">그룹 ID</TableHead>
              <TableHead className="w-[80px] text-center">상태</TableHead>
              <TableHead>청구 화주</TableHead>
              <TableHead>정산 기간</TableHead>
              <TableHead className="text-center">화물 건수</TableHead>
              <TableHead className="text-right">기본 운임</TableHead>
              <TableHead className="text-right">추가금</TableHead>
              <TableHead className="text-right pr-4">세금(10%)</TableHead>
              <TableHead className="text-right">총 청구금액</TableHead>
              <TableHead>세금계산서</TableHead>
              <TableHead>담당자</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {incomes.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={11}
                  className="h-24 text-center text-muted-foreground"
                >
                  표시할 정산 정보가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              incomes.map((income) => (
                <TableRow 
                  key={income.id} 
                  className="cursor-pointer hover:bg-secondary/20"
                  onClick={() => handleIncomeClick(income.id)}
                >
                  <TableCell className="font-medium text-primary underline">
                    {income.id}
                  </TableCell>
                  <TableCell>
                    {renderStatusBadge(income.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{income.shipperName}</span>
                      <span className="text-xs text-muted-foreground">{income.businessNumber}</span>
                    </div>
                  </TableCell>                  
                  <TableCell className="font-medium">
                    <div className="flex flex-col items-center">
                      <span className="text-md ">{getSchedule(income.startDate, income.endDate)}</span>
                      <span className="text-xs text-muted-foreground">{format(income.startDate, "(E)", { locale: ko })} - {format(income.endDate, "(E)", { locale: ko })}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {income.orderCount}건
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(income.totalBaseAmount)}원
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={income.totalAdditionalAmount >= 0 ? "text-blue-600" : "text-red-600"}>
                      {income.totalAdditionalAmount >= 0 ? "+" : ""}{formatCurrency(income.totalAdditionalAmount)}원
                    </span>
                  </TableCell>
                  <TableCell className="text-right pr-4">
                    {income.isTaxFree ? (
                      <Badge variant="outline" className="bg-gray-100">면세</Badge>
                    ) : (
                      `${formatCurrency(income.tax)}원`
                    )}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(income.finalAmount)}원
                  </TableCell>
                  <TableCell>
                    {renderInvoiceStatusBadge(income.invoiceStatus)}
                  </TableCell>
                  <TableCell>
                    {income.manager}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 페이지네이션 */}
      {incomes.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {totalPages > 0
              ? `페이지 ${currentPage} / ${totalPages}`
              : "데이터 없음"}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleFirstPage}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleLastPage}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 