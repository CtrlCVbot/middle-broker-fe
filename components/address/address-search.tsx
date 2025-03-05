"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface IAddressSearchProps {
  onSearch: (searchTerm: string, type?: string) => void;
}

export function AddressSearch({ onSearch }: IAddressSearchProps) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const handleSearch = () => {    
    //onSearch(searchTerm, selectedType || undefined);
    resetSearch(selectedType);
    
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleTypeChange = (value: string) => {
    resetSearch(value);
  };

  const resetSearch = (value: string) => {
    setSelectedType(value);
    if (value === "전체") {
      // 모든 항목 표시 로직
      console.log("모든 항목 표시");
      setSearchTerm(""); // 검색어 초기화
      setCurrentPage(1); // 첫 페이지로 이동
      onSearch(searchTerm, undefined); // 모든 주소를 다시 로드
      
    } else {
      console.log("유형 변경", searchTerm + " : " + value);
      onSearch(searchTerm, value || undefined);      
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="flex-1">
        <Input
          placeholder="상/하차지명, 담당자명, 연락처, 주소를 검색하세요"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full"
        />
      </div>

      <div className="flex gap-2">
        <Select value={selectedType} onValueChange={handleTypeChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="유형 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="전체">전체</SelectItem>
            <SelectItem value="상차지">상차지</SelectItem>
            <SelectItem value="하차지">하차지</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={handleSearch} variant="default">검색</Button>
      </div>
    </div>
  );
} 
