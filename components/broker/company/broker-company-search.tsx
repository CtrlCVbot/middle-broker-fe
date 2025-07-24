"use client";

import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// 기존 스토어 import 주석 처리
// import { useBrokerCompanyStore, getFilterSummaryText } from '@/store/broker-company-store';
// 새로운 스토어 import 추가
import { useCompanyStore, getFilterSummaryText } from '@/store/company-store';
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
import { Search, Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';
// 호환성을 위해 브로커 업체 타입 유지
import { CompanyType, StatementType, CompanyStatus } from '@/types/broker-company';
// 새로운 타입 import
import { CompanyType as ApiCompanyType, CompanyStatus as ApiCompanyStatus } from '@/types/company';

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
  } = useCompanyStore();

  // Popover 상태 관리
  const [open, setOpen] = useState(false);

  // 검색어 입력 시 필터 업데이트 (keyword로 변경)
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter({ keyword: e.target.value });
  };

  // 업체 구분 변경 시 임시 필터 업데이트 (영문 값으로 변경)
  const handleTypeChange = (value: string) => {
    let apiTypeValue = '';
    if (value !== 'all') {
      if (value === '화주') apiTypeValue = 'shipper';
      else if (value === '운송사') apiTypeValue = 'carrier';
      else if (value === '주선사') apiTypeValue = 'broker';
      
      setTempFilter({ type: apiTypeValue as ApiCompanyType });
    } else {
      setTempFilter({ type: '' });
    }
  };

  // 전표 구분 변경 시 임시 필터 업데이트
  // 참고: 새 스토어에는 statementType이 없으므로 이 부분은 더 이상 사용하지 않습니다
  const handleStatementTypeChange = (value: string) => {
    // 새 API에서는 statementType을 사용하지 않지만, 
    // 레거시 호환성을 위해 유지합니다
  };

  // 업체 상태 변경 시 임시 필터 업데이트 (영문 값으로 변경)
  const handleStatusChange = (value: string) => {
    let apiStatusValue = '';
    if (value !== 'all') {
      apiStatusValue = value === '활성' ? 'active' : 'inactive';
      
      setTempFilter({ status: apiStatusValue as ApiCompanyStatus });
    } else {
      setTempFilter({ status: '' });
    }
  };

  // 필터 적용
  const handleApplyFilter = () => {
    // 날짜 필터를 제거하여 적용
    applyTempFilter();
    setOpen(false);
  };

  // 필터 초기화
  const handleResetFilter = () => {
    resetFilter();
    setOpen(false);
  };

  // 변경 취소
  const handleCancelChanges = () => {
    resetTempFilter();
    setOpen(false);
  };

  // Popover가 열릴 때 현재 필터 값을 임시 필터에 복사
  const handleOpenChange = (open: boolean) => {
    if (open) {
      resetTempFilter();
    }
    setOpen(open);
  };

  // 필터가 적용되었는지 확인
  const hasActiveFilters = !!(
    filter.type || 
    filter.status
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
                  {Object.values(filter).filter(v => v !== '' && v !== null).length - (filter.keyword ? 1 : 0)}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-4" align="start">
            <div className="space-y-4">
              <h4 className="font-medium text-sm">업체 필터링</h4>
              
              {/* 업체 구분과 전표 구분 필터 */}
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="companyType">업체 구분</Label>
                    <Select 
                      value={tempFilter.type || 'all'} 
                      onValueChange={handleTypeChange}
                    >
                      <SelectTrigger id="companyType">
                        <SelectValue placeholder="모든 업체" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">전체</SelectItem>
                        {/* 여기서는 사용자에게는 한글로 표시하지만, 내부적으로는 영문 코드를 사용합니다 */}
                        <SelectItem value="broker">주선사</SelectItem>
                        <SelectItem value="shipper">화주</SelectItem>
                        <SelectItem value="carrier">운송사</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* 새 API에는 없지만 UI 일관성을 위해 유지 */}
                  <div>
                    <Label htmlFor="statementType">전표 구분</Label>
                    <Select 
                      value={'all'} 
                      onValueChange={handleStatementTypeChange}
                      disabled={true}
                    >
                      <SelectTrigger id="statementType">
                        <SelectValue placeholder="전표 구분" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">전체</SelectItem>
                        <SelectItem value="매입처">매입처</SelectItem>
                        <SelectItem value="매출처">매출처</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              {/* 업체 상태 필터 */}
              <div className="space-y-2">
                <Label htmlFor="companyStatus">업체 상태</Label>
                <Select 
                  value={tempFilter.status ? (tempFilter.status === 'active' ? '활성' : '비활성') : 'all'} 
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger id="companyStatus">
                    <SelectValue placeholder="업체 상태" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    <SelectItem value="활성">활성</SelectItem>
                    <SelectItem value="비활성">비활성</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* 버튼 그룹 */}
              <div className="flex justify-between pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCancelChanges}
                >
                  취소
                </Button>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleResetFilter}
                    className="text-destructive hover:text-destructive/90"
                  >
                    초기화
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleApplyFilter}
                  >
                    적용하기
                  </Button>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      {/* 검색 입력 필드 */}
      <div className="w-full md:flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="업체명, 대표자, 사업자번호로 검색"
          className="pl-10 w-full"
          value={filter.keyword || ''}
          onChange={handleSearchChange}
        />
        {filter.keyword && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full aspect-square rounded-none"
            onClick={() => setFilter({ keyword: '' })}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
} 