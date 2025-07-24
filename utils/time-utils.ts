/**
 * 시간 관련 유틸리티 함수들
 */

/**
 * 00:00부터 23:50까지 10분 단위로 시간 옵션 생성
 * @returns 시간 옵션 배열 (예: ["00:00", "00:10", "00:20", ...])
 */
export const generateTimeOptions = (): string[] => {
  const options: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 10) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      options.push(timeString);
    }
  }
  return options;
};

/**
 * 분 단위를 00분 또는 30분으로 조정
 * - 00~14분 → 00분
 * - 15~44분 → 30분  
 * - 45~59분 → 다음 시간 00분
 * @param date 조정할 날짜 객체
 * @returns 조정된 날짜 객체
 */
export const adjustMinutesToHalfHour = (date: Date): Date => {
  const adjusted = new Date(date);
  const minutes = date.getMinutes();
  
  if (minutes >= 0 && minutes < 15) {
    adjusted.setMinutes(0);
  } else if (minutes >= 15 && minutes < 45) {
    adjusted.setMinutes(30);
  } else { // 45~59분
    adjusted.setMinutes(0);
    adjusted.setHours(adjusted.getHours() + 1);
  }
  
  adjusted.setSeconds(0);
  adjusted.setMilliseconds(0);
  return adjusted;
};

/**
 * 주어진 시간과 가장 가까운 10분 단위 시간 찾기
 * @param timeString 시간 문자열 (예: "14:23")
 * @returns 가장 가까운 10분 단위 시간 (예: "14:20")
 */
export const findNearestTenMinuteTime = (timeString: string): string => {
  const [hourStr, minuteStr] = timeString.split(':');
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);
  
  // 가장 가까운 10분 단위로 반올림
  const roundedMinute = Math.round(minute / 10) * 10;
  
  // 60분이 되면 다음 시간으로
  if (roundedMinute >= 60) {
    const nextHour = (hour + 1) % 24;
    return `${nextHour.toString().padStart(2, '0')}:00`;
  }
  
  return `${hour.toString().padStart(2, '0')}:${roundedMinute.toString().padStart(2, '0')}`;
};

// 시간 옵션을 미리 생성 (성능 최적화)
export const TIME_OPTIONS = generateTimeOptions(); 