"use client";

import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  
} from "@/components/ui/sheet";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  DollarSign, 
  FileText, 
  Package, 
  CheckCircle, 
  AlertCircle,
  
  Clock,
  Copy,
  Send,
  Truck
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useIncomeDetailStore } from "@/store/income-store";
import { IncomeStatusType, AdditionalFeeType } from "@/types/income";
import { IncomeAdditionalCost } from "./income-additional-cost";
import { IncomeStatusBadge } from "./income-status-badge";

export function IncomeDetailSheet() {
  const {
    isSheetOpen,
    closeSheet,
    incomeDetail,
    isLoading,
    error,
    updateStatus,
    setTaxFree
  } = useIncomeDetailStore();

  // 현재 선택된 탭
  const [activeTab, setActiveTab] = useState("details");
  
  // 추가금 추가/편집 모드
  const [isEditingAdditionalFee, setIsEditingAdditionalFee] = useState(false);
  
  // 문서 복사
  const handleCopyId = () => {
    if (incomeDetail?.id) {
      navigator.clipboard.writeText(incomeDetail.id);
      // 토스트 알림 추가 가능
    }
  };
  
  // 정산 상태 변경
  const handleStatusChange = (newStatus: IncomeStatusType) => {
    if (incomeDetail?.id) {
      updateStatus(newStatus);
    }
  };
  
  // 세금 면제 설정
  const handleTaxFreeChange = (value: boolean) => {
    if (incomeDetail?.id) {
      setTaxFree(value);
    }
  };
  
  // 세금계산서 발행하기
  const handleIssueInvoice = () => {
    // 세금계산서 발행 로직 구현
    console.log("세금계산서 발행:", incomeDetail?.id);
  };
  
  // 알림 메시지 전송
  const handleSendNotification = () => {
    // 알림 전송 로직 구현
    console.log("알림 전송:", incomeDetail?.id);
  };
  
  // 다음 단계로 진행
  const handleNextStatus = () => {
    if (!incomeDetail) return;
    
    if (incomeDetail.status === 'WAITING') {
      handleStatusChange('MATCHING');
    } else if (incomeDetail.status === 'MATCHING') {
      handleStatusChange('COMPLETED');
    }
  };
  
  // 페이지 내용 생성
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>오류 발생</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    if (!incomeDetail) {
      return (
        <Alert className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>정산 정보 없음</AlertTitle>
          <AlertDescription>선택된 정산 정보가 없습니다.</AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="space-y-6 py-6">
        {/* 정산 기본 정보 카드 */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-semibold">정산 정보</CardTitle>
              <div className="flex items-center space-x-2">
                <IncomeStatusBadge status={incomeDetail.status} />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyId}
                >
                  <Copy className="h-3.5 w-3.5 mr-1" />
                  복사
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 정산 기본 정보 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">정산번호</h4>
                <p className="text-sm font-semibold">{incomeDetail.id}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">화물 건수</h4>
                <p className="text-sm font-semibold">{incomeDetail.orderCount}건</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">화주명</h4>
                <p className="text-sm font-semibold">{incomeDetail.shipperName}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">사업자번호</h4>
                <p className="text-sm font-semibold">{incomeDetail.businessNumber}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">정산 시작일</h4>
                <p className="text-sm font-semibold">{incomeDetail.startDate}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">정산 종료일</h4>
                <p className="text-sm font-semibold">{incomeDetail.endDate}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">담당자</h4>
                <p className="text-sm font-semibold">{incomeDetail.manager}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">연락처</h4>
                <p className="text-sm font-semibold">{incomeDetail.managerContact || "-"}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">세금계산서 상태</h4>
                <p className="text-sm font-semibold">
                  {incomeDetail.invoiceStatus || "미발행"}
                  {incomeDetail.invoiceNumber && ` (${incomeDetail.invoiceNumber})`}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">면세 여부</h4>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="tax-free"
                    checked={incomeDetail.isTaxFree}
                    onCheckedChange={handleTaxFreeChange}
                    disabled={incomeDetail.status === 'COMPLETED'}
                  />
                  <Label htmlFor="tax-free" className="text-sm font-medium">
                    {incomeDetail.isTaxFree ? "면세" : "과세(10%)"}
                  </Label>
                </div>
              </div>
            </div>

            {/* 금액 정보 */}
            <div className="mt-6 space-y-4">
              <h3 className="text-base font-semibold">정산 금액 정보</h3>
              <div className="grid grid-cols-2 gap-4 px-3 py-2 bg-muted/50 rounded-md">
                <div>
                  <h4 className="text-sm text-muted-foreground">기본 운임 합계</h4>
                  <p className="text-sm font-medium">{formatCurrency(incomeDetail.totalBaseAmount)}원</p>
                </div>
                <div>
                  <h4 className="text-sm text-muted-foreground">추가금 합계</h4>
                  <p className={`text-sm font-medium ${incomeDetail.totalAdditionalAmount >= 0 ? "text-blue-600" : "text-red-600"}`}>
                    {incomeDetail.totalAdditionalAmount >= 0 ? "+" : ""}{formatCurrency(incomeDetail.totalAdditionalAmount)}원
                  </p>
                </div>
                <div>
                  <h4 className="text-sm text-muted-foreground">세금 ({incomeDetail.isTaxFree ? "면세" : "10%"})</h4>
                  <p className="text-sm font-medium">{formatCurrency(incomeDetail.tax)}원</p>
                </div>
                <div>
                  <h4 className="text-sm text-muted-foreground">총 청구금액</h4>
                  <p className="text-base font-semibold">{formatCurrency(incomeDetail.finalAmount)}원</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 탭 컨텐츠 */}
        <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="details">
              <Package className="h-4 w-4 mr-2" />
              정산 화물 목록
            </TabsTrigger>
            <TabsTrigger value="additionalFees">
              <DollarSign className="h-4 w-4 mr-2" />
              추가금 내역
            </TabsTrigger>
            <TabsTrigger value="logs">
              <Clock className="h-4 w-4 mr-2" />
              정산 로그
            </TabsTrigger>
          </TabsList>
          
          {/* 정산 화물 목록 탭 */}
          <TabsContent value="details" className="border rounded-md p-4">
            <div className="space-y-4">
              <h3 className="text-base font-semibold flex items-center">
                <Truck className="h-4 w-4 mr-2" />
                정산 포함 화물 ({incomeDetail.orderCount}건)
              </h3>
              
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-[100px]">화물 ID</TableHead>
                      <TableHead>출발지</TableHead>
                      <TableHead>도착지</TableHead>
                      <TableHead>차량</TableHead>
                      <TableHead className="text-right">운송비</TableHead>
                      <TableHead className="text-right">수수료</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {incomeDetail.orders ? (
                      incomeDetail.orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.id}</TableCell>
                          <TableCell>{order.departureLocation}</TableCell>
                          <TableCell>{order.arrivalLocation}</TableCell>
                          <TableCell>{order.vehicle.type} {order.vehicle.weight}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(order.chargeAmount || order.amount)}원
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(order.fee)}원
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center h-16 text-muted-foreground">
                          화물 상세 정보를 불러올 수 없습니다.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
          
          {/* 추가금 내역 탭 */}
          <TabsContent value="additionalFees" className="border rounded-md p-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-semibold flex items-center">
                  <DollarSign className="h-4 w-4 mr-2" />
                  추가금 내역 ({incomeDetail.additionalFees.length}건)
                </h3>
                
                {incomeDetail.status !== 'COMPLETED' && (
                  <Button 
                    size="sm" 
                    variant={isEditingAdditionalFee ? "secondary" : "outline"}
                    onClick={() => setIsEditingAdditionalFee(!isEditingAdditionalFee)}
                  >
                    {isEditingAdditionalFee ? "완료" : "추가금 편집"}
                  </Button>
                )}
              </div>
              
              {isEditingAdditionalFee ? (
                <IncomeAdditionalCost 
                  incomeId={incomeDetail.id} 
                  orderIds={incomeDetail.orderIds}
                />
              ) : (
                incomeDetail.additionalFees.length > 0 ? (
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead>유형</TableHead>
                          <TableHead>설명</TableHead>
                          <TableHead>대상 화물</TableHead>
                          <TableHead>등록자</TableHead>
                          <TableHead>등록일</TableHead>
                          <TableHead className="text-right">금액</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {incomeDetail.additionalFees.map((fee) => (
                          <TableRow key={fee.id}>
                            <TableCell>{fee.type}</TableCell>
                            <TableCell>{fee.description || "-"}</TableCell>
                            <TableCell>{fee.orderId || "전체"}</TableCell>
                            <TableCell>{fee.createdBy}</TableCell>
                            <TableCell>{fee.createdAt.split(' ')[0]}</TableCell>
                            <TableCell className={`text-right ${fee.amount >= 0 ? "text-blue-600" : "text-red-600"}`}>
                              {fee.amount >= 0 ? "+" : ""}{formatCurrency(fee.amount)}원
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-32 bg-muted/20 rounded-md">
                    <p className="text-muted-foreground">추가금 내역이 없습니다.</p>
                    {incomeDetail.status !== 'COMPLETED' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => setIsEditingAdditionalFee(true)}
                      >
                        <DollarSign className="h-3.5 w-3.5 mr-1" />
                        추가금 추가하기
                      </Button>
                    )}
                  </div>
                )
              )}
            </div>
          </TabsContent>
          
          {/* 정산 로그 탭 */}
          <TabsContent value="logs" className="border rounded-md p-4">
            <div className="space-y-4">
              <h3 className="text-base font-semibold flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                정산 히스토리
              </h3>
              
              <div className="space-y-2">
                {incomeDetail.logs.map((log, index) => (
                  <div 
                    key={index} 
                    className="flex items-start p-3 border rounded-md hover:bg-muted/20"
                  >
                    <div className="mr-4">
                      <IncomeStatusBadge status={log.status} size="sm" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{log.status}</span>
                        <span className="text-xs text-muted-foreground">
                          {log.date} {log.time}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-muted-foreground">처리자: {log.handler || "-"}</span>
                        {log.remark && (
                          <span className="text-xs">{log.remark}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* 작업 버튼 영역 */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="space-x-2">
            {/* 좌측 버튼들 */}
            {incomeDetail.status === 'COMPLETED' && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSendNotification}
              >
                <Send className="h-3.5 w-3.5 mr-1" />
                알림 발송
              </Button>
            )}
            
            {(incomeDetail.status === 'MATCHING' || incomeDetail.status === 'COMPLETED') && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleIssueInvoice}
                disabled={incomeDetail.invoiceStatus === '발행완료'}
              >
                <FileText className="h-3.5 w-3.5 mr-1" />
                세금계산서 발행
              </Button>
            )}
          </div>
          
          <div className="space-x-2">
            {/* 우측 버튼들 */}
            <Button variant="outline" size="sm" onClick={closeSheet}>
              닫기
            </Button>
            
            {incomeDetail.status !== 'COMPLETED' && (
              <Button size="sm" onClick={handleNextStatus}>
                <CheckCircle className="h-3.5 w-3.5 mr-1" />
                {incomeDetail.status === 'WAITING' ? '정산대사 전환' : '정산완료 처리'}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Sheet open={isSheetOpen} onOpenChange={(open) => !open && closeSheet()}>
      <SheetContent className="w-full max-w-3xl sm:max-w-3xl overflow-y-auto">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="text-xl flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-primary" />
            매출 정산 상세 정보
          </SheetTitle>
        </SheetHeader>
        
        {renderContent()}
      </SheetContent>
    </Sheet>
  );
} 