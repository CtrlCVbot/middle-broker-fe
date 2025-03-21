import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"
import { ko } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
 * 날짜를 포맷팅합니다. (예: 2023-01-01T00:00:00Z -> 2023-01-01)
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    return format(date, 'yyyy-MM-dd', { locale: ko });
  } catch (error) {
    console.error("날짜 형식 오류:", error);
    return dateString || '-';
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
