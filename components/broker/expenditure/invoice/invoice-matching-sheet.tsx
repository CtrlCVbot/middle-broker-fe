'use client';

import { useInvoiceStore } from "@/store/expenditure/invoice-store";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AmountDisplay } from "../shared/amount-display";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ICargo } from "@/types/broker/expenditure";
import { useEffect, useState } from "react";
import { generateMockCargos } from "@/utils/mockdata/mock-invoices";

export const InvoiceMatchingSheet = () => {
  const {
    selectedInvoice,
    isMatchingSheetOpen,
    setMatchingSheetOpen,
    matchedCargos,
    setMatchedCargos,
    getTotalMatchedAmount,
    getAmountDifference
  } = useInvoiceStore();

  const [cargoFilter, setCargoFilter] = useState("");
  
  // 목업 데이터 - 실제로는 API에서 가져올 것
  const [availableCargos, setAvailableCargos] = useState<ICargo[]>([]);
  
  // 컴포넌트 마운트 시 목업 데이터 로드
  useEffect(() => {
    setAvailableCargos(generateMockCargos(20));
  }, []);
  
  // 세금계산서가 변경될 때 해당 사업자번호에 맞는 화물 자동 매칭
  useEffect(() => {
    if (selectedInvoice && matchedCargos.length === 0) {
      // 선택된 세금계산서와 사업자번호가 일치하는 화물을 최대 3개까지 자동 매칭
      const autoMatchCargos = availableCargos
        .filter(cargo => cargo.businessNumber === selectedInvoice.businessNumber)
        .slice(0, 3);
      
      if (autoMatchCargos.length > 0) {
        setMatchedCargos(autoMatchCargos);
      }
    }
  }, [selectedInvoice, availableCargos, matchedCargos.length, setMatchedCargos]);

  const filteredCargos = availableCargos.filter(cargo =>
    (!selectedInvoice || cargo.businessNumber === selectedInvoice.businessNumber) &&
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

  // 시트가 닫힐 때 필터 초기화
  const handleSheetOpenChange = (open: boolean) => {
    if (!open) {
      setCargoFilter("");
    }
    setMatchingSheetOpen(open);
  };

  return (
    <Sheet open={isMatchingSheetOpen} onOpenChange={handleSheetOpenChange}>
      <SheetContent className="w-full sm:max-w-[720px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{selectedInvoice ? '세금계산서 매칭' : '세금계산서 생성'}</SheetTitle>
        </SheetHeader>

        {/* 세금계산서 정보 요약 (선택된 세금계산서가 있을 경우) */}
        {selectedInvoice && (
          <div className="mt-6 p-4 border rounded-lg space-y-2">
            <div className="flex justify-between">
              <span>운송사명</span>
              <span>{selectedInvoice.supplierName}</span>
            </div>
            <div className="flex justify-between">
              <span>세금계산서 번호</span>
              <span>{selectedInvoice.taxId}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>합계금액</span>
              <AmountDisplay amount={selectedInvoice.totalAmount || 0} size="lg" />
            </div>
          </div>
        )}

        {/* 세금계산서 정보 입력 (신규 생성 시) */}
        {!selectedInvoice && (
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">운송사명</label>
              <Input placeholder="운송사명 입력" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">사업자번호</label>
              <Input placeholder="000-00-00000" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">세금계산서 번호</label>
              <Input placeholder="세금계산서 번호 입력" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">작성일</label>
              <Input type="date" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">공급가액</label>
                <Input type="number" placeholder="0" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">세액</label>
                <Input type="number" placeholder="0" />
              </div>
            </div>
          </div>
        )}

        {/* 금액 불일치 경고 */}
        {selectedInvoice && hasAmountMismatch && (
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
              {filteredCargos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                    매칭 가능한 화물이 없습니다
                  </TableCell>
                </TableRow>
              ) : (
                filteredCargos.map((cargo) => (
                  <TableRow key={cargo.id}>
                    <TableCell>{cargo.id}</TableCell>
                    <TableCell>{cargo.carNumber}</TableCell>
                    <TableCell className="text-right">
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
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* 매칭된 화물 목록 */}
        {matchedCargos.length > 0 && (
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
                      <TableCell className="text-right">
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
        )}

        {/* 합계 및 액션 버튼 */}
        <div className="mt-6 space-y-4">
          {matchedCargos.length > 0 && (
            <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
              <span className="font-semibold">매칭 총액</span>
              <AmountDisplay amount={getTotalMatchedAmount()} size="lg" />
            </div>
          )}
          
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
              {selectedInvoice ? '정산 대사로 전환' : '세금계산서 생성'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}; 