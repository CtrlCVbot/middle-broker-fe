"use client";

import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { BrokerRegisterLocationForm } from "./broker-register-location-form";
import { BrokerRegisterOptionSelector } from "./broker-register-option-selector";
import { BrokerOrderRegisterSummary } from "./broker-register-summary";
import { 
  BROKER_VEHICLE_TYPES, 
  BROKER_WEIGHT_TYPES, 
  BROKER_TRANSPORT_OPTIONS,
  IBrokerOrderRegisterData
} from "@/types/broker-order";
import { useRouter } from "next/navigation";
import { useBrokerOrderRegisterStore } from "@/store/broker-order-register-store";
import { Truck, MapPin, Info, ArrowRight } from "lucide-react";

// 폼 유효성 검증 스키마
const formSchema = z.object({
  vehicleType: z.string({
    required_error: "차량 종류를 선택해주세요",
  }),
  weightType: z.string({
    required_error: "중량을 선택해주세요",
  }),
  cargoType: z.string().min(1, {
    message: "화물 종류를 입력해주세요",
  }),
  remark: z.string().optional(),
  departure: z.object({
    address: z.string().min(1, { message: "주소를 입력해주세요" }),
    detailedAddress: z.string().optional(),
    name: z.string().min(1, { message: "담당자명을 입력해주세요" }),
    company: z.string().min(1, { message: "업체명을 입력해주세요" }),
    contact: z.string().min(1, { message: "연락처를 입력해주세요" }),
    date: z.string().min(1, { message: "날짜를 선택해주세요" }),
    time: z.string().min(1, { message: "시간을 선택해주세요" }),
  }),
  destination: z.object({
    address: z.string().min(1, { message: "주소를 입력해주세요" }),
    detailedAddress: z.string().optional(),
    name: z.string().min(1, { message: "담당자명을 입력해주세요" }),
    company: z.string().min(1, { message: "업체명을 입력해주세요" }),
    contact: z.string().min(1, { message: "연락처를 입력해주세요" }),
    date: z.string().min(1, { message: "날짜를 선택해주세요" }),
    time: z.string().min(1, { message: "시간을 선택해주세요" }),
  }),
  selectedOptions: z.array(z.string()),
});

// BrokerOrderRegisterForm의 props 인터페이스 정의
interface BrokerOrderRegisterFormProps {
  onSubmit?: (data: IBrokerOrderRegisterData) => void;
  editMode?: boolean;
  orderNumber?: string;
}

export function BrokerOrderRegisterForm({ onSubmit, editMode = false, orderNumber }: BrokerOrderRegisterFormProps) {
  const router = useRouter();
  const { registerOrder, setFormData } = useBrokerOrderRegisterStore();
  
  // 폼 단계 상태
  const [step, setStep] = useState<'info' | 'summary'>('info');
  
  // 폼 초기화
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vehicleType: "",
      weightType: "",
      cargoType: "",
      remark: "",
      departure: {
        address: "",
        detailedAddress: "",
        name: "",
        company: "",
        contact: "",
        date: "",
        time: "",
      },
      destination: {
        address: "",
        detailedAddress: "",
        name: "",
        company: "",
        contact: "",
        date: "",
        time: "",
      },
      selectedOptions: [],
    },
  });

  // 수정 모드일 경우 기존 데이터 로드
  React.useEffect(() => {
    if (editMode && orderNumber) {
      // 여기에 기존 주문 데이터를 가져오는 로직을 추가할 수 있습니다.
      // 예시: API 호출 또는 스토어에서 데이터 가져오기
      console.log(`수정 모드: 주문번호 ${orderNumber} 데이터 로드`);
      
      // form.reset()을 사용하여 폼 값을 초기화할 수 있습니다.
      // 실제 구현 시 아래 주석을 해제하고 데이터를 적절히 채워주세요.
      /*
      form.reset({
        vehicleType: existingData.vehicleType,
        weightType: existingData.weightType,
        cargoType: existingData.cargoType,
        // ... 나머지 필드
      });
      */
    }
  }, [editMode, orderNumber, form]);
  
  // 요약 단계에서 뒤로가기 처리
  const handleBack = () => {
    setStep('info');
  };
  
  // 폼 제출 핸들러
  const onSubmitHandler = (values: z.infer<typeof formSchema>) => {
    if (step === 'info') {
      // 요약 단계로 이동
      setFormData(values as IBrokerOrderRegisterData);
      setStep('summary');
    } else {
      // 최종 제출
      if (editMode && onSubmit) {
        // 수정 모드에서는 전달받은 onSubmit 함수 사용
        onSubmit(values as IBrokerOrderRegisterData);
      } else {
        // 신규 등록 모드
        try {
          registerOrder(values as IBrokerOrderRegisterData);
          // 등록 후 이동
          router.push('/broker/order/list');
        } catch (error) {
          console.error('등록 실패:', error);
        }
      }
    }
  };
  
  return (
    <div className="space-y-6">
      {step === 'info' ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmitHandler)} className="space-y-8">
            {/* 차량 및 화물 정보 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Truck className="mr-2 h-5 w-5" />
                  차량 및 화물 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 차량 종류 */}
                  <FormField
                    control={form.control}
                    name="vehicleType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>차량 종류</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="차량 종류 선택" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {BROKER_VEHICLE_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* 중량 */}
                  <FormField
                    control={form.control}
                    name="weightType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>중량</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="중량 선택" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {BROKER_WEIGHT_TYPES.map((weight) => (
                              <SelectItem key={weight} value={weight}>
                                {weight}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* 화물 종류 */}
                <FormField
                  control={form.control}
                  name="cargoType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>화물 종류</FormLabel>
                      <FormControl>
                        <Input placeholder="화물 종류 입력" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* 비고 */}
                <FormField
                  control={form.control}
                  name="remark"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>비고</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="추가 요청사항이나 참고사항을 입력하세요"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            
            {/* 출발지 정보 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <MapPin className="mr-2 h-5 w-5" />
                  출발지 정보
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BrokerRegisterLocationForm
                  control={form.control}
                  prefix="departure"
                  label="출발지"
                />
              </CardContent>
            </Card>
            
            {/* 도착지 정보 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <MapPin className="mr-2 h-5 w-5" />
                  도착지 정보
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BrokerRegisterLocationForm
                  control={form.control}
                  prefix="destination"
                  label="도착지"
                />
              </CardContent>
            </Card>
            
            {/* 운송 옵션 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Info className="mr-2 h-5 w-5" />
                  운송 옵션
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="selectedOptions"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <BrokerRegisterOptionSelector
                          options={BROKER_TRANSPORT_OPTIONS}
                          selectedOptions={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            
            {/* 제출 버튼 */}
            <div className="flex justify-end">
              <Button type="submit" className="w-full md:w-auto">
                다음 단계
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
        </Form>
      ) : (
        // 요약 단계
        <BrokerOrderRegisterSummary
          formData={form.getValues() as IBrokerOrderRegisterData}
          onBack={handleBack}
          onSubmit={() => form.handleSubmit(onSubmitHandler)()}
        />
      )}
    </div>
  );
} 