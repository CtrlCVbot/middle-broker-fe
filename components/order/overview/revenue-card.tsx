"use client"

import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"
import { useEffect, useRef } from "react"

interface RevenueCardProps {
  revenue: number
  changePercentage: number
}

export function RevenueCard({ revenue, changePercentage }: RevenueCardProps) {
  const isPositive = changePercentage >= 0
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    // Simple line chart
    const width = canvasRef.current.width
    const height = canvasRef.current.height

    ctx.clearRect(0, 0, width, height)
    ctx.strokeStyle = "#0ea5e9"
    ctx.lineWidth = 2
    ctx.beginPath()

    // Generate some random data points
    const points = 10
    const data = Array.from({ length: points }, () => Math.random() * 0.5 + 0.2)

    for (let i = 0; i < points; i++) {
      const x = (width / (points - 1)) * i
      const y = height - height * data[i]

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }

    ctx.stroke()
  }, [])

  return (
    <Card>
      <CardContent>
        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Today's Revenue</h3>
        <div className="flex items-center justify-between mt-2">
          <div className="mt-4 h-10">
            <canvas ref={canvasRef} width={50} height={50} className="w-full h-full"></canvas>
          </div>
          <div className="text-right">
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">${revenue.toLocaleString()}</p>
          <div className="flex items-center mt-1">
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
