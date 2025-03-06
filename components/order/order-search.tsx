"use client";

import React, { useCallback, useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOrderStore } from "@/store/order-store";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function OrderSearch() {
  const {
    filter,
    setFilter,
    resetFilter,
    filterOptions
  } = useOrderStore();

  // 디버깅을 위해 filterOptions 값을 확인
  useEffect(() => {
    console.log('FilterOptions in OrderSearch:', filterOptions);
    console.log('Cities available:', filterOptions?.cities);
  }, [filterOptions]);

  // 검색어 입력 시 필터 업데이트
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter({ searchTerm: e.target.value });
  };

  // 출발지 도시 변경 시 필터 업데이트
  const handleDepartureCityChange = (value: string) => {
    setFilter({ departureCity: value === "all" ? undefined : value });
  };

  // 도착지 도시 변경 시 필터 업데이트
  const handleArrivalCityChange = (value: string) => {
    setFilter({ arrivalCity: value === "all" ? undefined : value });
  };

  // 차량 종류 변경 시 필터 업데이트
  const handleVehicleTypeChange = (value: string) => {
    setFilter({ vehicleType: value === "all" ? undefined : value });
  };

  // 중량 변경 시 필터 업데이트
  const handleWeightChange = (value: string) => {
    setFilter({ weight: value === "all" ? undefined : value });
  };

  // 모든 필터 초기화
  const handleResetAll = () => {
    resetFilter();
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4 md:flex-row">
          {/* 검색 입력 필드 */}
          <div className="flex items-center gap-2 w-full md:w-auto md:flex-1">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ID, 위치, 운전자 등으로 검색..."
              className="flex-1"
              value={filter.searchTerm || ""}
              onChange={handleSearchChange}
            />
          </div>

          {/* 출발지 도시 필터 */}
          <div className="w-full md:w-[180px]">
            <Select
              onValueChange={handleDepartureCityChange}
              value={filter.departureCity || "all"}
            >
              <SelectTrigger>
                <SelectValue placeholder="출발지 도시" />
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

          {/* 도착지 도시 필터 */}
          <div className="w-full md:w-[180px]">
            <Select
              onValueChange={handleArrivalCityChange}
              value={filter.arrivalCity || "all"}
            >
              <SelectTrigger>
                <SelectValue placeholder="도착지 도시" />
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
          <div className="w-full md:w-[150px]">
            <Select
              onValueChange={handleVehicleTypeChange}
              value={filter.vehicleType || "all"}
            >
              <SelectTrigger>
                <SelectValue placeholder="차량 종류" />
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
          <div className="w-full md:w-[120px]">
            <Select
              onValueChange={handleWeightChange}
              value={filter.weight || "all"}
            >
              <SelectTrigger>
                <SelectValue placeholder="중량" />
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

          {/* 필터 초기화 버튼 */}
          <div className="w-full md:w-auto">
            <Button
              variant="ghost"
              onClick={handleResetAll}
              className="w-full md:w-auto"
            >
              필터 초기화
            </Button>
          </div>
        </div>

        {/* 선택된 필터 표시 */}
        {(filter.departureCity || filter.arrivalCity || filter.vehicleType || filter.weight || filter.searchTerm) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {filter.searchTerm && (
              <Badge variant="secondary" className="flex items-center gap-1">
                검색어: {filter.searchTerm}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setFilter({ searchTerm: "" })}
                />
              </Badge>
            )}
            {filter.departureCity && (
              <Badge variant="secondary" className="flex items-center gap-1">
                출발지: {filter.departureCity}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setFilter({ departureCity: undefined })}
                />
              </Badge>
            )}
            {filter.arrivalCity && (
              <Badge variant="secondary" className="flex items-center gap-1">
                도착지: {filter.arrivalCity}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setFilter({ arrivalCity: undefined })}
                />
              </Badge>
            )}
            {filter.vehicleType && (
              <Badge variant="secondary" className="flex items-center gap-1">
                차량: {filter.vehicleType}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setFilter({ vehicleType: undefined })}
                />
              </Badge>
            )}
            {filter.weight && (
              <Badge variant="secondary" className="flex items-center gap-1">
                중량: {filter.weight}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setFilter({ weight: undefined })}
                />
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 