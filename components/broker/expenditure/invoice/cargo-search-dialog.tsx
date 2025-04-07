'use client';

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, CalendarIcon } from "lucide-react";
import { ICargo } from "@/types/broker/expenditure";
import { AmountDisplay } from "../shared/amount-display";
import { format } from "date-fns";
import { generateMockCargos } from "@/utils/mockdata/mock-invoices";

interface CargoSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (selectedCargos: ICargo[]) => void;
  excludeCargoIds: string[];
}

interface CargoFilter {
  startDate: string;
  endDate: string;
  searchTerm: string;
}

export function CargoSearchDialog({
  open,
  onOpenChange,
  onSelect,
  excludeCargoIds
}: CargoSearchDialogProps) {
  const [selectedCargos, setSelectedCargos] = useState<ICargo[]>([]);
  const [availableCargos, setAvailableCargos] = useState<ICargo[]>(generateMockCargos(20));
  const [cargoFilter, setCargoFilter] = useState<CargoFilter>({
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    searchTerm: ''
  });

  const handleFilterChange = (key: keyof CargoFilter, value: string) => {
    setCargoFilter(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    // TODO: API 호출로 변경
    const filtered = generateMockCargos(20)
      .filter(cargo => {
        // 운송완료된 화물만 필터링 (실제 API에서는 이 조건을 쿼리에 포함)
        const searchTermMatches = !cargoFilter.searchTerm || 
          cargo.id.toLowerCase().includes(cargoFilter.searchTerm.toLowerCase()) ||
          cargo.businessNumber.includes(cargoFilter.searchTerm) ||
          cargo.driver?.name?.toLowerCase().includes(cargoFilter.searchTerm.toLowerCase()) ||
          cargo.departureLocation.toLowerCase().includes(cargoFilter.searchTerm.toLowerCase()) ||
          cargo.arrivalLocation.toLowerCase().includes(cargoFilter.searchTerm.toLowerCase());
        
        return searchTermMatches;
      });
    setAvailableCargos(filtered);
  };

  const handleCargoSelect = (cargo: ICargo) => {
    setSelectedCargos(prev => {
      const isSelected = prev.some(c => c.id === cargo.id);
      if (isSelected) {
        return prev.filter(c => c.id !== cargo.id);
      } else {
        return [...prev, cargo];
      }
    });
  };

  const handleConfirm = () => {
    onSelect(selectedCargos);
    setSelectedCargos([]);
    onOpenChange(false);
  };

  const filteredCargos = availableCargos.filter(
    cargo => !excludeCargoIds.includes(cargo.id)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>화물 검색</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden">
          {/* 검색 필터 */}
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input
                  type="date"
                  value={cargoFilter.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="pl-10"
                />
              </div>
              <span className="flex items-center">~</span>
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input
                  type="date"
                  value={cargoFilter.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input
                  placeholder="화물번호, 사업자번호, 차주명, 상/하차지 검색"
                  value={cargoFilter.searchTerm}
                  onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4 mr-2" />
                검색
              </Button>
            </div>
          </div>

          {/* 화물 목록 테이블 */}
          <div className="border rounded-lg overflow-hidden flex-1">
            <div className="overflow-auto max-h-[calc(90vh-300px)]">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[80px]">선택</TableHead>
                    <TableHead className="w-[120px]">화물번호</TableHead>
                    <TableHead className="w-[150px]">상차일시</TableHead>
                    <TableHead>상차/하차지</TableHead>
                    <TableHead className="w-[120px]">사업자번호</TableHead>
                    <TableHead className="w-[100px]">차주</TableHead>
                    <TableHead className="w-[120px] text-right">배차금</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCargos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                        검색된 화물이 없습니다.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCargos.map((cargo) => {
                      const isSelected = selectedCargos.some(c => c.id === cargo.id);
                      return (
                        <TableRow 
                          key={cargo.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleCargoSelect(cargo)}
                        >
                          <TableCell>
                            <div className="flex items-center justify-center">
                              <div className={`w-4 h-4 border rounded ${isSelected ? 'bg-primary border-primary' : 'border-input'}`} />
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{cargo.id}</TableCell>
                          <TableCell>{cargo.transportDate}</TableCell>
                          <TableCell className="max-w-[200px]">
                            <div className="flex flex-col">
                              <span className="truncate">↑ {cargo.departureLocation}</span>
                              <span className="truncate">↓ {cargo.arrivalLocation}</span>
                            </div>
                          </TableCell>
                          <TableCell>{cargo.businessNumber}</TableCell>
                          <TableCell>{cargo.driver?.name || "-"}</TableCell>
                          <TableCell className="text-right">
                            <AmountDisplay amount={cargo.dispatchAmount} />
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {selectedCargos.length}개 선택됨
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button onClick={handleConfirm} disabled={selectedCargos.length === 0}>
              선택 완료
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 