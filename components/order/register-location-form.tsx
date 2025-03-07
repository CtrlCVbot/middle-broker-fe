"use client";

import React, { useState, useEffect } from "react";
import { FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { useOrderRegisterStore } from "@/store/order-register-store";
import { searchAddress, RECENT_LOCATIONS } from "@/utils/mockdata/mock-register";
import { ILocationInfo } from "@/types/order";
import { CalendarIcon, SearchIcon, ClockIcon } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface LocationFormProps {
  type: 'departure' | 'destination';
  locationInfo: ILocationInfo;
  onChange: (info: Partial<ILocationInfo>) => void;
  title?: string;
  compact?: boolean;
}

export function LocationForm({ 
  type, 
  locationInfo, 
  onChange, 
  title = type === 'departure' ? '출발지 정보' : '도착지 정보',
  compact = false 
}: LocationFormProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [searching, setSearching] = useState(false);
  const [date, setDate] = useState<Date | undefined>(
    locationInfo.date ? new Date(locationInfo.date) : undefined
  );
  
  const { recentLocations, addRecentLocation, useRecentLocation } = useOrderRegisterStore();
  
  // 해당 타입(출발/도착)에 맞는 최근 위치 필터링
  const filteredRecentLocations = recentLocations
    .filter(loc => loc.type === type)
    .slice(0, 3); // 최근 3개만 표시
  
  // 주소 검색 처리
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    try {
      const results = await searchAddress(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('주소 검색 오류:', error);
    } finally {
      setSearching(false);
    }
  };
  
  // 검색 결과 선택 처리
  const handleSelectAddress = (address: string) => {
    onChange({ address });
    setSearchResults([]);
    setSearchQuery('');
  };
  
  // 날짜 변경 처리
  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate);
    if (newDate) {
      onChange({ date: format(newDate, 'yyyy-MM-dd') });
    }
  };
  
  // 전체 데이터 저장 처리
  const handleSaveAll = () => {
    // 모든 필드가 입력되었을 때만 최근 위치에 추가
    if (
      locationInfo.address && 
      locationInfo.company && 
      locationInfo.name && 
      locationInfo.contact && 
      locationInfo.date && 
      locationInfo.time
    ) {
      addRecentLocation(type, locationInfo);
    }
  };
  
  // 날짜, 시간이 입력된 후 저장
  useEffect(() => {
    if (locationInfo.date && locationInfo.time) {
      handleSaveAll();
    }
  }, [locationInfo.date, locationInfo.time]);
  
  return (
    <div className="space-y-3">
      {/* <h3 className="text-lg font-medium">{title}</h3> */} 
      
      {/* 최근 주소 표시 */}
      {filteredRecentLocations.length > 0 && (
        <div className="mb-3">
          <div className="text-sm text-muted-foreground mb-2">최근 사용 주소</div>
          <div className="flex flex-wrap gap-2">
            {filteredRecentLocations.map((loc) => (
              <Badge 
                key={loc.id} 
                variant="outline"
                className="cursor-pointer hover:bg-accent"
                onClick={() => useRecentLocation(type, loc.id)}
              >
                {loc.info.address.length > 15 
                  ? loc.info.address.substring(0, 15) + '...' 
                  : loc.info.address}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {/* 주소 검색 */}
      <div className="space-y-2">
        <FormLabel>주소</FormLabel>
        <div className="flex gap-2">
          <Input
            value={locationInfo.address || ''}
            onChange={(e) => onChange({ address: e.target.value })}
            placeholder="주소를 입력하세요"
            disabled={true}
          />
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" type="button">
                <SearchIcon className="h-4 w-4 mr-2" />
                검색
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>주소 검색</DialogTitle>
                <DialogDescription>
                  찾으시는 주소의 동/읍/면 이름을 입력하세요
                </DialogDescription>
              </DialogHeader>
              
              <div className="flex gap-2 my-4">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="예: 강남구 역삼동"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button 
                  type="button" 
                  onClick={handleSearch}
                  disabled={searching}
                >
                  {searching ? '검색 중...' : '검색'}
                </Button>
              </div>
              
              {searchResults.length > 0 && (
                <ScrollArea className="h-60">
                  <div className="space-y-2">
                    {searchResults.map((address, i) => (
                      <div 
                        key={i}
                        className="p-2 cursor-pointer border rounded hover:bg-accent"
                      >
                        <DialogClose asChild>
                          <Button 
                            variant="ghost" 
                            className="w-full justify-start text-left p-2"
                            onClick={() => handleSelectAddress(address)}
                          >
                            {address}
                          </Button>
                        </DialogClose>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* 상세 주소 */}
      <div>
        <FormLabel>상세 주소</FormLabel>
        <Input
          value={locationInfo.detailedAddress || ''}
          onChange={(e) => onChange({ detailedAddress: e.target.value })}
          placeholder="상세 주소를 입력하세요"
        />
      </div>
      
      {/* 회사명 / 담당자 */}
      <div className={cn("grid gap-3", compact ? "grid-cols-2" : "grid-cols-1")}>
        <div>
          <FormLabel>회사명</FormLabel>
          <Input
            value={locationInfo.company || ''}
            onChange={(e) => onChange({ company: e.target.value })}
            placeholder="회사명을 입력하세요"
          />
        </div>
        
        <div>
          <FormLabel>담당자</FormLabel>
          <Input
            value={locationInfo.name || ''}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="담당자 이름을 입력하세요"
          />
        </div>
      </div>
      
      {/* 연락처 */}
      <div>
        <FormLabel>연락처</FormLabel>
        <Input
          value={locationInfo.contact || ''}
          onChange={(e) => onChange({ contact: e.target.value })}
          placeholder="예: 010-1234-5678"
        />
      </div>
      
      {/* 날짜 / 시간 */}
      <div className={cn("grid gap-3", compact ? "grid-cols-2" : "grid-cols-1")}>
        {/* 날짜 선택 */}
        <div>
          <FormLabel>{type === 'departure' ? '출발일' : '도착일'}</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? (
                  format(date, 'PPP', { locale: ko })
                ) : (
                  <span>날짜 선택</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateChange}
                initialFocus
                locale={ko}
              />
            </PopoverContent>
          </Popover>
        </div>
        
        {/* 시간 선택 */}
        <div>
          <FormLabel>{type === 'departure' ? '출발 시간' : '도착 시간'}</FormLabel>
          <Input
            type="time"
            value={locationInfo.time || ''}
            onChange={(e) => onChange({ time: e.target.value })}
            placeholder="시간 선택"
          />
        </div>
      </div>
    </div>
  );
} 