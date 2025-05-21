"use client";

import React, { useState } from "react";
import { ChevronRight, ChevronDown, ChevronUp, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import BrokerChargeInfoLineForm, { IAdditionalFee } from "./broker-charge-info-line-form";
import { toast } from "@/components/ui/use-toast";

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
  onAdditionalFeeAdded?: (fee: IAdditionalFee) => void;
}

export function FinanceSummaryCard({
  title = "운임 정산",
  date = "5월 15일 기준",
  estimate = [
    { label: "기본", amount: 0 },
  ],
  income = [
    { label: "기본", amount: 0 },
  ],
  expense = [
    { label: "기본", amount: 0 },
  ],
  balance = 0,
  className,
  onAdditionalFeeAdded,
}: IFinanceSummaryCardProps) {
  // 상세 항목 표시 여부 상태
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  // 추가금 다이얼로그 상태
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<IAdditionalFee | null>(null);
  const [selectedFeeType, setSelectedFeeType] = useState<string | null>(null);
  const [newFee, setNewFee] = useState<IAdditionalFee>({
    type: "대기",
    amount: "",
    memo: "",
    target: { charge: true, dispatch: true }
  });

  // 토글 함수
  const toggleDetails = () => {
    setIsDetailsOpen(!isDetailsOpen);
  };
  
  // 총액 계산
  const totalEstimate = estimate?.reduce((sum, item) => sum + item.amount, 0) || 0;
  const totalIncome = income?.reduce((sum, item) => sum + item.amount, 0) || 0;
  const totalExpense = expense?.reduce((sum, item) => sum + item.amount, 0) || 0;
  const totalBalance = totalIncome - totalExpense;

  // 추가금 다이얼로그 열기
  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  // 금액 입력 핸들러
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>, isDialog?: boolean) => {
    const value = e.target.value.replace(/[^\d-]/g, '');
    setNewFee({ ...newFee, amount: value });
  };

  // 타겟 토글 핸들러 (청구/배차)
  const handleToggleTarget = (target: 'charge' | 'dispatch') => {
    setNewFee({
      ...newFee,
      target: {
        ...newFee.target,
        [target]: !newFee.target[target]
      }
    });
  };

  // 추가금 항목 추가
  const handleAddFee = () => {
    //if (!newFee.amount || isNaN(Number(newFee.amount))) {
    if (!newFee.amounts){
      toast({
        title: "금액을 입력해주세요123",
        variant: "default"
      });
      return;
    }
    
    const fee: IAdditionalFee = {
      id: Date.now().toString(),
      ...newFee
    };
    
    // 추가된 추가금 처리 (부모 컴포넌트로 전달)
    if (onAdditionalFeeAdded) {
      onAdditionalFeeAdded(fee);
    }
    
    // 상태 초기화
    resetNewFee();
    setDialogOpen(false);
  };

  // 추가금 항목 추가  
  

  // 추가금 항목 수정
  const handleUpdateFee = () => {
    // 실제 구현 시 필요하면 추가
    handleCancelEdit();
  };

  // 수정 취소
  const handleCancelEdit = () => {
    setEditingFee(null);
    resetNewFee();
    setDialogOpen(false);
  };

  // 새 추가금 입력 상태 리셋
  const resetNewFee = () => {
    setNewFee({ 
      type: "대기", 
      amount: "", 
      memo: "", 
      target: { charge: true, dispatch: true } 
    });
    setSelectedFeeType(null);
  };

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

      {/* 청구 */}
      <div className="flex justify-between items-center hover:cursor-pointer hover:bg-gray-700 pt-1 pb-1 px-4 rounded-md" 
          onClick={handleOpenDialog}>
        <p className="text-md">청구({income.length-1})</p>
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
      <div className="flex justify-between items-center hover:cursor-pointer hover:bg-gray-700 pt-1 pb-1 px-4 rounded-md" 
          onClick={handleOpenDialog}>
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

      {/* 추가금 입력 다이얼로그 */}
      <BrokerChargeInfoLineForm 
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        newFee={newFee}
        setNewFee={setNewFee}
        editingFee={editingFee}
        selectedFeeType={selectedFeeType}
        isCompleted={false}
        handleAmountChange={handleAmountChange}
        handleToggleTarget={handleToggleTarget}
        handleAddFee={handleAddFee}
        handleUpdateFee={handleUpdateFee}
        handleCancelEdit={handleCancelEdit}
      />
    </div>
  );
}