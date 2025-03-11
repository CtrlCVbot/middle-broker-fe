"use client";

import { useState, useEffect } from "react";
import { CalendarIcon, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { useSettlementStore } from "@/store/settlement-store";
import { ISettlementFilters, SettlementStatus } from "@/types/settlement";

// 로컬 필터 타입 정의
interface LocalFilters {
  startDate: Date | null;
  endDate: Date | null;
  companyName: string;
  driverName: string;
  status: SettlementStatus | null;
}

export function SettlementFilter() {
  const { filters, applyFilters, resetFilters } = useSettlementStore();
  
  // 필터 상태
  const [localFilters, setLocalFilters] = useState<LocalFilters>({
    startDate: filters.startDate ? new Date(filters.startDate) : null,
    endDate: filters.endDate ? new Date(filters.endDate) : null,
    companyName: filters.companyName || "",
    driverName: filters.driverName || "",
    status: filters.status
  });
  
  // Sheet 상태
  const [open, setOpen] = useState(false);
  
  // 회사명 변경 핸들러
  const handleCompanyNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalFilters(prev => ({ ...prev, companyName: e.target.value }));
  };
  
  // 운전기사 변경 핸들러
  const handleDriverNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalFilters(prev => ({ ...prev, driverName: e.target.value }));
  };
  
  // 상태 변경 핸들러
  const handleStatusChange = (value: string) => {
    if (value === "ALL") {
      setLocalFilters(prev => ({ ...prev, status: null }));
    } else {
      setLocalFilters(prev => ({ ...prev, status: value as SettlementStatus }));
    }
  };
  
  // 날짜 선택 핸들러
  const handleStartDateSelect = (date: Date | undefined) => {
    setLocalFilters(prev => ({
      ...prev,
      startDate: date || null
    }));
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    setLocalFilters(prev => ({
      ...prev,
      endDate: date || null
    }));
  };
  
  // 필터 적용
  const handleApplyFilter = () => {
    const newFilters: Partial<ISettlementFilters> = {
      startDate: localFilters.startDate ? format(localFilters.startDate, 'yyyy-MM-dd') : null,
      endDate: localFilters.endDate ? format(localFilters.endDate, 'yyyy-MM-dd') : null,
      companyName: localFilters.companyName || null,
      driverName: localFilters.driverName || null,
      status: localFilters.status
    };
    
    applyFilters(newFilters);
    setOpen(false);
  };
  
  // 필터 초기화
  const handleResetFilter = () => {
    setLocalFilters({
      startDate: null,
      endDate: null,
      companyName: "",
      driverName: "",
      status: null
    });
    resetFilters();
    setOpen(false);
  };
  
  // 필터 취소
  const handleCancelChanges = () => {
    setLocalFilters({
      startDate: filters.startDate ? new Date(filters.startDate) : null,
      endDate: filters.endDate ? new Date(filters.endDate) : null,
      companyName: filters.companyName || "",
      driverName: filters.driverName || "",
      status: filters.status
    });
    setOpen(false);
  };
  
  return (
    <div className="flex items-center gap-2 mb-4">
      {/* 모바일용 필터 시트 */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="md:hidden">
            <Search className="h-4 w-4 mr-2" />
            필터
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[300px] sm:w-[400px] overflow-auto">
          <div className="grid gap-4 py-4">
            <h3 className="text-lg font-medium">정산 필터</h3>
            
            <div className="space-y-2">
              <Label htmlFor="company">업체명</Label>
              <Input
                id="company"
                placeholder="업체명을 입력하세요"
                value={localFilters.companyName}
                onChange={handleCompanyNameChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="driver">운전기사</Label>
              <Input
                id="driver"
                placeholder="운전기사 이름을 입력하세요"
                value={localFilters.driverName}
                onChange={handleDriverNameChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">정산 상태</Label>
              <Select
                value={localFilters.status || "ALL"}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="상태 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">전체</SelectItem>
                  <SelectItem value="COMPLETED">완료</SelectItem>
                  <SelectItem value="PENDING">미완료</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>시작일</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !localFilters.startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {localFilters.startDate ? (
                      format(localFilters.startDate, "PPP", { locale: ko })
                    ) : (
                      <span>시작일 선택</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={localFilters.startDate || undefined}
                    onSelect={handleStartDateSelect}
                    initialFocus
                    locale={ko}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label>종료일</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !localFilters.endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {localFilters.endDate ? (
                      format(localFilters.endDate, "PPP", { locale: ko })
                    ) : (
                      <span>종료일 선택</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={localFilters.endDate || undefined}
                    onSelect={handleEndDateSelect}
                    initialFocus
                    locale={ko}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="flex items-center justify-between pt-4">
              <Button variant="outline" onClick={handleResetFilter}>
                초기화
              </Button>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={handleCancelChanges}>
                  취소
                </Button>
                <Button onClick={handleApplyFilter}>
                  적용
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      
      {/* 데스크탑용 필터 컴포넌트 */}
      <div className="hidden md:flex items-center space-x-2 flex-1">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 flex-1">
          <div className="col-span-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {localFilters.startDate ? (
                    format(localFilters.startDate, "yyyy-MM-dd")
                  ) : (
                    <span>시작일</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={localFilters.startDate || undefined}
                  onSelect={handleStartDateSelect}
                  initialFocus
                  locale={ko}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="col-span-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {localFilters.endDate ? (
                    format(localFilters.endDate, "yyyy-MM-dd")
                  ) : (
                    <span>종료일</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={localFilters.endDate || undefined}
                  onSelect={handleEndDateSelect}
                  initialFocus
                  locale={ko}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="col-span-1">
            <Input
              placeholder="업체명"
              value={localFilters.companyName}
              onChange={handleCompanyNameChange}
              className="h-10"
            />
          </div>
          
          <div className="col-span-1">
            <Select
              value={localFilters.status || "ALL"}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="정산 상태" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">전체</SelectItem>
                <SelectItem value="COMPLETED">완료</SelectItem>
                <SelectItem value="PENDING">미완료</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Button variant="outline" onClick={handleResetFilter} size="sm" className="h-10">
          <X className="h-4 w-4 mr-1" />
          초기화
        </Button>
        
        <Button onClick={handleApplyFilter} size="sm" className="h-10">
          <Search className="h-4 w-4 mr-1" />
          검색
        </Button>
      </div>
    </div>
  );
} 