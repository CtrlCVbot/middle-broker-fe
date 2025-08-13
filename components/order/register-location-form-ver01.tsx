//react, next
import React, { useState, useEffect, useRef, useCallback } from 'react';

//ui
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarIcon, Search as SearchIcon, Map, Phone, Building2, User, Loader2, MapPin, Building, Clock, Pin, LogOut, LogIn } from 'lucide-react';

//types
import { ILocationInfo } from '@/types/order';
import { IKakaoAddressResult, IAddress } from '@/types/address';

//store
import { useOrderRegisterStore } from '@/store/order-register-store';

//hooks
import { useRecentAddresses } from '@/hooks/useRecentAddresses';

//components
import { SearchAddressDialog } from '@/components/address/search-address-dialog';

//utils
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { findNearestTenMinuteTime, adjustMinutesToHalfHour } from '@/utils/time-utils';

// 시간 옵션 생성 (00~23)
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => 
  i.toString().padStart(2, '0')
);

// 분 옵션 생성 (10분 단위)
const MINUTE_OPTIONS = ['00', '10', '20', '30', '40', '50'];

interface LocationFormProps {
  type: 'departure' | 'destination';
  locationInfo: ILocationInfo;
  onChange: (info: Partial<ILocationInfo>) => void;
  title?: string;
  compact?: boolean;
  disabled?: boolean;
  onDisabledClick?: () => void;
  companyId?: string;
  onReset?: () => void; // 초기화 신호를 받기 위한 prop 추가
}

export const LocationFormVer01: React.FC<LocationFormProps> = ({ 
  type, 
  locationInfo, 
  onChange, 
  //title = type === 'departure' ? '상차지 정보' : '하차지 정보',
  compact = false,
  disabled = false,
  onDisabledClick,
  companyId = '',
  onReset
}) => {
  const { useRecentLocation } = useOrderRegisterStore();
  const [hasSearchedAddress, setHasSearchedAddress] = useState(!!locationInfo.address);
  
  // type 변환: 'departure' -> 'pickup', 'destination' -> 'delivery'
  const addressType = type === 'departure' ? 'pickup' : 'delivery';
  
  // 타입별로 실제 데이터 fetch
  const { 
    data: recentAddresses = [], 
    isLoading: isLoadingRecentAddresses,
    error: recentAddressesError 
  } = useRecentAddresses({ 
    selectedCompanyId: companyId,
    type: addressType,
    limit: 4,
    enabled: !hasSearchedAddress && compact 
  });
  
  // 시간 파싱 헬퍼 함수
  const parseTime = (timeString: string) => {
    if (!timeString) return { hour: '', minute: '' };
    const [hour, minute] = timeString.split(':');
    return { hour: hour || '', minute: minute || '' };
  };
  
  // 시간 조합 헬퍼 함수
  const combineTime = (hour: string, minute: string) => {
    return `${hour}:${minute}`;
  };
  
  // 현재 시간 값에서 시간과 분 추출
  const { hour: currentHour, minute: currentMinute } = parseTime(locationInfo.time || '');

  // 주소 검색 관련 상태 (useEffect에서 사용되므로 먼저 선언)
  const [searchResults, setSearchResults] = useState<IKakaoAddressResult[]>([]);

  // 디버깅: recentAddresses와 searchResults의 key 확인
  React.useEffect(() => {
    if (recentAddresses.length > 0) {
      const recentKeys = recentAddresses.map((location, idx) => location.id || `recent-${idx}`);
      const duplicateRecentKeys = recentKeys.filter((key, index) => recentKeys.indexOf(key) !== index);
      if (duplicateRecentKeys.length > 0) {
        console.warn('🔍 LocationForm recentAddresses에서 중복된 key 발견:', duplicateRecentKeys);
        console.warn('🔍 전체 recentAddresses 배열:', recentAddresses);
      }
    }
    
    if (searchResults.length > 0) {
      const searchKeys = searchResults.map((result, index) => result.id || `search-result-${index}`);
      const duplicateSearchKeys = searchKeys.filter((key, index) => searchKeys.indexOf(key) !== index);
      if (duplicateSearchKeys.length > 0) {
        console.warn('🔍 LocationForm searchResults에서 중복된 key 발견:', duplicateSearchKeys);
        console.warn('🔍 전체 searchResults 배열:', searchResults);
      }
    }
  }, [recentAddresses, searchResults]);
  
  // 시간 편집 Popover 상태
  const [isTimePopoverOpen, setIsTimePopoverOpen] = useState(false);
  
  // 편집 모드에서 임시로 사용할 시간/분 상태
  const [tempHour, setTempHour] = useState('');
  const [tempMinute, setTempMinute] = useState('');
  
  // 시간 편집 Popover 열기 핸들러
  const handleOpenTimePopover = () => {
    setTempHour(currentHour || '');
    setTempMinute(currentMinute || '');
    setIsTimePopoverOpen(true);
  };
  
  // 임시 시간 변경 핸들러
  const handleTempHourChange = (newHour: string) => {
    setTempHour(newHour);
  };
  
  // 임시 분 변경 핸들러
  const handleTempMinuteChange = (newMinute: string) => {
    setTempMinute(newMinute);
  };
  
  // 시간 편집 완료 핸들러
  const handleTimeEditComplete = useCallback(() => {
    // 임시 상태에서 실제 상태로 반영
    const finalHour = tempHour || '00';
    const finalMinute = tempMinute || '00';
    const newTime = combineTime(finalHour, finalMinute);
    onChange({ time: newTime });
    setIsTimePopoverOpen(false);
    setTempHour('');
    setTempMinute('');
  }, [tempHour, tempMinute, onChange]);
  
  // 시간 편집 취소 핸들러
  const handleTimeEditCancel = () => {
    setIsTimePopoverOpen(false);
    setTempHour('');
    setTempMinute('');
  };
  

  
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
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  
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
  
  // 주소록에서 주소 선택 함수
  const handleSelectAddressFromBook = (address: IAddress) => {
    // 현재 시간
    const now = new Date();

    // 타입별 시간 오프셋 (단위: 시간)
    const timeOffsetByType: Record<'departure' | 'destination', number> = {
      departure: 6,    // 상차: 현재 + 6시간
      destination: 7,  // 하차: 현재 + 7시간 (상차 + 1시간)
    };

    // 선택한 타입에 따라 미래 시간 계산
    const offsetHours = timeOffsetByType[type];
    const futureTime = new Date(now.getTime() + offsetHours * 60 * 60 * 1000);

    // 분을 00분 또는 30분으로 조정
    const adjustedTime = adjustMinutesToHalfHour(futureTime);

    // 시간 포맷팅 (HH:mm)
    const formattedDate = format(adjustedTime, 'yyyy-MM-dd');
    const formattedTime = format(adjustedTime, 'HH:mm', { locale: ko });

    // 최종 날짜 + 시간 정보
    const dateTimeInfo = {
      date: formattedDate,
      time: formattedTime,
    };

    
    onChange({
      id: address.id,
      address: address.roadAddress || address.jibunAddress,
      detailedAddress: address.detailAddress || '',
      name: address.contactName || '',
      company: address.name || '',
      contact: address.contactPhone || '',
      latitude: address.metadata?.lat || 0,
      longitude: address.metadata?.lng || 0,
      ...dateTimeInfo
    });
    
    if (type === 'departure' && dateTimeInfo.date) {
      setDate(now);
    }
    else if (type === 'destination' && dateTimeInfo.date) {
      setDate(now);
    }
    
    setHasSearchedAddress(true);
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

  // onReset prop을 받았을 때 내부 상태 초기화
  useEffect(() => {
    if (onReset) {
      setDate(undefined);
      setHasSearchedAddress(false);
      setSearchQuery('');
      setSearchResults([]);
      setSearchError(null);
      setIsTimePopoverOpen(false);
      setTempHour('');
      setTempMinute('');
    }
  }, [onReset]);

  // 주소가 선택되었을 때 자동으로 날짜/시간 설정 (현재 시간 + 6시간)
  useEffect(() => {
    if (hasSearchedAddress && !locationInfo.date && !locationInfo.time) {
      const now = new Date();
      const futureTime = new Date(now.getTime() + 6 * 60 * 60 * 1000); // 6시간 후
      
      // 분을 00분 또는 30분으로 조정
      const adjustedTime = adjustMinutesToHalfHour(futureTime);
      
      const formattedDate = format(adjustedTime, 'yyyy-MM-dd');
      const formattedTime = format(adjustedTime, 'HH:mm', { locale: ko });
      
      onChange({
        date: formattedDate,
        time: formattedTime
      });
      
      setDate(adjustedTime);
    }
  }, [hasSearchedAddress, locationInfo.date, locationInfo.time, onChange]);
  
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
  const handleRecentLocationClickVer1 = (location: IAddress) => {
    onChange({
      id: location.id, // id를 명시적으로 추가
      address: location.roadAddress || location.jibunAddress,
      detailedAddress: location.detailAddress || '',
      name: location.contactName || '',
      company: location.name || '',
      contact: location.contactPhone || '',
      latitude: location.metadata?.lat || 0,
      longitude: location.metadata?.lng || 0
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
            {type === 'departure' ? (
              <LogOut className={`h-5 w-5 text-primary`} />
            ) : (
              <LogIn className={`h-5 w-5 text-primary`} />
            )}
            <h3 className="text-lg font-bold">{type === 'departure' ? '상차 정보' : '하차 정보'}</h3><span className="text-destructive">*</span>
          </div>
          
          <div className="flex gap-2">
            
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
        {/* 로딩 상태 UI */}
        {!hasSearchedAddress && compact && isLoadingRecentAddresses && (
          <div className="border rounded-lg p-4 bg-muted/30 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">
                최근 사용 {type === 'departure' ? '상차지' : '하차지'} 불러오는 중...
              </span>
            </div>
          </div>
        )}

        {/* 에러 상태 UI */}
        {!hasSearchedAddress && compact && recentAddressesError && (
          <div className="text-sm text-red-500 p-2 rounded-md bg-red-50 mb-2">
            최근 사용 {type === 'departure' ? '상차지' : '하차지'}를 불러올 수 없습니다.
          </div>
        )}

        {/* 데이터 표시 */}
        {!hasSearchedAddress && 
         !isLoadingRecentAddresses && 
         recentAddresses.length > 0 && 
         compact && (
          <div className="border rounded-lg p-4 bg-muted/30 mb-4">
            <div className="flex items-center gap-2 mb-4 text-primary">
              <Pin className="h-5 w-5" />
              <h3 className="font-medium">
                최근 사용 {type === 'departure' ? '상차지' : '하차지'}
              </h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {recentAddresses.map((location, idx) => (
                <Button
                  key={location.id || `recent-${idx}`}
                  variant="outline"
                  className={cn("h-auto py-2 justify-start text-left",
                    type === 'departure' ? 'hover:bg-gray-200 cursor-pointer hover:text-green-800' : 'hover:bg-gray-200 cursor-pointer hover:text-blue-800'
                  )}
                  onClick={() => handleRecentLocationClickVer1(location)}
                  disabled={disabled}
                >
                  <div className="flex-1 truncate">
                    <p className="text-sm font-medium">{location.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{location.roadAddress}</p>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}

        {hasSearchedAddress ? (
          <>
            {/* 연락처 정보 영역 */}
            <div className="border rounded-lg p-4 bg-muted/30 mb-6">
              <div className="space-y-4">
                {/* 회사명 / 담당자 */}
                <div className={cn("grid gap-4", compact ? "grid-cols-2" : "grid-cols-1 md:grid-cols-2")}>
                  <div>
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                      <Building className="h-4 w-4 mb-2" />
                      <div className="text-xs text-gray-500 mb-2">회사명</div>
                    </div>
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
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                      <User className="h-4 w-4 mb-2" />
                      <div className="text-xs text-gray-500 mb-2">담당자</div>
                    </div>
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
                  <div className="text-xs text-gray-500 mb-2">연락처</div>
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
            <div className="mb-6">
              <div className="text-xs text-gray-500 mb-2">상세 주소 :</div>
              <Input
                value={locationInfo.detailedAddress || ''}
                onChange={(e) => onChange({ detailedAddress: e.target.value })}
                placeholder="상세 주소를 입력하세요"
                disabled={disabled}
                className={disabled ? 'bg-muted' : ''}
                onClick={handleDisabledClick}
                             />
             </div>

             {/* 일정 정보 영역 */}
             <div className="border rounded-lg p-4 bg-muted/30">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <div className="flex items-center gap-2">
                     {/* <CalendarIcon className="h-5 w-5 mb-2" /> */}
                     <div className="text-xs text-gray-500 mb-2">
                       {type === 'departure' ? '상차일' : '하차일'} <span className="text-destructive">*</span>
                     </div>
                   </div>
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
                         {date ? format(date, 'P', { locale: ko }) : "날짜 선택"}
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
                   <div className="flex items-center gap-2">
                     {/* <Clock className="h-5 w-5 mb-2" /> */}
                     <div className="text-xs text-gray-500 mb-2">
                       {type === 'departure' ? '상차 시간' : '하차 시간'} <span className="text-destructive">*</span>
                     </div>
                   </div>
                   
                   <Popover open={isTimePopoverOpen} onOpenChange={setIsTimePopoverOpen}>
                     <PopoverTrigger asChild>
                       <div 
                         className={cn(
                           "flex items-center justify-center border rounded-lg px-3 bg-background h-10 transition-colors",
                           disabled 
                             ? "bg-muted cursor-not-allowed" 
                             : "cursor-pointer hover:bg-muted/50"
                         )}
                         onClick={disabled ? handleDisabledClick : handleOpenTimePopover}
                       >
                         <div className="text-sm font-mono text-foreground">
                           {locationInfo.time || '시간을 선택하세요'}
                         </div>
                       </div>
                     </PopoverTrigger>
                     <PopoverContent className="w-auto p-4">
                       <div className="space-y-4">
                         <div className="text-sm font-medium text-center">
                           {type === 'departure' ? '상차 시간' : '하차 시간'} 설정
                         </div>
                         
                         <div className="flex items-center gap-3 justify-center">
                           <Select
                             value={tempHour}
                             onValueChange={handleTempHourChange}
                           >
                             <SelectTrigger className="w-20 h-9">
                               <SelectValue placeholder="시" />
                             </SelectTrigger>
                             <SelectContent className="max-h-60">
                               {HOUR_OPTIONS.map((hour) => (
                                 <SelectItem key={hour} value={hour}>
                                   {hour}시
                                 </SelectItem>
                               ))}
                             </SelectContent>
                           </Select>
                           
                           <span className="text-lg font-bold text-muted-foreground">:</span>
                           
                           <Select
                             value={tempMinute}
                             onValueChange={handleTempMinuteChange}
                           >
                             <SelectTrigger className="w-20 h-9">
                               <SelectValue placeholder="분" />
                             </SelectTrigger>
                             <SelectContent>
                               {MINUTE_OPTIONS.map((minute) => (
                                 <SelectItem key={minute} value={minute}>
                                   {minute}분
                                 </SelectItem>
                               ))}
                             </SelectContent>
                           </Select>
                         </div>
                         
                         <div className="flex gap-2 justify-end">
                           <Button
                             type="button"
                             variant="outline"
                             size="sm"
                             onClick={handleTimeEditCancel}
                           >
                             취소
                           </Button>
                           <Button
                             type="button"
                             variant="default"
                             size="sm"
                             onClick={handleTimeEditComplete}
                           >
                             확인
                           </Button>
                         </div>
                       </div>
                     </PopoverContent>
                   </Popover>
                 </div>
               </div>
             </div>
          </>
        ) : 
        //주소록에서 찾기
        (
          <div className={cn("flex flex-col items-center justify-center py-4 border-2 border-dashed border-gray-300 rounded-md bg-gray-50 mb-2 mt-6",
            type === 'departure' ? 'bg-gray-100' : 'bg-gray-100'
          )}>
            <Map className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-4">{type === 'departure' ? '상차지' : '하차지'} 주소를 검색해주세요</p>
            <div className="flex gap-2">
              
              <Button 
                type="button" 
                onClick={() => setIsAddressDialogOpen(true)}
                disabled={disabled}
                className={type === 'departure' ? 'hover:bg-green-800 cursor-pointer' : 'hover:bg-blue-800 cursor-pointer'}
              >
                <Building className="h-4 w-4 mr-2" />
                주소록에서 찾기
              </Button>
            </div>
          </div>
        )}
      </div>
      

      

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
                {searchResults.map((result, index) => (
                  <DialogClose key={result.id || `search-result-${index}`} asChild>
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

      {/* 주소록에서 선택 다이얼로그 */}
      <SearchAddressDialog 
        open={isAddressDialogOpen} 
        onOpenChange={setIsAddressDialogOpen}
        onSelect={handleSelectAddressFromBook}
        companyId={companyId}
      />
    </div>
  );
}; 