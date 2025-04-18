"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { Search, X, Filter } from "lucide-react";
import { debounce } from "@/utils/debounce";

interface IAddressSearchProps {
  onSearch: (searchTerm: string, type?: string) => void;
  initialSearchTerm?: string;
  initialType?: string;
  debounceTime?: number;
}

export function AddressSearch({ 
  onSearch, 
  initialSearchTerm = "", 
  initialType = "",
  debounceTime = 400
}: IAddressSearchProps) {
  const [searchTerm, setSearchTerm] = useState<string>(initialSearchTerm);
  const [selectedType, setSelectedType] = useState<string>(initialType || "all");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  
  // 디바운스 검색 핸들러 (useCallback으로 메모이제이션)
  const debouncedSearch = useCallback(
    debounce((term: string, type: string) => {
      setIsSearching(false);
      onSearch(term, type === "all" ? undefined : type as any);
    }, debounceTime),
    [onSearch, debounceTime]
  );
  
  // 검색어나 타입이 변경될 때 검색 실행
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if (searchTerm || selectedType !== "all") {
      setIsSearching(true);
      debouncedSearch(searchTerm, selectedType);
    }
    
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchTerm, selectedType, debouncedSearch]);

  // 검색어 입력 핸들러
  const handleSearchInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  // 타입 변경 핸들러
  const handleTypeChange = useCallback((value: string) => {
    setSelectedType(value);
  }, []);

  // 검색 폼 초기화 핸들러
  const handleClearSearch = useCallback(() => {
    setSearchTerm("");
    setSelectedType("all");
    setIsSearching(false);
    debouncedSearch.cancel();
    onSearch("", undefined);
  }, [debouncedSearch, onSearch]);

  // 엔터 키 핸들러
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setIsSearching(true);
      debouncedSearch.cancel();
      onSearch(searchTerm, selectedType === "all" ? undefined : selectedType as any);
    }
  }, [debouncedSearch, onSearch, searchTerm, selectedType]);
  
  // 검색 버튼 클릭 핸들러
  const handleSearchClick = useCallback(() => {
    setIsSearching(true);
    debouncedSearch.cancel();
    onSearch(searchTerm, selectedType === "all" ? undefined : selectedType as any);
  }, [debouncedSearch, onSearch, searchTerm, selectedType]);

  return (
    <Card className="mb-6 border-0 shadow-none">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="상/하차지명, 담당자명, 주소 또는 연락처 검색"
              value={searchTerm}
              onChange={handleSearchInput}
              onKeyDown={handleKeyDown}
              className="pl-10 pr-10"
            />
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Select value={selectedType} onValueChange={handleTypeChange}>
                <SelectTrigger className="w-[140px] pl-10">
                  <SelectValue placeholder="유형 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="load">상차지</SelectItem>
                  <SelectItem value="drop">하차지</SelectItem>
                  <SelectItem value="any">상/하차지</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleSearchClick}
              variant="default"
              disabled={isSearching}
            >
              검색
            </Button>

            {(searchTerm || selectedType !== "all") && (
              <Button
                onClick={handleClearSearch}
                variant="ghost"
                size="sm"
                className="h-10"
              >
                <X className="mr-2 h-4 w-4" />
                초기화
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 
