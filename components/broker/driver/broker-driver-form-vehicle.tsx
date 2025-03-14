"use client";

import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

// 차량 종류 옵션
const vehicleTypes = [
  { label: "카고", value: "카고" },
  { label: "윙바디", value: "윙바디" },
  { label: "탑차", value: "탑차" },
  { label: "냉동탑", value: "냉동탑" },
  { label: "호퍼", value: "호퍼" },
  { label: "덤프", value: "덤프" },
];

// 톤수 옵션
const tonnageOptions = [
  { label: "1톤", value: "1톤" },
  { label: "1.4톤", value: "1.4톤" },
  { label: "2.5톤", value: "2.5톤" },
  { label: "3.5톤", value: "3.5톤" },
  { label: "5톤", value: "5톤" },
  { label: "8톤", value: "8톤" },
  { label: "11톤", value: "11톤" },
  { label: "15톤", value: "15톤" },
  { label: "25톤", value: "25톤" },
];

// 운행 가능 지역 옵션
const operationAreaOptions = [
  { id: "seoul", label: "서울" },
  { id: "gyeonggi", label: "경기" },
  { id: "incheon", label: "인천" },
  { id: "gangwon", label: "강원" },
  { id: "chungbuk", label: "충북" },
  { id: "chungnam", label: "충남" },
  { id: "daejeon", label: "대전" },
  { id: "gyeongbuk", label: "경북" },
  { id: "gyeongnam", label: "경남" },
  { id: "daegu", label: "대구" },
  { id: "busan", label: "부산" },
  { id: "ulsan", label: "울산" },
  { id: "jeonbuk", label: "전북" },
  { id: "jeonnam", label: "전남" },
  { id: "gwangju", label: "광주" },
  { id: "jeju", label: "제주" },
];

// 차량 정보 스키마
const vehicleSchema = z.object({
  vehicleNumber: z
    .string()
    .min(1, { message: "차량번호를 입력해주세요." })
    .regex(/^\d{2,3}[가-힣]\d{4}$/, {
      message: "올바른 차량번호 형식이 아닙니다. (예: 12가3456)",
    }),
  vehicleType: z.string({
    required_error: "차량 종류를 선택해주세요.",
  }),
  tonnage: z.string({
    required_error: "톤수를 선택해주세요.",
  }),
  operationArea: z.array(z.string()).optional(),
});

interface IVehicleFormProps {
  data: any;
  onUpdate: (data: any, isValid: boolean) => void;
}

export function BrokerDriverVehicleForm({ data, onUpdate }: IVehicleFormProps) {
  const [isFormValid, setIsFormValid] = useState(false);
  
  // 폼 초기화
  const form = useForm<z.infer<typeof vehicleSchema>>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      vehicleNumber: data.vehicleNumber || "",
      vehicleType: data.vehicleType || "",
      tonnage: data.tonnage || "",
      operationArea: data.operationArea || [],
    },
  });
  
  // 폼 값이 변경될 때마다 부모 컴포넌트에 업데이트
  useEffect(() => {
    const subscription = form.watch((value) => {
      const formData = form.getValues();
      const isValid = form.formState.isValid;
      setIsFormValid(isValid);
      onUpdate(formData, isValid);
    });
    
    return () => subscription.unsubscribe();
  }, [form, form.watch, onUpdate]);
  
  // 차량번호 자동 포맷팅 (앞 부분 숫자 + 한글 + 뒷 부분 숫자)
  const formatVehicleNumber = (value: string) => {
    return value;
  };
  
  return (
    <Form {...form}>
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="vehicleNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>차량번호<span className="text-red-500 ml-1">*</span></FormLabel>
              <FormControl>
                <Input 
                  placeholder="12가3456" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                차량번호를 정확히 입력해주세요.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="vehicleType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>차량 종류<span className="text-red-500 ml-1">*</span></FormLabel>
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
                  {vehicleTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="tonnage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>톤수<span className="text-red-500 ml-1">*</span></FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="톤수 선택" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {tonnageOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="operationArea"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel>운행 가능 지역</FormLabel>
                <FormDescription>
                  차주가 운행 가능한 지역을 선택해주세요. (복수 선택 가능)
                </FormDescription>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {operationAreaOptions.map((item) => (
                  <FormField
                    key={item.id}
                    control={form.control}
                    name="operationArea"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={item.id}
                          className="flex flex-row items-start space-x-2 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(item.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, item.id])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== item.id
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {item.label}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Form>
  );
} 