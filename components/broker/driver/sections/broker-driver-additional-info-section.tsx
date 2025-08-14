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
import { DriverFormValues } from "@/types/driver-form-schema";
import { 
  BANK_CODES, 
  CARGO_BOX_TYPE_OPTIONS, 
  CARGO_BOX_LENGTH_UNITS,
  getManufactureYearOptions,
  formatBankAccountNumber 
} from "@/utils/driver-form-utils";

interface IBrokerDriverAdditionalInfoSectionProps {
  form: UseFormReturn<DriverFormValues>;
}

export function BrokerDriverAdditionalInfoSection({ form }: IBrokerDriverAdditionalInfoSectionProps) {
  const manufactureYearOptions = getManufactureYearOptions();
  const watchName = form.watch("name");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">추가 정보</CardTitle>
        <CardDescription>정산 및 송금에 필요한 추가 정보를 입력하세요. (선택)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 좌측 컬럼 - 은행 정보 */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">은행 정보</h4>
            
            {/* 은행명 */}
            <FormField
              control={form.control}
              name="bankCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>은행명</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="은행 선택" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {BANK_CODES.map((bank) => (
                        <SelectItem key={bank.code} value={bank.code}>
                          {bank.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 계좌번호 */}
            <FormField
              control={form.control}
              name="bankAccountNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>계좌번호</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="계좌번호를 입력하세요" 
                      {...field}
                      onChange={(e) => {
                        const formatted = formatBankAccountNumber(e.target.value);
                        field.onChange(formatted);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 예금주 */}
            <FormField
              control={form.control}
              name="bankAccountHolder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>예금주</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="예금주명" 
                      {...field}
                      defaultValue={watchName || field.value}
                    />
                  </FormControl>
                  <FormDescription>
                    차주명이 자동으로 입력됩니다. 필요시 수정하세요.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* 우측 컬럼 - 화물함 정보 */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">화물함 정보</h4>
            
            {/* 화물함 종류 */}
            <FormField
              control={form.control}
              name="cargoBoxType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>화물함 종류</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="화물함 종류 선택" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CARGO_BOX_TYPE_OPTIONS.map((type) => (
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

            {/* 화물함 길이 */}
            <FormField
              control={form.control}
              name="cargoBoxLength"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>화물함 길이</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input 
                        placeholder="예: 4.5" 
                        {...field}
                        className="flex-1"
                      />
                    </FormControl>
                    <Select defaultValue="m">
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CARGO_BOX_LENGTH_UNITS.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <FormDescription>
                    화물함의 길이를 입력하세요.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 제조년도 */}
            <FormField
              control={form.control}
              name="manufactureYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>제조년도</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="제조년도 선택" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {manufactureYearOptions.map((year) => (
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
        </div>
      </CardContent>
    </Card>
  );
} 