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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

// 권한 옵션
const permissionOptions = [
  { id: "dispatch", label: "배차" },
  { id: "settlement", label: "정산" },
  { id: "admin", label: "관리" },
];

// 계정 정보 스키마
const accountSchema = z.object({
  driverId: z
    .string()
    .min(4, { message: "아이디는 최소 4자 이상이어야 합니다." })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "아이디는 영문, 숫자, 언더스코어(_)만 포함할 수 있습니다.",
    }),
  password: z
    .string()
    .min(8, { message: "비밀번호는 최소 8자 이상이어야 합니다." })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/, {
      message: "비밀번호는 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.",
    }),
  email: z
    .string()
    .email({ message: "올바른 이메일 형식이 아닙니다." }),
  permissions: z.array(z.string()).min(1, {
    message: "최소 하나 이상의 권한을 선택해주세요.",
  }),
});

interface IAccountFormProps {
  data: any;
  onUpdate: (data: any, isValid: boolean) => void;
}

export function BrokerDriverAccountForm({ data, onUpdate }: IAccountFormProps) {
  const [isFormValid, setIsFormValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // 폼 초기화
  const form = useForm<z.infer<typeof accountSchema>>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      driverId: data.driverId || "",
      password: data.password || "",
      email: data.email || "",
      permissions: data.permissions || ["dispatch"],
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
  
  // 비밀번호 강도 확인
  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: "없음", color: "bg-gray-200" };
    
    let strength = 0;
    
    if (password.length >= 8) strength += 1;
    if (password.match(/[a-z]+/)) strength += 1;
    if (password.match(/[A-Z]+/)) strength += 1;
    if (password.match(/[0-9]+/)) strength += 1;
    if (password.match(/[^a-zA-Z0-9]+/)) strength += 1;
    
    switch (strength) {
      case 0:
      case 1:
        return { strength: 1, label: "매우 약함", color: "bg-red-500" };
      case 2:
        return { strength: 2, label: "약함", color: "bg-orange-500" };
      case 3:
        return { strength: 3, label: "보통", color: "bg-yellow-500" };
      case 4:
        return { strength: 4, label: "강함", color: "bg-lime-500" };
      case 5:
        return { strength: 5, label: "매우 강함", color: "bg-green-500" };
      default:
        return { strength: 0, label: "없음", color: "bg-gray-200" };
    }
  };
  
  const passwordStrength = getPasswordStrength(form.watch("password"));
  
  return (
    <Form {...form}>
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="driverId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>아이디<span className="text-red-500 ml-1">*</span></FormLabel>
              <FormControl>
                <Input placeholder="user_id" {...field} />
              </FormControl>
              <FormDescription>
                영문, 숫자, 언더스코어(_)만 사용 가능합니다.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>비밀번호<span className="text-red-500 ml-1">*</span></FormLabel>
              <div className="relative">
                <FormControl>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="********"
                    {...field}
                  />
                </FormControl>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="mt-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs">강도: {passwordStrength.label}</span>
                  <span className="text-xs">{field.value.length}/20</span>
                </div>
                <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${passwordStrength.color} transition-all duration-300`}
                    style={{
                      width: `${(passwordStrength.strength / 5) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <FormDescription>
                8자 이상의 대소문자, 숫자, 특수문자를 포함해야 합니다.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>이메일<span className="text-red-500 ml-1">*</span></FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="example@email.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="permissions"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel>권한<span className="text-red-500 ml-1">*</span></FormLabel>
                <FormDescription>
                  차주에게 부여할 권한을 선택해주세요. (복수 선택 가능)
                </FormDescription>
              </div>
              <div className="space-y-2">
                {permissionOptions.map((permission) => (
                  <FormField
                    key={permission.id}
                    control={form.control}
                    name="permissions"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={permission.id}
                          className="flex flex-row items-start space-x-2 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(permission.id)}
                              onCheckedChange={(checked) => {
                                const updatedPermissions = checked
                                  ? [...field.value, permission.id]
                                  : field.value?.filter(
                                      (value) => value !== permission.id
                                    );
                                field.onChange(updatedPermissions);
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {permission.label}
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