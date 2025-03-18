"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, CheckCircle, CreditCard, DollarSign, TrendingUp, ArrowDownUp, Clock } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface FeeInfo {
  estimated?: string | number;
  contracted?: string | number;
  discount?: string | number;
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
  
  const difference = calculateDifference();
  const isCompleted = status === "운송마감";
  
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
              {fee?.estimated ? `${formatCurrency(fee.estimated)}원` : "-"}
            </div>
          </div>
          
          {/* 확정 운임 (배차 완료 시에만 표시) */}
          {status !== "배차대기" && (
            <>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="text-muted-foreground">확정 운임</div>
                <div className="col-span-2 font-medium">
                  {fee?.contracted ? `${formatCurrency(fee.contracted)}원` : "-"}
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
                -{formatCurrency(fee.discount)}원
              </div>
            </div>
          )}
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
              <Badge variant={settlement?.status === "정산완료" ? "success" : "outline"}>
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