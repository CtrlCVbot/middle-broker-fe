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

import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  
} from "@/components/ui/dialog";
import { 
  Plus, 
  Trash, 
  Edit,
  AlertTriangle,
  Building,
  Factory
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
  const [additionalTotal, setAdditionalTotal] = useState<number>(0);
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
  
  // Dialog 상태
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFeeType, setSelectedFeeType] = useState<AdditionalFeeType | null>(null);
  
  // 추가금 섹션은 기본적으로 열려있게 설정
  const [additionalFeeSectionOpen, setAdditionalFeeSectionOpen] = useState(true);
  
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
  }, [form.watch("baseAmount"), form.watch("chargeAmount"), additionalFees]);
  
  // 금액 입력 핸들러 (숫자만 입력 가능하도록)
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>, isNewFee = false, field: "baseAmount" | "chargeAmount" | "estimatedAmount" = "baseAmount") => {
    const value = e.target.value.replace(/[^\d-]/g, '');
    
    if (isNewFee) {
      setNewFee({ ...newFee, amount: value });
    } else {
      form.setValue(field, value);
    }
  };
  
  // 추가금 타입 버튼 클릭 핸들러
  const handleAddFeeTypeClick = (type: AdditionalFeeType) => {
    setSelectedFeeType(type);
    setNewFee({ ...newFee, type });
    setDialogOpen(true);
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
    resetNewFee();
    setDialogOpen(false);
    calculateTotals();
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
  
  // Dialog 닫기 핸들러
  const handleCloseDialog = () => {
    resetNewFee();
    setDialogOpen(false);
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
    setSelectedFeeType(fee.type);
    setDialogOpen(true);
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
    resetNewFee();
    setDialogOpen(false);
    calculateTotals();
  };
  
  // 추가금 항목 삭제
  const handleDeleteFee = (id: string) => {
    setAdditionalFees(additionalFees.filter(fee => fee.id !== id));
    
    if (editingFee?.id === id) {
      setEditingFee(null);
      resetNewFee();
    }
    
    calculateTotals();
  };
  
  // 수정 취소
  const handleCancelEdit = () => {
    setEditingFee(null);
    resetNewFee();
    setDialogOpen(false);
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
    const additionalTotalValue = chargeAdditionalTotal;
    const chargeTotalValue = chargeAmountValue + chargeAdditionalTotal;
    const profitValue = chargeTotalValue - dispatchTotalValue;
    
    setDispatchTotal(dispatchTotalValue);
    setChargeTotal(chargeTotalValue);
    setAdditionalTotal(additionalTotalValue);
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
          {/* 운임 요약 카드 - 항상 펼쳐져 있는 상태로 변경 */}
          <div className="">
            
            {/* 상세 정보 - 항상 표시 */}
            <div className="space-y-6">
              {/* 견적금 (숨겨진 필드) */}
              <div className="hidden">
                <FormField
                  control={form.control}
                  name="estimatedAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          {...field}
                          readOnly
                          disabled={isCompleted}
                          className="hidden"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              {/* 화주 청구 금액 상세 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-primary" />
                  <h4 className="font-medium">화주 청구 금액 상세</h4>
                </div>
                
                <div className="space-y-3 pl-6">
                  {/* 기본 운임 */}
                  <div className="grid grid-cols-3 gap-2 items-center">
                    <FormLabel className="text-muted-foreground text-sm">기본 운임</FormLabel>
                    <div className="col-span-2">
                      <FormField
                        control={form.control}
                        name="chargeAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="청구금 입력"
                                onChange={e => handleAmountChange(e, false, "chargeAmount")}
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
                  
                  {/* 추가금 항목 - 화주 항목만 필터링 */}
                  {additionalFees.filter(fee => fee.target.charge).length > 0 && (
                    <>
                      <div className="text-sm text-muted-foreground">추가금 항목</div>
                      <div className="pl-4 space-y-2">
                        {additionalFees.filter(fee => fee.target.charge).map(fee => (
                          <div key={fee.id} className="grid grid-cols-3 gap-2 text-sm">
                            <div>{fee.type}</div>
                            <div className="col-span-2">{displayAmount(fee.amount)}</div>
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm font-medium border-t pt-2">
                        <div className="text-muted-foreground">총 추가금</div>
                        <div className="col-span-2">
                          {formatCurrency(additionalFees.filter(fee => fee.target.charge).reduce((sum, fee) => {
                            const feeAmount = typeof fee.amount === 'string' ? Number(fee.amount.replace(/,/g, '')) : fee.amount;
                            return sum + feeAmount;
                          }, 0))}원
                        </div>
                      </div>
                    </>
                  )}
                  
                  {/* 세금 (미구현 상태) */}
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="text-muted-foreground">세금(10%)</div>
                    <div className="col-span-2 font-medium text-muted-foreground">
                      <span className="italic">미적용</span>
                    </div>
                  </div>
                  
                  {/* 최종 청구 금액 */}
                  <div className="grid grid-cols-3 gap-2 text-lg font-bold border-t pt-3">
                    <div>최종 청구 금액</div>
                    <div className="col-span-2 text-primary">
                      {displayAmount(chargeTotal)}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 차주 배차 금액 상세 */}
              <div className="space-y-3 mt-6">
                <div className="flex items-center gap-2">
                  <Factory className="h-4 w-4 text-primary" />
                  <h4 className="font-medium">차주 배차 금액 상세</h4>
                </div>
                
                <div className="space-y-3 pl-6">
                  {/* 기본 배차 운임 */}
                  <div className="grid grid-cols-3 gap-2 items-center">
                    <FormLabel className="text-muted-foreground text-sm">기본 배차 운임</FormLabel>
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
                  
                  {/* 추가금 (통합) - 배차 항목만 필터링 */}
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="text-muted-foreground">추가금 (통합)</div>
                    <div className="col-span-2 font-medium">
                      {formatCurrency(additionalFees.filter(fee => fee.target.dispatch).reduce((sum, fee) => {
                        const feeAmount = typeof fee.amount === 'string' ? Number(fee.amount.replace(/,/g, '')) : fee.amount;
                        return sum + feeAmount;
                      }, 0))}원
                    </div>
                  </div>
                  
                  {/* 세금 (미구현 상태) */}
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="text-muted-foreground">세금(10%)</div>
                    <div className="col-span-2 font-medium text-muted-foreground">
                      <span className="italic">미적용</span>
                    </div>
                  </div>
                  
                  {/* 최종 배차 금액 */}
                  <div className="grid grid-cols-3 gap-2 text-lg font-bold border-t pt-3">
                    <div>최종 배차 금액</div>
                    <div className="col-span-2">
                      {displayAmount(dispatchTotal)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between">
                  <div className="text-sm text-muted-foreground">예상 마진</div>
                  <div className={`text-xl font-bold ${profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {profit >= 0 ? "+" : ""}{formatCurrency(profit)}원
                  </div>
                </div>
              </div>
              
              {/* 추가금 관리 섹션 */}
              <div className="space-y-3 mt-6 border-t pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Plus className="h-4 w-4 text-primary" />
                  <h4 className="font-medium">추가금 관리</h4>
                </div>
                
                <div>
                  {/* 추가금 타입 버튼 */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {ADDITIONAL_FEE_TYPES.map((type) => (
                      <Button
                        key={type}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddFeeTypeClick(type)}
                        disabled={isCompleted}
                      >
                        {type}
                      </Button>
                    ))}
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
          
          {/* 추가금 입력 Dialog */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {editingFee ? "추가금 수정" : "추가금 추가"}
                </DialogTitle>
                <DialogDescription>
                  {selectedFeeType ? `${selectedFeeType} 추가금 정보를 ${editingFee ? '수정' : '입력'}해주세요.` : '추가금 정보를 입력해주세요.'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {/* 추가금 타입 */}
                <div className="space-y-2">
                  <Label>추가금 타입</Label>
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
                
                {/* 금액 */}
                <div className="space-y-2">
                  <Label>금액</Label>
                  <Input
                    type="text"
                    placeholder="금액"
                    value={newFee.amount}
                    onChange={(e) => handleAmountChange(e, true)}
                    disabled={isCompleted}
                    className="text-right"
                  />
                </div>
                
                {/* 메모 */}
                <div className="space-y-2">
                  <Label>메모</Label>
                  <Input
                    type="text"
                    placeholder="메모"
                    value={newFee.memo}
                    onChange={(e) => setNewFee({...newFee, memo: e.target.value})}
                    disabled={isCompleted}
                  />
                </div>
                
                {/* 대상 선택 (청구/배차) */}
                <div className="space-y-2">
                  <Label>대상</Label>
                  <div className="flex gap-3 mt-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={newFee.target.charge ? "default" : "outline"}
                      onClick={() => handleToggleTarget('charge')}
                      disabled={isCompleted}
                    >
                      청구 {newFee.target.charge ? "✓" : ""}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={newFee.target.dispatch ? "default" : "outline"}
                      onClick={() => handleToggleTarget('dispatch')}
                      disabled={isCompleted}
                    >
                      배차 {newFee.target.dispatch ? "✓" : ""}
                    </Button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCancelEdit}
                  disabled={isCompleted}
                >
                  취소
                </Button>
                <Button 
                  type="button" 
                  onClick={editingFee ? handleUpdateFee : handleAddFee}
                  disabled={isCompleted}
                >
                  {editingFee ? "수정" : "추가"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </form>
      </Form>
    </div>
  );
} 