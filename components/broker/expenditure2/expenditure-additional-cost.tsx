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

import { useExpenditureDetailStore } from "@/store/expenditure-detail-store";
import { AdditionalFeeType, IAdditionalFee } from "@/types/expenditure";
import { Plus, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface IExpenditureAdditionalCostProps {
  expenditureId: string;
  orderIds: string[];
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
              {expenditureDetail.additionalFees.map((fee: IAdditionalFee) => (
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
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="border rounded-md p-4 text-center text-muted-foreground">
          추가된 추가금이 없습니다.
        </div>
      )}
    </div>
  );
} 