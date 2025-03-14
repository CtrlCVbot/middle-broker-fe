"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, CheckCircle, CreditCard } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface SettlementInfo {
  id?: string;
  status?: string;
}

interface BrokerOrderSettlementInfoCardProps {
  amount: string;
  fee: string;
  requestedAmount: string;
  settlement?: SettlementInfo;
}

export function BrokerOrderSettlementInfoCard({ 
  amount, 
  fee, 
  requestedAmount, 
  settlement 
}: BrokerOrderSettlementInfoCardProps) {
  // 문자열 금액을 숫자로 변환 (콤마 제거)
  const amountNumber = parseInt(amount.replace(/,/g, ''), 10) || 0;
  const feeNumber = parseInt(fee.replace(/,/g, ''), 10) || 0;
  const requestedAmountNumber = parseInt(requestedAmount.replace(/,/g, ''), 10) || 0;
  
  // 정산 금액 계산
  const settlementAmount = amountNumber - feeNumber;
  
  // 요청 견적금과 배차 금액의 차이 계산
  const amountDifference = amountNumber - requestedAmountNumber;
  const isAmountHigher = amountNumber > requestedAmountNumber;
  const differencePercentage = requestedAmountNumber > 0 
    ? Math.round((Math.abs(amountDifference) / requestedAmountNumber) * 100) 
    : 0;
  
  return (
    <div className="space-y-4">
          {/* 요청 견적금 vs 배차 금액 비교 */}
          <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" />
            <h4 className="font-medium">견적 비교</h4>
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="text-muted-foreground">요청 견적금</div>
            <div className="col-span-2 font-medium">{formatCurrency(requestedAmountNumber)}원</div>
            
            <div className="text-muted-foreground">배차 금액</div>
            <div className="col-span-2 font-medium">{formatCurrency(amountNumber)}원</div>
            
            <div className="text-muted-foreground">차액</div>
            <div className={`col-span-2 font-medium flex items-center gap-1 ${
              isAmountHigher ? 'text-red-500' : 'text-green-500'
            }`}>
              {isAmountHigher ? (
                <>
                  <AlertTriangle className="h-3.5 w-3.5" />
                  +{formatCurrency(Math.abs(amountDifference))}원 ({differencePercentage}% 증가)
                </>
              ) : (
                <>
                  <CheckCircle className="h-3.5 w-3.5" />
                  -{formatCurrency(Math.abs(amountDifference))}원 ({differencePercentage}% 감소)
                </>
              )}
            </div>
          </div>
          
          {isAmountHigher && differencePercentage > 10 && (
            <div className="bg-red-50 p-2 rounded-md text-sm text-red-700 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p>
                배차 금액이 요청 견적금보다 {differencePercentage}% 높습니다. 
                화주와 금액 조정이 필요할 수 있습니다.
              </p>
            </div>
          )}
          </div>
          
          {/* 분리선 */}
          <Separator className="my-4" />
          
          {/* 정산 정보 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              <h4 className="font-medium">정산 정보</h4>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-sm">
              {settlement?.status && (
                <>
                  <div className="text-muted-foreground">정산 상태</div>
                  <div className="col-span-2 font-medium">
                    <Badge 
                      variant={settlement.status === "정산완료" ? "default" : "outline"}
                      className={settlement.status === "정산완료" ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
                    >
                      {settlement.status}
                    </Badge>
                  </div>
                </>
              )}
              
              {settlement?.id && (
                <>
                  <div className="text-muted-foreground">정산 번호</div>
                  <div className="col-span-2 font-medium">{settlement.id}</div>
                </>
              )}
              
              <div className="text-muted-foreground">운송비</div>
              <div className="col-span-2 font-medium">{formatCurrency(amountNumber)}원</div>
              
              <div className="text-muted-foreground">수수료</div>
              <div className="col-span-2 font-medium">{formatCurrency(feeNumber)}원</div>
              
              <div className="text-muted-foreground">정산 금액</div>
              <div className="col-span-2 font-medium text-primary">
                {formatCurrency(settlementAmount)}원
              </div>
            </div>
          </div>
          
          {/* 분리선 */}
          <Separator className="my-4" />

          {/* 추가 정산 내역 (대기료, 경유비, 톨비 등) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" />
                <h4 className="font-medium">추가 정산 내역</h4>
              </div>
              <Badge variant="outline" className="text-xs">
                없음
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground">
              현재 등록된 추가 정산 내역이 없습니다.
            </p>
          </div>
        
    </div>
  );
} 