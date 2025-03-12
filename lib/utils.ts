import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"
import { ko } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 금액을 통화 형식으로 포맷팅합니다. (예: 1000 -> 1,000)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ko-KR').format(amount);
}

/**
 * 날짜를 포맷팅합니다. (예: 2023-01-01T00:00:00Z -> 2023년 1월 1일)
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return format(date, 'yyyy년 M월 d일', { locale: ko });
  } catch (error) {
    console.error("날짜 형식 오류:", error);
    return dateString;
  }
}
