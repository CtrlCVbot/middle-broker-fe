"use client";

//react
import React from "react";

//ui
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
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

//types
import { IPurchase, PurchaseStatusType } from "@/types/purchase";


//store
import { useBrokerChargeStore } from "@/store/broker-charge-purchase-store";

//utils
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface BundleMatchingListProps {
  purchases: IPurchase[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  //onStatusChange?: (incomeId: string, newStatus: IncomeStatusType) => void;
  onIssueInvoice?: (incomeId: string) => void;
  onExportExcel?: (incomeId: string) => void;
  currentTab?: PurchaseStatusType; // 현재 선택된 탭
}

export function BundleMatchingList({
  purchases,
  currentPage,
  totalPages,
  onPageChange,
  //onStatusChange,
  onIssueInvoice,
  onExportExcel,
  currentTab,// = "MATCHING", // 기본값은 정산대사
}: BundleMatchingListProps) {
  

  // 정산 편집을 위한 broker charge store 액세스
  const { openSettlementFormForEdit } = useBrokerChargeStore();
  
  // 정산 상세 정보 열기 (기존 로직 - 참고용으로 유지)
  const handleIncomeClick = (incomeId: string) => {
    // 정산 편집 폼 열기로 변경
    openSettlementFormForEdit(incomeId);
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
  const renderStatusBadge = (status: PurchaseStatusType) => {
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
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-700">대기</Badge>;
      case '발행완료':
        return <Badge variant="outline" className="bg-green-100 text-green-700">발행</Badge>;
      case '발행오류':
        return <Badge variant="outline" className="bg-red-100 text-red-700">오류</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  const renderDepositStatusBadge = (date?: any) => {
    
    console.log('date:', date);
    if (date === undefined || date === null || date === '') {
      return <Badge variant="outline" className="bg-slate-100">미입금</Badge>;
    } else {
      return <Badge variant="outline" className="bg-green-100 text-green-700">완료</Badge>;
      
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

  console.log('purchases:', purchases);
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              {/* <TableHead className="w-[80px] text-center">그룹 ID</TableHead> */}
              <TableHead className="w-[80px] text-center">상태</TableHead>
              <TableHead>지급 차량</TableHead>
              <TableHead>정산 기간</TableHead>
              <TableHead className="text-center">화물 건수</TableHead>
              <TableHead className="text-right">기본 운임</TableHead>
              <TableHead className="text-right">세금(10%)</TableHead>
              <TableHead className="text-right">정산 추가금</TableHead>
              <TableHead className="text-right">총 청구금액</TableHead>
              <TableHead className="text-center">세금계산서</TableHead>
              <TableHead className="text-center">입금</TableHead>
              <TableHead>담당자</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchases.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={11}
                  className="h-24 text-center text-muted-foreground"
                >
                  표시할 정산 정보가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              purchases.map((purchase) => (
                <TableRow 
                  key={purchase.id} 
                  className="cursor-pointer hover:bg-secondary/20"
                  onClick={() => handleIncomeClick(purchase.id)}
                >
                  {/* <TableCell className="font-medium text-primary underline">
                    {income.id.slice(0, 8)}
                  </TableCell> */}
                  <TableCell className="text-center">
                    {renderStatusBadge(purchase.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{purchase.driverName}</span>
                      <span className="text-xs text-muted-foreground">{purchase.driverBusinessNumber}</span>
                    </div>
                  </TableCell>                  
                  <TableCell className="font-medium">
                    <div className="flex flex-col items-center">
                      <span className="text-md ">{getSchedule(purchase.startDate, purchase.endDate)}</span>
                      <span className="text-xs text-muted-foreground">{format(purchase.startDate, "(E)", { locale: ko })} - {format(purchase.endDate, "(E)", { locale: ko })}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {purchase.orderCount}건
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(purchase.totalBaseAmount)}원
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {purchase.isTaxFree ? (
                      <Badge variant="outline" className="bg-gray-100">면세</Badge>
                    ) : (
                      `${formatCurrency(purchase.tax)}원`
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={purchase.totalAdditionalAmount >= 0 ? "text-blue-600" : "text-red-600"}>
                      {purchase.totalAdditionalAmount >= 0 ? "+" : ""}{formatCurrency(purchase.totalAdditionalAmount)}원
                    </span>
                  </TableCell>
                  
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(purchase.finalAmount)}원
                  </TableCell>
                  <TableCell className="text-center">
                    {renderInvoiceStatusBadge(purchase.invoiceStatus)}
                  </TableCell>
                  <TableCell className="text-center">
                    {renderDepositStatusBadge(purchase.depositReceivedAt)}
                  </TableCell>
                  <TableCell>
                    {purchase.manager}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 페이지네이션 */}
      {purchases.length > 0 && (
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