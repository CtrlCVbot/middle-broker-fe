import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"

interface OrderCardProps {
  ordersNumber: number
  changePercentage: number
  progress: number
}

export function OrderCard({ ordersNumber, changePercentage, progress }: OrderCardProps) {
  const isPositive = changePercentage >= 0

  return (
    <Card>
      <CardContent>
        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">운송 요청 수</h3>
        <div className="flex items-center justify-between mt-2">
          <div className="relative w-16 h-16">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle
                className="text-slate-200 dark:text-slate-700"
                strokeWidth="10"
                stroke="currentColor"
                fill="transparent"
                r="40"
                cx="50"
                cy="50"
              />
              <circle
                className="text-blue-500 dark:text-blue-400"
                strokeWidth="10"
                strokeDasharray={`${progress * 2.51} 251`}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="40"
                cx="50"
                cy="50"
              />
              <text
                x="50%"
                y="50%"
                dominantBaseline="middle"
                textAnchor="middle"
                className="text-sm font-medium fill-slate-700 dark:fill-slate-300"
              >
                {progress}%
              </text>
            </svg>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{ordersNumber.toLocaleString()}</p>
            <div className="flex items-center justify-end mt-1">
              {isPositive ? (
                <TrendingUp className="h-4 w-4 text-emerald-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${isPositive ? "text-emerald-500" : "text-red-500"}`}>
                {Math.abs(changePercentage).toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
