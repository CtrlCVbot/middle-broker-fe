"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { useSettlementStore } from "@/store/settlement-store";
import { Search, Filter, X, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { SETTLEMENT_STATUS, SettlementStatus } from "@/types/settlement";

export function SettlementSearch() {
  const {
    filter,
    setFilter,
    resetFilter,
  } = useSettlementStore();

  // Popover 상태 관리
  const [open, setOpen] = useState(false);

  // 임시 필터 상태
  const [tempFilter, setTempFilter] = useState({
    orderId: filter.orderId,
    departureCity: filter.departureCity,
    arrivalCity: filter.arrivalCity,
    driverName: filter.driverName,
    status: filter.status,
    startDate: filter.startDate,
    endDate: filter.endDate,
    minAmount: filter.minAmount?.toString(),
    maxAmount: filter.maxAmount?.toString(),
  });
  
  // 날짜 상태 관리
  const [startDate, setStartDate] = useState<Date | undefined>(
    tempFilter.startDate ? new Date(tempFilter.startDate) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    tempFilter.endDate ? new Date(tempFilter.endDate) : undefined
  );

  // 검색어 입력 시 필터 업데이트
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter({ searchTerm: e.target.value });
  };

  // 화물 번호 변경 핸들러
  const handleOrderIdChange = (value: string) => {
    setTempFilter({ ...tempFilter, orderId: value === "all" ? undefined : value });
  };

  // 출발지 도시 변경 핸들러
  const handleDepartureCityChange = (value: string) => {
    setTempFilter({ ...tempFilter, departureCity: value === "all" ? undefined : value });
  };

  // 도착지 도시 변경 핸들러
  const handleArrivalCityChange = (value: string) => {
    setTempFilter({ ...tempFilter, arrivalCity: value === "all" ? undefined : value });
  };

  // 차주명 변경 핸들러
  const handleDriverNameChange = (value: string) => {
    setTempFilter({ ...tempFilter, driverName: value === "all" ? undefined : value });
  };

  // 정산 상태 변경 핸들러
  const handleStatusChange = (value: string) => {
    setTempFilter({ 
      ...tempFilter, 
      status: value === "all" ? undefined : value as SettlementStatus 
    });
  };

  // 최소 금액 변경 핸들러
  const handleMinAmountChange = (value: string) => {
    setTempFilter({ ...tempFilter, minAmount: value === "" ? undefined : value });
  };

  // 최대 금액 변경 핸들러
  const handleMaxAmountChange = (value: string) => {
    setTempFilter({ ...tempFilter, maxAmount: value === "" ? undefined : value });
  };
  
  // 시작일 선택 핸들러
  const handleStartDateSelect = (date: Date | undefined) => {
    setStartDate(date);
    if (date) {
      setTempFilter({ ...tempFilter, startDate: format(date, 'yyyy-MM-dd') });
    } else {
      setTempFilter({ ...tempFilter, startDate: undefined });
    }
  };
  
  // 종료일 선택 핸들러
  const handleEndDateSelect = (date: Date | undefined) => {
    setEndDate(date);
    if (date) {
      setTempFilter({ ...tempFilter, endDate: format(date, 'yyyy-MM-dd') });
    } else {
      setTempFilter({ ...tempFilter, endDate: undefined });
    }
  };

  // 필터 적용
  const handleApplyFilter = () => {
    setFilter({
      orderId: tempFilter.orderId,
      departureCity: tempFilter.departureCity,
      arrivalCity: tempFilter.arrivalCity,
      driverName: tempFilter.driverName,
      status: tempFilter.status,
      startDate: tempFilter.startDate,
      endDate: tempFilter.endDate,
      minAmount: tempFilter.minAmount ? parseInt(tempFilter.minAmount) : undefined,
      maxAmount: tempFilter.maxAmount ? parseInt(tempFilter.maxAmount) : undefined,
    });
    setOpen(false);
  };

  // 필터 초기화
  const handleResetFilter = () => {
    resetFilter();
    setTempFilter({
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
    setStartDate(undefined);
    setEndDate(undefined);
  };

  // 변경 취소
  const handleCancelChanges = () => {
    setTempFilter({
      orderId: filter.orderId,
      departureCity: filter.departureCity,
      arrivalCity: filter.arrivalCity,
      driverName: filter.driverName,
      status: filter.status,
      startDate: filter.startDate,
      endDate: filter.endDate,
      minAmount: filter.minAmount?.toString(),
      maxAmount: filter.maxAmount?.toString(),
    });
    setStartDate(filter.startDate ? new Date(filter.startDate) : undefined);
    setEndDate(filter.endDate ? new Date(filter.endDate) : undefined);
    setOpen(false);
  };

  // Popover가 열릴 때 현재 필터 값을 임시 필터에 복사
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setTempFilter({
        orderId: filter.orderId,
        departureCity: filter.departureCity,
        arrivalCity: filter.arrivalCity,
        driverName: filter.driverName,
        status: filter.status,
        startDate: filter.startDate,
        endDate: filter.endDate,
        minAmount: filter.minAmount?.toString(),
        maxAmount: filter.maxAmount?.toString(),
      });
      setStartDate(filter.startDate ? new Date(filter.startDate) : undefined);
      setEndDate(filter.endDate ? new Date(filter.endDate) : undefined);
    }
    setOpen(open);
  };

  // 필터가 적용되었는지 확인
  const hasActiveFilters = !!(
    filter.orderId || 
    filter.departureCity || 
    filter.arrivalCity || 
    filter.driverName ||
    filter.status ||
    filter.startDate ||
    filter.endDate ||
    filter.minAmount ||
    filter.maxAmount
  );

  // 현재 선택된 필터 요약 텍스트
  const getFilterSummaryText = () => {
    if (!hasActiveFilters) {
      return "필터 설정";
    }
    
    const parts = [];
    if (filter.status) parts.push(`상태: ${filter.status}`);
    if (filter.departureCity) parts.push(`출발: ${filter.departureCity}`);
    if (filter.arrivalCity) parts.push(`도착: ${filter.arrivalCity}`);
    if (filter.driverName) parts.push(`차주: ${filter.driverName}`);
    if (filter.orderId) parts.push(`화물번호: ${filter.orderId}`);
    if (filter.startDate) parts.push(`시작일: ${filter.startDate}`);
    if (filter.endDate) parts.push(`종료일: ${filter.endDate}`);
    if (filter.minAmount) parts.push(`최소금액: ${filter.minAmount}원`);
    if (filter.maxAmount) parts.push(`최대금액: ${filter.maxAmount}원`);
    
    if (parts.length > 0) {
      return parts.join(", ").length > 30 
        ? parts.join(", ").substring(0, 30) + "..." 
        : parts.join(", ");
    }
    
    return "필터 설정";
  };

  return (
    <div className="flex flex-col gap-4 md:flex-row items-center mb-6">
      {/* 필터 Popover 버튼 */}
      <div className="w-full md:w-auto">
        <Popover open={open} onOpenChange={handleOpenChange}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className={cn(
                "flex items-center gap-2 w-full md:w-auto border-dashed",
                hasActiveFilters ? "border-primary text-primary" : ""
              )}
            >
              <Filter className="h-4 w-4" />
              <span className="max-w-[150px] md:max-w-[200px] truncate">
                {getFilterSummaryText()}
              </span>
              {hasActiveFilters && (
                <Badge 
                  variant="secondary" 
                  className="ml-1 rounded-sm px-1 font-normal"
                >
                  {Object.values(filter).filter(Boolean).length - (filter.searchTerm ? 1 : 0)}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-4" align="start">
            <div className="space-y-4">
              <h4 className="font-medium text-sm">정산 필터링</h4>
              
              {/* 시작일 필터 */}
              <div className="space-y-2">
                <Label>시작일</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? (
                        format(startDate, "yyyy-MM-dd")
                      ) : (
                        <span>검색 시작일</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={handleStartDateSelect}
                      initialFocus
                      locale={ko}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              {/* 종료일 필터 */}
              <div className="space-y-2">
                <Label>종료일</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? (
                        format(endDate, "yyyy-MM-dd")
                      ) : (
                        <span>검색 종료일</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={handleEndDateSelect}
                      initialFocus
                      locale={ko}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              {/* 정산 상태 필터 */}
              <div className="space-y-2">
                <Label htmlFor="status">정산 상태</Label>
                <Select
                  value={tempFilter.status || "all"}
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="모든 상태" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">모든 상태</SelectItem>
                    {SETTLEMENT_STATUS.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* 출발지 필터 */}
              <div className="space-y-2">
                <Label htmlFor="departure-city">출발지</Label>
                <Input
                  id="departure-city"
                  placeholder="출발지 입력"
                  value={tempFilter.departureCity || ""}
                  onChange={(e) => setTempFilter({ ...tempFilter, departureCity: e.target.value || undefined })}
                />
              </div>
              
              {/* 도착지 필터 */}
              <div className="space-y-2">
                <Label htmlFor="arrival-city">도착지</Label>
                <Input
                  id="arrival-city"
                  placeholder="도착지 입력"
                  value={tempFilter.arrivalCity || ""}
                  onChange={(e) => setTempFilter({ ...tempFilter, arrivalCity: e.target.value || undefined })}
                />
              </div>

              {/* 차주명 필터 */}
              <div className="space-y-2">
                <Label htmlFor="driver-name">차주명</Label>
                <Input
                  id="driver-name"
                  placeholder="차주명 입력"
                  value={tempFilter.driverName || ""}
                  onChange={(e) => setTempFilter({ ...tempFilter, driverName: e.target.value || undefined })}
                />
              </div>

              {/* 화물 번호 필터 */}
              <div className="space-y-2">
                <Label htmlFor="order-id">화물 번호</Label>
                <Input
                  id="order-id"
                  placeholder="화물 번호 입력"
                  value={tempFilter.orderId || ""}
                  onChange={(e) => setTempFilter({ ...tempFilter, orderId: e.target.value || undefined })}
                />
              </div>
              
              {/* 금액 범위 필터 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min-amount">최소 금액</Label>
                  <Input
                    id="min-amount"
                    type="number"
                    placeholder="최소 금액"
                    value={tempFilter.minAmount || ""}
                    onChange={(e) => setTempFilter({ ...tempFilter, minAmount: e.target.value || undefined })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-amount">최대 금액</Label>
                  <Input
                    id="max-amount"
                    type="number"
                    placeholder="최대 금액"
                    value={tempFilter.maxAmount || ""}
                    onChange={(e) => setTempFilter({ ...tempFilter, maxAmount: e.target.value || undefined })}
                  />
                </div>
              </div>
              
              {/* 버튼 영역 */}
              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilter}
                  disabled={!hasActiveFilters}
                >
                  초기화
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelChanges}
                  >
                    취소
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleApplyFilter}
                  >
                    적용
                  </Button>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      {/* 검색 입력 필드 */}
      <div className="flex items-center gap-2 w-full md:w-[300px] lg:w-[400px]">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="정산번호, 화물번호, 차주명 등으로 검색..."
          className="flex-1"
          value={filter.searchTerm || ""}
          onChange={handleSearchChange}
        />
        {filter.searchTerm && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setFilter({ searchTerm: "" })}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
} 