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
import { IExpenditure, ExpenditureStatusType } from "@/types/expenditure";
import { formatCurrency } from "@/lib/utils";
import { useExpenditureDetailStore } from "@/store/expenditure-store";
import { Badge } from "@/components/ui/badge";

interface IExpenditureListProps {
  expenditures: IExpenditure[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onStatusChange?: (expenditureId: string, newStatus: ExpenditureStatusType) => void;
  onIssueInvoice?: (expenditureId: string) => void;
  onExportExcel?: (expenditureId: string) => void;
  currentTab?: ExpenditureStatusType; // 현재 선택된 탭
}

export function ExpenditureList({
  expenditures,
  currentPage,
  totalPages,
  onPageChange,
  onStatusChange,
  onIssueInvoice,
  onExportExcel,
  currentTab = "pending", // 기본값은 정산대기
}: IExpenditureListProps) {
  // 상세 정보 모달을 위한 스토어 액세스
  const { openSheet } = useExpenditureDetailStore();
  
  // 정산 상세 정보 열기
  const handleExpenditureClick = (expenditureId: string) => {
    openSheet(expenditureId);
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
  const renderStatusBadge = (status: ExpenditureStatusType) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-slate-100">정산대기</Badge>;
      case 'processing':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">정산대사</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-100">정산완료</Badge>;
      case 'cancelled':
        return <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100">정산취소</Badge>;
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
      case "processing":
        return "정산대사 상태";
      case "completed":
        return "정산완료 상태";
      default:
        return "상태";
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="w-[120px]">정산 ID</TableHead>
              <TableHead>{getStatusColumnName()}</TableHead>
              <TableHead>화주명</TableHead>
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
            {expenditures.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={11}
                  className="h-24 text-center text-muted-foreground"
                >
                  표시할 정산 정보가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              expenditures.map((expenditure) => (
                <TableRow 
                  key={expenditure.id} 
                  className="cursor-pointer hover:bg-secondary/20"
                  onClick={() => handleExpenditureClick(expenditure.id)}
                >
                  <TableCell className="font-medium text-primary underline">
                    {expenditure.id}
                  </TableCell>
                  <TableCell>
                    {renderStatusBadge(expenditure.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{expenditure.shipperName}</span>
                      <span className="text-xs text-muted-foreground">{expenditure.businessNumber}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{expenditure.startDate}</span>
                      <span>~</span>
                      <span>{expenditure.endDate}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {expenditure.orderCount}건
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(expenditure.totalBaseAmount || 0)}원
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={(expenditure.totalAdditionalAmount || 0) >= 0 ? "text-blue-600" : "text-red-600"}>
                      {(expenditure.totalAdditionalAmount || 0) >= 0 ? "+" : ""}{formatCurrency(expenditure.totalAdditionalAmount || 0)}원
                    </span>
                  </TableCell>
                  <TableCell className="text-right pr-4">
                    {expenditure.isTaxFree ? (
                      <Badge variant="outline" className="bg-gray-100">면세</Badge>
                    ) : (
                      `${formatCurrency(expenditure.tax || 0)}원`
                    )}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(expenditure.finalAmount || 0)}원
                  </TableCell>
                  <TableCell>
                    {renderInvoiceStatusBadge(expenditure.invoiceStatus)}
                  </TableCell>
                  <TableCell>
                    {expenditure.manager}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 페이지네이션 */}
      {expenditures.length > 0 && (
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