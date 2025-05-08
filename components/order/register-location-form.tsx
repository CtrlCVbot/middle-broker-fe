import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormLabel } from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogClose,
  DialogTrigger 
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ILocationInfo } from '@/types/order1';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { CalendarIcon, Search as SearchIcon, Pin } from 'lucide-react';
import { useOrderRegisterStore } from '@/store/order-register-store';
import { cn } from '@/lib/utils';
import { RECENT_LOCATIONS } from '@/utils/mockdata/mock-register';

interface LocationFormProps {
  type: 'departure' | 'destination';
  locationInfo: ILocationInfo;
  onChange: (info: Partial<ILocationInfo>) => void;
  title?: string;
  compact?: boolean;
  disabled?: boolean;
  onDisabledClick?: () => void;
}

export const LocationForm: React.FC<LocationFormProps> = ({ 
  type, 
  locationInfo, 
  onChange, 
  //title = type === 'departure' ? '출발지 정보' : '도착지 정보',
  compact = false,
  disabled = false,
  onDisabledClick
}) => {
  const { useRecentLocation } = useOrderRegisterStore();
  
  // 날짜 상태 관리
  const [date, setDate] = useState<Date | undefined>(() => {
    if (!locationInfo.date) return undefined;
    
    try {
      const [year, month, day] = locationInfo.date.split('-').map(Number);
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        return new Date(year, month - 1, day);
      }
    } catch (e) {
      console.error('날짜 변환 오류:', e);
    }
    return undefined;
  });
  
  // 주소 검색 관련 상태
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [searching, setSearching] = useState(false);
  
  // 주소 검색 함수
  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    // 검색 시뮬레이션
    setTimeout(() => {
      const results = [
        `${searchQuery} 1번지`,
        `${searchQuery} 중앙로 123`,
        `${searchQuery} 산업단지 A블록`,
        `${searchQuery} 주택단지 101동`,
        `${searchQuery} 상가 지하 1층`
      ];
      setSearchResults(results);
      setSearching(false);
    }, 500);
  };
  
  // 주소 선택 함수
  const handleSelectAddress = (address: string) => {
    onChange({ address });
  };
  
  // 날짜 변경 함수
  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate);
    if (newDate) {
      const formattedDate = format(newDate, 'yyyy-MM-dd');
      onChange({ date: formattedDate });
    }
  };
  
  // 비활성화된 필드 클릭 시 콜백 호출
  const handleDisabledClick = () => {
    if (disabled && onDisabledClick) {
      onDisabledClick();
    }
  };
  
  // 날짜 정보가 변경될 때 state 업데이트
  useEffect(() => {
    if (locationInfo.date && !date) {
      try {
        const [year, month, day] = locationInfo.date.split('-').map(Number);
        if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
          setDate(new Date(year, month - 1, day));
        }
      } catch (e) {
        console.error('날짜 변환 오류:', e);
      }
    }
  }, [locationInfo.date, date]);
  
  // 최근 주소 항목 클릭 핸들러
  const handleRecentLocationClick = (location: ILocationInfo) => {
    onChange({
      address: location.address,
      detailedAddress: location.detailedAddress,
      name: location.name,
      company: location.company,
      contact: location.contact,
      date: location.date,
      time: location.time
    });
  };
  
  return (
    <div className="space-y-3">
      {/* 주소 검색 */}
      <div className="space-y-2">
        <FormLabel>주소</FormLabel>
        <div>
          <div className="flex gap-2">
            <Input
              value={locationInfo.address || ''}
              onChange={(e) => onChange({ address: e.target.value })}
              placeholder="주소를 입력하세요"
              disabled={true}
              className={disabled ? 'bg-gray-100' : ''}
              onClick={handleDisabledClick}
            />
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  type="button"
                  disabled={disabled}
                  onClick={disabled ? handleDisabledClick : undefined}
                >
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
          {/* 상세 주소 */}
          <div className="py-2">
            <Input
              value={locationInfo.detailedAddress || ''}
              onChange={(e) => onChange({ detailedAddress: e.target.value })}
              placeholder="상세 주소를 입력하세요"
              disabled={disabled}
              className={disabled ? 'bg-gray-100' : ''}
              onClick={handleDisabledClick}
            />
          </div>
        </div>
      </div>
      
      {/* 회사명 / 담당자 */}
      <div className={cn("grid gap-3", compact ? "grid-cols-2" : "grid-cols-1")}>
        <div>
          <FormLabel>회사명</FormLabel>
          <Input
            value={locationInfo.company || ''}
            onChange={(e) => onChange({ company: e.target.value })}
            placeholder="회사명을 입력하세요"
            disabled={disabled}
            className={disabled ? 'bg-gray-100' : ''}
            onClick={handleDisabledClick}
          />
        </div>
        
        <div>
          <FormLabel>담당자</FormLabel>
          <Input
            value={locationInfo.name || ''}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="담당자 이름을 입력하세요"
            disabled={disabled}
            className={disabled ? 'bg-gray-100' : ''}
            onClick={handleDisabledClick}
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
          disabled={disabled}
          className={disabled ? 'bg-gray-100' : ''}
          onClick={handleDisabledClick}
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
                  !date && "text-muted-foreground",
                  disabled && "bg-gray-100 cursor-not-allowed"
                )}
                disabled={disabled}
                onClick={disabled ? handleDisabledClick : undefined}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, 'PPP', { locale: ko }) : <span>날짜 선택</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
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
            disabled={disabled}
            className={disabled ? 'bg-gray-100' : ''}
            onClick={handleDisabledClick}
          />
        </div>
      </div>
      
      {/* 최근 사용 주소 */}
      {!compact && RECENT_LOCATIONS && RECENT_LOCATIONS.length > 0 && (
        <div className="mt-4">
          <FormLabel className="mb-2 block">최근 사용 주소</FormLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {RECENT_LOCATIONS.slice(0, 4).map((location, idx) => (
              <Button
                key={idx}
                variant="outline"
                className="h-auto py-2 justify-start text-left"
                onClick={() => handleRecentLocationClick(location)}
                disabled={disabled}
              >
                <div className="flex-1 truncate">
                  <p className="text-sm font-medium">{location.address}</p>
                  <p className="text-xs text-muted-foreground truncate">{location.company}</p>
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 