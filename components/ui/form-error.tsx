"use client";

import { XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormErrorProps {
  message?: string;
  className?: string;
}

/**
 * 폼 오류 메시지 컴포넌트
 * 
 * 개별 필드의 유효성 검증 오류 또는 API 응답 오류를 표시하는 데 사용
 */
export function FormError({
  message,
  className,
}: FormErrorProps) {
  if (!message) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-x-2 text-sm text-destructive",
        className
      )}
    >
      <XCircle className="h-4 w-4" />
      <p>{message}</p>
    </div>
  );
}

interface ApiFormErrorProps {
  errors?: Record<string, string[]>;
  field: string;
  className?: string;
}

/**
 * API 응답 오류 표시 컴포넌트
 * 
 * API 응답에서 받은 특정 필드의 오류 메시지를 표시
 */
export function ApiFormError({
  errors,
  field,
  className,
}: ApiFormErrorProps) {
  if (!errors || !errors[field] || errors[field].length === 0) return null;

  return <FormError message={errors[field][0]} className={className} />;
} 