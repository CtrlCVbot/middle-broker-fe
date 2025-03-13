"use client";

import React, { useEffect, useState } from 'react';
import { Search, Filter, X, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { format } from 'date-fns';

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

  const [searchValue, setSearchValue] = useState(filter.searchTerm || '');
  const [openPopover, setOpenPopover] = useState(false);
  const [searchDebounceTimeout, setSearchDebounceTimeout] = useState<NodeJS.Timeout | null>(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  // 검색어 변경 핸들러 (디바운스 적용)
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    
    if (searchDebounceTimeout) {
      clearTimeout(searchDebounceTimeout);
    }
    
    // 500ms 디바운스 적용
    const timeout = setTimeout(() => {
      setFilter({ searchTerm: value });
    }, 500);
    
    setSearchDebounceTimeout(timeout);
  };

  // 검색어 초기화 핸들러
  const handleClearSearch = () => {
    setSearchValue('');
    setFilter({ searchTerm: '' });
  };

  // 필터 팝오버 열기 시 임시 필터 초기화
  const handleOpenPopover = () => {
    resetTempFilter(); // 현재 적용된 필터로 임시 필터 리셋
    setOpenPopover(true);
  };

  // 필터 초기화 핸들러
  const handleResetFilter = () => {
    resetFilter();
    setOpenPopover(false);
  };

  // 필터 적용 핸들러
  const handleApplyFilter = () => {
    applyTempFilter();
    setOpenPopover(false);
  };

  // 날짜 선택 핸들러
  const handleStartDateSelect = (date: Date | undefined) => {
    setTempFilter({
      startDate: date ? format(date, 'yyyy-MM-dd') : null
    });
    setShowStartDatePicker(false);
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    setTempFilter({
      endDate: date ? format(date, 'yyyy-MM-dd') : null
    });
    setShowEndDatePicker(false);
  };

  return (
    <div className="flex flex-col gap-4 mb-4">
      
      <div className="flex flex-col sm:flex-row gap-2 w-full">

        {/* 필터 팝오버 */}
        <Popover open={openPopover} onOpenChange={setOpenPopover}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-2 whitespace-nowrap"
              onClick={handleOpenPopover}
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">필터</span>
              {Object.values(filter).some(v => (v !== '' && v !== null)) && (
                <Badge variant="secondary" className="ml-1">
                  {getFilterSummaryText(filter)}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[280px] sm:w-[400px]" align="end">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">상세 검색</h4>
                <p className="text-sm text-muted-foreground">
                  업체 정보 필터링 옵션을 설정합니다.
                </p>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="companyType">업체 구분</Label>
                <Select
                  value={tempFilter.type}
                  onValueChange={(value) => setTempFilter({ type: value as any })}
                >
                  <SelectTrigger id="companyType">
                    <SelectValue placeholder="모든 업체 구분" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">모든 업체 구분</SelectItem>
                    {filterOptions.types.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="statementType">전표 구분</Label>
                <Select
                  value={tempFilter.statementType}
                  onValueChange={(value) => setTempFilter({ statementType: value as any })}
                >
                  <SelectTrigger id="statementType">
                    <SelectValue placeholder="모든 전표 구분" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">모든 전표 구분</SelectItem>
                    {filterOptions.statementTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="status">업체 상태</Label>
                <Select
                  value={tempFilter.status}
                  onValueChange={(value) => setTempFilter({ status: value as any })}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="모든 상태" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">모든 상태</SelectItem>
                    {filterOptions.statuses.map((status) => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label>등록 기간</Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Popover
                      open={showStartDatePicker}
                      onOpenChange={setShowStartDatePicker}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {tempFilter.startDate ? format(new Date(tempFilter.startDate), 'yyyy-MM-dd') : '시작일'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={tempFilter.startDate ? new Date(tempFilter.startDate) : undefined}
                          onSelect={handleStartDateSelect}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <span className="self-center">~</span>
                  <div className="relative flex-1">
                    <Popover
                      open={showEndDatePicker}
                      onOpenChange={setShowEndDatePicker}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {tempFilter.endDate ? format(new Date(tempFilter.endDate), 'yyyy-MM-dd') : '종료일'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                        <CalendarComponent
                          mode="single"
                          selected={tempFilter.endDate ? new Date(tempFilter.endDate) : undefined}
                          onSelect={handleEndDateSelect}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between gap-2 mt-4">
                <Button variant="outline" onClick={handleResetFilter}>초기화</Button>
                <Button onClick={handleApplyFilter}>적용</Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* 검색 인풋 */}
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="업체명, 대표자, 전화번호, 사업자번호로 검색"
            value={searchValue}
            onChange={handleSearchChange}
            className="pl-9 pr-9"
          />
          {searchValue && (
            <button
              onClick={handleClearSearch}
              className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        
      </div>
    </div>
  );
} 