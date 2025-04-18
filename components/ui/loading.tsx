"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
}

/**
 * 로딩 스피너 컴포넌트
 * 
 * 간단한 로딩 스피너를 표시합니다
 */
export function LoadingSpinner({ 
  size = 24, 
  className 
}: LoadingSpinnerProps) {
  return (
    <Loader2 
      className={cn("animate-spin text-primary", className)} 
      size={size}
    />
  );
}

interface LoadingProps {
  text?: string;
  size?: number;
  className?: string;
}

/**
 * 로딩 컴포넌트
 * 
 * 로딩 스피너와 텍스트를 함께 표시합니다
 */
export function Loading({ 
  text = "로딩 중...", 
  size = 24, 
  className 
}: LoadingProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-6", className)}>
      <LoadingSpinner size={size} />
      {text && <p className="mt-2 text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}

interface LoadingOverlayProps {
  isLoading: boolean;
  text?: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * 로딩 오버레이 컴포넌트
 * 
 * 컨텐츠 위에 로딩 오버레이를 표시합니다
 */
export function LoadingOverlay({ 
  isLoading, 
  text, 
  className, 
  children 
}: LoadingOverlayProps) {
  return (
    <div className="relative">
      {children}
      
      {isLoading && (
        <div className={cn(
          "absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-[1px] z-50",
          className
        )}>
          <Loading text={text} />
        </div>
      )}
    </div>
  );
}

/**
 * 로딩 스켈레톤 컴포넌트
 * 
 * 컨텐츠 로딩 중 스켈레톤 UI를 표시합니다
 */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-primary/10", className)}
      {...props}
    />
  );
} 