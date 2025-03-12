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
import { useOrderStore, getFilterSummaryText } from "@/store/order-store";
import { Search, Filter, X, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { ORDER_STATUS, OrderStatusType } from "@/types/order";

export function OrderSearch() {
  const {
    filter,
    tempFilter,
    setFilter,
    setTempFilter,
    applyTempFilter,
    resetFilter,
    resetTempFilter,
    filterOptions
  } = useOrderStore();

  // Popover 상태 관리
  const [open, setOpen] = useState(false);
  
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

  // 출발지 도시 변경 시 임시 필터 업데이트
  const handleDepartureCityChange = (value: string) => {
    setTempFilter({ departureCity: value === "all" ? undefined : value });
  };

  // 도착지 도시 변경 시 임시 필터 업데이트
  const handleArrivalCityChange = (value: string) => {
    setTempFilter({ arrivalCity: value === "all" ? undefined : value });
  };

  // 차량 종류 변경 시 임시 필터 업데이트
  const handleVehicleTypeChange = (value: string) => {
    setTempFilter({ vehicleType: value === "all" ? undefined : value });
  };

  // 중량 변경 시 임시 필터 업데이트
  const handleWeightChange = (value: string) => {
    setTempFilter({ weight: value === "all" ? undefined : value });
  };
  
  // 배차상태 변경 시 임시 필터 업데이트
  const handleStatusChange = (value: string) => {
    setTempFilter({ status: value === "all" ? undefined : value as OrderStatusType });
  };
  
  // 시작일 선택 핸들러
  const handleStartDateSelect = (date: Date | undefined) => {
    setStartDate(date);
    if (date) {
      setTempFilter({ startDate: format(date, 'yyyy-MM-dd') });
    } else {
      setTempFilter({ startDate: undefined });
    }
  };
  
  // 종료일 선택 핸들러
  const handleEndDateSelect = (date: Date | undefined) => {
    setEndDate(date);
    if (date) {
      setTempFilter({ endDate: format(date, 'yyyy-MM-dd') });
    } else {
      setTempFilter({ endDate: undefined });
    }
  };

  // 필터 적용
  const handleApplyFilter = () => {
    applyTempFilter();
    setOpen(false);
  };

  // 필터 초기화
  const handleResetFilter = () => {
    resetFilter();
    setStartDate(undefined);
    setEndDate(undefined);
    setOpen(false);
  };

  // 변경 취소
  const handleCancelChanges = () => {
    resetTempFilter();
    setStartDate(tempFilter.startDate ? new Date(tempFilter.startDate) : undefined);
    setEndDate(tempFilter.endDate ? new Date(tempFilter.endDate) : undefined);
    setOpen(false);
  };

  // Popover가 열릴 때 현재 필터 값을 임시 필터에 복사
  const handleOpenChange = (open: boolean) => {
    if (open) {
      resetTempFilter();
      setStartDate(filter.startDate ? new Date(filter.startDate) : undefined);
      setEndDate(filter.endDate ? new Date(filter.endDate) : undefined);
    }
    setOpen(open);
  };

  // 필터가 적용되었는지 확인
  const hasActiveFilters = !!(
    filter.departureCity || 
    filter.arrivalCity || 
    filter.vehicleType || 
    filter.weight ||
    filter.status ||
    filter.startDate ||
    filter.endDate
  );

  // 현재 선택된 필터 요약 텍스트
  const filterSummary = getFilterSummaryText(filter);

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
                {filterSummary}
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
              <h4 className="font-medium text-sm">화물 필터링</h4>
              
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
              
              {/* 배차상태 필터 */}
              <div className="space-y-2">
                <Label htmlFor="status">배차상태</Label>
                <Select
                  value={tempFilter.status || "all"}
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="모든 상태" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">모든 상태</SelectItem>
                    {ORDER_STATUS.map((status) => (
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
                <Select
                  value={tempFilter.departureCity || "all"}
                  onValueChange={handleDepartureCityChange}
                >
                  <SelectTrigger id="departure-city">
                    <SelectValue placeholder="모든 출발지" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">모든 출발지</SelectItem>
                    {(filterOptions?.cities || []).map((city) => (
                      <SelectItem key={`dep-${city}`} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* 도착지 필터 */}
              <div className="space-y-2">
                <Label htmlFor="arrival-city">도착지</Label>
                <Select
                  value={tempFilter.arrivalCity || "all"}
                  onValueChange={handleArrivalCityChange}
                >
                  <SelectTrigger id="arrival-city">
                    <SelectValue placeholder="모든 도착지" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">모든 도착지</SelectItem>
                    {(filterOptions?.cities || []).map((city) => (
                      <SelectItem key={`arr-${city}`} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* 차량 종류 필터 */}
              <div className="space-y-2">
                <Label htmlFor="vehicle-type">차량 종류</Label>
                <Select
                  value={tempFilter.vehicleType || "all"}
                  onValueChange={handleVehicleTypeChange}
                >
                  <SelectTrigger id="vehicle-type">
                    <SelectValue placeholder="모든 차량" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">모든 차량</SelectItem>
                    {(filterOptions?.vehicleTypes || []).map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* 중량 필터 */}
              <div className="space-y-2">
                <Label htmlFor="weight">중량</Label>
                <Select
                  value={tempFilter.weight || "all"}
                  onValueChange={handleWeightChange}
                >
                  <SelectTrigger id="weight">
                    <SelectValue placeholder="모든 중량" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">모든 중량</SelectItem>
                    {(filterOptions?.weightTypes || []).map((weight) => (
                      <SelectItem key={weight} value={weight}>
                        {weight}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
          placeholder="ID, 위치, 운전자 등으로 검색..."
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