import { GROUPED_ORDER_FLOW, GroupLabel, OrderStatusType } from "@/types/order";

export type StatusCount = { status: OrderStatusType; count: number };
export type GroupStat = { label: GroupLabel; count: number; percentage: number };

const groupMap = new Map<GroupLabel, Set<OrderStatusType>>(
  GROUPED_ORDER_FLOW.map(g => [g.label, new Set(g.statuses as OrderStatusType[])])
);

/**
 * 상태별 통계를 그룹별로 변환하는 함수
 * @param byStatus 상태별 통계 데이터
 * @returns 그룹별 통계 데이터
 */
export function toGroupStats(byStatus: StatusCount[]): GroupStat[] {
  const sums = new Map<GroupLabel, number>();
  GROUPED_ORDER_FLOW.forEach(g => sums.set(g.label, 0));

  byStatus.forEach(({ status, count }) => {
    for (const [label, set] of groupMap) {
      if (set.has(status)) {
        sums.set(label, (sums.get(label) || 0) + count);
        break;
      }
    }
  });

  const total = Array.from(sums.values()).reduce((a, b) => a + b, 0) || 1;
  return GROUPED_ORDER_FLOW.map(g => ({
    label: g.label,
    count: sums.get(g.label) || 0,
    percentage: Math.round(((sums.get(g.label) || 0) / total) * 1000) / 10,
  }));
} 