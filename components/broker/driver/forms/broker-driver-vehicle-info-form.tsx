"use client"

import React, { useEffect } from "react"
import { UseFormReturn } from "react-hook-form"
import * as z from "zod"
import { Input } from "@/components/ui/input"
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { VehicleType, TonnageType } from "@/types/broker-driver"

// 차량 정보 스키마
const vehicleInfoSchema = z.object({
  vehicleNumber: z.string().min(1, "차량번호는 필수입니다"),
  vehicleType: z.string().min(1, "차량종류는 필수입니다"),
  tonnage: z.string().min(1, "톤수는 필수입니다"),
  cargoBoxType: z.string().optional(),
  cargoBoxLength: z.string().optional(),
  manufactureYear: z.string().optional(),
})

// 전체 폼 스키마에서 차량 정보 타입 추출
type DriverFormValues = {
  basicInfo: any;
  vehicleInfo: z.infer<typeof vehicleInfoSchema>;
  accountInfo: any;
  notes: any;
}

interface IBrokerDriverVehicleInfoFormProps {
  form: UseFormReturn<DriverFormValues>;
  onComplete?: () => void;
}

// 차량 종류 옵션 - VehicleType에서 가져옴
const vehicleTypeOptions: VehicleType[] = ['카고', '윙바디', '냉동', '탑차', '리프트', '기타'];

// 톤수 옵션 - TonnageType에서 가져옴
const tonnageOptions: TonnageType[] = [
  "1톤", "1.4톤", "2.5톤", "3.5톤", "5톤", "8톤", "11톤", "18톤", "25톤", "기타"
];

// 화물함 종류 옵션
const cargoBoxTypeOptions = [
  "일반", "파렛트", "철판", "스테인리스", "알루미늄", "기타"
]

export function BrokerDriverVehicleInfoForm({
  form,
  onComplete,
}: IBrokerDriverVehicleInfoFormProps) {
  // 폼 상태 변화 감지
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (
        name?.includes("vehicleInfo") && 
        form.formState.dirtyFields.vehicleInfo &&
        !form.formState.errors.vehicleInfo
      ) {
        onComplete?.();
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form, onComplete]);
  
  // 현재 연도 계산 (제조년도 선택 옵션용)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 30 }, (_, i) => (currentYear - i).toString());
  
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="vehicleInfo.vehicleNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>차량번호 <span className="text-destructive">*</span></FormLabel>
            <FormControl>
              <Input placeholder="서울 12가 3456" {...field} />
            </FormControl>
            <FormDescription>
              차량 번호판에 기재된 번호를 입력하세요.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="vehicleInfo.vehicleType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>차량종류 <span className="text-destructive">*</span></FormLabel>
            <Select 
              onValueChange={field.onChange} 
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="차량종류 선택" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {vehicleTypeOptions.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>
              차량의 종류를 선택하세요.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="vehicleInfo.tonnage"
        render={({ field }) => (
          <FormItem>
            <FormLabel>톤수 <span className="text-destructive">*</span></FormLabel>
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
                {tonnageOptions.map((tonnage) => (
                  <SelectItem key={tonnage} value={tonnage}>
                    {tonnage}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>
              차량의 톤수를 선택하세요.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="vehicleInfo.cargoBoxType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>화물함 종류</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="화물함 종류 선택" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {cargoBoxTypeOptions.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>
              화물함의 종류를 선택하세요.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="vehicleInfo.cargoBoxLength"
        render={({ field }) => (
          <FormItem>
            <FormLabel>화물함 길이</FormLabel>
            <FormControl>
              <Input placeholder="예: 4.5m" {...field} />
            </FormControl>
            <FormDescription>
              화물함의 길이를 입력하세요.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="vehicleInfo.manufactureYear"
        render={({ field }) => (
          <FormItem>
            <FormLabel>제조년도</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="제조년도 선택" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}년
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>
              차량의 제조년도를 선택하세요.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
} 