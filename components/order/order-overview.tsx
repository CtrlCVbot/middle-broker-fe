import { OverviewTopCard } from "@/components/order/overview/overview-top-card"
import { OrderCard } from "@/components/order/overview/order-card"
import { RevenueCard } from "@/components/order/overview/revenue-card"
import { AverageValueCard } from "@/components/order/overview/average-value-card"
import { SpendingCard } from "@/components/order/overview/spending-card"
import { EarningsCard } from "@/components/order/overview/earning-card"
import { WeekReportCard } from "@/components/order/overview/week-report-card"

export function OrderOverview() {
  return (
    <div className="p-6 bg-slate-50 dark:bg-slate-900">
      <OverviewTopCard conversionRate={30.5} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mt-4">
        <OrderCard ordersNumber={2095} changePercentage={4.09} progress={63} />
        <RevenueCard revenue={12095} changePercentage={-5.08} />
        {/* <AverageValueCard value={80.5} /> */}
        <SpendingCard expenses={12095} />
        <EarningsCard current={12095} target={45000} />
        <WeekReportCard revenue={14000} />
      </div>
    </div>
  )
}
