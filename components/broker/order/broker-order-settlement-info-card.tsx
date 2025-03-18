"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, CheckCircle, CreditCard, DollarSign, TrendingUp, ArrowDownUp, Clock, Plus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

// 추가금 타입 및 대상 정의
type AdditionalFeeType = "대기" | "경유" | "수작업" | "왕복" | "톨비" | "수수료" | "현장착불";
type AdditionalFeeTarget = {
  charge: boolean;
  dispatch: boolean;
};

// 추가금 인터페이스
interface IAdditionalFee {
  id: string;
  type: AdditionalFeeType;
  amount: number | string;
  memo: string;
  target: AdditionalFeeTarget;
}

interface FeeInfo {
  estimated?: string | number;
  contracted?: string | number;
  discount?: string | number;
  baseAmount?: string | number;
  chargeAmount?: string | number;
  additionalFees?: IAdditionalFee[];
  dispatchTotal?: number;
  chargeTotal?: number;
  profit?: number;
}

interface SettlementInfo {
  id?: string;
  status?: string;
  dueDate?: string;
  completedDate?: string;
  method?: string;
}

interface BrokerOrderSettlementInfoCardProps {
  fee?: FeeInfo;
  settlement?: SettlementInfo;
  status: string;
}

export function BrokerOrderSettlementInfoCard({ fee, settlement, status }: BrokerOrderSettlementInfoCardProps) {
  // 예상 금액과 계약 금액 차이 계산
  const calculateDifference = () => {
    if (!fee?.estimated || !fee?.contracted) return 0;
    
    const estimated = typeof fee.estimated === 'number' 
      ? fee.estimated 
      : parseInt(fee.estimated.replace(/[^\d]/g, ''), 10);
      
    const contracted = typeof fee.contracted === 'number'
      ? fee.contracted
      : parseInt(fee.contracted.replace(/[^\d]/g, ''), 10);
    
    return contracted - estimated;
  };
  
  // 배차 총액, 청구 총액, 수익 계산
  const dispatchTotal = fee?.dispatchTotal || 0;
  const chargeTotal = fee?.chargeTotal || 0;
  const profit = fee?.profit || (chargeTotal - dispatchTotal);
  
  // 추가금 목록 가져오기
  const additionalFees = fee?.additionalFees || [];
  
  const difference = calculateDifference();
  const isCompleted = status === "운송마감";
  
  // 금액 표시 헬퍼 함수
  const displayAmount = (amount?: number | string) => {
    if (!amount) return "-";
    
    const numAmount = typeof amount === 'string' ? 
      Number(amount.replace(/,/g, '')) : amount;
    
    const isNegative = numAmount < 0;
    const absAmount = Math.abs(numAmount);
    
    return (
      <span className={isNegative ? "text-red-600" : ""}>
        {isNegative ? "-" : ""}{formatCurrency(absAmount)}원
      </span>
    );
  };
  
  // 문자열 또는 숫자를 숫자로 변환하는 함수
  const parseAmount = (amount?: string | number): number => {
    if (!amount) return 0;
    return typeof amount === 'string' 
      ? parseInt(amount.replace(/[^\d]/g, ''), 10)
      : amount;
  };
  
  return (
    <div className="space-y-6">
      {/* 운임 정보 */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="h-4 w-4 text-primary" />
          <h4 className="font-medium">운임 정보</h4>
        </div>
        
        <div className="space-y-4">
          {/* 예상 운임 */}
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="text-muted-foreground">예상 운임</div>
            <div className="col-span-2 font-medium">
              {fee?.estimated ? `${formatCurrency(parseAmount(fee.estimated))}원` : "-"}
            </div>
          </div>
          
          {/* 배차금 */}
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="text-muted-foreground">배차금</div>
            <div className="col-span-2 font-medium">
              {fee?.baseAmount ? displayAmount(fee.baseAmount) : "-"}
            </div>
          </div>
          
          {/* 청구금 */}
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="text-muted-foreground">청구금</div>
            <div className="col-span-2 font-medium">
              {fee?.chargeAmount ? displayAmount(fee.chargeAmount) : "-"}
            </div>
          </div>
          
          {/* 확정 운임 (배차 완료 시에만 표시) */}
          {status !== "배차대기" && (
            <>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="text-muted-foreground">확정 운임</div>
                <div className="col-span-2 font-medium">
                  {fee?.contracted ? `${formatCurrency(parseAmount(fee.contracted))}원` : "-"}
                </div>
              </div>
              
              {/* 차액 표시 */}
              {difference !== 0 && (
                <div className="flex items-center gap-2 text-sm mt-2">
                  <ArrowDownUp className="h-3 w-3" />
                  <span className={cn(
                    difference > 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {difference > 0 ? "+" : ""}{formatCurrency(difference)}원
                  </span>
                  <span className="text-muted-foreground">
                    ({difference > 0 ? "증가" : "감소"})
                  </span>
                </div>
              )}
            </>
          )}
          
          {/* 할인 금액 (있는 경우만 표시) */}
          {fee?.discount && parseInt(fee.discount.toString()) > 0 && (
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="text-muted-foreground">할인 금액</div>
              <div className="col-span-2 font-medium text-red-600">
                -{formatCurrency(parseAmount(fee.discount))}원
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Separator />
      
      {/* 추가금 정보 */}
      {additionalFees.length > 0 && (
        <>
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Plus className="h-4 w-4 text-primary" />
              <h4 className="font-medium">추가금 정보</h4>
            </div>
            
            <div className="border rounded-md overflow-hidden mb-4">
              <div className="grid grid-cols-10 gap-0 bg-muted/20 p-2 text-sm font-medium border-b">
                <div className="col-span-2">타입</div>
                <div className="col-span-2 text-right">금액</div>
                <div className="col-span-2">대상</div>
                <div className="col-span-4">메모</div>
              </div>
              
              <ScrollArea className="max-h-[200px]">
                {additionalFees.map((fee) => (
                  <div 
                    key={fee.id} 
                    className="grid grid-cols-10 gap-0 p-2 text-sm border-b hover:bg-muted/10"
                  >
                    <div className="col-span-2 flex items-center">
                      <Badge variant="outline">{fee.type}</Badge>
                    </div>
                    <div className="col-span-2 text-right flex items-center justify-end">
                      {displayAmount(fee.amount)}
                    </div>
                    <div className="col-span-2 flex items-center">
                      <div className="flex gap-1">
                        <Badge variant={fee.target.charge ? "secondary" : "outline"}>
                          청구
                        </Badge>
                        <Badge variant={fee.target.dispatch ? "default" : "outline"}>
                          배차
                        </Badge>
                      </div>
                    </div>
                    <div className="col-span-4 flex items-center truncate">
                      {fee.memo}
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </div>
          </div>
          
          <Separator />
        </>
      )}
      
      {/* 금액 요약 */}
      <div className="bg-muted/10 p-4 rounded-md space-y-4">
        {/* 배차 총액 */}
        <div className="flex justify-between items-center">
          <div className="text-sm font-medium">배차 총액</div>
          <div className="text-lg font-bold">
            {displayAmount(dispatchTotal)}
          </div>
        </div>
        
        {/* 청구 총액 */}
        <div className="flex justify-between items-center">
          <div className="text-sm font-medium">청구 총액</div>
          <div className="text-lg font-bold">
            {displayAmount(chargeTotal)}
          </div>
        </div>
        
        {/* 구분선 */}
        <Separator />
        
        {/* 수익 */}
        <div className="flex justify-between items-center">
          <div className="text-sm font-medium">수익 (청구-배차)</div>
          <div className={`text-lg font-bold ${profit >= 0 ? "text-green-600" : "text-red-600"}`}>
            {profit >= 0 ? "+" : ""}{formatCurrency(profit)}원
          </div>
        </div>
      </div>
      
      <Separator />
      
      {/* 정산 정보 */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h4 className="font-medium">정산 정보</h4>
        </div>
        
        <div className="space-y-4">
          {/* 정산 상태 */}
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="text-muted-foreground">정산 상태</div>
            <div className="col-span-2">
              <Badge variant={settlement?.status === "정산완료" ? "default" : "outline"}>
                {settlement?.status || "정산대기"}
              </Badge>
            </div>
          </div>
          
          {/* 정산 방식 */}
          {settlement?.method && (
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="text-muted-foreground">정산 방식</div>
              <div className="col-span-2 font-medium">
                {settlement.method}
              </div>
            </div>
          )}
          
          {/* 정산 예정일 */}
          {settlement?.dueDate && (
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="text-muted-foreground">정산 예정일</div>
              <div className="col-span-2 font-medium flex items-center gap-2">
                {!isCompleted && <Clock className="h-3 w-3 text-muted-foreground" />}
                {settlement.dueDate}
              </div>
            </div>
          )}
          
          {/* 정산 완료일 */}
          {settlement?.completedDate && (
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="text-muted-foreground">정산 완료일</div>
              <div className="col-span-2 font-medium">
                {settlement.completedDate}
              </div>
            </div>
          )}
          
          {/* 운송 진행 상태 표시 */}
          {!isCompleted && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span>배차대기</span>
                <span>운송마감</span>
              </div>
              <Progress 
                value={status === "배차대기" ? 0 : 
                       status === "배차완료" ? 25 : 
                       status === "상차완료" ? 50 : 
                       status === "운송중" ? 75 : 90} 
                className="h-2"
              />
              <div className="text-xs text-center text-muted-foreground mt-1">
                현재: <span className="font-medium">{status}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 