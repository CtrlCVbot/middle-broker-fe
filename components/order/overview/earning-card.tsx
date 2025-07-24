import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface EarningsCardProps {
  current: number
  target: number
}

export function EarningsCard({ current, target }: EarningsCardProps) {
  const progressPercentage = (current / target) * 100

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Expected Earnings</h3>
        <div className="mt-2 space-y-4">
          <div className="flex justify-between">
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">${current.toLocaleString()}</p>
            <p className="text-2xl font-bold text-slate-400">${target.toLocaleString()}</p>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </CardContent>
    </Card>
  )
}
