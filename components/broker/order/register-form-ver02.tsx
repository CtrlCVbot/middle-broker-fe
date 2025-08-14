"use client";

//react, next
import React, { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from 'next/navigation';

//ui
import { 
  Form, 
  FormLabel, 
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
//import { toast } from "@/components/ui/use-toast";
import { toast } from "sonner";
import { TruckIcon, MapPinIcon, Settings2 as OptionsIcon, Calculator as CalculatorIcon, ChevronDown, ChevronUp, PencilIcon, Info, Weight, Truck, Container, Loader2 } from "lucide-react";

//store, services
import { useOrderRegisterStore } from "@/store/order-register-store";
import { useOrderEditStore } from "@/store/order-edit-store";
import { DistanceClientService } from "@/services/distance-client-service";
import { useCompanies, useCompanyStore } from "@/store/company-store";
import { useBrokerCompanyManagerStore } from "@/store/broker-company-manager-store";
// 추가: 자동 설정을 위한 imports
import { useAuthStore } from "@/store/auth-store";
import { getCompanyById } from "@/services/company-service";

//types
import {  
  ORDER_VEHICLE_TYPES,
  ORDER_VEHICLE_WEIGHTS
} from "@/types/order";

//components
import { LocationFormVer01 } from "@/components/broker/order/register-location-form-ver02";
import { RegisterSuccessDialog } from '@/components/broker/order/register-success-dialog';
import { CompanyManagerInfoSection } from '@/components/broker/order/register-company-manager-info-section';
import { RegisterTransportOptionCard } from '@/components/broker/order/register-transport-option-card';
import { RegisterEstimateInfoCard } from '@/components/broker/order/register-estimate-info-card';
import { OrderStepProgress } from "@/components/order/order-step-progress";
import { RegisterCargoInfoForm } from "@/components/order/register-cargoInfo-form";

//utils
import { format } from 'date-fns';
import { cn } from "@/lib/utils";
import { adjustMinutesToHalfHour } from '@/utils/time-utils';
import { validateOrderFormData } from '@/utils/order-utils';

interface OrderRegisterFormProps {
  onSubmit: () => void;
  editMode?: boolean;
  orderNumber?: string;
}

interface AnimatedNumberProps {
  number: number;
  duration?: number; // 기본 애니메이션 시간
  suffix?: string;   // "km", "원" 등 단위
}

export function AnimatedNumber({ number, duration = 500, suffix = '' }: AnimatedNumberProps) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const from = display;

    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const nextValue = Math.floor(from + (number - from) * progress);
      setDisplay(nextValue);
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }, [number]);

  return <span>{display.toLocaleString()}{suffix}</span>;
}



export function OrderRegisterForm({ onSubmit, editMode = false, orderNumber }: OrderRegisterFormProps) {
  const [activeTab, setActiveTab] = useState<string>("vehicle");
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRemark, setShowRemark] = useState<boolean>(true);
  const [showOptions, setShowOptions] = useState<boolean>(true);
  const [showCargoInfo, setShowCargoInfo] = useState<boolean>(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState<boolean>(false);
  const [registeredOrderId, setRegisteredOrderId] = useState<string>('');
  const [companySearchTerm, setCompanySearchTerm] = useState('');
  const [managerSearchTerm, setManagerSearchTerm] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [selectedManagerId, setSelectedManagerId] = useState<string | null>(null);
  
  // 추가: 자동 설정 관련 상태
  const [isAutoSettingLoading, setIsAutoSettingLoading] = useState(false);
  const [autoSettingError, setAutoSettingError] = useState<string | null>(null);
  const [isCompanyAutoSet, setIsCompanyAutoSet] = useState(false);
  const [isManagerAutoSet, setIsManagerAutoSet] = useState(false);
  const [isManualReset, setIsManualReset] = useState(false); // 수동 초기화 여부 추적
  const [locationResetTrigger, setLocationResetTrigger] = useState(0); // LocationFormVer01 초기화 트리거
  const [managersLoadedForCompany, setManagersLoadedForCompany] = useState<string | null>(null); // 담당자 목록이 로드된 업체 ID
  
  // 추가: 섹션 활성화 상태 관리
  const [isCompanySelected, setIsCompanySelected] = useState(false);
  const [isManagerSelected, setIsManagerSelected] = useState(false);
  
  const { setFilter } = useCompanyStore();
  const companiesQuery = useCompanies();

// 담당자 관리 store 사용
const {
  managers: brokerManagers,
  isLoading: isLoadingManagers,
  setFilter: setManagerFilter,
  loadManagers,  
  currentCompanyId
} = useBrokerCompanyManagerStore();

  // 추가: Auth store에서 사용자 정보 가져오기
  const { user, isLoggedIn } = useAuthStore();

  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  const router = useRouter();
  
  // Zustand 스토어에서 상태와 액션 가져오기
  const registerStore = useOrderRegisterStore();
  const editStore = useOrderEditStore();
  
  // editMode에 따라 적절한 스토어 사용
  const store = editMode ? editStore : registerStore;
  const { 
    registerData,
  } = store;
  
  // 스토어 타입에 맞는 resetForm 함수 참조
  const resetFormAction = editMode 
    ? editStore.resetState 
    : registerStore.resetForm;
  
  // 필요한 액션 함수들 (타입 단언 사용)
  const setVehicleType = editMode 
    ? (value: any) => editStore.setRegisterData({ vehicleType: value }) 
    : registerStore.setVehicleType;
    
  const setWeightType = editMode 
    ? (value: any) => editStore.setRegisterData({ weightType: value }) 
    : registerStore.setWeightType;
    
  const setCargoType = editMode 
    ? (value: string) => editStore.setRegisterData({ cargoType: value }) 
    : registerStore.setCargoType;
    
  const setRemark = editMode 
    ? (value: string) => editStore.setRegisterData({ remark: value }) 
    : registerStore.setRemark;
    
  const setDeparture = editMode 
    ? (value: any) => editStore.setRegisterData({ departure: value }) 
    : registerStore.setDeparture;
    
  const setDestination = editMode 
    ? (value: any) => editStore.setRegisterData({ destination: value }) 
    : registerStore.setDestination;
    
  const toggleOption = editMode 
    ? (optionId: string) => {
        const currentOptions = [...registerData.selectedOptions];
        const index = currentOptions.indexOf(optionId);
        if (index === -1) {
          currentOptions.push(optionId);
        } else {
          currentOptions.splice(index, 1);
        }
        editStore.setRegisterData({ selectedOptions: currentOptions });
      } 
    : registerStore.toggleOption;
    
  const setStoreCompanyId = editMode 
    ? (companyId: string | undefined) => editStore.setRegisterData({ selectedCompanyId: companyId }) 
    : registerStore.setSelectedCompanyId;
    
  const setStoreManagerId = editMode 
    ? (managerId: string | undefined) => editStore.setRegisterData({ selectedManagerId: managerId }) 
    : registerStore.setSelectedManagerId;
  
  // editMode일 때 필드 상태 제어를 위한 추가 state
  const { isFieldEditable, originalData } = editStore;
  
  // 필드 수정 가능 여부 확인 함수
  const isEditable = (fieldName: string): boolean => {
    if (!editMode) return true; // 등록 모드에서는 모든 필드 수정 가능
    return isFieldEditable(fieldName); // 수정 모드에서는 배차 상태에 따라 다름
  };
  
  // 비활성화된 필드 클릭 시 안내 메시지 표시
  const handleDisabledFieldClick = (fieldName: string) => {
         if (editMode && !isEditable(fieldName)) {
       toast("현재 배차 상태에서는 이 항목을 수정할 수 없습니다.");
     }
  };

  // 추가: 자동 설정 핵심 함수
  const handleAutoSetCompanyInfo = async () => {
    // 조건 체크: 로그인 + companyId 존재 + 아직 회사 미선택
    if (!user?.companyId || selectedCompanyId || !isLoggedIn()) return;
    
    setIsAutoSettingLoading(true);
    setAutoSettingError(null);
    
    try {
      console.log('🔄 로그인 정보로 자동 설정 시작:', { 
        userId: user.id, 
        companyId: user.companyId 
      });
      
      // 1. 회사 정보 조회
      const company = await getCompanyById(user.companyId);
      console.log('✅ 회사 정보 조회 성공:', company);
      
      // 2. 폼 필드 자동 설정
      form.setValue("shipperName", company.name);
      form.setValue("businessNumber", company.businessNumber || "");
      form.setValue("shipperCeo", company.ceoName || "");
      
      // 3. 로컬 상태 및 스토어 상태 업데이트
      setSelectedCompanyId(company.id);
      setStoreCompanyId(company.id);
      setIsCompanyAutoSet(true); // 자동 설정 표시
      
      // 4. 담당자 목록 로드
      console.log('🔄 담당자 목록 로드 시작...');
      await loadManagers(company.id);
      
             // 성공 토스트 표시
       toast.success("로그인 정보로 회사가 자동 설정되었습니다.");
      
    } catch (error) {
      console.error("❌ 자동 설정 오류:", error);
      setAutoSettingError("로그인 정보로 자동 설정 중 오류가 발생했습니다.");
             // 에러 토스트 표시
       toast.error("수동으로 회사와 담당자를 선택해주세요.");
    } finally {
      setIsAutoSettingLoading(false);
    }
  };
  
  

  // React Hook Form 초기화 함수
  const initForm = () => {
    if (editMode && originalData) {
      console.log("폼 초기화 - 수정 모드:", registerData);
    } else {
      console.log("폼 초기화 - 등록 모드:", registerData);
    }
    
    // 폼 초기값 설정
    return {
      vehicleType: registerData.vehicleType,
      weightType: registerData.weightType,
      cargoType: registerData.cargoType || '',
      remark: registerData.remark || '',
      departure: registerData.departure,
      destination: registerData.destination,
      selectedOptions: registerData.selectedOptions
    };
  };
  
  // React Hook Form
  const form = useForm({
    defaultValues: {
      ...initForm(),
      // 회사 및 담당자 정보 필드 추가
      selectedCompanyId: '',      
      shipperName: '',
      businessNumber: '',
      shipperCeo: '',
      selectedManagerId: '',
      manager: '',
      managerContact: '',
      managerEmail: '',
    }
  });

  // // 추가: 컴포넌트 마운트 시 자동 설정 실행 - 주선사 모드에서는 사용하지 않음, 하지만 삭제금지!
  // useEffect(() => {
  //   // 조건: 로그인 상태 + 등록 모드 + 회사 미선택 + 사용자에 회사ID 존재 + 수동 초기화 안함
  //   if (
  //     isLoggedIn() && 
  //     !editMode && 
  //     user?.companyId && 
  //     !selectedCompanyId && 
  //     !isAutoSettingLoading &&
  //     !isManualReset // 수동 초기화 하지 않은 경우에만 자동 설정
  //   ) {
  //     console.log('🚀 자동 설정 조건 충족, 실행 시작...');
  //     handleAutoSetCompanyInfo();
  //   }
  // }, [isLoggedIn(), user?.companyId, selectedCompanyId, editMode, isManualReset]);
  
  // 폼 데이터 업데이트 (수정 모드에서 폼 필드가 초기 데이터와 연결되도록 추가)
  useEffect(() => {
    if (editMode && originalData) {
      console.log("폼 데이터 업데이트:", registerData);
      
      // 폼의 값을 업데이트
      form.reset({
        vehicleType: registerData.vehicleType,
        weightType: registerData.weightType,
        cargoType: registerData.cargoType || '',
        remark: registerData.remark || '',
        departure: registerData.departure,
        destination: registerData.destination,
        selectedOptions: registerData.selectedOptions
      });
    }
  }, [editMode, form, originalData, registerData]);
  
  // 폼 제출 처리 함수 업데이트
  const handleFormSubmit = async (data: any) => {
    console.log("🚀 화물 등록 버튼 클릭 - 폼 제출 시작");
    console.log("📋 현재 폼 데이터:", registerData);
    
    // 제출 중 상태 설정
    setIsSubmitting(true);
    
    try {
      // 폼 유효성 검증 (회사/담당자 선택 포함)
      console.log("🔍 유효성 검증 시작...");
      const isValid: boolean = validateOrderFormData(
        registerData, 
        registerData.selectedCompanyId, 
        registerData.selectedManagerId
      );
      
      console.log("✅ 유효성 검증 결과:", isValid);
      
      if (!isValid) {
        console.log("❌ 유효성 검증 실패 - 제출 중단");
        // showValidationError 함수에서 이미 개별 필드별 토스트를 표시하므로 
        // 여기서는 추가 토스트를 표시하지 않음
        return;
      }
      
      console.log("🎉 유효성 검증 통과 - 화물 등록 진행");
      
      // API 호출 대신 명세서 표시를 위한 콜백 호출
      if (onSubmit) {
        onSubmit();
      }
      
         } catch (error) {
       console.error("💥 폼 제출 중 오류 발생:", error);
       toast.error("화물 등록 중 오류가 발생했습니다. 다시 시도해주세요.");
     } finally {
      setIsSubmitting(false);
    }
  };
  
  // 성공 다이얼로그 닫기 함수
  const handleSuccessDialogClose = () => {
    setSuccessDialogOpen(false);
  };
  
  // 거리 및 금액 계산
  useEffect(() => {
    const { departure, destination } = registerData;
    
    console.log('🔍 거리 계산 useEffect 트리거됨:', {
      departure: {
        address: departure.address,
        id: departure.id,
        latitude: departure.latitude,
        longitude: departure.longitude
      },
      destination: {
        address: destination.address,
        id: destination.id,
        latitude: destination.latitude,
        longitude: destination.longitude
      }
    });
    
    // 출발지 또는 도착지 중 하나라도 주소가 없으면 예상 정보 초기화
    if (!departure.address || !destination.address) {
      console.log('❌ 주소 정보 부족으로 거리 계산 건너뜀');
      if (editMode) {
        editStore.setRegisterData({
          estimatedDistance: 0,
          estimatedAmount: 0,
        });
      } else {
        registerStore.setEstimatedInfo(0, 0);
      }
      return; // 거리 계산 로직 실행하지 않음
    }
    // 출발지와 도착지 주소가 모두 입력된 경우에만 계산
    const calculateDistanceAndAmount = async () => {
      console.log('🚀 거리 계산 시작');
      setIsCalculating(true);
      
      try {
        // 실제 거리 계산 (카카오 API 사용)
        let distance = 0;
        // 예상 금액은 "협의"로 설정 (0으로 설정하여 UI에서 "협의" 표시)
        const amount = 0; // 협의 금액으로 설정
        
        // 좌표 정보가 있는 경우 실제 API 호출
        if (departure.latitude && departure.longitude && 
            destination.latitude && destination.longitude) {
          console.log('✅ 좌표 정보 확인됨, API 호출 진행');
          
          const result = await DistanceClientService.calculateDistanceByAddresses({
            pickupAddressId: departure.id,
            deliveryAddressId: destination.id,
            pickupCoordinates: {
              lat: departure.latitude,
              lng: departure.longitude
            },
            deliveryCoordinates: {
              lat: destination.latitude,
              lng: destination.longitude
            },
            priority: 'RECOMMEND'
          });
          
          if (result.success && result.distanceKm) {
            distance = result.distanceKm;
            let duration = result.durationMinutes;
            let method = result.method;
            let cacheId = result.cacheId;
            let metadata = result.metadata;
            // 거리 정보 연동: duration, method, cacheId, metadata 등 저장
            console.log('거리 계산 결과:', result);
            const extra = {
              distanceCalculationMethod: result.method,
              distanceCacheId: result.cacheId,
              distanceMetadata: result.metadata,
              estimatedDurationMinutes: result.durationMinutes,
              distanceKm: result.distanceKm,
              // 필요시 추가 필드 매핑
            };

            console.log('editMode-->', editMode);
            if (editMode) {              
              //수정
              editStore.setRegisterData({
                estimatedDistance: distance,
                estimatedAmount: amount,
                estimatedDurationMinutes: result.durationMinutes,
                distanceCalculationMethod: result.method,
                distanceCalculatedAt: new Date().toISOString(),
                distanceCacheId: result.cacheId,
                distanceMetadata: result.metadata as any,                
              });
            } else {       
              //등록 
              console.log('등록 전 extra-->', extra);
              registerStore.setEstimatedInfo(distance, amount, extra as any);
              console.log('등록 registerData-->', registerStore.registerData);
              
            }
          } else {
            console.log('거리 계산 실패, 직선거리 계산 사용:', result.error);
            // fallback: 직선 거리 계산
            distance = await DistanceClientService.calculateMockDistance(
              departure.latitude,
              departure.longitude,
              destination.latitude,
              destination.longitude
            );
          }
        } else {          
          console.log('❌ 좌표 정보 없음!!!');
          // 계산 결과를 store에 반영
          if (editMode) {
            editStore.setRegisterData({
              estimatedDistance: distance,
              estimatedAmount: amount,
            });
          } else {
            console.log('editMode2-->', editMode);
            registerStore.setEstimatedInfo(distance, amount);
          }
        }
        
        console.log(` 거리: ${distance}km, 예상금액: 협의`);
        console.log('registerStore.registerData-->', registerStore.registerData);
      } catch (error) {
        console.error("거리 계산 중 오류 발생:", error);
        
        // 에러 발생 시 기본값 설정
        const fallbackDistance = 0; // 기본 0km
        const fallbackAmount = 0; // 협의
        
        if (editMode) {
          editStore.setRegisterData({
            estimatedDistance: fallbackDistance,
            estimatedAmount: fallbackAmount,
          });
        } else {          
          registerStore.setEstimatedInfo(fallbackDistance, fallbackAmount);
        }
        
        toast.error("거리 계산 중 문제가 발생했습니다. 기본값으로 설정됩니다.");
      } finally {
        setIsCalculating(false);
      }
    };
    
    // 300ms 디바운스로 연속 호출 방지
    const timeoutId = setTimeout(() => {
      if (departure.address && destination.address) {
        console.log('⏰ 디바운스 후 거리 계산 실행');
        calculateDistanceAndAmount();
      } else {
        console.log('⏰ 디바운스 후 주소 정보 부족으로 계산 건너뜀');
      }
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [
    registerData.departure.address,
    registerData.destination.address,
    registerData.departure.id,
    registerData.destination.id,
    registerData.departure.latitude,
    registerData.departure.longitude,
    registerData.destination.latitude,
    registerData.destination.longitude
  ]);

  // 상차지 시간 설정 시 하차지 시간 자동 설정 (상차지 + 1시간)
  useEffect(() => {
    const { departure, destination } = registerData;
    
    // 조건: 상차지 날짜/시간 모두 설정 && 하차지 날짜/시간 미설정
    if (departure.date && departure.time && 
        (!destination.date || !destination.time)) {
      
      try {
        // 상차지 시간을 Date 객체로 변환
        const departureDateTime = new Date(`${departure.date} ${departure.time}`);
        
        // 유효한 날짜인지 확인
        if (isNaN(departureDateTime.getTime())) {
          console.warn('상차지 날짜/시간 형식이 올바르지 않습니다:', departure.date, departure.time);
          return;
        }
        
        // 1시간 추가 (3600000 밀리초)
        const destinationDateTime = new Date(departureDateTime.getTime() + 60 * 60 * 1000);
        
        // 분을 00분 또는 30분으로 조정
        const adjustedDestinationTime = adjustMinutesToHalfHour(destinationDateTime);
        
        // 날짜와 시간 문자열로 변환
        const destinationDate = format(adjustedDestinationTime, 'yyyy-MM-dd');
        const destinationTime = format(adjustedDestinationTime, 'HH:mm');
        
        // 하차지 정보 업데이트 (기존 정보는 유지하고 날짜/시간만 변경)
        setDestination({
          ...destination,
          date: destinationDate,
          time: destinationTime
        });
        
        console.log(`하차지 시간 자동 설정: ${departure.date} ${departure.time} → ${destinationDate} ${destinationTime}`);
        
      } catch (error) {
        console.error('하차지 시간 자동 설정 중 오류:', error);
      }
    }
  }, [
    registerData.departure.date, 
    registerData.departure.time, 
    registerData.destination.date, 
    registerData.destination.time,
    setDestination
  ]);
  
  // 비고 필드가 비어있지 않으면 자동으로 표시
  useEffect(() => {
    if (registerData.remark && registerData.remark.trim() !== '') {
      setShowRemark(true);
    }
  }, [registerData.remark]);

  // locationResetTrigger가 변경되면 LocationFormVer01 컴포넌트 초기화
  useEffect(() => {
    if (locationResetTrigger > 0) {
      // 트리거를 리셋하여 다음 초기화를 위해 준비
      setTimeout(() => {
        setLocationResetTrigger(0);
      }, 100);
    }
  }, [locationResetTrigger]);

  // 회사 검색 함수
  const handleCompanySearch = () => {
    // TODO: 실제 회사 검색 API 호출
    setFilter({ keyword: companySearchTerm });
    console.log('회사 검색:', companySearchTerm);
  };

  // 회사 선택 시 담당자 목록 로드
  useEffect(() => {
    if (selectedCompanyId) {
      console.log('🔍 선택된 회사 ID로 담당자 목록 로드:', selectedCompanyId);
      loadManagers(selectedCompanyId);
      // 담당자 목록 로드 시작 시 해당 업체 ID 기록
      setManagersLoadedForCompany(selectedCompanyId);
      // 회사 선택 상태 업데이트
      setIsCompanySelected(true);
    } else {
      // 회사 선택 해제 시 모든 섹션 비활성화
      setIsCompanySelected(false);
      setIsManagerSelected(false);
    }
  }, [selectedCompanyId, loadManagers]);

  // 담당자 선택 상태 감지
  useEffect(() => {
    if (selectedManagerId && isCompanySelected) {
      setIsManagerSelected(true);
    } else {
      setIsManagerSelected(false);
    }
  }, [selectedManagerId, isCompanySelected]);



  // registerData 변경 시 섹션 활성화 상태 동기화
  useEffect(() => {
    if (editMode) {
      // 수정 모드에서는 registerData의 상태를 기반으로 섹션 활성화
      setIsCompanySelected(!!registerData.selectedCompanyId);
      setIsManagerSelected(!!registerData.selectedManagerId);
    }
  }, [editMode, registerData.selectedCompanyId, registerData.selectedManagerId]);

  // 담당자 목록 로드 완료 감지 및 자동 선택
  useEffect(() => {
    // 담당자 목록 로드가 완료되었고, 해당 업체의 담당자 목록인 경우에만 자동 선택 실행
    if (
      !isLoadingManagers && 
      managersLoadedForCompany === selectedCompanyId &&
      selectedCompanyId && 
      brokerManagers.length > 0
    ) {
      console.log('🎯 담당자 목록 로드 완료, 자동 선택 로직 실행');
      
      // 이미 담당자가 선택되어 있거나 수정 모드인 경우 스킵
      if (selectedManagerId || editMode) {
        console.log('⏭️ 담당자 이미 선택됨 또는 수정 모드로 자동 선택 스킵');
        return;
      }

      // 현재 로그인한 사용자가 있는지 확인
      if (!user?.email) {
        console.log('⏭️ 로그인한 사용자 정보 없음으로 자동 선택 스킵');
        return;
      }

      // 배차 역할을 가진 활성 담당자 찾기
      const currentUserAsManager = brokerManagers.find(
        m => m.roles.includes('배차') && m.status === '활성'
      );

      console.log('brokerManagers-->', brokerManagers);
      console.log('currentUserAsManager-->', currentUserAsManager);
      
      if (currentUserAsManager) {
        console.log('✅ 현재 사용자를 담당자로 자동 설정:', currentUserAsManager.name);
        setSelectedManagerId(currentUserAsManager.id);
        setStoreManagerId(currentUserAsManager.id);
        setIsManagerAutoSet(true); // 자동 설정 표시
        form.setValue("manager", currentUserAsManager.name);
        form.setValue("managerContact", currentUserAsManager.phoneNumber || "");
        form.setValue("managerEmail", currentUserAsManager.email);
        
        // 담당자 자동 설정 완료 토스트
        toast.success(`${currentUserAsManager.name}님이 담당자로 설정되었습니다.`);
      } else {
        console.log('⚠️ 현재 사용자를 담당자 목록에서 찾을 수 없음');
        console.log('담당자 목록에서 배차 역할을 가진 활성 담당자:', 
          brokerManagers.filter(m => m.roles.includes('배차') && m.status === '활성')
        );
      }
    }
  }, [isLoadingManagers, managersLoadedForCompany, selectedCompanyId, brokerManagers, selectedManagerId, editMode, user?.email]);

  // 담당자 검색 함수
  const handleManagerSearch = () => {
    // TODO: 실제 담당자 검색 API 호출
    if (selectedCompanyId) {
      setManagerFilter({ 
        searchTerm: managerSearchTerm,
        showInactive: false 
      });
    }
    console.log('담당자 검색:', managerSearchTerm);
  };

  // 추가: 담당자 목록 로드 후 배차 담당자 자동 선택 (기존 로직 - 백업용)
  // useEffect(() => {
  //   console.log('🔄 자동 담당자 선택 로직 실행:', {
  //     selectedCompanyId,
  //     selectedManagerId,
  //     brokerManagersLength: brokerManagers.length,
  //     userEmail: user?.email,
  //     editMode,
  //     currentCompanyId,
  //     managersLoadedForCompany,
  //     isLoadingManagers
  //   });

  //   // 조건: 회사 선택됨 + 담당자 미선택 + 담당자 목록 존재 + 현재 로그인한 사용자 존재
  //   // + 로딩이 완료되었는지 확인
  //   if (
  //     selectedCompanyId && 
  //     !selectedManagerId && 
  //     brokerManagers.length > 0 && 
  //     user?.email &&
  //     !editMode &&
  //     !isLoadingManagers // 로딩이 완료되었는지 확인
  //   ) {
  //     console.log('✅ 자동 선택 조건 충족, 배차 담당자 검색 시작');
      
  //     const currentUserAsManager = brokerManagers.find(
  //       m => m.roles.includes('배차') && m.status === '활성'
  //     );

  //     console.log('brokerManagers-->', brokerManagers);
  //     console.log('currentUserAsManager-->', currentUserAsManager);
  //     console.log('currentCompanyId-->', currentCompanyId);
  //     console.log('selectedCompanyId-->', selectedCompanyId);
  //     console.log('managersLoadedForCompany-->', managersLoadedForCompany);
  //     console.log('isLoadingManagers-->', isLoadingManagers);
      
  //     if (currentUserAsManager) {
  //       console.log('✅ 현재 사용자를 담당자로 자동 설정:', currentUserAsManager.name);
  //       setSelectedManagerId(currentUserAsManager.id);
  //       setStoreManagerId(currentUserAsManager.id);
  //       setIsManagerAutoSet(true); // 자동 설정 표시
  //       form.setValue("manager", currentUserAsManager.name);
  //       form.setValue("managerContact", currentUserAsManager.phoneNumber || "");
  //       form.setValue("managerEmail", currentUserAsManager.email);
        
  //       // 담당자 자동 설정 완료 토스트
  //       toast({
  //         title: "담당자 자동 설정 완료",
  //         description: `${currentUserAsManager.name}님이 담당자로 설정되었습니다.`,
  //         variant: "default",
  //       });
  //     } else {
  //       console.log('⚠️ 현재 사용자를 담당자 목록에서 찾을 수 없음');
  //       console.log('담당자 목록에서 배차 역할을 가진 활성 담당자:', 
  //         brokerManagers.filter(m => m.roles.includes('배차') && m.status === '활성')
  //       );
  //     }
  //   } else {
  //     console.log('❌ 자동 선택 조건 미충족:', {
  //       hasSelectedCompany: !!selectedCompanyId,
  //       hasSelectedManager: !!selectedManagerId,
  //       hasManagers: brokerManagers.length > 0,
  //       hasUserEmail: !!user?.email,
  //       isEditMode: editMode,
  //       isLoading: isLoadingManagers
  //     });
  //   }
  // }, [selectedCompanyId, brokerManagers, user?.email, selectedManagerId, editMode, currentCompanyId, managersLoadedForCompany, isLoadingManagers]);

  // 화물 정보 초기화 함수 - useCallback으로 최적화
  const handleCargoReset = useCallback(() => {
    setWeightType('1톤');
    setVehicleType('카고');
    setCargoType('');
    setRemark('');
  }, [setWeightType, setVehicleType, setCargoType, setRemark]);
  
  
  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)}>

          <Card className="border-none shadow-none">
            
            {/* <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex flex-col w-full">
                  <CardTitle>{editMode  ? (
                      <>운송 정보 수정 
                      
                      </> 
                    ) : (
                      <>운송 요청</>
                    )}</CardTitle>
                  <CardDescription>{editMode ? (
                      "요청한 운송 정보를 수정하세요. 배차 상태에 따라 수정 가능한 항목이 제한될 수 있습니다."
                    ) : (
                      "운송 요청할 화물 정보를 입력하고 등록해주세요."
                    )}</CardDescription>
                </div>
                {editMode && originalData && (
                  <div className="w-full pt-0">
                    <OrderStepProgress currentStatus={originalData.statusProgress as any} />
                  </div>
                )}
              </div>
            </CardHeader> */}
              
            <CardContent>
              {/* 새로운 레이아웃: 2개 컬럼으로 분할 */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                
                {/* 첫 번째 컬럼 (1/3): 회사 및 담당자 정보 + 화물 정보 */}
                <div className="lg:col-span-1 space-y-4">
                  
                  {/* 회사 및 담당자 정보 */}
                  <Card>
                    <CardContent>
                      <CompanyManagerInfoSection
                        form={form}
                        companySearchTerm={companySearchTerm}
                        setCompanySearchTerm={setCompanySearchTerm}
                        companies={companiesQuery.data?.data ?? []}
                        onSelectCompany={(company) => {
                          form.setValue("shipperName", company.name);
                          form.setValue("businessNumber", company.businessNumber || "");
                          if (company.ceoName) {
                            form.setValue("shipperCeo", company.ceoName);
                          }
                          // 로컬 상태와 스토어 상태 모두 업데이트
                          setSelectedCompanyId(company.id);
                          setStoreCompanyId(company.id);
                          // 수동 선택 시 자동 설정 상태 리셋
                          setIsCompanyAutoSet(false);
                          setIsManagerAutoSet(false);
                          // 회사 선택 시 담당자 목록 로드
                          if (company.id) {
                            loadManagers(company.id);
                          }
                        }}
                        selectedCompanyId={selectedCompanyId}
                        onCompanySearch={handleCompanySearch}
                        isLoadingCompanies={companiesQuery.isLoading}
                        managerSearchTerm={managerSearchTerm}
                        setManagerSearchTerm={setManagerSearchTerm}
                        managers={brokerManagers.filter(manager => manager.status === '활성')}
                        onSelectManager={(manager) => {
                          setSelectedManagerId(manager.id);
                          setStoreManagerId(manager.id);
                          // 수동 선택 시 자동 설정 상태 리셋
                          setIsManagerAutoSet(false);
                          form.setValue("manager", manager.name);
                          form.setValue("managerContact", manager.phoneNumber || "");
                          form.setValue("managerEmail", manager.email || "");
                        }}
                        selectedManagerId={selectedManagerId}
                        onManagerSearch={handleManagerSearch}
                        isLoadingManagers={isLoadingManagers}
                        onReset={() => {
                          form.reset({
                            ...form.getValues(),
                            shipperName: "",
                            businessNumber: "",
                            shipperCeo: "",
                            manager: "",
                            managerContact: "",
                            managerEmail: "",
                          });
                          setSelectedCompanyId(null);
                          setSelectedManagerId(null);
                          setStoreCompanyId(undefined);
                          setStoreManagerId(undefined);
                          
                          // 자동 설정 상태도 초기화
                          setAutoSettingError(null);
                          setIsCompanyAutoSet(false);
                          setIsManagerAutoSet(false);
                          
                          // 담당자 목록 로드 상태도 초기화
                          setManagersLoadedForCompany(null);
                          
                          // 섹션 활성화 상태 초기화
                          setIsCompanySelected(false);
                          setIsManagerSelected(false);
                          
                          // 수동 초기화 상태 설정 (자동 설정 방지)
                          setIsManualReset(true);
                          
                          // 화물 정보도 초기화
                          setWeightType('1톤');
                          setVehicleType('카고');
                          setCargoType('');
                          setRemark('');
                          
                          // 상차/하차 정보도 초기화
                          setDeparture({
                            id: '',
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
                            createdAt: new Date().toISOString()
                          });
                          setDestination({
                            id: '',
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
                            createdAt: new Date().toISOString()
                          });
                          
                          // LocationFormVer01 컴포넌트 초기화 신호 전달을 위한 상태 추가
                          setLocationResetTrigger(prev => prev + 1);
                        }}
                        isEditMode={editMode}
                        loading={isSubmitting}
                        // 추가: 자동 설정 관련 props
                        isAutoSettingLoading={isAutoSettingLoading}
                        autoSettingError={autoSettingError}
                        isCompanyAutoSet={isCompanyAutoSet}
                        isManagerAutoSet={isManagerAutoSet}
                        // 추가: 담당자 목록 리로드 함수
                        onManagerListReload={() => {
                          if (selectedCompanyId) {
                            loadManagers(selectedCompanyId);
                          }
                        }}
                      />
                    </CardContent>
                  </Card>

                  {/* 화물 정보 */}
                  <div>
                    {/* 비활성화 상태 안내 메시지 - 수정 모드에서는 표시하지 않음 */}
                    {!editMode && !isManagerSelected && (
                      <div className="mb-3 p-3 bg-muted/50 border border-dashed border-muted-foreground/30 rounded-md">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Info className="h-4 w-4" />
                          <span>
                            {!isCompanySelected 
                              ? "화주 회사를 먼저 선택해주세요." 
                              : "담당자를 선택한 후 화물 정보를 입력할 수 있습니다."
                            }
                          </span>
                        </div>
                      </div>
                    )}
                    
                    <RegisterCargoInfoForm
                      companyId={selectedCompanyId || undefined}
                      compact={true}
                      enabled={!editMode && isManagerSelected} // 담당자 선택 후 활성화
                      onCargoSelect={(cargo) => {
                        // 화물 정보 자동 입력
                        setWeightType(cargo.requestedVehicleWeight as any);
                        setVehicleType(cargo.requestedVehicleType as any);
                        setCargoType(cargo.cargoName.slice(0, 38)); // 38자 제한
                        setRemark(cargo.memo || '');
                      }}
                      disabled={editMode || (!editMode && !isManagerSelected)} // 수정 모드가 아니고 담당자 미선택 시에만 비활성화
                      onDisabledClick={() => {
                        if (editMode) {
                          handleDisabledFieldClick('cargoType');
                        } else if (!isCompanySelected) {
                          toast("먼저 화주 회사를 선택해주세요.");
                        } else if (!isManagerSelected) {
                          toast("먼저 담당자를 선택해주세요.");
                        } else {
                          handleDisabledFieldClick('cargoType');
                        }
                      }}
                      // 폼 데이터 연동
                      weightType={registerData.weightType}
                      vehicleType={registerData.vehicleType}
                      cargoType={registerData.cargoType}
                      remark={registerData.remark || ''}
                      onWeightTypeChange={(value) => setWeightType(value as any)}
                      onVehicleTypeChange={(value) => setVehicleType(value as any)}
                      onCargoTypeChange={(value) => setCargoType(value)}
                      onRemarkChange={(value) => setRemark(value)}
                      // 초기화 함수 전달
                      onReset={handleCargoReset}
                    />
                  </div>
                </div>

                {/* 두 번째 컬럼 (2/3): 상차/하차 정보 + 운송 옵션/예상 정보 */}
                <div className="lg:col-span-2 space-y-4">
                  
                  {/* 첫 번째 행: 상차 정보 + 하차 정보 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* 상차 정보 */}
                    <Card className={cn("h-full", !editMode && !isManagerSelected && "opacity-60")}>
                      <CardContent className="h-full">
                        {/* 비활성화 상태 안내 메시지 - 수정 모드에서는 표시하지 않음 */}
                        {!editMode && !isManagerSelected && (
                          <div className="mb-3 p-2 bg-muted/50 border border-dashed border-muted-foreground/30 rounded-md">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Info className="h-3 w-3" />
                              <span>
                                {!isCompanySelected 
                                  ? "회사 선택 필요" 
                                  : "담당자 선택 필요"
                                }
                              </span>
                            </div>
                          </div>
                        )}
                        
                        <LocationFormVer01
                          type="departure"
                          locationInfo={registerData.departure}
                          onChange={(info) => setDeparture(info as any)}
                          compact={true}
                          disabled={editMode && !isEditable('departure') || (!editMode && !isManagerSelected)} // 수정 모드가 아니고 담당자 미선택 시에만 비활성화
                          onDisabledClick={() => {
                            if (editMode) {
                              handleDisabledFieldClick('departure');
                            } else if (!isCompanySelected) {
                              toast("먼저 화주 회사를 선택해주세요.");
                            } else if (!isManagerSelected) {
                              toast("먼저 담당자를 선택해주세요.");
                            } else {
                              handleDisabledFieldClick('departure');
                            }
                          }}
                          companyId={selectedCompanyId || ''}
                          onReset={locationResetTrigger > 0 ? () => {} : undefined}
                        />
                      </CardContent>
                    </Card>

                    {/* 하차 정보 */}
                    <Card className={cn("h-full", !editMode && !isManagerSelected && "opacity-60")}>
                      <CardContent className="h-full">
                        {/* 비활성화 상태 안내 메시지 - 수정 모드에서는 표시하지 않음 */}
                        {!editMode && !isManagerSelected && (
                          <div className="mb-3 p-2 bg-muted/50 border border-dashed border-muted-foreground/30 rounded-md">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Info className="h-3 w-3" />
                              <span>
                                {!isCompanySelected 
                                  ? "회사 선택 필요" 
                                  : "담당자 선택 필요"
                                }
                              </span>
                            </div>
                          </div>
                        )}
                        
                        <LocationFormVer01
                          type="destination"
                          locationInfo={registerData.destination}
                          onChange={(info) => setDestination(info as any)}
                          compact={true}
                          disabled={editMode && !isEditable('destination') || (!editMode && !isManagerSelected)} // 수정 모드가 아니고 담당자 미선택 시에만 비활성화
                          onDisabledClick={() => {
                            if (editMode) {
                              handleDisabledFieldClick('destination');
                            } else if (!isCompanySelected) {
                              toast("먼저 화주 회사를 선택해주세요.");
                            } else if (!isManagerSelected) {
                              toast("먼저 담당자를 선택해주세요.");
                            } else {
                              handleDisabledFieldClick('destination');
                            }
                          }}
                          companyId={selectedCompanyId || ''}
                          onReset={locationResetTrigger > 0 ? () => {} : undefined}
                        />
                      </CardContent>
                    </Card>
                  </div>

                  {/* 두 번째 행: 운송 옵션 + 예상 정보 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {/* 운송 옵션 */}
                    <div>                   
                      <Card className={cn("", !editMode && !isManagerSelected && "opacity-60")}>
                        <CardHeader className="flex flex-row items-center justify-between">
                          <CardTitle className="text-md flex items-center">
                            <OptionsIcon className="h-5 w-5 mr-2" />
                            <span className="">운송 옵션</span>
                          </CardTitle>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowOptions((prev) => !prev)}
                            disabled={!editMode && !isManagerSelected}
                          >
                            {showOptions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                        </CardHeader>
                        {showOptions && (
                          <CardContent>
                            {/* 비활성화 상태 안내 메시지 - 수정 모드에서는 표시하지 않음 */}
                            {!editMode && !isManagerSelected && (
                              <div className="mb-3 p-2 bg-muted/50 border border-dashed border-muted-foreground/30 rounded-md">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Info className="h-3 w-3" />
                                  <span>
                                    {!isCompanySelected 
                                      ? "회사 선택 필요" 
                                      : "담당자 선택 필요"
                                    }
                                  </span>
                                </div>
                              </div>
                            )}
                            
                            <RegisterTransportOptionCard
                              selectedOptions={registerData.selectedOptions}
                              onToggle={toggleOption}
                              disabled={editMode && !isEditable('selectedOptions') || (!editMode && !isManagerSelected)} // 수정 모드가 아니고 담당자 미선택 시에만 비활성화
                            />
                          </CardContent>
                        )}
                      </Card>
                    </div>

                    {/* 예상 정보 */}
                    <div className="space-y-4">                      
                      <Card className={cn("", !editMode && !isManagerSelected && "opacity-60")}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center">
                            <CalculatorIcon className="h-5 w-5 mr-2" />
                            <span className="">{editMode ? '정산 정보' : '예상 정보'}</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {/* 비활성화 상태 안내 메시지 - 수정 모드에서는 표시하지 않음 */}
                          {!editMode && !isManagerSelected && (
                            <div className="mb-3 p-2 bg-muted/50 border border-dashed border-muted-foreground/30 rounded-md">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Info className="h-3 w-3" />
                                <span>
                                  {!isCompanySelected 
                                    ? "회사 선택 필요" 
                                    : "담당자 선택 필요"
                                  }
                                </span>
                              </div>
                            </div>
                          )}
                          
                          <RegisterEstimateInfoCard
                            estimatedDistance={registerData.estimatedDistance}
                            estimatedAmount={registerData.estimatedAmount}
                            isCalculating={isCalculating}
                          />
                          
                        </CardContent>
                        
                        
                      </Card>
                      
                      {/* 등록 버튼 - 수정 모드에서는 표시하지 않음 */}
                      {!editMode && (
                        <Button 
                          type="submit" 
                          size="lg" 
                          className="w-full"
                          disabled={isSubmitting || !isManagerSelected} // 담당자 미선택 시 비활성화
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              처리 중...
                            </>
                          ) : !isCompanySelected ? (
                            '화주 회사 선택 필요'
                          ) : !isManagerSelected ? (
                            '담당자 선택 필요'
                          ) : (
                            '화물 등록'
                          )}
                        </Button>
                      )}
                    </div>

                  </div>
                  
                </div>
              </div>
            </CardContent>
          </Card>

        </form>
      </Form>
      
      {/* 성공 다이얼로그 */}
      <RegisterSuccessDialog
        isOpen={successDialogOpen}
        orderId={registeredOrderId}
        onClose={handleSuccessDialogClose}
      />
    </>
  );
} 