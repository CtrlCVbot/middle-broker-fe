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
import { ILocationInfo } from '@/types/order';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { CalendarIcon, Search as SearchIcon, Map, Phone, Building2, User, Loader2, MapPin, Building } from 'lucide-react';
import { useOrderRegisterStore } from '@/store/order-register-store';
import { cn } from '@/lib/utils';
import { RECENT_LOCATIONS } from '@/utils/mockdata/mock-register';

// 카카오 주소 검색 결과 인터페이스
interface IKakaoAddressResult {
  place_name: string;
  distance: string;
  place_url: string;
  category_name: string;
  address_name: string;
  road_address_name?: string;
  road_address?: {
    address_name: string;
    region_1depth_name: string;
    region_2depth_name: string;
    region_3depth_name: string;
    road_name: string;
    underground_yn: string;
    main_building_no: string;
    sub_building_no: string;
    building_name: string;
    zone_no: string;
  };
  address?: {
    address_name: string;
    region_1depth_name: string;
    region_2depth_name: string;
    region_3depth_name: string;
    mountain_yn: string;
    main_address_no: string;
    sub_address_no: string;
    zip_code: string;
  };
  id: string;
  phone: string;
  category_group_code: string;
  category_group_name: string;
  x: string;
  y: string;
}

interface LocationFormProps {
  type: 'departure' | 'destination';
  locationInfo: ILocationInfo;
  onChange: (info: Partial<ILocationInfo>) => void;
  title?: string;
  compact?: boolean;
  disabled?: boolean;
  onDisabledClick?: () => void;
}

export const LocationFormVer01: React.FC<LocationFormProps> = ({ 
  type, 
  locationInfo, 
  onChange, 
  //title = type === 'departure' ? '출발지 정보' : '도착지 정보',
  compact = false,
  disabled = false,
  onDisabledClick
}) => {
  const { useRecentLocation } = useOrderRegisterStore();
  const [hasSearchedAddress, setHasSearchedAddress] = useState(!!locationInfo.address);
  
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
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  
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
      setSearchError('주소 검색 중 오류가 발생했습니다.');
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };
  
  // 주소 선택 함수
  const handleSelectAddress = (result: IKakaoAddressResult) => {
    const roadAddress = result.road_address?.address_name || result.road_address_name || '';
    const jibunAddress = result.address?.address_name || result.address_name || '';
    
    onChange({
      address: roadAddress || jibunAddress,
      detailedAddress: '',
      name: result.place_name || '',
      company: result.place_name || '',
      contact: result.phone || '',
      // metadata에 위도/경도 정보도 추가할 수 있음
    });
    
    setHasSearchedAddress(true);
    setIsSearchDialogOpen(false);
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
    
    // locationInfo가 변경되면 주소 검색 상태도 업데이트
    setHasSearchedAddress(!!locationInfo.address);
  }, [locationInfo.date, date, locationInfo.address]);
  
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
    setHasSearchedAddress(true);
  };
  
  // 전화번호 자동 포맷팅 함수
  const formatPhoneNumber = (value: string) => {
    // 숫자와 하이픈만 남기기
    const cleaned = value.replace(/[^\d-]/g, '');
    // 하이픈 제거
    const numbersOnly = cleaned.replace(/-/g, '');
    
    // 전화번호 형식에 맞게 하이픈 추가
    if (numbersOnly.length <= 3) {
      return numbersOnly;
    } else if (numbersOnly.length <= 7) {
      return `${numbersOnly.slice(0, 3)}-${numbersOnly.slice(3)}`;
    } else {
      return `${numbersOnly.slice(0, 3)}-${numbersOnly.slice(3, 7)}-${numbersOnly.slice(7, 11)}`;
    }
  };

  // 전화번호 변경 시 자동 포맷팅 적용
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatPhoneNumber(e.target.value);
    onChange({ contact: formattedValue });
  };

   // 데이터 초기화 함수 추가: 폼 데이터를 초기 상태로 리셋합니다.
   const handleReset = () => {
    onChange({
      address: '',
      roadAddress: '',
      jibunAddress: '',
      latitude: 0,
      longitude: 0,
      detailedAddress: '',
      name: '',
      company: '',
      contact: '',
      date: '',
      time: '',
    });
    setDate(undefined);
    setHasSearchedAddress(false);
    setSearchQuery('');
    setSearchResults([]);
    setSearchError(null);
  };
  
  return (
    <div className="space-y-6">
      {/* 주소 정보 영역 */}
      {/* <div className="border rounded-lg p-4 bg-muted/30"> */}
      <div className="">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-primary">
            <Map className={`h-5 w-5 ${type === 'departure' ? 'text-red-500' : 'text-blue-500'}`} />
            <h3 className="font-medium">{type === 'departure' ? '상차 정보' : '하차 정보'}</h3>
          </div>
          {/* <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={() => setIsSearchDialogOpen(true)}
            disabled={disabled}
          >
            <SearchIcon className="h-4 w-4 mr-2" />
            주소 검색
          </Button> */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsSearchDialogOpen(true)}
              disabled={disabled}
            >
              <SearchIcon className="h-4 w-4 mr-2" />
              주소 검색
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={disabled}
            >
              초기화
            </Button>
          </div>
        </div>

        {/* 최근 사용 주소 */}
        {!hasSearchedAddress && (compact && RECENT_LOCATIONS && RECENT_LOCATIONS.length > 0) && (
          <div className="border rounded-lg p-4 bg-muted/30 mb-4">
            <div className="flex items-center gap-2 mb-4 text-primary">
              <Building2 className="h-5 w-5" />
              <h3 className="font-medium">최근 사용 주소</h3>
            </div>
            
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

        {hasSearchedAddress ? (
          <>
            {/* 주소 표시 영역 */}
            <div className="mb-4">
              <div className="flex items-center justify-between border p-4 rounded bg-background bg-muted/30">
                <div className="flex flex-col text-sm">
                  <div className="font-medium text-base text-primary">
                    {locationInfo.address || '주소를 검색해주세요'}
                  </div>
                  {locationInfo.detailedAddress && (
                    <div className="text-muted-foreground text-sm mt-1">
                      {locationInfo.detailedAddress}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* 상세 주소 입력 */}
            <div className="mb-4">
              <div className="text-sm font-medium mb-2">상세 주소</div>
              <Input
                value={locationInfo.detailedAddress || ''}
                onChange={(e) => onChange({ detailedAddress: e.target.value })}
                placeholder="상세 주소를 입력하세요"
                disabled={disabled}
                className={disabled ? 'bg-muted' : ''}
                onClick={handleDisabledClick}
              />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 border border-dashed rounded-md bg-muted/30">
            <Map className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-4">{type === 'departure' ? '출발지' : '도착지'} 주소를 검색해주세요</p>
            <Button 
              type="button" 
              onClick={() => setIsSearchDialogOpen(true)}
              disabled={disabled}
            >
              <SearchIcon className="h-4 w-4 mr-2" />
              주소 검색하기
            </Button>
          </div>
        )}
      </div>
      
      {/* 연락처 정보 영역 */}
      {hasSearchedAddress && (
      <div className="border rounded-lg p-4 bg-muted/30">
        <div className="flex items-center gap-2 mb-4 text-primary">
          <User className="h-5 w-5" />
          <h3 className="font-medium">{type === 'departure' ? '상차 담당자' : '하차 담당자'} 정보</h3>
        </div>

        <div className="space-y-4">
          {/* 회사명 / 담당자 */}
          <div className={cn("grid gap-4", compact ? "grid-cols-2" : "grid-cols-1 md:grid-cols-2")}>
            <div>
              <div className="text-sm font-medium mb-2">회사명</div>
              <Input
                value={locationInfo.company || ''}
                onChange={(e) => onChange({ company: e.target.value })}
                placeholder="회사명을 입력하세요"
                disabled={disabled}
                className={disabled ? 'bg-muted' : ''}
                onClick={handleDisabledClick}
              />
            </div>
            
            <div>
              <div className="text-sm font-medium mb-2">담당자</div>
              <Input
                value={locationInfo.name || ''}
                onChange={(e) => onChange({ name: e.target.value })}
                placeholder="담당자 이름을 입력하세요"
                disabled={disabled}
                className={disabled ? 'bg-muted' : ''}
                onClick={handleDisabledClick}
              />
            </div>
          </div>
          
          {/* 연락처 */}
          <div>
            <div className="text-sm font-medium mb-2">연락처</div>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={locationInfo.contact || ''}
                onChange={handlePhoneChange}
                placeholder="연락처를 입력하세요"
                disabled={disabled}
                className={cn(disabled ? 'bg-muted' : '', "pl-10")}
                onClick={handleDisabledClick}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              숫자와 하이픈(-)만 입력 가능합니다 (예: 010-1234-5678)
            </p>
          </div>
        </div>
      </div>
      )}
      
      {/* 일정 정보 영역 */}
      {hasSearchedAddress && (
      <div className="border rounded-lg p-4 bg-muted/30">
        <div className="flex items-center gap-2 mb-4 text-primary">
          <CalendarIcon className="h-5 w-5" />
          <h3 className="font-medium">{type === 'departure' ? '상차 일정' : '하차 일정'} 정보</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium mb-2">{type === 'departure' ? '출발일' : '도착일'}</div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left",
                    !date && "text-muted-foreground",
                    disabled && "bg-muted"
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
                  locale={ko}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div>
            <div className="text-sm font-medium mb-2">{type === 'departure' ? '출발 시간' : '도착 시간'}</div>
            <Input
              type="time"
              value={locationInfo.time || ''}
              onChange={(e) => onChange({ time: e.target.value })}
              placeholder="시간을 입력하세요"
              disabled={disabled}
              className={disabled ? 'bg-muted' : ''}
              onClick={handleDisabledClick}
            />
          </div>
        </div>
      </div>
      )}
      
      

      {/* 주소 검색 다이얼로그 */}
      <Dialog open={isSearchDialogOpen} onOpenChange={setIsSearchDialogOpen}>
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
                        
                        {(result.road_address_name || result.road_address?.address_name) && (
                          <div className="flex items-start text-sm text-muted-foreground pl-6">
                            <MapPin className="h-3.5 w-3.5 mr-2 shrink-0 mt-0.5" />
                            <span>{result.road_address_name || result.road_address?.address_name}</span>
                          </div>
                        )}
                        
                        {(result.address_name || result.address?.address_name) && (result.road_address_name !== result.address_name) && (
                          <div className="flex items-start text-sm text-muted-foreground pl-6">
                            <MapPin className="h-3.5 w-3.5 mr-2 shrink-0 mt-0.5" />
                            <span>{result.address_name || result.address?.address_name}</span>
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
  );
}; 