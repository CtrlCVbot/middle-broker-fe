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
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// 유효성 검증 스키마
const basicInfoSchema = z.object({
  name: z.string().min(1, { message: "차주명을 입력해주세요." }),
  phone: z
    .string()
    .min(1, { message: "연락처를 입력해주세요." })
    .regex(/^\d{3}-\d{3,4}-\d{4}$/, {
      message: "올바른 연락처 형식이 아닙니다. (예: 010-1234-5678)",
    }),
  businessNumber: z
    .string()
    .min(1, { message: "사업자번호를 입력해주세요." })
    .regex(/^\d{3}-\d{2}-\d{5}$/, {
      message: "올바른 사업자번호 형식이 아닙니다. (예: 123-45-67890)",
    }),
  address: z.string().min(1, { message: "주소를 입력해주세요." }),
  company: z.string().optional(),
  isActive: z.boolean().default(true),
});

interface IBasicInfoProps {
  data: any;
  onUpdate: (data: any, isValid: boolean) => void;
}

export function BrokerDriverBasicInfoForm({ data, onUpdate }: IBasicInfoProps) {
  const [isFormValid, setIsFormValid] = useState(false);
  
  // 폼 초기화
  const form = useForm<z.infer<typeof basicInfoSchema>>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      name: data.name || "",
      phone: data.phone || "",
      businessNumber: data.businessNumber || "",
      address: data.address || "",
      company: data.company || "",
      isActive: data.isActive !== undefined ? data.isActive : true,
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
  
  // 전화번호 자동 포맷팅 (하이픈 추가)
  const formatPhoneNumber = (value: string) => {
    // 숫자만 추출
    const numbers = value.replace(/\D/g, "");
    
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    }
  };
  
  // 사업자번호 자동 포맷팅 (하이픈 추가)
  const formatBusinessNumber = (value: string) => {
    // 숫자만 추출
    const numbers = value.replace(/\D/g, "");
    
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 5) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 5)}-${numbers.slice(5, 10)}`;
    }
  };
  
  return (
    <Form {...form}>
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>차주명<span className="text-red-500 ml-1">*</span></FormLabel>
              <FormControl>
                <Input placeholder="홍길동" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>연락처<span className="text-red-500 ml-1">*</span></FormLabel>
              <FormControl>
                <Input
                  placeholder="010-1234-5678"
                  {...field}
                  onChange={(e) => {
                    const formatted = formatPhoneNumber(e.target.value);
                    field.onChange(formatted);
                  }}
                />
              </FormControl>
              <FormDescription>
                하이픈(-)을 포함한 연락처를 입력해주세요.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="businessNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>사업자번호<span className="text-red-500 ml-1">*</span></FormLabel>
              <FormControl>
                <Input
                  placeholder="123-45-67890"
                  {...field}
                  onChange={(e) => {
                    const formatted = formatBusinessNumber(e.target.value);
                    field.onChange(formatted);
                  }}
                />
              </FormControl>
              <FormDescription>
                하이픈(-)을 포함한 사업자등록번호를 입력해주세요.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>주소<span className="text-red-500 ml-1">*</span></FormLabel>
              <FormControl>
                <Input placeholder="서울특별시 강남구..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>소속 회사</FormLabel>
              <FormControl>
                <Input placeholder="(선택) 소속 회사명" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">차주 상태</FormLabel>
                <FormDescription>
                  차주를 활성 상태로 등록할지 선택합니다.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </Form>
  );
} 