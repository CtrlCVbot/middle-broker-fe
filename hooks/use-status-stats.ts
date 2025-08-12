import useSWR, { SWRConfiguration } from "swr";
import { toGroupStats, GroupStat, StatusCount } from "@/utils/status-group";

export type StatusStatsResponse = {
  totalCount: number;
  byStatus: StatusCount[];
  prevPeriodTotal?: number;
  prevPeriodByStatus?: StatusCount[];
};

export type StatusStatsParams = {
  date_from: string; // ISO(YYYY-MM-DD)
  date_to: string;   // ISO(YYYY-MM-DD) — 상한 미포함 권장
  tenant_id?: string;
  company_id?: string;
};

const fetcher = (url: string) => fetch(url).then(r => {
  if (!r.ok) throw new Error(`status-stats ${r.status}`);
  return r.json();
});

const buildKey = (p?: StatusStatsParams) =>
  p ? [
    "status-stats",
    p.date_from,
    p.date_to,
    p.tenant_id ?? "-",
    p.company_id ?? "-",
  ] as const : null;

const buildUrl = (p: StatusStatsParams) => {
  const qs = new URLSearchParams(p as any).toString();
  return `/api/dashboard/status-stats?${qs}`;
};

/**
 * 배차 상태 통계 데이터를 SWR로 조회하는 훅
 * @param params 조회 파라미터
 * @param options SWR 설정 옵션
 * @returns 상태 통계 데이터 및 상태
 */
export function useStatusStats(
  params: StatusStatsParams | undefined,
  options?: SWRConfiguration<StatusStatsResponse>
) {
  const key = buildKey(params);
  const { data, error, isValidating, mutate } = useSWR<StatusStatsResponse>(
    key,
    () => fetcher(buildUrl(params as StatusStatsParams)),
    {
      revalidateOnFocus: true,
      dedupingInterval: 10_000,
      keepPreviousData: true as any, // SWR v2: experimental, 이전 데이터 유지
      ...options,
    }
  );

  const grouped: GroupStat[] | undefined = data ? toGroupStats(data.byStatus) : undefined;
  const totalCount = data?.totalCount ?? 0;

  return {
    grouped,        // UI용 그룹 통계
    totalCount,     // 총 건수
    raw: data,      // 원본 응답(필요 시 사용)
    loading: !data && !error,
    error,
    isValidating,
    mutate,         // 수동 재검증/갱신
  };
} 