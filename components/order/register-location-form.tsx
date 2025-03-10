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
import { format, parse } from "date-fns";
import { ko } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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
    <div className="space-y-4">
      {title && !compact && <h3 className="text-lg font-medium">{title}</h3>}
      
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
        <Label htmlFor={`${type}-address`}>주소</Label>
        <div className="flex space-x-2">
          <Input
            id={`${type}-address`}
            placeholder="주소 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button type="button" size="icon" onClick={handleSearch} disabled={searching}>
            <SearchIcon className="h-4 w-4" />
          </Button>
        </div>
        
        {/* 주소 검색 결과 */}
        {searchResults.length > 0 && (
          <Card className="mt-2">
            <CardContent className="p-2">
              <ScrollArea className="h-32">
                <div className="space-y-1">
                  {searchResults.map((address, idx) => (
                    <Button
                      key={idx}
                      variant="ghost"
                      className="w-full justify-start text-left h-auto py-2"
                      onClick={() => handleSelectAddress(address)}
                    >
                      <div className="flex items-center space-x-2 w-full">
                        <div className="flex-1 truncate">
                          <span className="text-sm font-medium">{address}</span>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
        
        {/* 선택된 주소 표시 */}
        {locationInfo.address && (
          <div className="flex items-center">
            <div className="bg-muted p-2 rounded flex-1">
              <span className="text-sm">{locationInfo.address}</span>
            </div>
          </div>
        )}
      </div>
      
      {/* 상세 주소 */}
      <div>
        <Label htmlFor={`${type}-detailed-address`}>상세주소</Label>
        <Input
          id={`${type}-detailed-address`}
          placeholder="상세주소를 입력하세요"
          value={locationInfo.detailedAddress || ''}
          onChange={(e) => onChange({ detailedAddress: e.target.value })}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {/* 담당자 */}
        <div>
          <Label htmlFor={`${type}-name`}>담당자</Label>
          <Input
            id={`${type}-name`}
            placeholder="담당자명"
            value={locationInfo.name || ''}
            onChange={(e) => onChange({ name: e.target.value })}
          />
        </div>
        
        {/* 연락처 */}
        <div>
          <Label htmlFor={`${type}-contact`}>연락처</Label>
          <Input
            id={`${type}-contact`}
            placeholder="연락처"
            value={locationInfo.contact || ''}
            onChange={(e) => onChange({ contact: e.target.value })}
          />
        </div>
        
        {/* 회사명 */}
        <div className="col-span-2">
          <Label htmlFor={`${type}-company`}>회사명</Label>
          <Input
            id={`${type}-company`}
            placeholder="회사명"
            value={locationInfo.company || ''}
            onChange={(e) => onChange({ company: e.target.value })}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {/* 날짜 선택 */}
        <div>
          <Label>날짜</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
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
          <Label htmlFor={`${type}-time`}>시간</Label>
          <Input
            id={`${type}-time`}
            type="time"
            value={locationInfo.time || ''}
            onChange={(e) => onChange({ time: e.target.value })}
          />
        </div>
      </div>
      
      {/* 최근 사용 주소 */}
      {!compact && (
        <div className="mt-4">
          <Label className="mb-2 block">최근 사용 주소</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {RECENT_LOCATIONS.slice(0, 4).map((location, idx) => (
              <Button
                key={idx}
                variant="outline"
                className="h-auto py-2 justify-start"
                onClick={() => useRecentLocation(type, location.id)}
              >
                <div className="flex items-center space-x-2 w-full">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {location.name.slice(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 truncate">
                    <p className="text-sm font-medium">{location.address}</p>
                    <p className="text-xs text-muted-foreground truncate">{location.company}</p>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 