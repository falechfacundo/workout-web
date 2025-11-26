"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

interface MuscleGroupVolumeChartProps {
  data: any[]
}

export function MuscleGroupVolumeChart({ data }: MuscleGroupVolumeChartProps) {
  if (!data || data.length === 0) {
    return <div className="flex h-full items-center justify-center text-muted-foreground">No data available</div>
  }

  return (
    <ChartContainer
      config={{
        volume: {
          label: "Volume",
          color: "hsl(var(--chart-1))",
        },
        sets: {
          label: "Sets",
          color: "hsl(var(--chart-2))",
        },
      }}
      className="h-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tickLine={false} axisLine={false} />
          <YAxis yAxisId="left" tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
          <YAxis
            yAxisId="right"
            orientation="right"
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value.toFixed(1)}`}
          />
          <Tooltip content={<ChartTooltipContent indicator="dashed" />} />
          <Bar yAxisId="left" dataKey="volume" fill="var(--color-volume)" radius={4} name="Volume" />
          <Bar yAxisId="right" dataKey="sets" fill="var(--color-sets)" radius={4} name="Sets" />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
