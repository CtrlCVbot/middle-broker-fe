"use client";

import React, { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart, 
  Building,
  CircleDollarSign, 
  FileText, 
  Plus, 
  PlusCircle, 
  TrendingUp, 
  Users 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { IBrokerOrder } from "@/types/broker-order";
import { Separator } from "@/components/ui/separator";

interface IncomeWaitingSummaryProps {
  selectedOrders: IBrokerOrder[];
  onCreateIncome: () => void;
}

export function IncomeWaitingSummary({
  selectedOrders,
  onCreateIncome
}: IncomeWaitingSummaryProps) {
  // 화주별 그룹화
  const shipperGroups = useMemo(() => {
    const groups = new Map<string, { count: number, total: number }>();
    
    selectedOrders.forEach(order => {
      const shipper = order.company || '미지정';
      if (!groups.has(shipper)) {
        groups.set(shipper, { count: 0, total: 0 });
      }
      
      const group = groups.get(shipper)!;
      group.count += 1;
      group.total += order.amount || 0;
    });
    
    return Array.from(groups.entries())
      .map(([shipper, data]) => ({ shipper, ...data }))
      .sort((a, b) => b.count - a.count); // 건수 내림차순 정렬
  }, [selectedOrders]);
  
  // 주요 화주 (가장 많은 건수)
  const mainShipper = shipperGroups.length > 0 ? shipperGroups[0].shipper : '';
  
  // 총계 계산
  const summaryData = useMemo(() => {
    return selectedOrders.reduce(
      (acc, order) => {
        acc.totalFreight += order.amount || 0;
        acc.totalDispatch += order.fee || 0;
        return acc;
      },
      { totalFreight: 0, totalDispatch: 0 }
    );
  }, [selectedOrders]);
  
  // 순수익 계산
  const netProfit = summaryData.totalFreight - summaryData.totalDispatch;
  
  // 화물이 없는 경우 렌더링하지 않음
  if (selectedOrders.length === 0) return null;
  
  return (
    <div className="bg-background fixed bottom-0 left-0 right-0 border-t shadow-md z-10">
      <div className="container mx-auto py-3 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6 flex-1">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">{selectedOrders.length}건</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">
                {shipperGroups.length === 1 ? (
                  <span className="font-medium">{mainShipper}</span>
                ) : (
                  <span>
                    <span className="font-medium">{mainShipper}</span>
                    <span className="text-muted-foreground"> 외 {shipperGroups.length - 1}개 업체</span>
                  </span>
                )}
              </span>
            </div>
            
            <Separator orientation="vertical" className="h-6" />
            
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">운송료</span>
                <span className="font-medium">{formatCurrency(summaryData.totalFreight)}원</span>
              </div>
              
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">배차료</span>
                <span className="font-medium">{formatCurrency(summaryData.totalDispatch)}원</span>
              </div>
              
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">순수익</span>
                <span className="font-bold text-primary">{formatCurrency(netProfit)}원</span>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={onCreateIncome}
            className="gap-1" 
            size="sm"
          >
            <PlusCircle className="h-4 w-4" />
            선택한 화물 정산하기
          </Button>
        </div>
      </div>
    </div>
  );
} 