"use client";

import React, { useState, useRef } from "react";
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
import { useBrokerOrderStore, getFilterSummaryText } from "@/store/broker-order-store";
import { Search, Filter, X, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { BROKER_ORDER_STATUS, BrokerOrderStatusType, CallCenterType } from "@/types/broker-order";

export function BrokerOrderSearch() {
  const {
    filter,
    tempFilter,
    setFilter,
    setTempFilter,
    applyTempFilter,
    resetFilter,
    resetTempFilter,
    filterOptions
  } = useBrokerOrderStore();

  // Popover 상태 관리
  const [open, setOpen] = useState(false);
  
  // 날짜 상태 관리
  const [startDate, setStartDate] = useState<Date | undefined>(
    tempFilter.startDate ? new Date(tempFilter.startDate) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    tempFilter.endDate ? new Date(tempFilter.endDate) : undefined
  );

  // 검색어 상태 추가 (컴포넌트 내부 상태)
  const [searchInputValue, setSearchInputValue] = useState<string>(filter.searchTerm || '');
  // 디바운스 타이머 참조 추가
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 검색어 입력 시 필터 업데이트
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // 로컬 상태 즉시 업데이트
    setSearchInputValue(value);
    
    // 이전 타이머 취소
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }
    
    // 디바운스: 500ms 후에 필터 업데이트
    searchTimerRef.current = setTimeout(() => {
      setFilter({ ...filter, searchTerm: value });
    }, 500);
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
    setTempFilter({ status: value === "all" ? undefined : value as BrokerOrderStatusType });
  };
  
  // 콜센터 변경 시 임시 필터 업데이트
  const handleCallCenterChange = (value: string) => {
    setTempFilter({ callCenter: value === "all" ? undefined : value as CallCenterType });
  };
  
  // 담당자 변경 시 임시 필터 업데이트
  const handleManagerChange = (value: string) => {
    setTempFilter({ manager: value === "all" ? undefined : value });
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
    filter.endDate ||
    filter.callCenter ||
    filter.manager
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
              <h4 className="font-medium text-sm">중개 화물 필터링</h4>
              
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
              
              {/* 배차상태, 콜센터 필터 */}
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
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
                      {BROKER_ORDER_STATUS.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  </div>
                  <div>
                    <Label htmlFor="callCenter">콜센터</Label>
                    <Select
                      value={tempFilter.callCenter || "all"}
                      onValueChange={handleCallCenterChange}
                    >
                      <SelectTrigger id="callCenter">
                        <SelectValue placeholder="모든 콜센터" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">모든 콜센터</SelectItem>
                        {filterOptions.callCenters.map((callCenter) => (
                          <SelectItem key={callCenter} value={callCenter}>
                            {callCenter}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              {/* 출발지 필터 */}
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="departureCity">출발지</Label>
                    <Select
                      value={tempFilter.departureCity || "all"}
                  onValueChange={handleDepartureCityChange}
                >
                  <SelectTrigger id="departureCity">
                    <SelectValue placeholder="모든 출발지" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">모든 출발지</SelectItem>
                    {filterOptions.cities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                    </SelectContent>
                  </Select>
                  </div>
                  <div>
                    <Label htmlFor="arrivalCity">도착지</Label>
                    <Select
                      value={tempFilter.arrivalCity || "all"}
                      onValueChange={handleArrivalCityChange}
                    >
                      <SelectTrigger id="arrivalCity">
                        <SelectValue placeholder="모든 도착지" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">모든 도착지</SelectItem>
                      {filterOptions.cities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              {/*  필터 */}
              
              
              {/* 차량 종류, 중량 필터 */}
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
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
                        {filterOptions.weightTypes.map((weight) => (
                          <SelectItem key={weight} value={weight}>
                            {weight}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="vehicleType">차량 종류</Label>
                    <Select
                      value={tempFilter.vehicleType || "all"}
                      onValueChange={handleVehicleTypeChange}
                    >
                      <SelectTrigger id="vehicleType">
                        <SelectValue placeholder="모든 차량" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">모든 차량</SelectItem>
                        {filterOptions.vehicleTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* 담당자 필터 */}
              <div className="space-y-2">
                <Label htmlFor="manager">담당자</Label>
                <Select
                  value={tempFilter.manager || "all"}
                  onValueChange={handleManagerChange}
                >
                  <SelectTrigger id="manager">
                    <SelectValue placeholder="모든 담당자" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">모든 담당자</SelectItem>
                    {filterOptions.managers.map((manager) => (
                      <SelectItem key={manager} value={manager}>
                        {manager}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* 버튼 그룹 */}
              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelChanges}
                >
                  취소
                </Button>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetFilter}
                  >
                    초기화
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
      <div className="relative w-full">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="화물번호, 출발지, 도착지, 차주명 검색"
          className="w-full pl-8"
          value={searchInputValue}
          onChange={handleSearchChange}
        />
        {searchInputValue && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-9 px-2"
            onClick={() => {
              setSearchInputValue("");
              setFilter({ ...filter, searchTerm: "" });
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
} 