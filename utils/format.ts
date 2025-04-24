import { encodeBase64, decodeBase64 } from 'bcryptjs';

/**
 * 숫자를 세 자리마다 콤마가 포함된 문자열로 변환합니다.
 * @param value 포맷팅할 숫자 또는 문자열
 * @returns 콤마가 포함된 포맷팅된 문자열
 */
export function formatNumberWithCommas(value: number | string | undefined | null): string {
  if (value === undefined || value === null) return '0';
  
  // 문자열이나 숫자를 문자열로 변환
  const numStr = typeof value === 'string' ? value : value.toString();
  
  // 숫자가 아닌 문자열은 원래 값 반환
  if (isNaN(Number(numStr))) return numStr;
  
  // 3자리마다 콤마 추가
  return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * 숫자를 한국 화폐 형식으로 포맷팅합니다.
 * @param value 포맷팅할 금액 (숫자 또는 문자열)
 * @returns 화폐 단위로 포맷팅된 문자열
 */
export function formatCurrency(value: number | string | undefined | null): string {
  return formatNumberWithCommas(value);
}

/**
 * 날짜 문자열을 포맷팅합니다.
 * @param dateString 포맷팅할 ISO 날짜 문자열
 * @param withTime 시간 표시 여부
 * @returns 포맷팅된 날짜 문자열 (예: 2023.05.21 또는 2023.05.21 14:30)
 */
export function formatDate(dateString: string | undefined | null, withTime = false): string {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    
    // 유효하지 않은 날짜인 경우
    if (isNaN(date.getTime())) return dateString;
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    const formattedDate = `${year}.${month}.${day}`;
    
    if (withTime) {
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${formattedDate} ${hours}:${minutes}`;
    }
    
    return formattedDate;
  } catch (error) {
    return dateString;
  }
}

/**
 * 전화번호를 포맷팅합니다.
 * @param phoneNumber 포맷팅할 전화번호 문자열
 * @returns 포맷팅된 전화번호 (예: 010-1234-5678)
 */
export function formatPhoneNumber(phoneNumber: string | undefined | null): string {
  if (!phoneNumber) return '-';
  
  // 숫자만 추출
  const numbers = phoneNumber.replace(/\D/g, '');
  
  // 10-11자리 전화번호 포맷팅
  if (numbers.length === 11) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
  } else if (numbers.length === 10) {
    if (numbers.startsWith('02')) {
      // 서울 지역번호
      return `${numbers.slice(0, 2)}-${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    } else {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6)}`;
    }
  } else {
    return phoneNumber;
  }
} 

/**
 * 문자열을 Base64로 인코딩합니다.
 * @param str 인코딩할 문자열
 * @returns 인코딩된 Base64 문자열
 */
export function encodeBase64String(str: string): string {
  return Buffer.from(str, 'utf-8').toString('base64');
}

/**
 * Base64로 인코딩된 문자열을 디코딩합니다.
 * @param str 디코딩할 Base64 문자열
 * @returns 디코딩된 문자열
 */
export function decodeBase64String(str: string): string {
  return Buffer.from(str, 'base64').toString('utf-8');
}
