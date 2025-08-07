"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Container, 
  Weight, 
  Truck, 
  Info, 
  Loader2, 
  Package,
  Calendar,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

import { useRecentCargos, useInvalidateRecentCargos } from '@/hooks/useRecentCargos';
import { ICargo } from '@/types/order';
import { ORDER_VEHICLE_TYPES, ORDER_VEHICLE_WEIGHTS } from '@/types/order';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface RegisterCargoInfoFormProps {
  companyId?: string; // 선택적으로 변경
  compact?: boolean;
  enabled?: boolean;
  onCargoSelect?: (cargo: ICargo) => void;
  disabled?: boolean;
  onDisabledClick?: () => void;
  // 폼 데이터 연동을 위한 props 추가
  weightType?: string;
  vehicleType?: string;
  cargoType?: string;
  remark?: string;
  onWeightTypeChange?: (value: string) => void;
  onVehicleTypeChange?: (value: string) => void;
  onCargoTypeChange?: (value: string) => void;
  onRemarkChange?: (value: string) => void;
  // 초기화 관련 props 추가
  onReset?: () => void;
}

export const RegisterCargoInfoForm: React.FC<RegisterCargoInfoFormProps> = ({
  companyId,
  compact = false,
  enabled = true,
  onCargoSelect,
  disabled = false,
  onDisabledClick,
  // 폼 데이터 연동을 위한 props
  weightType = '',
  vehicleType = '',
  cargoType = '',
  remark = '',
  onWeightTypeChange,
  onVehicleTypeChange,
  onCargoTypeChange,
  onRemarkChange,
  // 초기화 관련 props
  onReset
}) => {
  const [hasEnteredCargo, setHasEnteredCargo] = useState(false);
  const [showCargoInfo, setShowCargoInfo] = useState(false);

  // 캐시 무효화 훅 사용
  const { invalidate: invalidateRecentCargos } = useInvalidateRecentCargos();

  // companyId 유효성 검사
  const isValidCompanyId = Boolean(companyId && companyId.trim() !== '' && companyId !== 'undefined');

  // 최근 화물 조회
  const { 
    data: recentCargos = [], 
    isLoading: isLoadingRecentCargos,
    error: recentCargosError,
    refetch: refetchRecentCargos
  } = useRecentCargos({ 
    companyId: companyId ?? '',
    limit: 5,
    enabled: Boolean(enabled && !hasEnteredCargo && compact && isValidCompanyId)
  });

  // 최근 화물 클릭 핸들러
  const handleRecentCargoClick = (cargo: ICargo) => {
    if (onCargoSelect) {
      onCargoSelect(cargo);
    }
    setHasEnteredCargo(true);
  };

  // 비활성화된 필드 클릭 시 콜백 호출
  const handleDisabledClick = () => {
    if (disabled && onDisabledClick) {
      onDisabledClick();
    }
  };

  // 화물 정보가 입력되면 최근 화물 표시 숨김
  useEffect(() => {
    if (hasEnteredCargo || (cargoType && cargoType.trim() !== '')) {
      setShowCargoInfo(false);
    }
  }, [hasEnteredCargo, cargoType]);

  // 초기화 시 최근 화물 정보 상태 리셋
  useEffect(() => {
    if (onReset) {
      setHasEnteredCargo(false);
      setShowCargoInfo(false);
      // 최근 화물 정보 캐시 무효화 및 재조회 (companyId가 유효할 때만)
      if (isValidCompanyId && companyId) {
        invalidateRecentCargos(companyId);
        refetchRecentCargos();
      }
    }
  }, [onReset, companyId, isValidCompanyId]); // 함수 참조 제거

  return (
    <div className="space-y-6">
      {/* 화물 정보 영역 */}
      <div className="">
        
        {/* 화물 정보 입력 폼 - 항상 표시되도록 수정 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <Container className="h-5 w-5 mr-2" />
              <div className="flex items-center">
                화물 정보 <span className="text-destructive">*</span>
              </div>
              <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowCargoInfo((prev) => !prev)}
              disabled={disabled}
            >
              {showCargoInfo ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1">
            <div className="space-y-4">
              
              {/* 최근 사용 화물 정보 섹션 - 중량/차량 종류 입력 필드 바로 위에 배치 */}
              {/* 화주 미선택 상태 */}
              {!isValidCompanyId && compact && (
                <div className="border rounded-lg p-4 bg-muted/30 mb-4">
                  <div className="text-center text-sm text-muted-foreground">
                    화주를 선택하면 최근 사용 화물 정보를 확인할 수 있습니다.
                  </div>
                </div>
              )}

              {/* 로딩 상태 UI */}
              {!hasEnteredCargo && !cargoType && compact && isLoadingRecentCargos && isValidCompanyId && (
                <div className="border rounded-lg p-4 bg-muted/30 mb-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-sm">
                      최근 화물 정보를 불러오는 중...
                    </span>
                  </div>
                </div>
              )}

              {/* 에러 상태 UI */}
              {!hasEnteredCargo && !cargoType && compact && recentCargosError && isValidCompanyId && (
                <Alert className="mb-4">
                  <AlertDescription>
                    최근 화물 정보를 불러올 수 없습니다.
                  </AlertDescription>
                </Alert>
              )}

              {/* 데이터 없음 */}
              {!hasEnteredCargo && 
               !cargoType &&
               !isLoadingRecentCargos && 
               recentCargos.length === 0 && 
               compact && 
               isValidCompanyId && (
                <div className="border rounded-lg p-4 bg-muted/30 mb-4">
                  <div className="text-center text-sm text-muted-foreground">
                    최근 입력된 화물 정보가 없습니다.
                  </div>
                </div>
              )}

              {/* 데이터 표시 */}
              {!hasEnteredCargo && 
               !cargoType &&
               !isLoadingRecentCargos && 
               recentCargos.length > 0 && 
               compact && 
               isValidCompanyId && (
                <div className="border rounded-lg p-4 bg-muted/30 mb-4">
                  <div className="flex items-center gap-2 mb-4 text-primary">
                    <Package className="h-5 w-5" />
                    <h3 className="font-medium">
                      최근 사용 화물 정보
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {recentCargos.map((cargo, idx) => (
                      <Button
                        key={cargo.id || `recent-cargo-${idx}`}
                        variant="outline"
                        className="h-auto py-3 justify-start text-left hover:bg-gray-200 cursor-pointer hover:text-blue-800"
                        onClick={() => handleRecentCargoClick(cargo)}
                        disabled={disabled}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Package className="h-4 w-4 text-primary" />
                            <p className="text-sm font-medium truncate">{cargo.cargoName}</p>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Weight className="h-3 w-3" />
                              {cargo.requestedVehicleWeight}
                            </span>
                            <span className="flex items-center gap-1">
                              <Truck className="h-3 w-3" />
                              {cargo.requestedVehicleType}
                            </span>
                          </div>
                          {cargo.memo && (
                            <p className="text-xs text-muted-foreground mt-1 truncate">
                              {cargo.memo}
                            </p>
                          )}
                          <div className="flex items-center gap-1 mt-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(cargo.updatedAt), 'yyyy-MM-dd')}
                            </span>
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* 중량 / 차량 종류 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium mb-2 flex items-center">
                    <Weight className="h-4 w-4 mr-2 text-muted-foreground" />중량
                  </div>
                  <Select 
                    value={weightType}
                    onValueChange={onWeightTypeChange}
                    disabled={disabled}
                  >
                    <SelectTrigger 
                      onClick={disabled ? handleDisabledClick : undefined}
                      className={disabled ? 'bg-gray-100' : ''}
                    >
                      <SelectValue placeholder="차량 중량 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {ORDER_VEHICLE_WEIGHTS.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <div className="text-sm font-medium mb-2 flex items-center">
                    <Truck className="h-4 w-4 mr-2 text-muted-foreground" />종류
                  </div>
                  <Select 
                    value={vehicleType}
                    onValueChange={onVehicleTypeChange}
                    disabled={disabled}
                  >
                    <SelectTrigger 
                      onClick={disabled ? handleDisabledClick : undefined}
                      className={disabled ? 'bg-gray-100' : ''}
                    >
                      <SelectValue placeholder="차량 종류 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {ORDER_VEHICLE_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* 화물 품목 */}
              <div className="col-span-12 md:col-span-10 flex items-end gap-2">
                <div className="flex-1">
                  <div className="text-sm font-medium mb-2 flex items-center">
                    화물 품목
                  </div>
                  <Input
                    placeholder="화물 품목을 입력하세요 (최대 38자)"
                    maxLength={38}
                    value={cargoType}
                    onChange={(e) => onCargoTypeChange?.(e.target.value)}
                    disabled={disabled}
                    className={disabled ? 'bg-gray-100' : ''}
                    onClick={disabled ? handleDisabledClick : undefined}
                  />
                  <p className="text-xs text-right text-muted-foreground mt-1">
                    {cargoType.length}/38자
                  </p>
                </div>
              </div>

              {/* 비고 - 조건부 렌더링 */}
              {showCargoInfo && (
                <div className="animate-in fade-in-50 duration-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">비고</div>
                  </div>
                  <Textarea
                    placeholder="비고 (선택사항)"
                    value={remark}
                    onChange={(e) => onRemarkChange?.(e.target.value)}
                    className="resize-none h-20"
                    disabled={disabled}
                    onClick={disabled ? handleDisabledClick : undefined}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}; 