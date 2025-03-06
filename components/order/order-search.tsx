"use client";

import React, { useCallback, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
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
import { useOrderStore } from "@/store/order-store";
import { Search, Check, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function OrderSearch() {
  const {
    filter,
    setFilter,
    resetFilter,
    filterOptions
  } = useOrderStore();

  const [openCity, setOpenCity] = useState(false);

  // 검색어 입력 시 필터 업데이트
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter({ searchTerm: e.target.value });
  };

  // 차량 종류 변경 시 필터 업데이트
  const handleVehicleTypeChange = (value: string) => {
    setFilter({ vehicleType: value === "all" ? undefined : value });
  };

  // 중량 변경 시 필터 업데이트
  const handleWeightChange = (value: string) => {
    setFilter({ weight: value === "all" ? undefined : value });
  };

  // 도시 선택 시 필터 업데이트
  const handleCitySelect = useCallback((city: string) => {
    setFilter({ city });
    setOpenCity(false);
  }, [setFilter]);

  // 선택한 도시 필터 초기화
  const handleCityReset = useCallback(() => {
    setFilter({ city: undefined });
  }, [setFilter]);

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

          {/* 도시 필터 */}
          <div className="flex flex-col gap-2 w-full md:w-[200px]">
            <Popover open={openCity} onOpenChange={setOpenCity}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCity}
                  className="justify-between w-full"
                >
                  {filter.city ? filter.city : "도시 선택"}
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="도시 검색..." className="h-9" />
                  <CommandEmpty>검색 결과가 없습니다</CommandEmpty>
                  <CommandGroup className="max-h-[200px] overflow-auto">
                    {filterOptions.cities.map((city) => (
                      <CommandItem
                        key={city}
                        value={city}
                        onSelect={() => handleCitySelect(city)}
                      >
                        {city}
                        <Check
                          className={cn(
                            "ml-auto h-4 w-4",
                            filter.city === city ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* 차량 종류 필터 */}
          <div className="w-full md:w-[200px]">
            <Select
              onValueChange={handleVehicleTypeChange}
              value={filter.vehicleType || "all"}
            >
              <SelectTrigger>
                <SelectValue placeholder="차량 종류" />
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

          {/* 중량 필터 */}
          <div className="w-full md:w-[150px]">
            <Select
              onValueChange={handleWeightChange}
              value={filter.weight || "all"}
            >
              <SelectTrigger>
                <SelectValue placeholder="중량" />
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
        {(filter.city || filter.vehicleType || filter.weight || filter.searchTerm) && (
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
            {filter.city && (
              <Badge variant="secondary" className="flex items-center gap-1">
                도시: {filter.city}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={handleCityReset}
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