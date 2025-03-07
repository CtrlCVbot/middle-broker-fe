"use client";

import React, { useEffect, useState } from "react";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useForm } from "react-hook-form";
import { useOrderRegisterStore } from "@/store/order-register-store";
import { useQuery } from "@tanstack/react-query";
import { 
  VEHICLE_TYPES, 
  WEIGHT_TYPES, 
  TRANSPORT_OPTIONS, 
  ILocationInfo 
} from "@/types/order";
import { 
  calculateAmount, 
  calculateDistance, 
  searchAddress 
} from "@/utils/mockdata/mock-register";
import { LocationForm } from "./register-location-form";
import { OptionSelector } from "./register-option-selector";
import { CalendarIcon, InfoIcon, TruckIcon, MapPinIcon, Settings2 as OptionsIcon, Calculator as CalculatorIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface OrderRegisterFormProps {
  onSubmit: () => void;
}

export function OrderRegisterForm({ onSubmit }: OrderRegisterFormProps) {
  const [activeTab, setActiveTab] = useState<string>("vehicle");
  const [isCalculating, setIsCalculating] = useState(false);
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  
  // Zustand 스토어에서 상태와 액션 가져오기
  const { 
    registerData,
    setVehicleType,
    setWeightType,
    setCargoType,
    setSpecialRequirements,
    setRemark,
    setDeparture,
    setDestination,
    toggleOption,
    setEstimatedDistance,
    setEstimatedAmount,
  } = useOrderRegisterStore();
  
  // React Hook Form
  const form = useForm({
    defaultValues: {
      vehicleType: registerData.vehicleType,
      weightType: registerData.weightType,
      cargoType: registerData.cargoType || '',
      specialRequirements: registerData.specialRequirements || '',
      remark: registerData.remark || '',
      departure: registerData.departure,
      destination: registerData.destination,
      selectedOptions: registerData.selectedOptions
    }
  });
  
  // 폼 제출 처리
  const handleFormSubmit = (data: any) => {
    // 필수 필드 검증
    const isValid = validateForm();
    if (!isValid) return;
    
    // 최종 확인 모달 열기
    onSubmit();
  };
  
  // 폼 유효성 검증
  const validateForm = () => {
    const { departure, destination, cargoType } = registerData;
    
    let isValid = true;
    
    // 출발지 검증
    if (!departure.address || !departure.company || !departure.name || !departure.contact || !departure.date || !departure.time) {
      setActiveTab("departure");
      isValid = false;
    }
    
    // 도착지 검증
    if (isValid && (!destination.address || !destination.company || !destination.name || !destination.contact || !destination.date || !destination.time)) {
      setActiveTab("destination");
      isValid = false;
    }
    
    // 화물 종류 검증
    if (isValid && !cargoType) {
      setActiveTab("vehicle");
      isValid = false;
    }
    
    return isValid;
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
          setEstimatedDistance(distance);
          
          // 금액 계산
          const amount = await calculateAmount(distance, weightType, selectedOptions);
          setEstimatedAmount(amount);
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
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {/* 차량 종류 */}
                      <div>
                        <FormLabel>차량 종류</FormLabel>
                        <Select
                          value={registerData.vehicleType}
                          onValueChange={(value) => setVehicleType(value as any)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="차량 종류 선택" />
                          </SelectTrigger>
                          <SelectContent>
                            {VEHICLE_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* 차량 중량 */}
                      <div>
                        <FormLabel>중량</FormLabel>
                        <Select
                          value={registerData.weightType}
                          onValueChange={(value) => setWeightType(value as any)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="중량 선택" />
                          </SelectTrigger>
                          <SelectContent>
                            {WEIGHT_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    {/* 화물 품목 */}
                    <div>
                      <FormLabel>화물 품목</FormLabel>
                      <Input
                        placeholder="화물 품목을 입력하세요 (최대 38자)"
                        maxLength={38}
                        value={registerData.cargoType}
                        onChange={(e) => setCargoType(e.target.value)}
                      />
                    </div>
                    
                    {/* 추가 요청사항 */}
                    <div>
                      <FormLabel>추가 요청사항</FormLabel>
                      <Textarea
                        placeholder="추가 요청사항 (선택사항)"
                        value={registerData.specialRequirements || ''}
                        onChange={(e) => setSpecialRequirements(e.target.value)}
                        className="resize-none h-20"
                      />
                    </div>
                    
                    {/* 비고 */}
                    <div>
                      <FormLabel>비고</FormLabel>
                      <Textarea
                        placeholder="비고 (선택사항)"
                        value={registerData.remark || ''}
                        onChange={(e) => setRemark(e.target.value)}
                        className="resize-none h-20"
                      />
                    </div>
                    
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
          
          <TabsContent value="departure">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <MapPinIcon className="h-5 w-5 mr-2 text-blue-500" />
                  출발지 정보
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <LocationForm
                    type="departure"
                    locationInfo={registerData.departure}
                    onChange={setDeparture}
                    title="출발지 정보"
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
                    onChange={setDestination}
                    title="도착지 정보"
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
                      onClick={handleFormSubmit}
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
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>예상 거리</span>
                <span className="font-medium">
                  {isCalculating ? (
                    <span className="animate-pulse">계산 중...</span>
                  ) : (
                    <span>{typeof registerData.estimatedDistance === 'number' ? registerData.estimatedDistance.toLocaleString() : '0'}km</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>예상 금액</span>
                <span className="font-bold text-primary">
                  {isCalculating ? (
                    <span className="animate-pulse">계산 중...</span>
                  ) : (
                    <span>{typeof registerData.estimatedAmount === 'number' ? registerData.estimatedAmount.toLocaleString() : '0'}원</span>
                  )}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // 데스크톱 환경에서는 2단 컬럼 레이아웃으로 표시
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* 왼쪽 컬럼: 차량 정보 및 출발지/도착지 */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* 왼쪽 패널: 차량 및 화물 정보 */}
          <div className="md:col-span-1 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <TruckIcon className="h-5 w-5 mr-2" />
                  차량 및 화물 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 차량 종류 */}
                <div>
                  <FormLabel>차량 종류</FormLabel>
                  <Select
                    value={registerData.vehicleType}
                    onValueChange={(value) => setVehicleType(value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="차량 종류 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {VEHICLE_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* 차량 중량 */}
                <div>
                  <FormLabel>중량</FormLabel>
                  <Select
                    value={registerData.weightType}
                    onValueChange={(value) => setWeightType(value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="중량 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {WEIGHT_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* 화물 품목 */}
                <div>
                  <FormLabel>화물 품목</FormLabel>
                  <Input
                    placeholder="화물 품목을 입력하세요 (최대 38자)"
                    maxLength={38}
                    value={registerData.cargoType}
                    onChange={(e) => setCargoType(e.target.value)}
                  />
                </div>
                
                {/* 추가 요청사항 */}
                <div>
                  <FormLabel>추가 요청사항</FormLabel>
                  <Textarea
                    placeholder="추가 요청사항 (선택사항)"
                    value={registerData.specialRequirements || ''}
                    onChange={(e) => setSpecialRequirements(e.target.value)}
                    className="resize-none h-20"
                  />
                </div>
                
                {/* 비고 */}
                <div>
                  <FormLabel>비고</FormLabel>
                  <Textarea
                    placeholder="비고 (선택사항)"
                    value={registerData.remark || ''}
                    onChange={(e) => setRemark(e.target.value)}
                    className="resize-none h-20"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* 중앙 패널: 출발지/도착지 정보 */}
          <div className="md:col-span-2 space-y-6">
            {/* 출발지 정보 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <MapPinIcon className="h-5 w-5 mr-2 text-blue-500" />
                  출발지 정보
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LocationForm
                  type="departure"
                  locationInfo={registerData.departure}
                  onChange={setDeparture}
                  compact={true}
                />
              </CardContent>
            </Card>
            
            {/* 도착지 정보 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <MapPinIcon className="h-5 w-5 mr-2 text-red-500" />
                  도착지 정보
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LocationForm
                  type="destination"
                  locationInfo={registerData.destination}
                  onChange={setDestination}
                  compact={true}
                />
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* 하단 패널: 옵션 및 버튼 */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* 운송 옵션 */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <OptionsIcon className="h-5 w-5 mr-2" />
                  운송 옵션
                </CardTitle>
                <CardDescription>
                  필요한 옵션을 모두 선택하세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OptionSelector
                  options={TRANSPORT_OPTIONS}
                  selectedOptions={registerData.selectedOptions}
                  onToggle={toggleOption}
                />
              </CardContent>
            </Card>
          </div>
          
          {/* 예상 거리 및 금액 */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <CalculatorIcon className="h-5 w-5 mr-2" />
                  예상 정보
                </CardTitle>
                <CardDescription>
                  출발지와 도착지를 입력하면 예상 거리와 금액이 자동 계산됩니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <FormLabel>예상 거리</FormLabel>
                      <div className="flex items-center h-10 px-3 border rounded-md">
                        {isCalculating ? (
                          <div className="animate-pulse">계산 중...</div>
                        ) : (
                          <span>{typeof registerData.estimatedDistance === 'number' ? registerData.estimatedDistance.toLocaleString() : '0'}km</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <FormLabel>예상 금액</FormLabel>
                      <div className="flex items-center h-10 px-3 border rounded-md font-medium">
                        {isCalculating ? (
                          <div className="animate-pulse">계산 중...</div>
                        ) : (
                          <span>{typeof registerData.estimatedAmount === 'number' ? registerData.estimatedAmount.toLocaleString() : '0'}원</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button type="submit" className="mt-6 w-full" size="lg">
                    화물 등록
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </Form>
  );
} 