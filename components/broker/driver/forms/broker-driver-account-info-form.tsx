"use client"

import React, { useEffect, useState } from "react"
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
import { Button } from "@/components/ui/button"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { PermissionType } from "@/types/broker-driver"

// 계정 정보 스키마
const accountInfoSchema = z.object({
  id: z.string().min(4, "아이디는 최소 4자 이상이어야 합니다"),
  password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다"),
  email: z.string().email("유효한 이메일 주소를 입력해주세요").optional().or(z.literal("")),
  permission: z.enum(["일반", "관리자"]).default("일반"),
})

// 전체 폼 스키마에서 계정 정보 타입 추출
type DriverFormValues = {
  basicInfo: any;
  vehicleInfo: any;
  accountInfo: z.infer<typeof accountInfoSchema>;
  notes: any;
}

interface IBrokerDriverAccountInfoFormProps {
  form: UseFormReturn<DriverFormValues>;
  onComplete?: () => void;
}

// 권한 옵션 배열
const permissionOptions: PermissionType[] = ['일반', '관리자'];

export function BrokerDriverAccountInfoForm({
  form,
  onComplete,
}: IBrokerDriverAccountInfoFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  
  // 폼 상태 변화 감지
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (
        name?.includes("accountInfo") && 
        form.formState.dirtyFields.accountInfo &&
        !form.formState.errors.accountInfo
      ) {
        onComplete?.();
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form, onComplete]);
  
  // 무작위 비밀번호 생성
  const generateRandomPassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    form.setValue("accountInfo.password", password, { shouldValidate: true, shouldDirty: true });
  };
  
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="accountInfo.id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>아이디 <span className="text-destructive">*</span></FormLabel>
            <FormControl>
              <Input placeholder="driver123" {...field} />
            </FormControl>
            <FormDescription>
              로그인에 사용할 아이디를 입력하세요. (최소 4자 이상)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="accountInfo.password"
        render={({ field }) => (
          <FormItem>
            <FormLabel>비밀번호 <span className="text-destructive">*</span></FormLabel>
            <div className="flex gap-2">
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"} 
                    placeholder="********" 
                    {...field} 
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-4 w-4" />
                    ) : (
                      <EyeIcon className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </FormControl>
              <Button
                type="button" 
                variant="outline"
                size="sm"
                onClick={generateRandomPassword}
              >
                자동생성
              </Button>
            </div>
            <FormDescription>
              안전한 비밀번호를 입력하세요. (최소 6자 이상)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="accountInfo.email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>이메일</FormLabel>
            <FormControl>
              <Input 
                type="email"
                placeholder="example@example.com" 
                {...field} 
                value={field.value || ""}
              />
            </FormControl>
            <FormDescription>
              비밀번호 재설정 등에 사용할 이메일 주소를 입력하세요.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="accountInfo.permission"
        render={({ field }) => (
          <FormItem>
            <FormLabel>권한</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="권한 선택" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {permissionOptions.map((permission) => (
                  <SelectItem key={permission} value={permission}>
                    {permission}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>
              차주의 시스템 접근 권한을 설정합니다.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
} 