import { GROUPED_ORDER_FLOW, GroupLabel, OrderStatusType } from "@/types/order";

export type StatusCount = { status: OrderStatusType; count: number };
export type GroupStat = { label: GroupLabel; count: number; percentage: number };

// GROUPED_ORDER_FLOW가 undefined일 경우를 대비한 fallback
const FALLBACK_GROUPED_ORDER_FLOW = [
  { label: "운송요청" as const, statuses: ["운송요청"] },
  { label: "배차중" as const, statuses: ["배차대기", "배차완료"] },
  { label: "운송중" as const, statuses: ["상차대기", "상차완료", "운송중"] },
  { label: "운송완료" as const, statuses: ["하차완료", "운송완료"] },
];

const safeGroupedOrderFlow = GROUPED_ORDER_FLOW || FALLBACK_GROUPED_ORDER_FLOW;

const groupMap = new Map<GroupLabel, Set<OrderStatusType>>(
  safeGroupedOrderFlow.map(g => [g.label, new Set(g.statuses as unknown as OrderStatusType[])])
);

/**
 * 상태별 통계를 그룹별로 변환하는 함수
 * @param byStatus 상태별 통계 데이터
 * @returns 그룹별 통계 데이터
 */
export function toGroupStats(byStatus: StatusCount[]): GroupStat[] {
  // 안전성 검사
  if (!byStatus || !Array.isArray(byStatus)) {
    console.log("byStatus", byStatus);
    return [];
  }

  const sums = new Map<GroupLabel, number>();
  safeGroupedOrderFlow.forEach(g => sums.set(g.label, 0));

  byStatus.forEach(({ status, count }) => {
    for (const [label, set] of groupMap) {
      if (set.has(status)) {
        sums.set(label, (sums.get(label) || 0) + count);
        break;
      }
    }
  });

  const total = Array.from(sums.values()).reduce((a, b) => a + b, 0) || 1;
  console.log("total", total);
  return safeGroupedOrderFlow.map(g => ({
    label: g.label,
    count: sums.get(g.label) || 0,
    percentage: Math.round(((sums.get(g.label) || 0) / total) * 1000) / 10,
  }));
} 