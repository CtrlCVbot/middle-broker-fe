/**
 * KST 기준 날짜 계산 유틸리티
 * 브라우저 타임존과 무관하게 KST 기준으로 일관된 날짜 계산
 */

/**
 * KST 기준 이번 달 범위 계산
 * @param date 기준일 (기본: 현재 날짜)
 * @returns KST 기준 월 범위 (from, to)
 */
export function kstMonthRangeBy(date = new Date()) {
  const KST_OFFSET = 9 * 60; // minutes
  const toKst = (d: Date) => new Date(d.getTime() + (KST_OFFSET - d.getTimezoneOffset()) * 60000);

  const kstNow = toKst(date);
  const y = kstNow.getFullYear();
  const m = kstNow.getMonth(); // 0-11

  const startKst = new Date(Date.UTC(y, m, 1, 0, 0, 0));      // 1일 00:00:00 KST
  const endOfMonthKst = new Date(Date.UTC(y, m + 1, 0, 23, 59, 59)); // 말일 23:59:59 KST

  const isCurrentMonth = (new Date()).getFullYear() === y && (new Date()).getMonth() === m;
  const endKst = isCurrentMonth ? kstNow : endOfMonthKst;

  return { from: startKst.toISOString(), to: endKst.toISOString() };
}

/**
 * YYYY-MM-DD 형식으로 날짜 포맷
 * @param date 날짜 (기본: 현재 날짜)
 * @returns YYYY-MM-DD 형식 문자열
 */
export function ymd(date = new Date()) {
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * KST 기준 현재 날짜를 YYYY-MM-DD 형식으로 반환
 * @returns KST 기준 오늘 날짜 (YYYY-MM-DD)
 */
export function kstToday() {
  return ymd(new Date());
} 