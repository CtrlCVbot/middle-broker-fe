import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"
import { ko } from "date-fns/locale"

/**
 * 여러 클래스명을 병합하는 유틸리티
 * tailwind 클래스 충돌을 해결하고 조건부 클래스를 지원합니다.
 * 
 * @example
 * cn("bg-red-500", isError && "text-white", "p-4")
 * 
 * @param inputs 클래스명 배열
 * @returns 병합된 클래스명 문자열
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 값이 객체인지 확인하는 유틸리티
 * null은 객체로 취급하지 않습니다.
 * 
 * @param value 확인할 값
 * @returns 객체 여부
 */
export function isObject(value: unknown): value is Record<string, any> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * 숫자를 통화 형식(원)으로 변환합니다.
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * 숫자를 포맷팅하는 유틸리티
 * 천 단위 구분자와 소수점 자릿수를 지정할 수 있습니다.
 * 
 * @param value 포맷팅할 숫자
 * @param options 포맷팅 옵션
 * @returns 포맷팅된 문자열
 */
export function formatNumber(
  value: number, 
  options: { 
    decimal?: number; 
    currency?: string;
    compact?: boolean;
  } = {}
): string {
  const { decimal = 0, currency, compact = false } = options;
  
  try {
    const formatter = new Intl.NumberFormat('ko-KR', {
      style: currency ? 'currency' : 'decimal',
      currency: currency,
      minimumFractionDigits: decimal,
      maximumFractionDigits: decimal,
      notation: compact ? 'compact' : 'standard',
    });
    
    return formatter.format(value);
  } catch (error) {
    console.error('Number formatting error:', error);
    return value.toFixed(decimal).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
}

/**
 * 주어진 날짜를 한국 형식으로 포맷팅하는 유틸리티
 * 
 * @param date 포맷팅할 날짜
 * @param options 포맷팅 옵션
 * @returns 포맷팅된 날짜 문자열
 */
export function formatDate(
  date: Date | string | number,
  options: {
    format?: 'full' | 'date' | 'time' | 'dateTime' | 'relative';
    locale?: string;
  } = {}
): string {
  const { format = 'full', locale = 'ko-KR' } = options;
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    console.error('Invalid date:', date);
    return String(date);
  }
  
  try {
    if (format === 'relative') {
      const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
      const now = new Date();
      const diffInSeconds = Math.floor((dateObj.getTime() - now.getTime()) / 1000);
      
      // 상대적 시간 표현
      if (diffInSeconds < -86400 * 30) {
        return new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(dateObj);
      } else if (diffInSeconds < -86400) {
        return rtf.format(Math.floor(diffInSeconds / 86400), 'day');
      } else if (diffInSeconds < -3600) {
        return rtf.format(Math.floor(diffInSeconds / 3600), 'hour');
      } else if (diffInSeconds < -60) {
        return rtf.format(Math.floor(diffInSeconds / 60), 'minute');
      } else if (diffInSeconds < 0) {
        return rtf.format(diffInSeconds, 'second');
      } else if (diffInSeconds < 60) {
        return rtf.format(diffInSeconds, 'second');
      } else if (diffInSeconds < 3600) {
        return rtf.format(Math.floor(diffInSeconds / 60), 'minute');
      } else if (diffInSeconds < 86400) {
        return rtf.format(Math.floor(diffInSeconds / 3600), 'hour');
      } else if (diffInSeconds < 86400 * 30) {
        return rtf.format(Math.floor(diffInSeconds / 86400), 'day');
      } else {
        return new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(dateObj);
      }
    }
    
    const formatter = new Intl.DateTimeFormat(locale, {
      dateStyle: format === 'date' || format === 'full' || format === 'dateTime' ? 'long' : undefined,
      timeStyle: format === 'time' || format === 'full' || format === 'dateTime' ? 'medium' : undefined,
    });
    
    return formatter.format(dateObj);
  } catch (error) {
    console.error('Date formatting error:', error);
    return dateObj.toLocaleString(locale);
  }
}

/**
 * 두 날짜 사이의 일 수를 계산합니다.
 */
export function getDaysBetween(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * 고유한 ID를 생성합니다.
 * @param prefix ID 앞에 붙일 접두사
 * @returns 접두사-랜덤숫자 형식의 문자열
 */
export function generateId(prefix: string = 'ID'): string {
  const randomPart = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  const timestamp = new Date().getTime().toString().slice(-5);
  return `${prefix}-${timestamp}${randomPart}`;
}
