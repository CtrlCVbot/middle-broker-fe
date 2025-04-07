"use client";

import React, { useState } from "react";
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useExpenditureDetailStore } from "@/store/expenditure-store";
import { AdditionalFeeType, IExpenditure, IAdditionalFee } from "@/types/expenditure";
import { DollarSign, Plus, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface IExpenditureAdditionalCostProps {
  expenditureId: string;
  orderIds: string[];
}

interface IFee extends IAdditionalFee {
  id: string;
  type: AdditionalFeeType;
  amount: number;
  description?: string;
  orderId?: string;
  createdAt: string;
  createdBy: string;
}

export function ExpenditureAdditionalCost({ expenditureId, orderIds }: IExpenditureAdditionalCostProps) {
  const { expenditureDetail, addAdditionalFee, removeAdditionalFee } = useExpenditureDetailStore();
  
  // 폼 상태
  const [type, setType] = useState<AdditionalFeeType>("대기비");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [orderId, setOrderId] = useState<string>("");
  
  // 숫자만 입력 받도록 처리
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9-]/g, "");
    setAmount(value);
  };
  
  // 추가금 추가
  const handleAddFee = () => {
    if (!amount) return;
    
    const amountNumber = parseInt(amount);
    if (isNaN(amountNumber)) return;
    
    addAdditionalFee({
      type,
      amount: amountNumber,
      description,
      orderId: orderId || undefined
    });
    
    // 폼 초기화
    setType("대기비");
    setAmount("");
    setDescription("");
    setOrderId("");
  };
  
  // 추가금 삭제
  const handleRemoveFee = (feeId: string) => {
    removeAdditionalFee(feeId);
  };
  
  return (
    <div className="space-y-4">
      {/* 추가금 입력 폼 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">추가금 입력</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-3">
              <Label htmlFor="fee-type" className="text-xs mb-1.5 block">추가금 유형</Label>
              <Select value={type} onValueChange={(value) => setType(value as AdditionalFeeType)}>
                <SelectTrigger id="fee-type">
                  <SelectValue placeholder="유형 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="대기비">대기비</SelectItem>
                  <SelectItem value="경유비">경유비</SelectItem>
                  <SelectItem value="왕복비">왕복비</SelectItem>
                  <SelectItem value="하차비">하차비</SelectItem>
                  <SelectItem value="수작업비">수작업비</SelectItem>
                  <SelectItem value="기타">기타</SelectItem>
                  <SelectItem value="할인">할인</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="col-span-3">
              <Label htmlFor="fee-amount" className="text-xs mb-1.5 block">금액</Label>
              <div className="relative">
                <Input
                  id="fee-amount"
                  value={amount}
                  onChange={handleAmountChange}
                  className="pr-8"
                  placeholder={type === "할인" ? "-10000" : "10000"}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  원
                </span>
              </div>
            </div>
            
            <div className="col-span-4">
              <Label htmlFor="fee-description" className="text-xs mb-1.5 block">설명</Label>
              <Input
                id="fee-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="추가금 설명 (선택사항)"
              />
            </div>
            
            <div className="col-span-2 flex flex-col justify-end">
              <Button
                onClick={handleAddFee}
                disabled={!amount || isNaN(parseInt(amount))}
                size="sm"
                className="h-9"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                추가
              </Button>
            </div>
          </div>
          
          {orderIds.length > 0 && (
            <div className="mt-3">
              <Label htmlFor="fee-order" className="text-xs mb-1.5 block">적용 화물 (선택사항)</Label>
              <Select value={orderId} onValueChange={setOrderId}>
                <SelectTrigger id="fee-order">
                  <SelectValue placeholder="전체 적용" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">전체 적용</SelectItem>
                  {orderIds.map((id) => (
                    <SelectItem key={id} value={id}>
                      {id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                특정 화물에만 추가금을 적용하려면 선택하세요. 선택하지 않으면 전체 정산에 적용됩니다.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* 추가금 목록 */}
      {expenditureDetail && expenditureDetail.additionalFees.length > 0 ? (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>유형</TableHead>
                <TableHead>설명</TableHead>
                <TableHead>대상 화물</TableHead>
                <TableHead className="text-right">금액</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenditureDetail.additionalFees.map((fee: IFee) => (
                <TableRow key={fee.id}>
                  <TableCell className="font-medium">{fee.type}</TableCell>
                  <TableCell>{fee.description || "-"}</TableCell>
                  <TableCell>{fee.orderId || "전체"}</TableCell>
                  <TableCell className={`text-right ${fee.amount >= 0 ? "text-blue-600" : "text-red-600"}`}>
                    {fee.amount >= 0 ? "+" : ""}{formatCurrency(fee.amount)}원
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleRemoveFee(fee.id)}
                      className="h-7 w-7"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={3} className="text-right font-semibold">
                  추가금 합계
                </TableCell>
                <TableCell className={`text-right font-semibold ${expenditureDetail.totalAdditionalAmount >= 0 ? "text-blue-600" : "text-red-600"}`}>
                  {expenditureDetail.totalAdditionalAmount >= 0 ? "+" : ""}{formatCurrency(expenditureDetail.totalAdditionalAmount)}원
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-32 bg-muted/20 rounded-md">
          <DollarSign className="h-6 w-6 text-muted-foreground mb-2" />
          <p className="text-muted-foreground">아직 추가금 내역이 없습니다.</p>
          <p className="text-xs text-muted-foreground">위 양식을 사용하여 추가금을 등록하세요.</p>
        </div>
      )}
      
      {/* 안내 메시지 */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm text-blue-700">
        <p>
          • <strong>대기비, 경유비, 왕복비</strong> 등은 양수 값을 입력하세요.
        </p>
        <p>
          • <strong>할인</strong>의 경우 음수 값을 입력하세요. (예: -10000)
        </p>
        <p>
          • 추가금은 정산 최종 금액에 자동으로 반영됩니다.
        </p>
      </div>
    </div>
  );
} 