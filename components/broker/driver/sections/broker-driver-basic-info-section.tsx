"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VehicleType, TonnageType } from "@/types/broker-driver";
import { DriverFormValues } from "@/types/driver-form-schema";
import { 
  formatPhoneNumber, 
  formatVehicleNumber, 
  formatBusinessNumber,
  createFormatHandler 
} from "@/utils/driver-form-utils";

interface IBrokerDriverBasicInfoSectionProps {
  form: UseFormReturn<DriverFormValues>;
}

// 차량 종류 옵션
const vehicleTypeOptions: VehicleType[] = ['카고', '윙바디', '냉동', '탑차', '리프트', '기타'];

// 톤수 옵션
const tonnageOptions: TonnageType[] = [
  "1톤", "1.4톤", "2.5톤", "3.5톤", "5톤", "8톤", "11톤", "18톤", "25톤", "기타"
];

export function BrokerDriverBasicInfoSection({ form }: IBrokerDriverBasicInfoSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">기본 정보</CardTitle>
        <CardDescription>차주의 기본 정보를 입력하세요. * 표시는 필수 항목입니다.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 좌측 컬럼 */}
          <div className="space-y-4">
            {/* 차주명 */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    차주명 <span className="text-destructive">*</span>
                  </FormLabel>
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

            {/* 연락처 */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    연락처 <span className="text-destructive">*</span>
                  </FormLabel>
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
                    차주와 연락 가능한 전화번호를 입력하세요.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 사업자번호 */}
            <FormField
              control={form.control}
              name="businessNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>사업자등록번호</FormLabel>
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
                    개인사업자인 경우 사업자등록번호를 입력하세요.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* 우측 컬럼 */}
          <div className="space-y-4">
            {/* 차량번호 */}
            <FormField
              control={form.control}
              name="vehicleNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    차량번호 <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="12가-3456" 
                      {...field}
                      onChange={(e) => {
                        const formatted = formatVehicleNumber(e.target.value);
                        field.onChange(formatted);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    차량 번호판에 기재된 번호를 입력하세요.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 차량종류 */}
            <FormField
              control={form.control}
              name="vehicleType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    차량종류 <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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

            {/* 톤수 */}
            <FormField
              control={form.control}
              name="tonnage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    톤수 <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 