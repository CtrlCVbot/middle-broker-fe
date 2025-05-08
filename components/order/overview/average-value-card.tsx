import { Card, CardContent } from "@/components/ui/card"
import { cn, formatCurrency } from "@/lib/utils"

interface AverageValueCardProps {
  value: number
  valueColor: string
  label: string
  memo: string
}

export function AverageValueCard({ value, valueColor, label, memo }: AverageValueCardProps) {
  return (
    <Card className="m-0 p-0">
      <CardContent className="m-0 px-6 py-2">
        
        <div className="mt-2 flex items-center">
          <div className={cn("w-1 h-10 bg-" + valueColor + " rounded-full mr-2")}></div>
          <div>
            <p className="text-md font-bold text-slate-800 dark:text-slate-100">
            {formatCurrency(value)}원
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{memo}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}