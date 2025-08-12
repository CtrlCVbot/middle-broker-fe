import useSWR, { SWRConfiguration } from "swr";

export type TrendPoint = { 
  date: string; 
  orderCount: number; 
  orderAmount: number; 
};

export type TrendsResponse = { 
  success: boolean;
  data: {
    period: { from: string; to: string }; 
    points: TrendPoint[]; 
    meta: { currency: 'KRW' } 
  };
};

export type TrendsParams = { 
  date_from: string; 
  date_to: string; 
  tenant_id?: string; 
  company_id?: string; 
  recommended_only?: boolean; 
};

const fetcher = (url: string) => fetch(url).then(r => {
  if (!r.ok) throw new Error(`trends ${r.status}`);
  return r.json();
});

const buildKey = (p?: TrendsParams) =>
  p ? [
    "trends",
    p.date_from,
    p.date_to,
    p.tenant_id ?? "-",
    p.company_id ?? "-",
    String(!!p.recommended_only),
  ] as const : null;

const buildUrl = (p: TrendsParams) => {
  const params = {
    ...p,
    recommended_only: String(!!p.recommended_only)
  };
  const qs = new URLSearchParams(params as any).toString();
  return `/api/dashboard/trends?${qs}`;
};

/**
 * 운송추이 데이터를 SWR로 조회하는 훅
 * @param params 조회 파라미터
 * @param options SWR 설정 옵션
 * @returns 운송추이 데이터 및 상태
 */
export function useTransportTrends(
  params: TrendsParams | undefined,
  options?: SWRConfiguration<TrendsResponse>
) {
  const key = buildKey(params);
  const { data, error, isValidating, mutate } = useSWR<TrendsResponse>(
    key,
    () => fetcher(buildUrl(params as TrendsParams)),
    {
      revalidateOnFocus: true,
      dedupingInterval: 10_000,
      keepPreviousData: true as any, // SWR v2: experimental, 이전 데이터 유지
      ...options,
    }
  );

  return {
    data,
    points: data?.data?.points ?? [],
    loading: !data && !error,
    error,
    isValidating,
    mutate,
  };
} 