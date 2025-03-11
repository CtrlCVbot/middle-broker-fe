"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ISettlement } from "@/types/settlement";
import { useSettlementStore } from "@/store/settlement-store";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, FileText, ArrowLeft, Download, Printer } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

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

// 상태 뱃지 정의
const getStatusBadge = (status: string) => {
  switch (status) {
    case "COMPLETED":
      return <Badge className="bg-green-500">완료</Badge>;
    case "PENDING":
      return <Badge className="bg-yellow-500">미완료</Badge>;
    default:
      return <Badge className="bg-gray-500">알 수 없음</Badge>;
  }
};

interface SettlementDetailProps {
  settlementId: string;
}

export function SettlementDetail({ settlementId }: SettlementDetailProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { 
    selectedSettlement, 
    loading, 
    updateSettlementStatus, 
    fetchSettlementById,
    downloadExcel,
    downloadPdf
  } = useSettlementStore();
  
  // 컴포넌트 마운트 시 정산 상세 데이터 조회
  useEffect(() => {
    if (!selectedSettlement || selectedSettlement.id !== settlementId) {
      fetchSettlementById(settlementId);
    }
  }, [settlementId, selectedSettlement, fetchSettlementById]);
  
  // 정산 완료 처리
  const handleCompleteSettlement = async () => {
    if (!selectedSettlement) return;
    
    setIsSubmitting(true);
    try {
      await updateSettlementStatus(settlementId, "COMPLETED");
      toast.success("정산이 완료 처리되었습니다.");
    } catch (error) {
      console.error('정산 완료 처리 중 오류 발생:', error);
      toast.error("정산 완료 처리 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 목록으로 이동
  const handleGoBack = () => {
    router.push('/settlement/list');
  };
  
  // 엑셀 다운로드
  const handleDownloadExcel = async () => {
    await downloadExcel();
  };
  
  // PDF 다운로드
  const handleDownloadPdf = async () => {
    await downloadPdf();
  };
  
  // 로딩 상태
  if (loading.detail || !selectedSettlement) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-10 w-48" />
      </div>
    );
  }
  
  // 정산 요약 정보
  const settlement = selectedSettlement;
  const totalTransportFee = settlement.items.reduce((sum, item) => sum + item.transportFee, 0);
  const totalAdditionalFee = settlement.items.reduce((sum, item) => sum + item.additionalFee, 0);
  const totalDiscount = settlement.items.reduce((sum, item) => sum + item.discount, 0);
  const totalTax = settlement.items.reduce((sum, item) => sum + item.tax, 0);
  
  return (
    <div className="space-y-6">
      {/* 상단 제어 버튼 */}
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={handleGoBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          정산 목록으로
        </Button>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleDownloadExcel}>
            <Download className="mr-2 h-4 w-4" />
            엑셀 다운로드
          </Button>
          <Button variant="outline" onClick={handleDownloadPdf}>
            <Printer className="mr-2 h-4 w-4" />
            PDF 출력
          </Button>
        </div>
      </div>
      
      {/* 정산 요약 정보 */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">정산 내역 #{settlement.id}</CardTitle>
              <CardDescription>
                {formatDate(settlement.startDate)} ~ {formatDate(settlement.endDate)}
              </CardDescription>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <div className="flex items-center space-x-2">
                <span>정산 상태:</span>
                {getStatusBadge(settlement.status)}
              </div>
              {settlement.status === "PENDING" && (
                <Button 
                  size="sm"
                  onClick={handleCompleteSettlement}
                  disabled={isSubmitting}
                >
                  <Check className="mr-2 h-4 w-4" />
                  정산 완료 처리
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-medium mb-2">업체 정보</h3>
              <div className="border rounded-md p-4 bg-muted/20">
                <p className="text-lg font-semibold">{settlement.companyName}</p>
                <p className="text-sm text-muted-foreground">요청일: {formatDate(settlement.requestDate)}</p>
                {settlement.completedDate && (
                  <p className="text-sm text-muted-foreground">완료일: {formatDate(settlement.completedDate)}</p>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2">정산 요약</h3>
              <div className="border rounded-md p-4 bg-muted/20">
                <div className="flex justify-between items-center mb-2">
                  <span>총 운송 비용:</span>
                  <span>{formatCurrency(totalTransportFee)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span>추가 비용:</span>
                  <span>{formatCurrency(totalAdditionalFee)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span>할인:</span>
                  <span>- {formatCurrency(totalDiscount)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span>세금:</span>
                  <span>{formatCurrency(totalTax)}</span>
                </div>
                <div className="flex justify-between items-center font-semibold border-t pt-2 mt-2">
                  <span>총 정산 금액:</span>
                  <span className="text-lg">{formatCurrency(settlement.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* 정산 상세 명세서 */}
          <h3 className="text-lg font-medium mb-4">정산 상세 명세서</h3>
          <div className="rounded-md border overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>화물 ID</TableHead>
                  <TableHead>운송 날짜</TableHead>
                  <TableHead>운전기사</TableHead>
                  <TableHead>운송료</TableHead>
                  <TableHead>추가 비용</TableHead>
                  <TableHead>할인</TableHead>
                  <TableHead>세금</TableHead>
                  <TableHead className="text-right">총액</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {settlement.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.orderId}</TableCell>
                    <TableCell>{formatDate(item.orderDate)}</TableCell>
                    <TableCell>
                      <div>
                        <div>{item.driverName}</div>
                        <div className="text-xs text-muted-foreground">{item.vehicleNumber}</div>
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(item.transportFee)}</TableCell>
                    <TableCell>{formatCurrency(item.additionalFee)}</TableCell>
                    <TableCell>{item.discount > 0 ? `- ${formatCurrency(item.discount)}` : '-'}</TableCell>
                    <TableCell>{formatCurrency(item.tax)}</TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(item.totalAmount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableRow className="bg-muted/20">
                <TableCell colSpan={3} className="font-bold">총계</TableCell>
                <TableCell className="font-bold">{formatCurrency(totalTransportFee)}</TableCell>
                <TableCell className="font-bold">{formatCurrency(totalAdditionalFee)}</TableCell>
                <TableCell className="font-bold">{totalDiscount > 0 ? `- ${formatCurrency(totalDiscount)}` : '-'}</TableCell>
                <TableCell className="font-bold">{formatCurrency(totalTax)}</TableCell>
                <TableCell className="text-right font-bold">{formatCurrency(settlement.totalAmount)}</TableCell>
              </TableRow>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-6">
          <div className="w-full text-right">
            <p className="text-sm text-muted-foreground">
              정산 ID: {settlement.id} | 정산 기간: {formatDate(settlement.startDate)} - {formatDate(settlement.endDate)}
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
} 