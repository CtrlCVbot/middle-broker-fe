export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('ko-KR').format(num);
}; 