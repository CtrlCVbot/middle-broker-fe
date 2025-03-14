"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CalendarIcon, Check, ChevronsUpDown, Filter, Loader2, Search, X } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBrokerDriverStore } from "@/store/broker-driver-store";
import { IBrokerDriverFilter } from "@/types/broker-driver";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { BrokerDriverVehicleTypeBadge, BrokerDriverTonnageBadge } from "./broker-driver-status-badge";

// 검색 폼 스키마
const searchFormSchema = z.object({
  searchTerm: z.string().optional(),
  vehicleType: z.string().optional(),
  tonnage: z.string().optional(),
  status: z.string().optional(),
  dispatchCount: z.string().optional(),
  startDate: z.date().optional().nullable(),
  endDate: z.date().optional().nullable(),
});

// SearchForm 타입
type SearchFormValues = z.infer<typeof searchFormSchema>;

// 필터 아이템
interface FilterItem {
  value: string;
  label: string;
  badge?: React.ReactNode;
}

export function BrokerDriverSearch() {
  const {
    filter,
    tempFilter,
    setTempFilter,
    applyTempFilter,
    resetFilter,
    resetTempFilter,
    filterOptions,
  } = useBrokerDriverStore();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  // 폼 초기화
  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      searchTerm: tempFilter.searchTerm || "",
      vehicleType: tempFilter.vehicleType || "all",
      tonnage: tempFilter.tonnage || "all",
      status: tempFilter.status || "all",
      dispatchCount: tempFilter.dispatchCount || "all",
      startDate: tempFilter.startDate ? new Date(tempFilter.startDate) : null,
      endDate: tempFilter.endDate ? new Date(tempFilter.endDate) : null,
    },
  });

  // 활성 필터 계산
  useEffect(() => {
    const newActiveFilters: string[] = [];
    
    if (filter.vehicleType) newActiveFilters.push(`차량: ${filter.vehicleType}`);
    if (filter.tonnage) newActiveFilters.push(`톤수: ${filter.tonnage}`);
    if (filter.status) newActiveFilters.push(`상태: ${filter.status}`);
    if (filter.dispatchCount) newActiveFilters.push(`배차: ${filter.dispatchCount}`);
    if (filter.startDate && filter.endDate) {
      newActiveFilters.push(`기간: ${filter.startDate} ~ ${filter.endDate}`);
    } else if (filter.startDate) {
      newActiveFilters.push(`시작일: ${filter.startDate}`);
    } else if (filter.endDate) {
      newActiveFilters.push(`종료일: ${filter.endDate}`);
    }
    
    setActiveFilters(newActiveFilters);
  }, [filter]);

  // 폼 상태 변경 시 임시 필터 업데이트
  useEffect(() => {
    const subscription = form.watch((value) => {
      setTempFilter({
        searchTerm: value.searchTerm || "",
        vehicleType: value.vehicleType === "all" ? "" : (value.vehicleType as any || ""),
        tonnage: value.tonnage === "all" ? "" : (value.tonnage as any || ""),
        status: value.status === "all" ? "" : (value.status as any || ""),
        dispatchCount: value.dispatchCount === "all" ? "" : (value.dispatchCount || ""),
        startDate: value.startDate ? format(value.startDate, "yyyy-MM-dd") : null,
        endDate: value.endDate ? format(value.endDate, "yyyy-MM-dd") : null,
      });
    });
    
    return () => subscription.unsubscribe();
  }, [form.watch, setTempFilter]);

  // 검색 서브밋 핸들러
  const onSubmit = async (values: SearchFormValues) => {
    setIsSearching(true);
    
    // 폼 값을 필터에 적용
    applyTempFilter();
    
    // 팝오버 닫기
    setIsFilterOpen(false);
    
    // 검색 상태 해제
    setTimeout(() => {
      setIsSearching(false);
    }, 500);
  };

  // 필터 초기화 핸들러
  const handleResetFilters = () => {
    resetFilter();
    resetTempFilter();
    
    form.reset({
      searchTerm: "",
      vehicleType: "all",
      tonnage: "all",
      status: "all",
      dispatchCount: "all",
      startDate: null,
      endDate: null,
    });
    
    // 변경사항 적용
    applyTempFilter();
  };

  // 개별 필터 제거 핸들러
  const handleRemoveFilter = (filterText: string) => {
    const [type, value] = filterText.split(": ");
    
    switch (type) {
      case "차량":
        form.setValue("vehicleType", "all");
        break;
      case "톤수":
        form.setValue("tonnage", "all");
        break;
      case "상태":
        form.setValue("status", "all");
        break;
      case "배차":
        form.setValue("dispatchCount", "all");
        break;
      case "기간":
      case "시작일":
      case "종료일":
        form.setValue("startDate", null);
        form.setValue("endDate", null);
        break;
    }
    
    // 변경사항 적용
    onSubmit(form.getValues());
  };

  // 차량 종류 옵션
  const vehicleTypeOptions: FilterItem[] = [
    { value: "all", label: "전체" },
    ...filterOptions.vehicleTypes.map((type) => ({
      value: type,
      label: type,
      badge: <BrokerDriverVehicleTypeBadge type={type} />,
    })),
  ];

  // 톤수 옵션
  const tonnageOptions: FilterItem[] = [
    { value: "all", label: "전체" },
    ...filterOptions.tonnageTypes.map((tonnage) => ({
      value: tonnage,
      label: tonnage,
      badge: <BrokerDriverTonnageBadge tonnage={tonnage} />,
    })),
  ];

  // 차주 상태 옵션
  const statusOptions: FilterItem[] = [
    { value: "all", label: "전체" },
    ...filterOptions.statuses.map((status) => ({
      value: status,
      label: status,
    })),
  ];

  // 배차 횟수 옵션
  const dispatchCountOptions: FilterItem[] = [
    { value: "all", label: "전체" },
    ...filterOptions.dispatchCountOptions.map((option) => ({
      value: option.value,
      label: option.label,
    })),
  ];

  return (
    <div className="space-y-4 py-2">

      {/* 검색 및 필터, 액션 버튼 */}
      <div>

        {/* 검색 및 필터  */}        
        <div className="w-full md:w-auto">
          <div className="flex flex-col gap-4 md:flex-row items-center mb-4">

            {/* 검색 필터 */}
            <div className="w-full md:w-auto">
              <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <span>필터</span>
                  {activeFilters.length > 0 && (
                    <Badge className="ml-1 rounded-full px-1 text-xs">{activeFilters.length}</Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[420px] p-4" align="end">
                <Form {...form}>
                  <div className="space-y-4">
                    <h4 className="font-medium">상세 검색</h4>
                    <Separator />
                    
                    <div className="grid grid-cols-2 gap-3">
                      {/* 차량 종류 */}
                      <div className="space-y-2">
                        <FormLabel className="text-xs">차량 종류</FormLabel>
                        <FormField
                          control={form.control}
                          name="vehicleType"
                          render={({ field }) => (
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue placeholder="차량 종류 선택" />
                              </SelectTrigger>
                              <SelectContent>
                                {vehicleTypeOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    <div className="flex items-center">
                                      {option.badge && <span className="mr-2">{option.badge}</span>}
                                      <span>{option.label}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                      
                      {/* 톤수 */}
                      <div className="space-y-2">
                        <FormLabel className="text-xs">톤수</FormLabel>
                        <FormField
                          control={form.control}
                          name="tonnage"
                          render={({ field }) => (
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue placeholder="톤수 선택" />
                              </SelectTrigger>
                              <SelectContent>
                                {tonnageOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    <div className="flex items-center">
                                      {option.badge && <span className="mr-2">{option.badge}</span>}
                                      <span>{option.label}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                      
                      {/* 차주 상태 */}
                      <div className="space-y-2">
                        <FormLabel className="text-xs">차주 상태</FormLabel>
                        <FormField
                          control={form.control}
                          name="status"
                          render={({ field }) => (
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue placeholder="차주 상태 선택" />
                              </SelectTrigger>
                              <SelectContent>
                                {statusOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                      
                      {/* 배차 횟수 */}
                      <div className="space-y-2">
                        <FormLabel className="text-xs">배차 횟수</FormLabel>
                        <FormField
                          control={form.control}
                          name="dispatchCount"
                          render={({ field }) => (
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue placeholder="배차 횟수 선택" />
                              </SelectTrigger>
                              <SelectContent>
                                {dispatchCountOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    </div>
                    
                    {/* 등록 기간 */}
                    <div className="space-y-2">
                      <FormLabel className="text-xs">등록 기간</FormLabel>
                      <div className="grid grid-cols-2 gap-2">
                        <FormField
                          control={form.control}
                          name="startDate"
                          render={({ field }) => (
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "h-8 w-full justify-start text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {field.value ? (
                                    format(field.value, "yyyy-MM-dd", { locale: ko })
                                  ) : (
                                    <span>시작일</span>
                                  )}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <Calendar
                                  mode="single"
                                  selected={field.value || undefined}
                                  onSelect={field.onChange}
                                  locale={ko}
                                  disabled={(date) => {
                                    const endDate = form.getValues("endDate");
                                    return endDate ? date > endDate : false;
                                  }}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="endDate"
                          render={({ field }) => (
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "h-8 w-full justify-start text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {field.value ? (
                                    format(field.value, "yyyy-MM-dd", { locale: ko })
                                  ) : (
                                    <span>종료일</span>
                                  )}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <Calendar
                                  mode="single"
                                  selected={field.value || undefined}
                                  onSelect={field.onChange}
                                  locale={ko}
                                  disabled={(date) => {
                                    const startDate = form.getValues("startDate");
                                    return startDate ? date < startDate : false;
                                  }}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          )}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={handleResetFilters}
                        disabled={isSearching}
                        className="h-8 px-2 text-xs"
                      >
                        필터 초기화
                      </Button>
                      <Button 
                        type="button" 
                        onClick={() => onSubmit(form.getValues())} 
                        className="h-8"
                        disabled={isSearching}
                      >
                        {isSearching ? (
                          <>
                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                            검색 중...
                          </>
                        ) : (
                          "적용"
                        )}
                      </Button>
                    </div>
                  </div>
                </Form>
              </PopoverContent>
              </Popover>
            </div>

            {/* 검색 인풋 */}
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="차주명, 연락처, 차량번호, 업체명 검색..."
                className="pl-9"
                value={form.watch("searchTerm") || ""}
                onChange={(e) => {
                  form.setValue("searchTerm", e.target.value);
                  // 실시간 검색 (입력 후 500ms 후에 검색 실행)
                  if (e.target.value === "" && filter.searchTerm !== "") {
                    onSubmit(form.getValues());
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onSubmit(form.getValues());
                  }
                }}
              />
              {form.watch("searchTerm") && (
                <button
                  type="button"
                  onClick={() => {
                    form.setValue("searchTerm", "");
                    onSubmit(form.getValues());
                  }}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>          
          </div>
        </div>

        {/* 검색 버튼 */}
        {/* <div className="w-full md:w-auto mt-4 md:mt-0">
          <Button type="button" onClick={() => onSubmit(form.getValues())} disabled={isSearching} size="sm">
            {isSearching ? (
              <>
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                검색 중...
              </>
            ) : (
              <>
                <Search className="mr-2 h-3 w-3" />
                검색
              </>
            )}
          </Button>
        </div>*/}
      </div>

      {/* 활성 필터 표시 */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {activeFilters.map((filterText) => (
            <Badge key={filterText} variant="outline" className="flex items-center gap-1 px-3 py-1">
              {filterText}
              <X
                className="ml-1 h-3 w-3 cursor-pointer"
                onClick={() => handleRemoveFilter(filterText)}
              />
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={handleResetFilters}
          >
            모두 지우기
          </Button>
        </div>
      )}
    </div>
  );
} 