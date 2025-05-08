import { ArrowUpRight } from "lucide-react"

interface OverviewTopCardProps {
  conversionRate: number | undefined;
}



export function OverviewTopCard({ conversionRate }: OverviewTopCardProps) {
  const formattedRate = typeof conversionRate === "number" ? conversionRate.toFixed(2) : 0;
  console.log("typeof conversionRate", typeof conversionRate);
  return (
    <div className="relative text-white px-4 pt-2 pb-0 rounded-lg">
      {/* 제목 */}
      {/* <h1 className="text-2xl font-bold">Website Overview</h1> */}

      {/* 통계 정보 */}
      <div className="absolute right-4 top-1 flex items-center gap-2 text-emerald-400">
        <ArrowUpRight className="h-5 w-5" />
        <span className="font-medium">
          합계 <span className="text-black">{formattedRate}%</span> 수익률
        </span>
      </div>
    </div>
  );
}