"use client";

//react
import React, { useMemo } from "react";

//ui
import { Button } from "@/components/ui/button";
import { Building, PlusCircle, Users } from "lucide-react";

//utils
import { formatCurrency } from "@/lib/utils";

//types
import { IBrokerOrder } from "@/types/broker-order";

interface IShipperGroup {
  companyId: string;
  companyName: string;
  orders: IBrokerOrder[];
  count: number;
  totalFreight: number;
  totalTax: number;
  totalDispatch: number;
  totalProfit: number;
}

interface WaitingSummaryProps {
  selectedOrders: IBrokerOrder[];
  onCreateIncome: () => void;
}

const WaitingSummary: React.FC<WaitingSummaryProps> = ({
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
          totalTax: 0,
          totalDispatch: 0,
          totalProfit: 0,
        };
      }

      const freight = Number(order.amount) || 0;
      const dispatch = Number(order.fee) || 0;
      const tax = Number(order.amount * 0.1) || 0;
      const profit = freight - dispatch - tax;

      groups[companyId].orders.push(order);
      groups[companyId].count += 1;
      groups[companyId].totalFreight += freight;
      console.log("groups[companyId].totalFreight", groups[companyId].totalFreight);
      groups[companyId].totalTax += tax;
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
        acc.totalTax += group.totalTax;
        acc.totalDispatch += group.totalDispatch;
        acc.totalProfit += group.totalProfit;
        return acc;
      },
      { totalOrders: 0, totalFreight: 0, totalTax: 0, totalDispatch: 0, totalProfit: 0 }
    );
  }, [shipperGroups]);

  return (
    <div className="bg-background sticky border shadow-md z-10 mt-4 rounded-lg p-4">
      <div className="container py-1">
        {/* 헤더 영역 */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium hidden sm:inline-block">선택 정산 요약</h3>
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
              총 {totals.totalOrders}건
            </span>
          </div>
          <Button onClick={onCreateIncome} size="sm" className="gap-1 h-8">
            <PlusCircle className="h-3 w-3" />
            <span className="hidden sm:inline-block">선택된 화물 그룹 정산하기</span>
          </Button>
        </div>

        {/* 컨텐츠 영역 */}
        <div className="flex flex-row h-[105px]">
          {/* 왼쪽: 업체별 카드들 (스크롤 가능) */}
          <div className="flex-grow overflow-x-auto hide-scrollbar pr-2 border-r">
            <div className="flex gap-2 min-w-max pb-0.5">
              {shipperGroups.map((group) => (
                <div 
                  key={group.companyId} 
                  className="border-dashed border-2 border-gray-400 rounded-md flex-shrink-0 w-[170px] sm:w-[190px] md:w-[200px] bg-card p-2.5 hover:shadow transition-shadow duration-150"
                >
                  <div className="flex items-center gap-1 mb-1.5">
                    <Building className="h-3 w-3 text-gray-500" />
                    <span className="font-medium text-xs sm:text-sm truncate">{group.companyName}</span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      ({group.count})
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-y-1 gap-x-2 text-xs">
                    <div className="text-muted-foreground font-medium">주선</div>
                    <div className="text-right font-medium">
                      {formatCurrency(group.totalFreight)}원
                    </div>
                    <div className="text-muted-foreground">세금</div>
                    <div className="text-right text-muted-foreground">
                      {formatCurrency(group.totalTax)}원
                    </div>
                    <div className="text-muted-foreground font-semibold">청구</div>
                    <div className="text-right font-semibold text-blue-800">
                      {formatCurrency(group.totalFreight + group.totalTax)}원
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 오른쪽: 전체 합계 */}
          <div className="w-[160px] sm:w-[190px] md:w-[220px] lg:w-[250px] xl:w-[350px] flex-shrink-0 pl-3">
            <div className="h-full flex flex-col justify-center">
              <div className="flex items-center gap-1 mb-2">
                <span className="font-medium text-xs sm:text-sm">전체 합계</span>
              </div>
              <div className="grid grid-cols-3 gap-x-1 sm:gap-x-2 md:gap-x-3 gap-y-1 text-xs sm:text-sm">
                <div>
                  <div className="text-xs text-muted-foreground font-medium">주선</div>
                  <div className="font-medium">{formatCurrency(totals.totalFreight)}원</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">세금</div>
                  <div className="font-normal text-muted-foreground">{formatCurrency(totals.totalTax)}원</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-semibold">청구</div>
                  <div className="font-semibold text-blue-700">{formatCurrency(totals.totalFreight + totals.totalTax)}원</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default WaitingSummary; 