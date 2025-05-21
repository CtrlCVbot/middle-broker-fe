"use client";

import React, { useState } from "react";
import { ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
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
    { label: "견적", amount: 5000000 },
    { label: "수작업비", amount: 100000 },
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
  // 상세 항목 표시 여부 상태
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // 토글 함수
  const toggleDetails = () => {
    setIsDetailsOpen(!isDetailsOpen);
  };
  
  // 총액 계산
  const totalEstimate = estimate?.reduce((sum, item) => sum + item.amount, 0) || 0;
  const totalIncome = income?.reduce((sum, item) => sum + item.amount, 0) || 0;
  const totalExpense = expense?.reduce((sum, item) => sum + item.amount, 0) || 0;
  const totalBalance = totalIncome - totalExpense;

  return (
    <div className={cn("flex flex-col gap-1 bg-gray-800 text-white p-2 rounded-lg", className)}>
      {/* 카드 헤더 */}
      

      <div className="flex justify-between items-center mb-3 hover:cursor-pointer hover:bg-gray-700 p-2 px-2 rounded-md" onClick={toggleDetails}>
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-gray-600 rounded-md overflow-hidden flex items-center justify-center">
            <div className="text-xl">🧾</div>
          </div>
          <div>
            <p className="text-md font-semibold">{title}</p>
            <p className="text-sm text-gray-400">{date}</p>
          </div>
        </div>
        
        <div>
          {isDetailsOpen ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </div>
      </div>

      

      {/* 견적 - 추후 추가 예정 */}
      {/* <div className="flex justify-between items-center hover:cursor-pointer hover:bg-gray-700 pt-1 pb-1 px-4 rounded-md">
        <p className="text-md">견적({estimate.length-1})</p>
        <div className="flex items-center">
          <span className="text-lg font-bold mr-1">{new Intl.NumberFormat('ko-KR').format(totalEstimate)}원</span>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </div>
      </div> */}
      
      {/* 견적 추가 항목 상세 - 펼쳐진 상태일 때만 표시 - 추후 추가 예정 */}
      {/* {isDetailsOpen && (
        <div className="ml-8 space-y-1 mb-2 px-6">
          {estimate?.map((item, index) => (
            <div key={index} className="flex justify-between items-center">
              <p className="text-gray-400">{item.label}</p>
              <p className="text-md">{new Intl.NumberFormat('ko-KR').format(item.amount)}원</p>
            </div>
          ))}
        </div>
      )} */}

      {/* 청구 */}
      <div className="flex justify-between items-center hover:cursor-pointer hover:bg-gray-700 pt-1 pb-1 px-4 rounded-md">
        <p className="text-md">청구{income.length-1 > 0 ? "(" + (income.length-1) + ")" : ""}</p>
        <div className="flex items-center">
          <span className="text-xl font-bold mr-1">{new Intl.NumberFormat('ko-KR').format(totalIncome)}원</span>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* 청구 추가 항목 상세 - 펼쳐진 상태일 때만 표시 */}
      {isDetailsOpen && (
        <div className="ml-8 space-y-1 mb-2 px-6">
          {income?.map((item, index) => (
            <div key={index} className="flex justify-between items-center">
              <p className="text-gray-400">{item.label}</p>
              <p className="text-md">{new Intl.NumberFormat('ko-KR').format(item.amount)}원</p>
            </div>
          ))}
        </div>
      )}

      {/* 배차 */}
      <div className="flex justify-between items-center hover:cursor-pointer hover:bg-gray-700 pt-1 pb-1 px-4 rounded-md">
        <p className="text-md">배차({expense.length-1})</p>
        <div className="flex items-center">
          <span className="text-xl font-bold mr-1">{new Intl.NumberFormat('ko-KR').format(totalExpense)}원</span>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* 배차 추가 항목 상세 - 펼쳐진 상태일 때만 표시 */}
      {isDetailsOpen && (
        <div className="ml-8 space-y-1 mb-2 px-6">
          {expense?.map((item, index) => (
            <div key={index} className="flex justify-between items-center">
              <p className="text-gray-400">{item.label}</p>
              <p className="text-md">{new Intl.NumberFormat('ko-KR').format(item.amount)}원</p>
            </div>
          ))}
        </div>
      )}

      <Separator className="bg-gray-700 my-5" />

      {/* 남은 금액 */}
      <div className="flex justify-between items-center pb-2 px-4">
        <p className="text-xl">수익 금액</p>
        <p className={cn("text-2xl font-bold", totalBalance > 0 ? "text-blue-400" : "text-red-400")}>
          {new Intl.NumberFormat('ko-KR').format(totalBalance)}원</p>
      </div>
    </div>
  );
}