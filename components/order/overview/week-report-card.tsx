"use client"

import { Card, CardContent } from "@/components/ui/card"
import { useEffect, useRef } from "react"

interface WeekReportCardProps {
  revenue: number
}

export function WeekReportCard({ revenue }: WeekReportCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    // Simple pie chart
    const width = canvasRef.current.width
    const height = canvasRef.current.height
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(width, height) / 2 - 5

    // Data for pie chart (example values)
    const data = [
      { value: 65, color: "#3b82f6" },
      { value: 35, color: "#ec4899" },
    ]

    let startAngle = 0

    data.forEach((segment) => {
      const segmentAngle = (segment.value / 100) * 2 * Math.PI

      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + segmentAngle)
      ctx.closePath()

      ctx.fillStyle = segment.color
      ctx.fill()

      startAngle += segmentAngle
    })
  }, [])

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Week Report</h3>
        <div className="mt-2 flex items-center justify-between">
          <div className="w-12 h-12">
            <canvas ref={canvasRef} width={50} height={50} className="w-full h-full"></canvas>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">${(revenue / 1000).toFixed(0)}k</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Revenue</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
