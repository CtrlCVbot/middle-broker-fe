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
import { Search, Filter, X, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { BrokerOrderStatusType } from "@/types/broker-order";

// 필터 옵션 타입 정의
interface IWaitingFilter {
  searchTerm?: string;
  departureCity?: string;
  arrivalCity?: string;
  vehicleType?: string;
  weight?: string;
  status?: BrokerOrderStatusType;
  startDate?: string;
  endDate?: string;
  company?: string;
  manager?: string;
}

// 필터 옵션 프롭스
interface IWaitingSearchProps {
  filter: IWaitingFilter;
  setFilter: (filter: Partial<IWaitingFilter>) => void;
  filterOptions: {
    cities: string[];
    vehicleTypes: string[];
    weightTypes: string[];
    statuses: BrokerOrderStatusType[];
    companies: string[];
    managers: string[];
  };
}

// 필터 요약 텍스트 생성 함수
const getFilterSummaryText = (filter: IWaitingFilter): string => {
  if (
    !filter.departureCity &&
    !filter.arrivalCity &&
    !filter.vehicleType &&
    !filter.weight &&
    !filter.status &&
    !filter.startDate &&
    !filter.endDate &&
    !filter.company &&
    !filter.manager
  ) {
    return "필터";
  }

  const parts = [];
  
  if (filter.startDate && filter.endDate) {
    parts.push(`${filter.startDate}~${filter.endDate}`);
  } else if (filter.startDate) {
    parts.push(`${filter.startDate}~`);
  } else if (filter.endDate) {
    parts.push(`~${filter.endDate}`);
  }
  
  if (filter.status) parts.push(filter.status);
  if (filter.departureCity) parts.push(`출발:${filter.departureCity}`);
  if (filter.arrivalCity) parts.push(`도착:${filter.arrivalCity}`);
  if (filter.vehicleType) parts.push(filter.vehicleType);
  if (filter.weight) parts.push(filter.weight);
  if (filter.company) parts.push(filter.company);
  if (filter.manager) parts.push(filter.manager);
  
  return parts.join(", ");
};

export function WaitingSearch({ filter, setFilter, filterOptions }: IWaitingSearchProps) {
  // 임시 필터 상태 관리
  const [tempFilter, setTempFilter] = useState<IWaitingFilter>({ ...filter });
  
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

  

  // 임시 필터 업데이트 함수
  const handleTempFilterUpdate = (updates: Partial<IWaitingFilter>) => {
    setTempFilter(prev => ({ ...prev, ...updates }));
  };

  // 출발지 도시 변경 시 임시 필터 업데이트
  const handleDepartureCityChange = (value: string) => {
    handleTempFilterUpdate({ departureCity: value === "all" ? undefined : value });
  };

  // 도착지 도시 변경 시 임시 필터 업데이트
  const handleArrivalCityChange = (value: string) => {
    handleTempFilterUpdate({ arrivalCity: value === "all" ? undefined : value });
  };

  // 차량 종류 변경 시 임시 필터 업데이트
  const handleVehicleTypeChange = (value: string) => {
    handleTempFilterUpdate({ vehicleType: value === "all" ? undefined : value });
  };

  // 중량 변경 시 임시 필터 업데이트
  const handleWeightChange = (value: string) => {
    handleTempFilterUpdate({ weight: value === "all" ? undefined : value });
  };
  
  // 배차상태 변경 시 임시 필터 업데이트
  const handleStatusChange = (value: string) => {
    handleTempFilterUpdate({ status: value === "all" ? undefined : value as BrokerOrderStatusType });
  };
  
  // 업체명 변경 시 임시 필터 업데이트
  const handleCompanyChange = (value: string) => {
    handleTempFilterUpdate({ company: value === "all" ? undefined : value });
  };
  
  // 담당자 변경 시 임시 필터 업데이트
  const handleManagerChange = (value: string) => {
    handleTempFilterUpdate({ manager: value === "all" ? undefined : value });
  };
  
  // 시작일 선택 핸들러
  const handleStartDateSelect = (date: Date | undefined) => {
    setStartDate(date);
    if (date) {
      handleTempFilterUpdate({ startDate: format(date, 'yyyy-MM-dd') });
    } else {
      handleTempFilterUpdate({ startDate: undefined });
    }
  };
  
  // 종료일 선택 핸들러
  const handleEndDateSelect = (date: Date | undefined) => {
    setEndDate(date);
    if (date) {
      handleTempFilterUpdate({ endDate: format(date, 'yyyy-MM-dd') });
    } else {
      handleTempFilterUpdate({ endDate: undefined });
    }
  };

  // 필터 적용
  const handleApplyFilter = () => {
    setFilter(tempFilter);
    setOpen(false);
  };

  // 필터 초기화
  const handleResetFilter = () => {
    const emptyFilter: IWaitingFilter = {};
    setFilter(emptyFilter);
    setTempFilter(emptyFilter);
    setStartDate(undefined);
    setEndDate(undefined);
    setOpen(false);
  };

  // 변경 취소
  const handleCancelChanges = () => {
    setTempFilter({ ...filter });
    setStartDate(filter.startDate ? new Date(filter.startDate) : undefined);
    setEndDate(filter.endDate ? new Date(filter.endDate) : undefined);
    setOpen(false);
  };

  // Popover가 열릴 때 현재 필터 값을 임시 필터에 복사
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setTempFilter({ ...filter });
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
    filter.company ||
    filter.manager
  );

  // 현재 선택된 필터 요약 텍스트
  const filterSummary = getFilterSummaryText(filter);

  return (
    <div className="flex flex-col gap-4 md:flex-row items-center mb-4">
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
              <h4 className="font-medium text-sm">정산 대기 화물 필터링</h4>
              
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
              
              {/* 배차상태, 담당자 필터 */}
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
                        {filterOptions.statuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
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

              {/* 업체명 필터 */}
              <div className="space-y-2">
                <Label htmlFor="company">업체명</Label>
                <Select
                  value={tempFilter.company || "all"}
                  onValueChange={handleCompanyChange}
                >
                  <SelectTrigger id="company">
                    <SelectValue placeholder="모든 업체" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">모든 업체</SelectItem>
                    {filterOptions.companies.map((company) => (
                      <SelectItem key={company} value={company}>
                        {company}
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
          placeholder="화물번호, 출발지, 도착지, 업체명 검색"
          className="w-full pl-8"
          value={filter.searchTerm || ""}
          onChange={handleSearchChange}
        />
        {filter.searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-9 px-2"
            onClick={() => setFilter({ searchTerm: "" })}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
} 