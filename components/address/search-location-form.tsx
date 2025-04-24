import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { ILocationInfo } from '@/types/order';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { CalendarIcon, Search as SearchIcon, MapPin, Building, Loader2 } from 'lucide-react';
import { useOrderRegisterStore } from '@/store/order-register-store';
import { cn } from '@/lib/utils';
import { RECENT_LOCATIONS } from '@/utils/mockdata/mock-register';

interface IKakaoAddressResult {
  place_name: string;
  distance: string;
  place_url: string;
  category_name: string;
  address_name: string;
  road_address_name: string;
  id: string;
  phone: string;
  category_group_code: string;
  category_group_name: string;
  x: string;
  y: string;
}

interface LocationFormProps {
  type: 'departure' | 'destination' | 'any';
  locationInfo: Partial<ILocationInfo>;
  onChange: (info: Partial<ILocationInfo>) => void;
  title?: string;
  compact?: boolean;
  disabled?: boolean;
  onDisabledClick?: () => void;
  onSelectLocation?: (location: any) => void;
}

export const LocationForm: React.FC<LocationFormProps> = ({ 
  type, 
  locationInfo = {},
  onChange, 
  //title = type === 'departure' ? '출발지 정보' : '도착지 정보',
  compact = false,
  disabled = false,
  onDisabledClick,
  onSelectLocation
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
  const [searchResults, setSearchResults] = useState<IKakaoAddressResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  
  // 주소 검색 함수
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    setSearchError(null);
    
    try {
      const response = await fetch(`/api/external/kakao/local/search-address?query=${encodeURIComponent(searchQuery.trim())}`);
      
      if (!response.ok) {
        throw new Error('주소 검색 중 오류가 발생했습니다.');
      }
      
      const data = await response.json();
      
      if (data.documents && Array.isArray(data.documents)) {
        setSearchResults(data.documents);
      } else {
        setSearchResults([]);
        setSearchError('검색 결과가 없습니다.');
      }
    } catch (error) {
      console.error('주소 검색 오류:', error);
      setSearchError('주소 검색 중 오류가 발생했습니다.');
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };
  
  // 주소 선택 함수
  const handleSelectAddress = (result: IKakaoAddressResult) => {
    const locationData = {
      address: result.road_address_name || result.address_name,
      detailedAddress: '',
      name: result.place_name || '',
      company: result.place_name || '',
      contact: result.phone || '',
      // 위도, 경도 정보로 추가 데이터 활용 가능
      metadata: {
        lat: parseFloat(result.y),
        lng: parseFloat(result.x),
        originalInput: searchQuery,
        source: 'kakao',
        buildingName: result.place_name || '',
      }
    };
    
    onChange(locationData);
    
    if (onSelectLocation) {
      onSelectLocation({
        roadAddress: result.road_address_name,
        jibunAddress: result.address_name,
        name: result.place_name,
        contactPhone: result.phone,
        metadata: {
          lat: parseFloat(result.y),
          lng: parseFloat(result.x),
          originalInput: searchQuery,
          source: 'kakao',
          buildingName: result.place_name,
        }
      });
    }
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
        <div className="text-sm font-medium">주소</div>
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
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>주소 검색</DialogTitle>
                  <DialogDescription>
                    찾으시는 주소의 도로명, 지번, 건물명을 입력하세요
                  </DialogDescription>
                </DialogHeader>
                
                <div className="flex gap-2 my-4">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="예: 강남구 역삼동, 테헤란로 152"
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button 
                    type="button" 
                    onClick={handleSearch}
                    disabled={searching}
                  >
                    {searching ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <SearchIcon className="h-4 w-4 mr-2" />}
                    {searching ? '검색 중' : '검색'}
                  </Button>
                </div>
                
                {searchError && (
                  <div className="text-sm text-red-500 p-2 rounded-md bg-red-50 mb-2">
                    {searchError}
                  </div>
                )}
                
                {searchResults.length > 0 && (
                  <ScrollArea className="h-[350px] rounded-md border border-input p-1">
                    <div className="space-y-1">
                      {searchResults.map((result) => (
                        <DialogClose key={result.id} asChild>
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-left p-3 h-auto"
                            onClick={() => handleSelectAddress(result)}
                          >
                            <div className="flex flex-col gap-1 w-full">
                              <div className="flex items-start">
                                <Building className="h-4 w-4 mr-2 shrink-0 mt-0.5 text-primary" />
                                <span className="font-medium">{result.place_name || result.address_name}</span>
                              </div>
                              
                              {result.road_address_name && (
                                <div className="flex items-start text-sm text-muted-foreground pl-6">
                                  <MapPin className="h-3.5 w-3.5 mr-2 shrink-0 mt-0.5" />
                                  <span>{result.road_address_name}</span>
                                </div>
                              )}
                              
                              {result.address_name && result.road_address_name !== result.address_name && (
                                <div className="flex items-start text-sm text-muted-foreground pl-6">
                                  <MapPin className="h-3.5 w-3.5 mr-2 shrink-0 mt-0.5" />
                                  <span>{result.address_name}</span>
                                </div>
                              )}
                              
                              {result.phone && (
                                <div className="text-sm text-muted-foreground pl-6">
                                  연락처: {result.phone}
                                </div>
                              )}
                            </div>
                          </Button>
                        </DialogClose>
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
          <div className="text-sm font-medium">회사명</div>
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
          <div className="text-sm font-medium">담당자</div>
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
        <div className="text-sm font-medium">연락처</div>
        <Input
          value={locationInfo.contact || ''}
          onChange={(e) => onChange({ contact: e.target.value })}
          placeholder="연락처를 입력하세요"
          disabled={disabled}
          className={disabled ? 'bg-gray-100' : ''}
          onClick={handleDisabledClick}
        />
      </div>
      
      {/* 날짜/시간 입력 (그리드 레이아웃) */}
      {!compact && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-sm font-medium">일자</div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left",
                    !date && "text-muted-foreground",
                    disabled && "bg-gray-100"
                  )}
                  disabled={disabled}
                  onClick={disabled ? handleDisabledClick : undefined}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP', { locale: ko }) : "날짜 선택"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={handleDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div>
            <div className="text-sm font-medium">시간</div>
            <Input
              value={locationInfo.time || ''}
              onChange={(e) => onChange({ time: e.target.value })}
              placeholder="시간을 입력하세요 (예: 14:00)"
              disabled={disabled}
              className={disabled ? 'bg-gray-100' : ''}
              onClick={handleDisabledClick}
            />
          </div>
        </div>
      )}
    </div>
  );
} 