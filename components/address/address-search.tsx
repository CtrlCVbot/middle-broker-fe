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
// Lodash 임포트를 제거하고 동적으로 임포트 구현

interface IAddressSearchProps {
  onSearch: (searchTerm: string, type?: string) => void;
  initialSearchTerm?: string;
  initialType?: string;
}

export function AddressSearch({ 
  onSearch, 
  initialSearchTerm = "", 
  initialType = "" 
}: IAddressSearchProps) {
  const [searchTerm, setSearchTerm] = useState<string>(initialSearchTerm);
  const [selectedType, setSelectedType] = useState<string>(initialType || "all");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [debounceFn, setDebounceFn] = useState<any>(null);

  // Lodash를 클라이언트 사이드에서만 로드하기 위한 처리
  useEffect(() => {
    // 서버 사이드에서는 실행하지 않음
    if (typeof window === 'undefined') return;
    
    import('lodash/debounce').then((module) => {
      const debounce = module.default;
      const fn = debounce((term: string, type?: string) => {
        setIsSearching(false);
        onSearch(term, type === "all" ? undefined : type);
      }, 500);
      
      setDebounceFn(() => fn);
    });
    
    // 컴포넌트 언마운트 시 디바운스 취소
    return () => {
      if (debounceFn && typeof debounceFn.cancel === 'function') {
        debounceFn.cancel();
      }
    };
  }, [onSearch]);

  // 검색어나 타입이 변경될 때 검색 실행 (client-side only)
  useEffect(() => {
    // 서버 사이드 렌더링 중에는 실행하지 않음
    if (typeof window === 'undefined' || !debounceFn) return;
    
    if (searchTerm || selectedType !== "all") {
      setIsSearching(true);
      debounceFn(searchTerm, selectedType);
    }
    
    return () => {
      if (debounceFn && typeof debounceFn.cancel === 'function') {
        debounceFn.cancel();
      }
    };
  }, [searchTerm, selectedType, debounceFn]);

  // 검색어 입력 핸들러
  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // 타입 변경 핸들러
  const handleTypeChange = (value: string) => {
    setSelectedType(value);
  };

  // 검색 폼 초기화 핸들러
  const handleClearSearch = () => {
    setSearchTerm("");
    setSelectedType("all");
    setIsSearching(true);
    
    if (debounceFn && typeof debounceFn.cancel === 'function') {
      debounceFn.cancel();
    }
    
    onSearch("", undefined);
  };

  // 엔터 키 핸들러
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setIsSearching(true);
      
      if (debounceFn && typeof debounceFn.cancel === 'function') {
        debounceFn.cancel();
      }
      
      onSearch(searchTerm, selectedType === "all" ? undefined : selectedType);
    }
  };

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
              onClick={() => {
                setIsSearching(true);
                
                if (debounceFn && typeof debounceFn.cancel === 'function') {
                  debounceFn.cancel();
                }
                
                onSearch(searchTerm, selectedType === "all" ? undefined : selectedType);
              }}
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
