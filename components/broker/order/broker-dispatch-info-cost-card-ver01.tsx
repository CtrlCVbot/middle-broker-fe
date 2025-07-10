"use client";

//react
import React, { useState } from "react";

//ui
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronDown, ChevronUp, Pencil } from "lucide-react";

//components
import BrokerChargeInfoLineForm, { IAdditionalFee } from "./broker-charge-info-line-form";

//hooks
import { useChargeForm } from '@/hooks/useChargeForm';

//store
// 운임 관련 스토어 및 타입 import 추가
import { useBrokerChargeStore } from "@/store/broker-charge-store"
import { useBrokerOrderStore } from "@/store/broker-order-store";
import { useBrokerOrderDetailStore } from "@/store/broker-order-detail-store";

//types
import { AmountType, AMOUNT_TYPES,  } from "@/types/settlement";

//utils
import { cn } from "@/lib/utils";

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

  const {     
    isSheetOpen,     
    selectedOrderId,     
    closeSheet,     
    orderDetail,     
    isLoading,     
    error,    
    fetchOrderDetail,       
  } = useBrokerOrderDetailStore();    
  
  // 브로커 주문 스토어 추가 - 새로고침을 위한 상태 관리  
  const { setLastRefreshed } = useBrokerOrderStore();  

  // 운임 관련 스토어 추가
  const {
    fetchChargesByOrderId,
    addCharge,
    isLoading: isChargeLoading,
    chargeGroups,
    financeSummary
  } = useBrokerChargeStore();
  
  
  // useChargeForm 커스텀 훅 사용
  const {
    dialogOpen,
    setDialogOpen,
    editingFee,
    selectedFeeType,
    newFee,
    setNewFee,
    handleOpenDialog,
    handleAmountChange,
    handleToggleTarget,
    handleAddFee,
    handleUpdateFee,
    handleCancelLineEdit
  } = useChargeForm({
    saveToBackend: true,
    addCharge,
    orderId: selectedOrderId || undefined,
    dispatchId: orderDetail?.dispatchId,
    onAdditionalFeeAdded,
    initialFeeType: "대기"
  });

  // 토글 함수
  const toggleDetails = () => {
    setIsDetailsOpen(!isDetailsOpen);
  };

  //청구 금액 항목 아이템별로 합치기
  const mergedIncome = income?.reduce((acc: { label: string; amount: number }[], cur) => {
    const found = acc.find((item) => item.label === cur.label);
    if (found) {
      found.amount += cur.amount;
    } else {
      acc.push({ ...cur });
    }
    return acc;
  }, []);

  //청구 금액 항목 정렬
  const sortedIncome = [...mergedIncome].sort((a, b) => {
    return AMOUNT_TYPES.indexOf(a.label as AmountType) - AMOUNT_TYPES.indexOf(b.label as AmountType);
  });
  

  //배차 금액 항목 아이템별로 합치기
  const mergedExpense = expense?.reduce((acc: { label: string; amount: number }[], cur) => {
    const found = acc.find((item) => item.label === cur.label);
    if (found) {
      found.amount += cur.amount;
    } else {
      acc.push({ ...cur });
    }
    return acc;
  }, []);

  //배차 금액 항목 정렬
  const sortedExpense = [...mergedExpense].sort((a, b) => {
    return AMOUNT_TYPES.indexOf(a.label as AmountType) - AMOUNT_TYPES.indexOf(b.label as AmountType);
  });
  
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

      {/* 청구 */}
      <div className="flex justify-between items-center hover:cursor-pointer hover:bg-gray-700 pt-1 pb-1 px-4 rounded-md" 
          onClick={() => handleOpenDialog('charge')}>
        <p className="text-md">청구{income.length-1 > 0 ? "(" + (income.length-1) + ")" : ""}</p>
        <div className="flex items-center">
          <span className="text-xl font-bold mr-1">{new Intl.NumberFormat('ko-KR').format(totalIncome)}원</span>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </div>        
      </div>

      {/* 청구 추가 항목 상세 - 펼쳐진 상태일 때만 표시 */}
      {isDetailsOpen && (
        <>        
        <div className="ml-8 space-y-1 mb-2 px-6">
          {sortedIncome.map((item, index) => (
            <div key={index} className="flex justify-between items-center">
              <p className="text-gray-400">{item.label}</p>
              <p className="text-md">{new Intl.NumberFormat('ko-KR').format(item.amount)}원</p>
            </div>
          ))}
        </div>
        </>
      )}

      {/* 배차 */}
      <div className="flex justify-between items-center hover:cursor-pointer hover:bg-gray-700 pt-1 pb-1 px-4 rounded-md" 
          onClick={() => handleOpenDialog('dispatch')}>
        <p className="text-md">배차{expense.length-1 > 0 ? "(" + (expense.length-1) + ")" : ""}</p>
        <div className="flex items-center">
          <span className="text-xl font-bold mr-1">{new Intl.NumberFormat('ko-KR').format(totalExpense)}원</span>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* 배차 추가 항목 상세 - 펼쳐진 상태일 때만 표시 */}
      {isDetailsOpen && (
        <>        
        <div className="ml-8 space-y-1 mb-2 px-6">
          {sortedExpense.map((item, index) => (
            <div key={index} className="flex justify-between items-center">
              <p className="text-gray-400">{item.label}</p>
              <p className="text-md">{new Intl.NumberFormat('ko-KR').format(item.amount)}원</p>
            </div>
          ))}
        </div>
        </>
      )}

      <Separator className="bg-gray-700 my-5" />

      {/* 남은 금액 */}
      <div className="flex justify-between items-center pb-2 px-4">
        <p className="text-xl">수익 금액</p>
        <p className={cn("text-2xl font-bold", totalBalance > 0 ? "text-blue-400" : "text-red-400")}>
          {new Intl.NumberFormat('ko-KR').format(totalBalance)}원</p>
      </div>

      {/* 운송 마감 버튼 */}
      {/* <div>
        <Separator className="bg-gray-700 my-5" />

        <div className="flex justify-between items-center pb-2 px-4">
          <p className="text-xl"></p>
          <Button variant="default" size="sm" 
            className={cn("bg-purple-700 hover:bg-purple-500", totalBalance > 0 ? "cursor-pointer" : "cursor-not-allowed")}
            //onClick={handleCreateSales}
          >
            운송 마감하기!
          </Button>
        </div>
      </div> */}

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
        handleCancelEdit={handleCancelLineEdit}
      />
    </div>
  );
}