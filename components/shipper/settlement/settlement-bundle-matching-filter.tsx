"use client";

//react
import React, { useCallback, useEffect, useState } from "react";

//ui
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
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Search, Filter, X } from "lucide-react";

//store
import { useShipperSettlementStore } from "@/store/shipper-settlement-store";

//utils
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ko } from "date-fns/locale";
import { IIncomeFilter, IncomeStatusType } from "@/types/income";
import { debounce } from "@/utils/debounce";
import { ISalesBundleFilter } from "@/types/broker-charge";

interface BundleMatchingFilterProps {
  tabStatus?: IncomeStatusType; // 현재 탭의 상태(정산대사/정산완료),
  debounceTime?: number;
}

// 필터 요약 텍스트 생성 함수
const getFilterSummaryText = (filter: Partial<ISalesBundleFilter>): string => {
  if (
    !filter.startDate &&
    !filter.endDate &&
    !filter.invoiceStatus
  ) {
    return "모든 정산";
  }

  const parts = [];

  if (filter.invoiceStatus) parts.push(`세금계산서: ${filter.invoiceStatus}`);  
  
  if (filter.startDate && filter.endDate) {
    parts.push(`${filter.startDate.slice(5)}~${filter.endDate.slice(5)}`);
  } else if (filter.startDate) {
    parts.push(`${filter.startDate.slice(5)}부터`);
  } else if (filter.endDate) {
    parts.push(`~${filter.endDate.slice(5)}`);
  }
  
  return parts.join(", ") || "모든 정산";
};

export function BundleMatchingFilter({ 
  //onFilterChange, 
  //onResetFilter, 
  tabStatus,
  debounceTime = 1000
}: BundleMatchingFilterProps) {

  const { 
    salesBundlesFilter, 
    salesBundlesTempFilter, 
    setSalesBundlesFilter,
    setSalesBundlesTempFilter,
    applySalesBundlesTempFilter,
    resetSalesBundlesFilter,
    resetSalesBundlesTempFilter, 
  } = useShipperSettlementStore();

  // 필터 상태
  const [tempFilter, setTempFilter] = useState<Partial<IIncomeFilter>>({});
  const [open, setOpen] = useState(false);

   // 날짜 상태 관리
   const [startDate, setStartDate] = useState<Date | undefined>(
    salesBundlesTempFilter.startDate ? new Date(salesBundlesTempFilter.startDate) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    salesBundlesTempFilter.endDate ? new Date(salesBundlesTempFilter.endDate) : undefined
  );

  //const [searchTerm, setSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState(salesBundlesFilter.search || "");
  
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [invoiceStatus, setInvoiceStatus] = useState<string>("all");
 
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);    
  }, []);

  // 엔터 키 핸들러
  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setSalesBundlesFilter({ search: searchTerm || undefined });
    }
  }, [searchTerm]); 

  // 세금계산서 상태 변경 시 임시 필터 업데이트
  const handleInvoiceStatusChange = (value: string) => {
    setInvoiceStatus(value);
    setSalesBundlesTempFilter({ invoiceStatus: value === "all" ? undefined : value });
  };
  
  // 시작일 선택 핸들러
  const handleStartDateSelect = (date: Date | undefined) => {
    setStartDate(date);
    if (date) {
      setSalesBundlesTempFilter({ startDate: format(date, 'yyyy-MM-dd') });
    } else {
      setSalesBundlesTempFilter({ startDate: undefined });
    }
  };
  
  // 종료일 선택 핸들러
  const handleEndDateSelect = (date: Date | undefined) => {
    setEndDate(date);
    if (date) {
      setSalesBundlesTempFilter({ endDate: format(date, 'yyyy-MM-dd') });
    } else {
      setSalesBundlesTempFilter({ endDate: undefined });
    }
  };

  // 필터 적용
  const handleApplyFilter = () => {
    applySalesBundlesTempFilter();
    setOpen(false);
  };

  // 필터 초기화
  const handleResetFilter = () => {
    resetSalesBundlesFilter();
    setInvoiceStatus("all");
    setStartDate(undefined);
    setEndDate(undefined);
    setOpen(false);
  };

  // 변경 취소
  const handleCancelChanges = () => {
    resetSalesBundlesTempFilter();
    setInvoiceStatus("all");
    setStartDate(salesBundlesFilter.startDate ? new Date(salesBundlesFilter.startDate) : undefined);
    setEndDate(salesBundlesFilter.endDate ? new Date(salesBundlesFilter.endDate) : undefined);
    setOpen(false);
  };

  // Popover가 열릴 때 현재 필터 값을 임시 필터에 복사
  const handleOpenChange = (open: boolean) => {
    if (open) {
      resetSalesBundlesTempFilter();
      setInvoiceStatus("all");
      setStartDate(salesBundlesFilter.startDate ? new Date(salesBundlesFilter.startDate) : undefined);
      setEndDate(salesBundlesFilter.endDate ? new Date(salesBundlesFilter.endDate) : undefined);
    }
    setOpen(open);
  };

  // 필터가 적용되었는지 확인
  const hasActiveFilters = !!(
    salesBundlesFilter.startDate ||
    salesBundlesFilter.endDate ||
    salesBundlesFilter.invoiceStatus
  );

  // 현재 선택된 필터 요약 텍스트
  const filterSummary = getFilterSummaryText(salesBundlesFilter);

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
                  {Object.values(tempFilter).filter(Boolean).length}
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
              
              {/* 세금계산서 상태 필터 */}
              <div className="space-y-2">
                <Label htmlFor="invoice-status">세금계산서 상태</Label>
                <Select
                  value={invoiceStatus}
                  onValueChange={handleInvoiceStatusChange}
                >
                  <SelectTrigger id="invoice-status">
                    <SelectValue placeholder="모든 상태" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">모든 상태</SelectItem>
                    <SelectItem value="미발행">미발행</SelectItem>
                    <SelectItem value="발행대기">발행대기</SelectItem>
                    <SelectItem value="발행완료">발행완료</SelectItem>
                    <SelectItem value="발행오류">발행오류</SelectItem>
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
          placeholder="정산번호, 화주명, 사업자번호 검색"
          className="w-full pl-8"
          value={searchTerm}
          onChange={handleSearchChange}
          onKeyDown={handleSearchKeyDown}
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-9 px-2"
            onClick={() => {
              setSalesBundlesFilter({ search: "" });
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
} 