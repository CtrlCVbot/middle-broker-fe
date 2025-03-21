"use client";

import React, { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users } from "lucide-react";
import { formatCurrency } from "../../../utils/format";
import { IBrokerOrder } from "@/types/broker-order";

interface IShipperGroup {
  companyId: string;
  companyName: string;
  orders: IBrokerOrder[];
  count: number;
  totalFreight: number;
  totalDispatch: number;
  totalProfit: number;
}

interface IncomeWaitingSummaryProps {
  selectedOrders: IBrokerOrder[];
  onCreateIncome: () => void;
}

const IncomeWaitingSummary: React.FC<IncomeWaitingSummaryProps> = ({
  selectedOrders,
  onCreateIncome,
}) => {
  // 선택된 화물이 없으면 표시하지 않음
  if (!selectedOrders || selectedOrders.length === 0) {
    return null;
  }

  // 화주별 그룹화된 데이터 계산
  const shipperGroups = useMemo(() => {
    const groups: Record<string, IShipperGroup> = {};

    selectedOrders.forEach((order) => {
      const companyId = order.company || "미지정";
      const companyName = order.company || "미지정";

      if (!groups[companyId]) {
        groups[companyId] = {
          companyId,
          companyName,
          orders: [],
          count: 0,
          totalFreight: 0,
          totalDispatch: 0,
          totalProfit: 0,
        };
      }

      const freight = order.amount || 0;
      const dispatch = order.fee || 0;
      const profit = freight - dispatch;

      groups[companyId].orders.push(order);
      groups[companyId].count += 1;
      groups[companyId].totalFreight += freight;
      groups[companyId].totalDispatch += dispatch;
      groups[companyId].totalProfit += profit;
    });

    return Object.values(groups);
  }, [selectedOrders]);

  // 전체 선택된 화물의 합계 계산
  const totals = useMemo(() => {
    return shipperGroups.reduce(
      (acc, group) => {
        acc.totalOrders += group.count;
        acc.totalFreight += group.totalFreight;
        acc.totalDispatch += group.totalDispatch;
        acc.totalProfit += group.totalProfit;
        return acc;
      },
      { totalOrders: 0, totalFreight: 0, totalDispatch: 0, totalProfit: 0 }
    );
  }, [shipperGroups]);

  return (
    <div className="bg-background sticky bottom-0 border-t shadow-md z-10 mt-4">
      <div className="container py-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">선택된 화물 정산 요약</h3>
            <Button onClick={onCreateIncome} className="gap-1">
              <PlusCircle className="h-4 w-4" />
              선택한 화물 정산하기
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
            {shipperGroups.map((group) => (
              <Card key={group.companyId} className="border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="font-medium">{group.companyName}</span>
                    <span className="text-sm text-muted-foreground">
                      ({group.count}건)
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-sm">
                    <div className="text-muted-foreground">운송비</div>
                    <div className="text-right">
                      {formatCurrency(group.totalFreight)}원
                    </div>
                    <div className="text-muted-foreground">배차비</div>
                    <div className="text-right">
                      {formatCurrency(group.totalDispatch)}원
                    </div>
                    <div className="text-muted-foreground font-medium">수익</div>
                    <div className="text-right font-medium">
                      {formatCurrency(group.totalProfit)}원
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-muted/30 border">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">전체 합계</span>
                  <span className="text-sm text-muted-foreground">
                    (총 {totals.totalOrders}건)
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm sm:flex sm:items-center">
                  <div>
                    <span className="text-muted-foreground mr-2">운송비:</span>
                    <span className="font-medium">
                      {formatCurrency(totals.totalFreight)}원
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground mr-2">배차비:</span>
                    <span className="font-medium">
                      {formatCurrency(totals.totalDispatch)}원
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground mr-2">수익:</span>
                    <span className="font-medium">
                      {formatCurrency(totals.totalProfit)}원
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default IncomeWaitingSummary; 