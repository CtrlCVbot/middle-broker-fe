"use client";

import React, { useState } from "react";
import { Search, X, Calendar, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useSettlementStore } from "@/store/settlement-store";
import { SETTLEMENT_STATUS, SettlementStatus } from "@/types/settlement";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { cn } from "@/lib/utils";

export function SettlementSearch() {
  const {
    filter,
    setFilter,
    resetFilter,
    isSearchPanelOpen,
    openSearchPanel,
    closeSearchPanel,
  } = useSettlementStore();

  // 더 자세한 검색을 위한 로컬 상태
  const [localFilter, setLocalFilter] = useState<{
    orderId?: string;
    departureCity?: string;
    arrivalCity?: string;
    driverName?: string;
    status?: SettlementStatus;
    startDate?: Date;
    endDate?: Date;
    minAmount?: string;
    maxAmount?: string;
  }>({
    orderId: filter.orderId,
    departureCity: filter.departureCity,
    arrivalCity: filter.arrivalCity,
    driverName: filter.driverName,
    status: filter.status,
    startDate: filter.startDate ? new Date(filter.startDate) : undefined,
    endDate: filter.endDate ? new Date(filter.endDate) : undefined,
    minAmount: filter.minAmount?.toString(),
    maxAmount: filter.maxAmount?.toString(),
  });

  // 입력 필드 변경 핸들러
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocalFilter((prev) => ({ ...prev, [name]: value }));
  };

  // 상태 선택 핸들러
  const handleStatusChange = (value: string) => {
    setLocalFilter((prev) => ({ 
      ...prev, 
      status: value as SettlementStatus 
    }));
  };

  // 날짜 선택 핸들러
  const handleDateChange = (date: Date | undefined, fieldName: 'startDate' | 'endDate') => {
    setLocalFilter((prev) => ({ ...prev, [fieldName]: date }));
  };

  // 검색어 입력 핸들러
  const handleSearchTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value;
    setFilter({ searchTerm });
  };

  // 필터 적용 핸들러
  const applyFilter = () => {
    setFilter({
      orderId: localFilter.orderId,
      departureCity: localFilter.departureCity,
      arrivalCity: localFilter.arrivalCity,
      driverName: localFilter.driverName,
      status: localFilter.status,
      startDate: localFilter.startDate?.toISOString().split('T')[0],
      endDate: localFilter.endDate?.toISOString().split('T')[0],
      minAmount: localFilter.minAmount ? parseInt(localFilter.minAmount) : undefined,
      maxAmount: localFilter.maxAmount ? parseInt(localFilter.maxAmount) : undefined,
    });
    closeSearchPanel();
  };

  // 필터 초기화 핸들러
  const handleResetFilter = () => {
    resetFilter();
    setLocalFilter({
      orderId: undefined,
      departureCity: undefined,
      arrivalCity: undefined,
      driverName: undefined,
      status: undefined,
      startDate: undefined,
      endDate: undefined,
      minAmount: undefined,
      maxAmount: undefined,
    });
  };

  // 활성화된 필터 개수
  const activeFilterCount = Object.values(filter).filter(Boolean).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="정산번호, 화물번호, 차주명, 연락처 등을 검색하세요"
            className="pl-8"
            value={filter.searchTerm || ""}
            onChange={handleSearchTermChange}
          />
          {filter.searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-9 w-9 p-0"
              onClick={() => setFilter({ searchTerm: undefined })}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">검색어 지우기</span>
            </Button>
          )}
        </div>
        <Sheet open={isSearchPanelOpen} onOpenChange={isSearchPanelOpen ? closeSearchPanel : openSearchPanel}>
          <SheetTrigger asChild>
            <Button variant="outline" className="shrink-0 gap-1">
              <Filter className="h-4 w-4" />
              필터
              {activeFilterCount > 0 && (
                <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>검색 필터</SheetTitle>
              <SheetDescription>
                원하는 조건을 설정하여 정산 정보를 검색하세요.
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="orderId">화물 번호</Label>
                <Input
                  id="orderId"
                  name="orderId"
                  placeholder="화물 번호 입력"
                  value={localFilter.orderId || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="departureCity">출발지</Label>
                <Input
                  id="departureCity"
                  name="departureCity"
                  placeholder="출발지 입력"
                  value={localFilter.departureCity || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="arrivalCity">도착지</Label>
                <Input
                  id="arrivalCity"
                  name="arrivalCity"
                  placeholder="도착지 입력"
                  value={localFilter.arrivalCity || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="driverName">차주명</Label>
                <Input
                  id="driverName"
                  name="driverName"
                  placeholder="차주명 입력"
                  value={localFilter.driverName || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">정산 상태</Label>
                <Select
                  value={localFilter.status || ""}
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="정산 상태 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">전체</SelectItem>
                    {SETTLEMENT_STATUS.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>조회 시작일</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !localFilter.startDate && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {localFilter.startDate ? (
                          format(localFilter.startDate, "PPP", { locale: ko })
                        ) : (
                          <span>시작일 선택</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={localFilter.startDate}
                        onSelect={(date) => handleDateChange(date, 'startDate')}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>조회 종료일</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !localFilter.endDate && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {localFilter.endDate ? (
                          format(localFilter.endDate, "PPP", { locale: ko })
                        ) : (
                          <span>종료일 선택</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={localFilter.endDate}
                        onSelect={(date) => handleDateChange(date, 'endDate')}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minAmount">최소 금액</Label>
                  <Input
                    id="minAmount"
                    name="minAmount"
                    type="number"
                    placeholder="최소 금액"
                    value={localFilter.minAmount || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxAmount">최대 금액</Label>
                  <Input
                    id="maxAmount"
                    name="maxAmount"
                    type="number"
                    placeholder="최대 금액"
                    value={localFilter.maxAmount || ""}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
            <SheetFooter>
              <Button variant="outline" onClick={handleResetFilter}>
                초기화
              </Button>
              <SheetClose asChild>
                <Button onClick={applyFilter}>적용</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
} 