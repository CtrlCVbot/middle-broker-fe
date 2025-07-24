"use client"

import { Card, CardContent } from "@/components/ui/card"
import { useEffect, useRef } from "react"

interface SpendingCardProps {
  expenses: number
}

export function SpendingCard({ expenses }: SpendingCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    // Simple area chart
    const width = canvasRef.current.width
    const height = canvasRef.current.height

    ctx.clearRect(0, 0, width, height)

    // Generate some random data points
    const points = 10
    const data = Array.from({ length: points }, () => Math.random() * 0.5 + 0.2)

    ctx.fillStyle = "rgba(249, 115, 22, 0.2)"
    ctx.strokeStyle = "#f97316"
    ctx.lineWidth = 2
    ctx.beginPath()

    for (let i = 0; i < points; i++) {
      const x = (width / (points - 1)) * i
      const y = height - height * data[i]

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }

    // Complete the area
    ctx.lineTo(width, height)
    ctx.lineTo(0, height)
    ctx.closePath()
    ctx.fill()

    // Draw the line
    ctx.beginPath()
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
      <CardContent className="p-6">
        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">All Spending</h3>
        <div className="mt-2">
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">${expenses.toLocaleString()}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Expenses</p>
        </div>
        <div className="mt-4 h-10">
          <canvas ref={canvasRef} width={100} height={40} className="w-full h-full"></canvas>
        </div>
      </CardContent>
    </Card>
  )
}
