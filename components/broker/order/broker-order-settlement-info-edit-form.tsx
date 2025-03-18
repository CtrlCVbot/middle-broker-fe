"use client";

import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Plus, 
  Trash, 
  DollarSign, 
  Edit, 
  CreditCard, 
  TrendingUp, 
  Save, 
  X,
  AlertTriangle
} from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";

// 추가금 타입 정의
const ADDITIONAL_FEE_TYPES = [
  "대기", "경유", "수작업", "왕복", "톨비", "수수료", "현장착불"
] as const;

type AdditionalFeeType = typeof ADDITIONAL_FEE_TYPES[number];

// 추가금 아이템 인터페이스
interface IAdditionalFee {
  id: string;
  type: AdditionalFeeType;
  amount: number | string;
  memo: string;
  target: { charge: boolean; dispatch: boolean };
}

// 폼 스키마 정의
const formSchema = z.object({
  baseAmount: z.string().refine(
    (val) => !isNaN(Number(val.replace(/,/g, ''))), 
    { message: "유효한 금액을 입력해주세요" }
  ),
  chargeAmount: z.string().refine(
    (val) => !isNaN(Number(val.replace(/,/g, ''))), 
    { message: "유효한 금액을 입력해주세요" }
  ),
  estimatedAmount: z.string().refine(
    (val) => !isNaN(Number(val.replace(/,/g, ''))), 
    { message: "유효한 금액을 입력해주세요" }
  )
});

interface BrokerOrderSettlementInfoEditFormProps {
  initialData: {
    baseAmount?: string | number;
    chargeAmount?: string | number;
    estimatedAmount?: string | number;
    additionalFees?: IAdditionalFee[];
  };
  status: string;
  onSave: (data: any) => void;
  onCancel: () => void;
}

export function BrokerOrderSettlementInfoEditForm({ 
  initialData, 
  status, 
  onSave, 
  onCancel 
}: BrokerOrderSettlementInfoEditFormProps) {
  // 운송마감 상태인지 확인
  const isCompleted = status === "운송마감";
  
  // 추가금 항목 관리 상태
  const [additionalFees, setAdditionalFees] = useState<IAdditionalFee[]>(
    initialData.additionalFees || []
  );
  
  // 상태 변수 및 계산 함수 추가
  // 총 금액 (배차 기본금 + 배차 추가금, 청구 기본금 + 청구 추가금)
  const [dispatchTotal, setDispatchTotal] = useState<number>(0);
  const [chargeTotal, setChargeTotal] = useState<number>(0);
  const [profit, setProfit] = useState<number>(0);
  
  // 편집 중인 추가금 항목
  const [editingFee, setEditingFee] = useState<IAdditionalFee | null>(null);
  
  // 새 추가금 입력 상태
  const [newFee, setNewFee] = useState<Omit<IAdditionalFee, 'id'>>({
    type: "대기",
    amount: "",
    memo: "",
    target: { charge: true, dispatch: true }
  });
  
  // React Hook Form 설정
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      baseAmount: initialData.baseAmount ? 
        typeof initialData.baseAmount === 'number' ? 
          initialData.baseAmount.toString() : initialData.baseAmount
        : "0",
      chargeAmount: initialData.chargeAmount ? 
        typeof initialData.chargeAmount === 'number' ? 
          initialData.chargeAmount.toString() : initialData.chargeAmount
        : initialData.baseAmount ? 
          typeof initialData.baseAmount === 'number' ? 
            initialData.baseAmount.toString() : initialData.baseAmount
          : "0",
      estimatedAmount: initialData.baseAmount ? 
        typeof initialData.baseAmount === 'number' ? 
          initialData.baseAmount.toString() : initialData.baseAmount
        : "0"
    }
  });
  
  // 배차금 값이 변경될 때마다 총 금액 다시 계산
  useEffect(() => {
    calculateTotals();
  }, [form.watch("baseAmount"), additionalFees]);
  
  // 금액 입력 핸들러 (숫자만 입력 가능하도록)
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>, isNewFee = false, field: "baseAmount" | "chargeAmount" | "estimatedAmount" = "baseAmount") => {
    const value = e.target.value.replace(/[^\d-]/g, '');
    
    if (isNewFee) {
      setNewFee({ ...newFee, amount: value });
    } else {
      form.setValue(field, value);
    }
  };
  
  // 추가금 버튼 클릭 핸들러
  const handleAddFeeTypeClick = (type: AdditionalFeeType) => {
    setNewFee({ ...newFee, type });
  };
  
  // 추가금 항목 추가
  const handleAddFee = () => {
    if (!newFee.amount || isNaN(Number(newFee.amount))) {
      toast({
        title: "금액을 입력해주세요",
        variant: "destructive"
      });
      return;
    }
    
    const fee: IAdditionalFee = {
      id: Date.now().toString(),
      type: newFee.type,
      amount: newFee.amount,
      memo: newFee.memo,
      target: newFee.target
    };
    
    setAdditionalFees([...additionalFees, fee]);
    setNewFee({ type: "대기", amount: "", memo: "", target: { charge: true, dispatch: true } });
    calculateTotals();
  };
  
  // 추가금 항목 수정 시작
  const handleStartEditFee = (fee: IAdditionalFee) => {
    setEditingFee(fee);
    setNewFee({
      type: fee.type,
      amount: fee.amount.toString(),
      memo: fee.memo,
      target: fee.target
    });
  };
  
  // 추가금 항목 수정 완료
  const handleUpdateFee = () => {
    if (!editingFee) return;
    
    if (!newFee.amount || isNaN(Number(newFee.amount))) {
      toast({
        title: "금액을 입력해주세요",
        variant: "destructive"
      });
      return;
    }
    
    setAdditionalFees(additionalFees.map(fee => 
      fee.id === editingFee.id ? 
        { ...fee, type: newFee.type, amount: newFee.amount, memo: newFee.memo, target: newFee.target } : 
        fee
    ));
    
    setEditingFee(null);
    setNewFee({ type: "대기", amount: "", memo: "", target: { charge: true, dispatch: true } });
    calculateTotals();
  };
  
  // 추가금 항목 삭제
  const handleDeleteFee = (id: string) => {
    setAdditionalFees(additionalFees.filter(fee => fee.id !== id));
    
    if (editingFee?.id === id) {
      setEditingFee(null);
      setNewFee({ type: "대기", amount: "", memo: "", target: { charge: true, dispatch: true } });
    }
    
    calculateTotals();
  };
  
  // 수정 취소
  const handleCancelEdit = () => {
    setEditingFee(null);
    setNewFee({ type: "대기", amount: "", memo: "", target: { charge: true, dispatch: true } });
  };
  
  // 총 금액 계산
  const calculateTotals = () => {
    // 배차 기본금 가져오기
    const baseAmount = form.watch("baseAmount");
    const baseAmountValue = baseAmount ? Number(baseAmount.replace(/,/g, '')) : 0;
    
    // 청구 기본금 가져오기
    const chargeAmount = form.watch("chargeAmount");
    const chargeAmountValue = chargeAmount ? Number(chargeAmount.replace(/,/g, '')) : 0;
    
    // 배차 추가금 계산
    const dispatchAdditionalTotal = additionalFees.reduce((sum, fee) => {
      if (fee.target.dispatch) {
        const feeAmount = typeof fee.amount === 'string' ? 
          Number(fee.amount.replace(/,/g, '')) : fee.amount;
        return sum + feeAmount;
      }
      return sum;
    }, 0);
    
    // 청구 추가금 계산
    const chargeAdditionalTotal = additionalFees.reduce((sum, fee) => {
      if (fee.target.charge) {
        const feeAmount = typeof fee.amount === 'string' ? 
          Number(fee.amount.replace(/,/g, '')) : fee.amount;
        return sum + feeAmount;
      }
      return sum;
    }, 0);
    
    // 총액 설정
    const dispatchTotalValue = baseAmountValue + dispatchAdditionalTotal;
    const chargeTotalValue = chargeAmountValue + chargeAdditionalTotal;
    const profitValue = chargeTotalValue - dispatchTotalValue;
    
    setDispatchTotal(dispatchTotalValue);
    setChargeTotal(chargeTotalValue);
    setProfit(profitValue);
  };
  
  // 폼 제출 핸들러
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // 배차금, 청구금 및 추가금 정보를 포함한 데이터 구성
    const formData = {
      baseAmount: values.baseAmount,
      chargeAmount: values.chargeAmount,
      estimatedAmount: values.estimatedAmount,
      additionalFees: additionalFees,
      dispatchTotal,
      chargeTotal,
      profit
    };
    
    // 데이터 저장
    onSave(formData);
  };
  
  // 추가금 표시 헬퍼 함수
  const displayAmount = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? 
      Number(amount.replace(/,/g, '')) : amount;
    
    const isNegative = numAmount < 0;
    const absAmount = Math.abs(numAmount);
    
    return (
      <span className={isNegative ? "text-red-600" : ""}>
        {isNegative ? "-" : ""}{formatCurrency(absAmount)}원
      </span>
    );
  };
  
  return (
    <div className="p-0">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* 운임 정보 */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="h-4 w-4 text-primary" />
              <h4 className="font-medium">운임 정보</h4>
            </div>
            
            <div className="space-y-4">
              {/*견적금 입력 */}
              <div className="grid grid-cols-3 gap-2 items-center">
                <FormLabel className="text-muted-foreground text-sm">견적금</FormLabel>
                <div className="col-span-2">
                  <FormField
                    control={form.control}
                    name="estimatedAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            readOnly
                            placeholder="견적금 입력"
                            disabled={isCompleted}
                            className="text-right bg-muted/40"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              {/* 배차금 입력 */}
              <div className="grid grid-cols-3 gap-2 items-center">
                <FormLabel className="text-muted-foreground text-sm">배차금</FormLabel>
                <div className="col-span-2">
                  <FormField
                    control={form.control}
                    name="baseAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="배차금 입력"
                            onChange={e => handleAmountChange(e, false, "baseAmount")}
                            disabled={isCompleted}
                            className="text-right"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
            </div>
          </div>
          
          <Separator />
          
          {/* 추가금 정보 */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h4 className="font-medium">추가금 관리</h4>
            </div>
            
            {/* 추가금 타입 버튼 */}
            <div className="flex flex-wrap gap-2 mb-4">
              {ADDITIONAL_FEE_TYPES.map((type) => (
                <Button
                  key={type}
                  type="button"
                  variant={newFee.type === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleAddFeeTypeClick(type)}
                  disabled={isCompleted}
                >
                  {type}
                </Button>
              ))}
            </div>
            
            {/* 추가금 입력 폼 */}
            <div className="grid grid-cols-10 gap-2 mb-4 items-start">
              <div className="col-span-3">
                <Select
                  value={newFee.type}
                  onValueChange={(val) => setNewFee({...newFee, type: val as AdditionalFeeType})}
                  disabled={isCompleted}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="타입 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {ADDITIONAL_FEE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="col-span-2">
                <Input
                  type="text"
                  placeholder="금액"
                  value={newFee.amount}
                  onChange={(e) => handleAmountChange(e, true)}
                  disabled={isCompleted}
                  className="text-right"
                />
              </div>
              
              <div className="col-span-4">
                <Input
                  type="text"
                  placeholder="메모"
                  value={newFee.memo}
                  onChange={(e) => setNewFee({...newFee, memo: e.target.value})}
                  disabled={isCompleted}
                />
              </div>
              
              <div className="col-span-1 flex justify-end">
                {editingFee ? (
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleUpdateFee}
                      disabled={isCompleted}
                      className="h-10 w-10"
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleCancelEdit}
                      disabled={isCompleted}
                      className="h-10 w-10"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleAddFee}
                    disabled={isCompleted}
                    className="h-10 w-10"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            
            {/* 추가금 목록 */}
            <div className="border rounded-md overflow-hidden mb-4">
              <div className="grid grid-cols-10 gap-0 bg-muted/20 p-2 text-sm font-medium border-b">
                <div className="col-span-3">타입</div>
                <div className="col-span-2 text-right">금액</div>
                <div className="col-span-3">메모</div>
                <div className="col-span-2 text-right">관리</div>
              </div>
              
              <ScrollArea className="max-h-[200px]">
                {additionalFees.length > 0 ? (
                  <div>
                    {additionalFees.map((fee) => (
                      <div 
                        key={fee.id} 
                        className={cn(
                          "grid grid-cols-10 gap-0 p-2 text-sm border-b", 
                          editingFee?.id === fee.id ? "bg-muted/30" : "hover:bg-muted/10"
                        )}
                      >
                        <div className="col-span-3 flex items-center">
                          <Badge variant="outline">{fee.type}</Badge>
                        </div>
                        <div className="col-span-2 text-right flex items-center justify-end">
                          {displayAmount(fee.amount)}
                        </div>
                        <div className="col-span-3 flex items-center truncate">
                          {fee.memo}
                        </div>
                        <div className="col-span-2 flex justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleStartEditFee(fee)}
                            disabled={isCompleted || !!editingFee}
                            className="h-8 w-8"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteFee(fee.id)}
                            disabled={isCompleted}
                            className="h-8 w-8 text-destructive"
                          >
                            <Trash className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    등록된 추가금이 없습니다.
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
          
          {/* 금액 요약 */}
          <div className="bg-muted/20 p-4 rounded-md space-y-4">
            {/* 배차 총액 */}
            <div className="flex justify-between items-center">
              <div className="text-sm font-medium">배차 총액</div>
              <div className="text-lg font-bold">
                {formatCurrency(dispatchTotal)}원
              </div>
            </div>
            
            {/* 청구 총액 */}
            <div className="flex justify-between items-center">
              <div className="text-sm font-medium">청구 총액</div>
              <div className="text-lg font-bold">
                {formatCurrency(chargeTotal)}원
              </div>
            </div>
            
            {/* 구분선 */}
            <Separator />
            
            {/* 수익 */}
            <div className="flex justify-between items-center">
              <div className="text-sm font-medium">수익 (청구-배차)</div>
              <div className={`text-lg font-bold ${profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                {profit >= 0 ? "+" : ""}{formatCurrency(profit)}원
              </div>
            </div>
          </div>
          
          {/* 운송마감 시 경고 */}
          {isCompleted && (
            <div className="flex gap-2 items-center p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-700">
              <AlertTriangle className="h-4 w-4" />
              <span>운송마감 상태에서는 운임 정보를 수정할 수 없습니다.</span>
            </div>
          )}
          
          {/* 버튼 */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              취소
            </Button>
            <Button type="submit" disabled={isCompleted}>
              저장
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 