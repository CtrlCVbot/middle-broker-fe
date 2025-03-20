"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Search, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { IIncomeFilter, INCOME_STATUS, IncomeStatusType } from "@/types/income";

interface IncomeFilterProps {
  onFilterChange: (filter: Partial<IIncomeFilter>) => void;
  onResetFilter: () => void;
}

export function IncomeFilter({ onFilterChange, onResetFilter }: IncomeFilterProps) {
  // 필터 상태
  const [status, setStatus] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [invoiceStatus, setInvoiceStatus] = useState<string>("");
  
  // 날짜 포맷 함수
  const formatDateForFilter = (date: Date | undefined) => {
    if (!date) return undefined;
    return format(date, "yyyy-MM-dd");
  };
  
  // 필터 적용
  const handleApplyFilter = () => {
    onFilterChange({
      status: status ? (status as IncomeStatusType) : undefined,
      startDate: formatDateForFilter(startDate),
      endDate: formatDateForFilter(endDate),
      searchTerm: searchTerm || undefined,
      invoiceStatus: invoiceStatus || undefined
    });
  };
  
  // 엔터키 처리
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleApplyFilter();
    }
  };
  
  // 필터 초기화
  const handleResetFilter = () => {
    setStatus("");
    setStartDate(undefined);
    setEndDate(undefined);
    setSearchTerm("");
    setInvoiceStatus("");
    onResetFilter();
  };
  
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="grid grid-cols-12 gap-4">
          {/* 검색어 필드 */}
          <div className="col-span-12 sm:col-span-4">
            <Label htmlFor="search" className="text-xs mb-1.5 block">
              검색어 (정산번호, 화주명, 사업자번호)
            </Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="검색어 입력"
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>
          
          {/* 상태 필터 */}
          <div className="col-span-6 sm:col-span-2">
            <Label htmlFor="status" className="text-xs mb-1.5 block">
              정산 상태
            </Label>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value)}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="모든 상태" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">모든 상태</SelectItem>
                {INCOME_STATUS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* 세금계산서 상태 필터 */}
          <div className="col-span-6 sm:col-span-2">
            <Label htmlFor="invoice-status" className="text-xs mb-1.5 block">
              세금계산서 상태
            </Label>
            <Select
              value={invoiceStatus}
              onValueChange={(value) => setInvoiceStatus(value)}
            >
              <SelectTrigger id="invoice-status">
                <SelectValue placeholder="모든 상태" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">모든 상태</SelectItem>
                <SelectItem value="미발행">미발행</SelectItem>
                <SelectItem value="발행대기">발행대기</SelectItem>
                <SelectItem value="발행완료">발행완료</SelectItem>
                <SelectItem value="발행오류">발행오류</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* 시작일 필터 */}
          <div className="col-span-6 sm:col-span-2">
            <Label htmlFor="start-date" className="text-xs mb-1.5 block">
              시작일
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="start-date"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "yyyy-MM-dd") : "날짜 선택"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          {/* 종료일 필터 */}
          <div className="col-span-6 sm:col-span-2">
            <Label htmlFor="end-date" className="text-xs mb-1.5 block">
              종료일
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="end-date"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "yyyy-MM-dd") : "날짜 선택"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          {/* 필터 버튼 */}
          <div className="col-span-12 sm:col-span-4 flex items-end space-x-2">
            <Button className="flex-1" onClick={handleApplyFilter}>
              필터 적용
            </Button>
            <Button variant="outline" onClick={handleResetFilter}>
              <X className="mr-1 h-4 w-4" />
              초기화
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 