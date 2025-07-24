/**
 * 디바운스 유틸리티 함수
 * 
 * 지정된 시간(ms) 동안 추가 호출이 없으면 함수를 실행합니다.
 * 함수가 여러 번 호출되면 마지막 호출만 실행됩니다.
 * 
 * @param func 실행할 함수
 * @param wait 대기 시간 (밀리초)
 * @param immediate 즉시 실행 여부 (true면 첫 호출 시 즉시 실행)
 * @returns 디바운싱된 함수
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait = 300,
  immediate = false
): { (...args: Parameters<T>): void; cancel: () => void } {
  let timeout: NodeJS.Timeout | null = null;
  
  // 디바운스 함수
  const debounced = function(this: any, ...args: Parameters<T>) {
    const context = this;
    
    // 타임아웃 취소 함수
    const later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    
    // 즉시 실행할지 여부
    const callNow = immediate && !timeout;
    
    // 이전 타임아웃 취소
    if (timeout) clearTimeout(timeout);
    
    // 새 타임아웃 설정
    timeout = setTimeout(later, wait);
    
    // 즉시 실행 조건인 경우 함수 실행
    if (callNow) func.apply(context, args);
  };
  
  // 타임아웃 취소 함수 추가
  debounced.cancel = function() {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };
  
  return debounced;
}

/**
 * 쓰로틀링 유틸리티 함수
 * 
 * 지정된 시간(ms) 동안 최대 한 번만 함수를 실행합니다.
 * 추가 호출이 있더라도 시간 내에는 무시됩니다.
 * 
 * @param func 실행할 함수
 * @param wait 제한 시간 (밀리초)
 * @param options 설정 객체 (leading: 첫 호출 실행 여부, trailing: 마지막 호출 실행 여부)
 * @returns 쓰로틀링된 함수
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait = 300,
  options = { leading: true, trailing: true }
): { (...args: Parameters<T>): void; cancel: () => void } {
  let timeout: NodeJS.Timeout | null = null;
  let previous = 0;
  let result: any;
  let context: any;
  let args: Parameters<T>;
  
  const later = function() {
    previous = options.leading === false ? 0 : Date.now();
    timeout = null;
    result = func.apply(context, args);
  };
  
  const throttled = function(this: any, ...params: Parameters<T>) {
    const now = Date.now();
    context = this;
    args = params;
    
    if (!previous && options.leading === false) previous = now;
    
    const remaining = wait - (now - previous);
    
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      
      previous = now;
      result = func.apply(context, args);
    } 
    else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining);
    }
    
    return result;
  };
  
  throttled.cancel = function() {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    previous = 0;
  };
  
  return throttled;
} 