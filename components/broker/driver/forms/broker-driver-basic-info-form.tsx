"use client"

import React, { useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { UseFormReturn } from "react-hook-form"
import * as z from "zod"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Form,
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
import { Textarea } from "@/components/ui/textarea"
import { DriverStatus } from "@/types/broker-driver"

// 차주 기본 정보 스키마
const basicInfoSchema = z.object({
  name: z.string().min(1, "차주명은 필수입니다"),
  phone: z.string().min(1, "연락처는 필수입니다"),
  businessNumber: z.string().optional(),
  address: z.string().optional(),
  status: z.enum(["활성", "비활성"]).default("활성"),
})

// 전체 폼 스키마에서 기본 정보 타입 추출
type DriverFormValues = {
  basicInfo: z.infer<typeof basicInfoSchema>;
  vehicleInfo: any;
  accountInfo: any;
  notes: any;
}

interface IBrokerDriverBasicInfoFormProps {
  form: UseFormReturn<DriverFormValues>;
  onComplete?: () => void;
}

// 상태 옵션 배열
const statusOptions: DriverStatus[] = ['활성', '비활성'];

export function BrokerDriverBasicInfoForm({
  form,
  onComplete,
}: IBrokerDriverBasicInfoFormProps) {
  // 폼 상태 변화 감지
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (
        name?.includes("basicInfo") && 
        form.formState.dirtyFields.basicInfo &&
        !form.formState.errors.basicInfo
      ) {
        onComplete?.();
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form, onComplete]);
  
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="basicInfo.name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>차주명 <span className="text-destructive">*</span></FormLabel>
            <FormControl>
              <Input placeholder="홍길동" {...field} />
            </FormControl>
            <FormDescription>
              차주의 실명을 입력하세요.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="basicInfo.phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>연락처 <span className="text-destructive">*</span></FormLabel>
            <FormControl>
              <Input placeholder="010-1234-5678" {...field} />
            </FormControl>
            <FormDescription>
              차주와 연락 가능한 전화번호를 입력하세요.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="basicInfo.businessNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>사업자등록번호</FormLabel>
            <FormControl>
              <Input placeholder="123-45-67890" {...field} />
            </FormControl>
            <FormDescription>
              개인사업자인 경우 사업자등록번호를 입력하세요.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="basicInfo.address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>주소</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="서울시 강남구 테헤란로 123" 
                className="resize-none"
                {...field} 
              />
            </FormControl>
            <FormDescription>
              차주의 거주지 또는 사업장 주소를 입력하세요.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="basicInfo.status"
        render={({ field }) => (
          <FormItem>
            <FormLabel>상태</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="상태 선택" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>
              차주의 활성 상태를 설정합니다.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
} 