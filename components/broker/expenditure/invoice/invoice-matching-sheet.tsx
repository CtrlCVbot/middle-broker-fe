'use client';

import { useInvoiceStore } from "@/store/expenditure/invoice-store";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AmountDisplay } from "../shared/amount-display";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ICargo } from "@/types/broker/expenditure";
import { useState } from "react";

export const InvoiceMatchingSheet = () => {
  const {
    selectedInvoice,
    isMatchingSheetOpen,
    setMatchingSheetOpen,
    matchedCargos,
    setMatchedCargos,
    additionalCharges,
    addAdditionalCharge,
    getTotalMatchedAmount,
    getAmountDifference
  } = useInvoiceStore();

  const [cargoFilter, setCargoFilter] = useState("");
  
  // 목업 데이터 - 실제로는 API에서 가져올 것
  const availableCargos: ICargo[] = [
    // ... 목업 데이터
  ];

  const filteredCargos = availableCargos.filter(cargo =>
    cargo.businessNumber === selectedInvoice?.businessNumber &&
    !matchedCargos.some(matched => matched.id === cargo.id) &&
    (cargoFilter ? 
      cargo.carNumber.includes(cargoFilter) || 
      cargo.id.includes(cargoFilter)
      : true
    )
  );

  const handleCargoSelect = (cargo: ICargo) => {
    setMatchedCargos([...matchedCargos, cargo]);
  };

  const handleCargoRemove = (cargoId: string) => {
    setMatchedCargos(matchedCargos.filter(c => c.id !== cargoId));
  };

  const amountDifference = getAmountDifference();
  const hasAmountMismatch = amountDifference !== 0;

  return (
    <Sheet open={isMatchingSheetOpen} onOpenChange={setMatchingSheetOpen}>
      <SheetContent className="w-full sm:max-w-[720px]">
        <SheetHeader>
          <SheetTitle>세금계산서 매칭</SheetTitle>
        </SheetHeader>

        {/* 세금계산서 정보 요약 */}
        <div className="mt-6 p-4 border rounded-lg space-y-2">
          <div className="flex justify-between">
            <span>운송사명</span>
            <span>{selectedInvoice?.supplierName}</span>
          </div>
          <div className="flex justify-between">
            <span>세금계산서 번호</span>
            <span>{selectedInvoice?.taxId}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>합계금액</span>
            <AmountDisplay amount={selectedInvoice?.totalAmount || 0} size="lg" />
          </div>
        </div>

        {/* 금액 불일치 경고 */}
        {hasAmountMismatch && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>
              세금계산서 금액과 매칭된 화물의 총액이 일치하지 않습니다.
              차액: <AmountDisplay amount={amountDifference} showSign />
            </AlertDescription>
          </Alert>
        )}

        {/* 화물 검색 */}
        <div className="mt-6">
          <Input
            placeholder="차량번호 또는 화물번호로 검색"
            value={cargoFilter}
            onChange={(e) => setCargoFilter(e.target.value)}
          />
        </div>

        {/* 매칭 가능한 화물 목록 */}
        <div className="mt-4 border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>화물번호</TableHead>
                <TableHead>차량번호</TableHead>
                <TableHead className="text-right">배차금</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCargos.map((cargo) => (
                <TableRow key={cargo.id}>
                  <TableCell>{cargo.id}</TableCell>
                  <TableCell>{cargo.carNumber}</TableCell>
                  <TableCell>
                    <AmountDisplay amount={cargo.dispatchAmount} />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCargoSelect(cargo)}
                    >
                      추가
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* 매칭된 화물 목록 */}
        <div className="mt-6">
          <h4 className="font-semibold mb-2">매칭된 화물</h4>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>화물번호</TableHead>
                  <TableHead>차량번호</TableHead>
                  <TableHead className="text-right">배차금</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matchedCargos.map((cargo) => (
                  <TableRow key={cargo.id}>
                    <TableCell>{cargo.id}</TableCell>
                    <TableCell>{cargo.carNumber}</TableCell>
                    <TableCell>
                      <AmountDisplay amount={cargo.dispatchAmount} />
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleCargoRemove(cargo.id)}
                      >
                        제거
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* 합계 및 액션 버튼 */}
        <div className="mt-6 space-y-4">
          <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
            <span className="font-semibold">매칭 총액</span>
            <AmountDisplay amount={getTotalMatchedAmount()} size="lg" />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setMatchingSheetOpen(false)}>
              취소
            </Button>
            <Button 
              onClick={() => {
                // TODO: 정산 대사로 전환 로직 구현
                setMatchingSheetOpen(false);
              }}
            >
              정산 대사로 전환
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}; 