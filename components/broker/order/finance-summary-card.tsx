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
  income?: number;
  expense?: IFinanceItem[];
  balance?: number;
  className?: string;
}

export function FinanceSummaryCard({
  title = "이번 달 남은 돈",
  date = "5월 15일 기준",
  income = 4801509,
  expense = [
    { label: "카드로 쓴 돈", amount: 227871 },
    { label: "계좌 이체", amount: 1117644 },
    { label: "페이·기타", amount: 0 },
  ],
  balance = 3455994,
  className,
}: IFinanceSummaryCardProps) {
  // 소비 총액 계산
  const totalExpense = expense?.reduce((sum, item) => sum + item.amount, 0) || 0;

  return (
    <div className={cn("bg-black text-white p-5 rounded-lg", className)}>
      {/* 카드 헤더 */}
      <div className="space-y-1 mb-6">
        <h3 className="text-2xl font-bold">{title}</h3>
        <p className="text-gray-400">{date}</p>
      </div>

      {/* 수입 */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-xl">수입</p>
        <div className="flex items-center">
          <span className="text-2xl font-bold mr-1">{new Intl.NumberFormat('ko-KR').format(income)}원</span>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* 소비 */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-xl">소비</p>
        <div className="flex items-center">
          <span className="text-2xl font-bold mr-1">{new Intl.NumberFormat('ko-KR').format(totalExpense)}원</span>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* 소비 항목 상세 */}
      <div className="ml-4 space-y-3 mb-6">
        {expense?.map((item, index) => (
          <div key={index} className="flex justify-between items-center">
            <p className="text-gray-400">{item.label}</p>
            <p className="text-xl">{new Intl.NumberFormat('ko-KR').format(item.amount)}원</p>
          </div>
        ))}
      </div>

      <Separator className="bg-gray-700 my-5" />

      {/* 남은 금액 */}
      <div className="flex justify-between items-center">
        <p className="text-xl">남은 금액</p>
        <p className="text-3xl font-bold text-blue-400">{new Intl.NumberFormat('ko-KR').format(balance)}원</p>
      </div>
    </div>
  );
} 