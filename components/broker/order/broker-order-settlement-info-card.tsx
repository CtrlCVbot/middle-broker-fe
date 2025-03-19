"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  AlertTriangle, 
  CheckCircle, 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  ArrowDownUp, 
  Clock, 
  Plus, 
  Building, 
  Factory, 
  ReceiptIcon, 
  TicketCheck,
  ChevronDown
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

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
  // 상태 변수 추가 - 접이식 UI 제어
  const [summaryOpen, setSummaryOpen] = useState(false); // 기본적으로 접혀있게 설정
  const [additionalFeesOpen, setAdditionalFeesOpen] = useState(false); // 추가금 상세 모달 상태
  
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
    <div className="space-y-4">
      {/* 운임 요약 카드 */}
      <div className="overflow-hidden mb-4">
        {/* 헤더 - 항상 표시 */}
        <div className="bg-card">
          {/* 카드 제목과 토글 버튼 */}
          <div className="flex justify-between items-center mb-4 cursor-pointer"
              onClick={() => setSummaryOpen(!summaryOpen)}>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <h4 className="font-medium">운임 요약</h4>
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform ${summaryOpen ? 'transform rotate-180' : ''}`} />
          </div>
          
          {/* 간략 정보 - 항상 표시 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">화주 청구 금액</div>
              <div className="text-xl font-bold text-primary">
                {fee?.estimated ? formatCurrency(parseAmount(fee.estimated)) : 0}원
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">차주 배차 금액</div>
              <div className="text-xl font-bold text-muted-foreground">
                {fee?.baseAmount ? formatCurrency(parseAmount(fee.baseAmount)) : 0}원
                {fee?.baseAmount && fee?.estimated && parseAmount(fee.baseAmount) < parseAmount(fee.estimated) && (
                  <span className="text-sm text-muted-foreground ml-2">
                    ({Math.round((parseAmount(fee.baseAmount) / parseAmount(fee.estimated) * 100) - 100)}%)
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between">
              <div className="text-sm text-muted-foreground">예상 마진</div>
              <div className={`text-xl font-bold ${profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                {profit >= 0 ? "+" : ""}{formatCurrency(profit)}원
              </div>
            </div>
          </div>
        </div>
        
        {/* 상세 정보 - 펼쳤을 때만 표시 */}
        {summaryOpen && (
          <div className="p-4 space-y-6 border-t">
            {/* 화주 청구 금액 상세 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-primary" />
                <h4 className="font-medium">화주 청구 금액 상세</h4>
              </div>
              
              <div className="space-y-3 pl-6">
                {/* 기본 운임 */}
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="text-muted-foreground">기본 운임</div>
                  <div className="col-span-2 font-medium">
                    {fee?.estimated ? formatCurrency(parseAmount(fee.estimated)) : 0}원
                  </div>
                </div>
                
                {/* 추가금 항목 - 화주 항목만 필터링 */}
                {additionalFees.filter(fee => fee.target.charge).length > 0 && (
                  <>
                    <div className="text-sm text-muted-foreground">추가금 항목</div>
                    <div className="pl-4 space-y-2">
                      {additionalFees.filter(fee => fee.target.charge).map(fee => (
                        <div key={fee.id} className="grid grid-cols-3 gap-2 text-sm">
                          <div>{fee.type}</div>
                          <div className="col-span-2">{displayAmount(fee.amount)}</div>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm font-medium border-t pt-2">
                      <div className="text-muted-foreground">총 추가금</div>
                      <div className="col-span-2">
                        {formatCurrency(additionalFees.filter(fee => fee.target.charge).reduce((sum, fee) => {
                          const feeAmount = typeof fee.amount === 'string' ? Number(fee.amount.replace(/,/g, '')) : fee.amount;
                          return sum + feeAmount;
                        }, 0))}원
                      </div>
                    </div>
                  </>
                )}
                
                {/* 세금 (미구현 상태) */}
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="text-muted-foreground">세금(10%)</div>
                  <div className="col-span-2 font-medium text-muted-foreground">
                    <span className="italic">미적용</span>
                  </div>
                </div>
                
                {/* 최종 청구 금액 */}
                <div className="grid grid-cols-3 gap-2 text-lg font-bold border-t pt-3">
                  <div>최종 청구 금액</div>
                  <div className="col-span-2 text-primary">
                    {displayAmount(chargeTotal)}
                  </div>
                </div>
              </div>
            </div>
            
            {/* 차주 배차 금액 상세 */}
            <div className="space-y-3 mt-6">
              <div className="flex items-center gap-2">
                <Factory className="h-4 w-4 text-primary" />
                <h4 className="font-medium">차주 배차 금액 상세</h4>
              </div>
              
              <div className="space-y-3 pl-6">
                {/* 기본 배차 운임 */}
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="text-muted-foreground">기본 배차 운임</div>
                  <div className="col-span-2 font-medium">
                    {fee?.baseAmount ? displayAmount(fee.baseAmount) : "-"}
                  </div>
                </div>
                
                {/* 추가금 (통합) - 배차 항목만 필터링 */}
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="text-muted-foreground">추가금 (통합)</div>
                  <div className="col-span-2 font-medium">
                    {formatCurrency(additionalFees.filter(fee => fee.target.dispatch).reduce((sum, fee) => {
                      const feeAmount = typeof fee.amount === 'string' ? Number(fee.amount.replace(/,/g, '')) : fee.amount;
                      return sum + feeAmount;
                    }, 0))}원
                    
                    {/* 추가금 상세 버튼 */}
                    {additionalFees.filter(fee => fee.target.dispatch).length > 0 && (
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="p-0 h-auto ml-2 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAdditionalFeesOpen(true);
                        }}
                      >
                        상세보기
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* 세금 (미구현 상태) */}
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="text-muted-foreground">세금(10%)</div>
                  <div className="col-span-2 font-medium text-muted-foreground">
                    <span className="italic">미적용</span>
                  </div>
                </div>
                
                {/* 최종 배차 금액 */}
                <div className="grid grid-cols-3 gap-2 text-lg font-bold border-t pt-3">
                  <div>최종 배차 금액</div>
                  <div className="col-span-2">
                    {displayAmount(dispatchTotal)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Separator />
     
      
      
    </div>
  );
} 