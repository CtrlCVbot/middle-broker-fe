"use client";

import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useBrokerCompanyStore, getFilterSummaryText } from '@/store/broker-company-store';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Search, Filter, X, CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { CompanyType, StatementType, CompanyStatus } from '@/types/broker-company';

export function BrokerCompanySearch() {
  const {
    filter,
    tempFilter,
    filterOptions,
    setFilter,
    setTempFilter,
    applyTempFilter,
    resetFilter,
    resetTempFilter
  } = useBrokerCompanyStore();

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

  // 업체 구분 변경 시 임시 필터 업데이트
  const handleTypeChange = (value: string) => {
    setTempFilter({ type: value === "all" ? '' : value as CompanyType });
  };

  // 전표 구분 변경 시 임시 필터 업데이트
  const handleStatementTypeChange = (value: string) => {
    setTempFilter({ statementType: value === "all" ? '' : value as StatementType });
  };

  // 업체 상태 변경 시 임시 필터 업데이트
  const handleStatusChange = (value: string) => {
    setTempFilter({ status: value === "all" ? '' : value as CompanyStatus });
  };
  
  // 시작일 선택 핸들러
  const handleStartDateSelect = (date: Date | undefined) => {
    setStartDate(date);
    if (date) {
      setTempFilter({ startDate: format(date, 'yyyy-MM-dd') });
    } else {
      setTempFilter({ startDate: null });
    }
  };
  
  // 종료일 선택 핸들러
  const handleEndDateSelect = (date: Date | undefined) => {
    setEndDate(date);
    if (date) {
      setTempFilter({ endDate: format(date, 'yyyy-MM-dd') });
    } else {
      setTempFilter({ endDate: null });
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
    setStartDate(filter.startDate ? new Date(filter.startDate) : undefined);
    setEndDate(filter.endDate ? new Date(filter.endDate) : undefined);
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
    filter.type || 
    filter.statementType || 
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
                  {Object.values(filter).filter(v => v !== '' && v !== null).length - (filter.searchTerm ? 1 : 0)}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-4" align="start">
            <div className="space-y-4">
              <h4 className="font-medium text-sm">업체 필터링</h4>
              
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
              
              {/* 업체 구분과 전표 구분 필터 */}
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="companyType">업체 구분</Label>
                    <Select
                      value={tempFilter.type || "all"}
                      onValueChange={handleTypeChange}
                    >
                      <SelectTrigger id="companyType">
                        <SelectValue placeholder="모든 업체 구분" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">모든 업체 구분</SelectItem>
                        {filterOptions.types.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="statementType">전표 구분</Label>
                    <Select
                      value={tempFilter.statementType || "all"}
                      onValueChange={handleStatementTypeChange}
                    >
                      <SelectTrigger id="statementType">
                        <SelectValue placeholder="모든 전표 구분" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">모든 전표 구분</SelectItem>
                        {filterOptions.statementTypes.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              {/* 상태 필터 */}
              <div className="space-y-2">
                <Label htmlFor="status">업체 상태</Label>
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
                      <SelectItem key={status} value={status}>{status}</SelectItem>
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
          placeholder="업체명, 대표자, 전화번호, 사업자번호로 검색"
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