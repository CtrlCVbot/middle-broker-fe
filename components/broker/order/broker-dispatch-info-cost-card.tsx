"use client";

import React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface IFinanceItem {
  label: string;
  amount: number;
}

interface IFinanceSummaryCardProps {
  title?: string;
  date?: string;
  estimate?: IFinanceItem[];
  income?: IFinanceItem[];
  expense?: IFinanceItem[];
  balance?: number;
  className?: string;
}

export function FinanceSummaryCard({
  title = "운임 정산",
  date = "5월 15일 기준",
  estimate = [
    { label: "기본", amount: 5000000 },    
    { label: "수작업비", amount: 100000 },
  ],
  income = [
    { label: "기본", amount: 5100000 },
    { label: "대기비", amount: 22000 },
    { label: "경유비", amount: 11000 },
  ],
  expense = [
    { label: "기본", amount: 4000000 },
    { label: "대기비", amount: 200000 },
    { label: "경유비", amount: 100000 },
  ],
  balance = 3455994,
  className,
}: IFinanceSummaryCardProps) {
  // 총액 계산
  const totalEstimate = estimate?.reduce((sum, item) => sum + item.amount, 0) || 0;
  const totalIncome = income?.reduce((sum, item) => sum + item.amount, 0) || 0;
  const totalExpense = expense?.reduce((sum, item) => sum + item.amount, 0) || 0;
  const totalBalance = totalIncome - totalExpense;

  return (
    <div className={cn("flex flex-col gap-1 bg-gray-800 text-white p-4 px-6 rounded-lg", className)}>
      {/* 카드 헤더 */}
      <div className="space-y-1 mb-4">
        <h3 className="text-md font-bold">{title}</h3>
        <p className="text-gray-400">{date}</p>
      </div>

      {/* 견적 */}
      <div className="flex justify-between items-center mb-2">
        <p className="text-md">견적</p>
        <div className="flex items-center">
          <span className="text-lg font-bold mr-1">{new Intl.NumberFormat('ko-KR').format(totalEstimate)}원</span>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </div>
      </div>
      {/* 견적 추가 항목 상세 */}
      <div className="ml-8 space-y-1 mb-2">
        {estimate?.map((item, index) => (
          <div key={index} className="flex justify-between items-center">
            <p className="text-gray-400">{item.label}</p>
            <p className="text-md">{new Intl.NumberFormat('ko-KR').format(item.amount)}원</p>
          </div>
        ))}
      </div>

      {/* 청구 */}
      <div className="flex justify-between items-center mb-2">
        <p className="text-md">청구</p>
        <div className="flex items-center">
          <span className="text-xl font-bold mr-1">{new Intl.NumberFormat('ko-KR').format(totalIncome)}원</span>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* 청구 추가 항목 상세 */}
      <div className="ml-8 space-y-1 mb-2">
        {income?.map((item, index) => (
          <div key={index} className="flex justify-between items-center">
            <p className="text-gray-400">{item.label}</p>
            <p className="text-md">{new Intl.NumberFormat('ko-KR').format(item.amount)}원</p>
          </div>
        ))}
      </div>

      {/* 배차 */}
      <div className="flex justify-between items-center mb-2">
        <p className="text-md">배차</p>
        <div className="flex items-center">
          <span className="text-xl font-bold mr-1">{new Intl.NumberFormat('ko-KR').format(totalExpense)}원</span>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* 배차 추가 항목 상세 */}
      <div className="ml-8 space-y-1 mb-2">
        {expense?.map((item, index) => (
          <div key={index} className="flex justify-between items-center">
            <p className="text-gray-400">{item.label}</p>
            <p className="text-md">{new Intl.NumberFormat('ko-KR').format(item.amount)}원</p>
          </div>
        ))}
      </div>

      

      <Separator className="bg-gray-700 my-5" />

      {/* 남은 금액 */}
      <div className="flex justify-between items-center">
        <p className="text-xl">수익 금액</p>
        <p className={cn("text-2xl font-bold", totalBalance > 0 ? "text-blue-400" : "text-red-400")}>
          {new Intl.NumberFormat('ko-KR').format(totalBalance)}원</p>
      </div>
    </div>
  );
} 