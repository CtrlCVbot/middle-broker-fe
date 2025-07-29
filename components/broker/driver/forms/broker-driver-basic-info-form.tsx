"use client"

import React, { useEffect } from "react"

import { UseFormReturn } from "react-hook-form"
import * as z from "zod"
import { Input } from "@/components/ui/input"

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
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

// 차주 기본 정보 스키마
const basicInfoSchema = z.object({
  name: z.string().min(1, "차주명은 필수입니다"),
  phone: z.string().min(1, "연락처는 필수입니다"),
  businessNumber: z.string().optional(),
  address: z.string().optional(),
  status: z.enum(["활성", "비활성"]).default("활성"),
  // 은행 정보 필드 추가
  bankCode: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankAccountHolder: z.string().optional(),
})

// 전체 폼 스키마에서 기본 정보 타입 추출
type DriverFormValues = {
  basicInfo: z.infer<typeof basicInfoSchema>;
  vehicleInfo: any;
  // accountInfo: any;
  notes: any;
}

interface IBrokerDriverBasicInfoFormProps {
  form: UseFormReturn<DriverFormValues>;
  onComplete?: () => void;
}

// 상태 옵션 배열
const statusOptions: DriverStatus[] = ['활성', '비활성'];

// 은행 코드와 은행명 매핑
const BANK_CODES = [
  { code: '001', name: '한국은행' },
  { code: '002', name: '산업은행' },
  { code: '003', name: '기업은행' },
  { code: '004', name: '국민은행' },
  { code: '007', name: '수협은행' },
  { code: '008', name: '수출입은행' },
  { code: '011', name: '농협은행' },
  { code: '020', name: '우리은행' },
  { code: '023', name: 'SC제일은행' },
  { code: '027', name: '씨티은행' },
  { code: '031', name: '대구은행' },
  { code: '032', name: '부산은행' },
  { code: '034', name: '광주은행' },
  { code: '035', name: '제주은행' },
  { code: '037', name: '전북은행' },
  { code: '039', name: '경남은행' },
  { code: '045', name: '새마을금고중앙회' },
  { code: '048', name: '신협중앙회' },
  { code: '050', name: '상호저축은행' },
  { code: '071', name: '우체국' },
  { code: '081', name: '하나은행' },
  { code: '088', name: '신한은행' },
  { code: '089', name: '케이뱅크' },
  { code: '090', name: '카카오뱅크' },
  { code: '092', name: '토스뱅크' },
];

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
      
      {/* <FormField
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
      /> */}

      {/* 은행 정보 카드 */}
      <Card>
        <CardHeader>
          <CardTitle>은행 정보</CardTitle>
          <CardDescription>정산 및 송금에 필요한 계좌 정보를 입력합니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 은행 코드(Select) */}
            <FormField
              control={form.control}
              name="basicInfo.bankCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>은행</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="은행 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {BANK_CODES.map((bank) => (
                          <SelectItem key={bank.code} value={bank.code}>
                            {bank.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* 예금주 */}
            <FormField
              control={form.control}
              name="basicInfo.bankAccountHolder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>예금주</FormLabel>
                  <FormControl>
                    <Input placeholder="예금주명" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {/* 계좌번호 (2열 전체) */}
          <FormField
            control={form.control}
            name="basicInfo.bankAccountNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>계좌번호</FormLabel>
                <FormControl>
                  <Input placeholder="계좌번호를 입력하세요" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
      
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