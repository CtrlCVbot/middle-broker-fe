"use client";

import React, { useEffect, useState } from "react";
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
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusFlow } from "@/components/order/status-badge";
import { useForm } from "react-hook-form";
import { useOrderRegisterStore } from "@/store/order-register-store";
import { useOrderEditStore } from "@/store/order-edit-store";
import { 
  OrderVehicleType, 
  OrderVehicleWeight, 
  ITransportOptionsSnapshot,
  ORDER_VEHICLE_TYPES,
  ORDER_VEHICLE_WEIGHTS
} from "@/types/order-ver01";

import { 
  calculateAmount, 
  calculateDistance, 
  //searchAddress 
} from "@/utils/mockdata/mock-register";
import { LocationForm } from "@/components/order/register-location-form";
import { LocationFormVer01 } from "@/components/order/register-location-form-ver01";

import { TruckIcon, MapPinIcon, Settings2 as OptionsIcon, Calculator as CalculatorIcon, ChevronDown, ChevronUp, PencilIcon, Info, Weight, Truck, Container, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from 'next/navigation';

import { validateOrderFormData } from '@/utils/order-utils';
import { RegisterSuccessDialog } from '@/components/order/register-success-dialog';

import { OrderStepProgress } from "@/components/order/order-step-progress";
import { CompanySearchSection } from '@/components/broker/order/company-search-section';
import { CompanyInfoSection as BrokerCompanyInfoSection } from '@/components/broker/order/company-info-section';
import { ManagerInfoSection as BrokerManagerInfoSection } from '@/components/broker/order/manager-info-section';
import { CompanyInfoSection } from '@/components/broker/order/register-company-info-section';
import { ManagerInfoSection } from '@/components/broker/order/register-manager-info-section';
import { CompanyManagerInfoSection } from '@/components/broker/order/register-company-manager-info-section';
import { RegisterCargoInfoCard } from '@/components/broker/order/register-cargo-info-card';
import { RegisterTransportOptionCard } from '@/components/broker/order/register-transport-option-card';
import { RegisterEstimateInfoCard } from '@/components/broker/order/register-estimate-info-card';

import { useCompanies, useCompanyStore } from "@/store/company-store";
import { useBrokerCompanyManagerStore } from "@/store/broker-company-manager-store";

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

// TRANSPORT_OPTIONS 상수 정의 (기존 코드 호환성을 위해)
const TRANSPORT_OPTIONS = [
  { id: 'early_delivery', label: '빠른배차' },
  { id: 'forklift_load', label: '지게차 상차' },
  { id: 'forklift_unload', label: '지게차 하차' },
  { id: 'exclusive_load', label: '단독배차' },
  { id: 'mixed_load', label: '혼적 가능' },
  { id: 'pay_on_delivery', label: '착불' },
  { id: 'duplicate_load', label: '중복화물 가능' },
  { id: 'special_load', label: '특수화물 필요' }
];

export function OrderRegisterForm({ onSubmit, editMode = false, orderNumber }: OrderRegisterFormProps) {
  const [activeTab, setActiveTab] = useState<string>("vehicle");
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRemark, setShowRemark] = useState<boolean>(false);
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const [showCargoInfo, setShowCargoInfo] = useState<boolean>(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState<boolean>(false);
  const [registeredOrderId, setRegisteredOrderId] = useState<string>('');
  const [companySearchTerm, setCompanySearchTerm] = useState('');
  const [managerSearchTerm, setManagerSearchTerm] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [selectedManagerId, setSelectedManagerId] = useState<string | null>(null);
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
      toast({
        title: "수정 불가",
        description: "현재 배차 상태에서는 이 항목을 수정할 수 없습니다.",
        variant: "default",
      });
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
      shipperName: '',
      businessNumber: '',
      shipperCeo: '',
      manager: '',
      managerContact: '',
      managerEmail: '',
    }
  });
  
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
    // 폼 유효성 검증
    const isValid = validateOrderFormData(registerData);
    console.log("폼 유효성 검증:", isValid);
    console.log("폼 데이터:", registerData);
    if (!isValid) {
      return;
    }
    
    // API 호출 대신 명세서 표시를 위한 콜백 호출
    if (onSubmit) {
      onSubmit();
    }
  };
  
  // 성공 다이얼로그 닫기 함수
  const handleSuccessDialogClose = () => {
    setSuccessDialogOpen(false);
  };
  
  // 거리 및 금액 계산
  useEffect(() => {
    const { departure, destination, weightType, selectedOptions } = registerData;
    
    // 출발지와 도착지 주소가 모두 입력된 경우에만 계산
    if (departure.address && destination.address) {
      const calculateDistanceAndAmount = async () => {
        setIsCalculating(true);
        
        try {
          // 거리 계산
          const distance = await calculateDistance(departure.address, destination.address);
          
          // 금액 계산
          const amount = await calculateAmount(distance, weightType, selectedOptions);

          // 계산 결과를 store에 반영
          if (editMode) {
            editStore.setRegisterData({
              estimatedDistance: distance,
              estimatedAmount: amount,
            });
          } else {
            registerStore.setEstimatedInfo(distance, amount);
          }
        } catch (error) {
          console.error("계산 중 오류 발생:", error);
        } finally {
          setIsCalculating(false);
        }
      };
      
      // 계산 실행
      calculateDistanceAndAmount();
    }
  }, [
    registerData.departure.address, 
    registerData.destination.address,
    registerData.weightType,
    registerData.selectedOptions
  ]);
  
  // 비고 필드가 비어있지 않으면 자동으로 표시
  useEffect(() => {
    if (registerData.remark && registerData.remark.trim() !== '') {
      setShowRemark(true);
    }
  }, [registerData.remark]);


  //---
  

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
    }
  }, [selectedCompanyId, loadManagers]);

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
  
  // 모바일 환경에서는 단일 컬럼 레이아웃으로 변경
  if (isMobile) {
    return (
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="vehicle">차량정보</TabsTrigger>
            <TabsTrigger value="departure">출발지</TabsTrigger>
            <TabsTrigger value="destination">도착지</TabsTrigger>
          </TabsList>
          
          <TabsContent value="vehicle" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <TruckIcon className="h-5 w-5 mr-2" />
                  차량 및 화물 정보
                </CardTitle>
                {editMode && originalData && (
                  <div className="pt-2">
                    <div className="text-sm font-medium text-muted-foreground mb-2">배차 진행 상태</div>
                    <StatusFlow currentStatus={originalData.status as any} />
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form className="space-y-4">
                    <div className="grid grid-cols-12 gap-4">
                      
                      {/* 차량 종류 */}
                      <div className="col-span-12 md:col-span-1">
                        <FormLabel>차량 종류</FormLabel>
                        <Select
                          value={registerData.vehicleType}
                          onValueChange={(value) => setVehicleType(value as any)}
                          disabled={editMode && !isEditable('vehicleType')}
                        >
                          <SelectTrigger 
                            onClick={() => handleDisabledFieldClick('vehicleType')}
                            className={editMode && !isEditable('vehicleType') ? 'bg-gray-100' : ''}
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
                      
                      {/* 차량 중량 */}
                      <div className="col-span-12 md:col-span-1">
                        <FormLabel>중량</FormLabel>
                        <Select
                          value={registerData.weightType}
                          onValueChange={(value) => setWeightType(value as any)}
                          disabled={editMode && !isEditable('weightType')}
                        >
                          <SelectTrigger 
                            onClick={() => handleDisabledFieldClick('weightType')}
                            className={editMode && !isEditable('weightType') ? 'bg-gray-100' : ''}
                          >
                            <SelectValue placeholder="중량 선택" />
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

                      {/* 화물 품목 */}
                      <div className="col-span-12 md:col-span-10 flex items-end gap-2">
                        <div className="flex-1">
                          <FormLabel>화물 품목</FormLabel>
                          <Input
                            placeholder="화물 품목을 입력하세요 (최대 38자)"
                            maxLength={38}
                            value={registerData.cargoType}
                            onChange={(e) => setCargoType(e.target.value)}
                            disabled={editMode && !isEditable('cargoType')}
                            className={editMode && !isEditable('cargoType') ? 'bg-gray-100' : ''}
                            onClick={() => handleDisabledFieldClick('cargoType')}
                          />
                          <p className="text-xs text-right text-muted-foreground mt-1">
                            {registerData.cargoType.length}/38자
                          </p>
                        </div>
                        
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                type="button" 
                                variant="outline" 
                                size="icon" 
                                className="mb-5"
                                onClick={() => setShowRemark(!showRemark)}
                                disabled={editMode && !isEditable('remark')}
                              >
                                {showRemark ? <ChevronUp className="h-4 w-4" /> : <PencilIcon className="h-4 w-4" />}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>비고 입력란 {showRemark ? '숨기기' : '표시하기'}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>

                    </div>
                    
                    
                    
                    {/* 비고 - 조건부 렌더링 */}
                    {(showRemark || (editMode && registerData.remark)) && (
                      <div className="animate-in fade-in-50 duration-200">
                        <div className="flex items-center justify-between">
                          <FormLabel>비고</FormLabel>
                          {editMode && isEditable('remark') && (
                            <div className="flex items-center text-xs text-green-600">
                              <Info className="h-3 w-3 mr-1" />
                              편집 가능
                            </div>
                          )}
                        </div>
                        <Textarea
                          placeholder="비고 (선택사항)"
                          value={registerData.remark || ''}
                          onChange={(e) => setRemark(e.target.value)}
                          className={cn("resize-none h-20", editMode && !isEditable('remark') ? 'bg-gray-100' : '')}
                          disabled={editMode && !isEditable('remark')}
                          onClick={() => handleDisabledFieldClick('remark')}
                        />
                      </div>
                    )}
                    
                    <Button
                      type="button"
                      onClick={() => setActiveTab("departure")}
                      className="w-full mt-4"
                    >
                      다음: 출발지 정보
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="departure" className="pt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <MapPinIcon className="h-5 w-5 mr-2 text-blue-500" />
                  출발지 정보
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* 업체 검색/선택 */}
                  <CompanySearchSection
                    selectedCompany={registerData.departure.company ? { name: registerData.departure.company } : undefined}
                    onSelectCompany={company => setDeparture({ ...registerData.departure, company: company.name })}
                  />
                  {/* 회사 정보 입력 */}
                  <BrokerCompanyInfoSection
                    companyInfo={{
                      name: registerData.departure.company || '',
                      address: registerData.departure.address || '',
                      contact: registerData.departure.contact || ''
                    }}
                    onChange={info => setDeparture({ ...registerData.departure, ...info })}
                  />
                  {/* 담당자 정보 입력 */}
                  <BrokerManagerInfoSection
                    managerInfo={{
                      name: registerData.departure.name || '',
                      contact: registerData.departure.contact || ''
                    }}
                    onChange={info => setDeparture({ ...registerData.departure, ...info })}
                  />
                  {/* 기존 LocationForm 등 나머지 출발지 입력 UI */}
                  <LocationForm
                    type="departure"
                    locationInfo={registerData.departure}
                    onChange={(info) => setDeparture(info as any)}
                    title="출발지 정보"
                    disabled={editMode && !isEditable('departure')}
                    onDisabledClick={() => handleDisabledFieldClick('departure')}
                  />
                  
                  <div className="flex justify-between mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("vehicle")}
                    >
                      이전
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setActiveTab("destination")}
                    >
                      다음: 도착지 정보
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="destination">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <MapPinIcon className="h-5 w-5 mr-2 text-red-500" />
                  도착지 정보
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <LocationForm
                    type="destination"
                    locationInfo={registerData.destination}
                    onChange={(info) => setDestination(info as any)}
                    title="도착지 정보"
                    disabled={editMode && !isEditable('destination')}
                    onDisabledClick={() => handleDisabledFieldClick('destination')}
                  />
                  
                  <div className="flex justify-between mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("departure")}
                    >
                      이전
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        const isValid = validateOrderFormData(registerData);
                        if (isValid) {
                          onSubmit();
                        }
                      }}
                    >
                      화물 등록
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="departureCopy" className="pt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <MapPinIcon className="h-5 w-5 mr-2 text-bule-500" />
                  출발지 정보 복사
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LocationFormVer01
                  type="departure"
                  locationInfo={registerData.departure}
                  onChange={(info) => setDeparture(info as any)}
                  compact={true}
                  disabled={editMode && !isEditable('departure')}
                  onDisabledClick={() => handleDisabledFieldClick('departure')}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="destinationCopy">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <MapPinIcon className="h-5 w-5 mr-2 text-red-500" />
                  도착지 정보
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <LocationForm
                    type="destination"
                    locationInfo={registerData.destination}
                    onChange={(info) => setDestination(info as any)}
                    title="도착지 정보"
                    disabled={editMode && !isEditable('destination')}
                    onDisabledClick={() => handleDisabledFieldClick('destination')}
                  />
                  
                  <div className="flex justify-between mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("departure")}
                    >
                      이전
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        const isValid = validateOrderFormData(registerData);
                        if (isValid) {
                          onSubmit();
                        }
                      }}
                    >
                      화물 등록
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* 모바일에서도 예상 정보 카드 표시 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <CalculatorIcon className="h-5 w-5 mr-2" />
              예상 정보
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RegisterEstimateInfoCard
              estimatedDistance={registerData.estimatedDistance}
              estimatedAmount={registerData.estimatedAmount}
              isCalculating={isCalculating}
            />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // 데스크톱 환경에서는 2단 컬럼 레이아웃으로 표시
  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)}>

          <Card className="border-none shadow-none">
            {/* <CardHeader>    
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>
                    {editMode  ? (
                      <>운송 정보 수정 - #{orderNumber?.slice(0, 8)}  </> 
                    ) : (
                      <>운송 요청</>
                    )}
                  </CardTitle>                  
                  <CardDescription className="text-sm text-muted-foreground">{editMode ? (
                      "요청한 운송 정보를 수정하세요. 배차 상태에 따라 수정 가능한 항목이 제한될 수 있습니다."
                    ) : (
                      "운송 요청할 화물 정보를 입력하고 등록해주세요."
                    )}
                      
                  </CardDescription>
                </div>
              </div>
                
            </CardHeader> */}

            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex flex-col w-full">
                  <CardTitle>{editMode  ? (
                      <>운송 정보 수정 
                      {/* - #{orderNumber?.slice(0, 8)}  */}
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
            </CardHeader>
              
            <CardContent>
              {/* 회사, 담당자 정보 */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4 items-stretch">
                  {/* 회사 및 담당자 통합 정보 */}
                  <div className="lg:col-span-1">
                    <Card className="h-full">
                      <CardContent className="h-full">
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
                            setSelectedCompanyId(company.id);
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
                          }}
                          isEditMode={editMode}
                          loading={isSubmitting}
                        />
                      </CardContent>
                    </Card>
                  </div>

                  {/* 오른쪽: 화물 정보 카드 */}
                  <div className="lg:col-span-2">
                    <Card className="h-full">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg flex items-center">
                          <Container className="h-5 w-5 mr-2" />
                          <div className="flex items-center">
                            화물 정보 <span className="text-destructive">*</span>
                          </div>
                        </CardTitle>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowCargoInfo((prev) => !prev)}
                        > 
                          {showCargoInfo ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>

                      </CardHeader>
                    
                      <CardContent className="flex-1">
                        <div className="space-y-4">
                          {/* 중량 / 차량 종류 */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            <div>
                              <div className="text-sm font-medium mb-2 flex items-center">
                                <Weight className="h-4 w-4 mr-2 text-muted-foreground" />중량
                              </div>
                              <Select
                                value={registerData.weightType}
                                onValueChange={(value) => setWeightType(value as any)}
                                disabled={editMode && !isEditable('weightType')}
                              >
                                <SelectTrigger 
                                  onClick={() => handleDisabledFieldClick('weightType')}
                                  className={editMode && !isEditable('weightType') ? 'bg-gray-100' : ''}
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
                                value={registerData.vehicleType}
                                onValueChange={(value) => setVehicleType(value as any)}
                                disabled={editMode && !isEditable('vehicleType')}
                              >
                                <SelectTrigger 
                                  onClick={() => handleDisabledFieldClick('vehicleType')}
                                  className={editMode && !isEditable('vehicleType') ? 'bg-gray-100' : ''}
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
                                  value={registerData.cargoType}
                                  onChange={(e) => setCargoType(e.target.value)}
                                  disabled={editMode && !isEditable('cargoType')}
                                  className={editMode && !isEditable('cargoType') ? 'bg-gray-100' : ''}
                                  onClick={() => handleDisabledFieldClick('cargoType')}
                                />
                                <p className="text-xs text-right text-muted-foreground mt-1">
                                  {registerData.cargoType.length}/38자
                                </p>
                              </div>
                          </div>

                          {/* 비고 - 조건부 렌더링 */}
                          {showCargoInfo && (
                            <div className="animate-in fade-in-50 duration-200">
                              <div className="flex items-center justify-between">
                                <FormLabel>비고</FormLabel>
                                {editMode && isEditable('remark') && (
                                  <div className="flex items-center text-xs text-green-600">
                                    <Info className="h-3 w-3 mr-1" />
                                    편집 가능
                                  </div>
                                )}
                              </div>
                              <Textarea
                                placeholder="비고 (선택사항)"
                                value={registerData.remark || ''}
                                onChange={(e) => setRemark(e.target.value)}
                                className={cn("resize-none h-20", editMode && !isEditable('remark') ? 'bg-gray-100' : '')}
                                disabled={editMode && !isEditable('remark')}
                                onClick={() => handleDisabledFieldClick('remark')}
                              />
                            </div>
                          )}
                        </div>
                        
                      </CardContent>                      
                    </Card>
                  </div>
              </div>

              {/* 출발지, 도착지 정보/화물 정보 */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* 중간: 출발지/도착지 정보 카드 */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">              

                  {/* 상차지 정보*/}
                  <Card>                
                    <CardContent>
                      <LocationFormVer01
                        type="departure"
                        locationInfo={registerData.departure}
                        onChange={(info) => setDeparture(info as any)}
                        compact={true}
                        disabled={editMode && !isEditable('departure')}
                        onDisabledClick={() => handleDisabledFieldClick('departure')}
                      />
                    </CardContent>
                  </Card>

                  {/* 하차지 정보 Copy*/}
                  <Card>                
                    <CardContent>
                      <LocationFormVer01
                        type="destination"
                        locationInfo={registerData.destination}
                        onChange={(info) => setDestination(info as any)}
                        compact={true}
                        disabled={editMode && !isEditable('destination')}
                        onDisabledClick={() => handleDisabledFieldClick('destination')}                  
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* 오른쪽: 화물 정보 카드 */}
                <div className="lg:col-span-1 space-y-4">                  

                  {/* 운송 옵션 카드 */}
                  <Card>
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
                      >
                        {showOptions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </CardHeader>
                    {showOptions && (
                      <CardContent>
                        <RegisterTransportOptionCard
                          selectedOptions={registerData.selectedOptions}
                          onToggle={toggleOption}
                          disabled={editMode && !isEditable('selectedOptions')}
                        />
                      </CardContent>
                    )}
                  </Card>

                  {/* 예상 정보 카드 */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center">
                        <CalculatorIcon className="h-5 w-5 mr-2" />
                        <span className="">{editMode ? '정산 정보' : '예상 정보'}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
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
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          처리 중...
                        </>
                      ) : (
                        '화물 등록'
                      )}
                    </Button>
                  )}
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