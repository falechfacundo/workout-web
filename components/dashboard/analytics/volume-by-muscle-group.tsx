"use client"

import { useState, useEffect } from "react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { getVolumeByMuscleGroup } from "@/lib/actions/analytics"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

interface VolumeByMuscleGroupProps {
  userId: string
}

export function VolumeByMuscleGroup({ userId }: VolumeByMuscleGroupProps) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState<"week" | "month" | "year">("month")

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const volumeData = await getVolumeByMuscleGroup(userId, period)
        setData(volumeData)
      } catch (error) {
        console.error("Failed to fetch volume data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [userId, period])

  const handlePeriodChange = (value: string) => {
    setPeriod(value as "week" | "month" | "year")
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-0.5">
          <CardTitle>Volume by Muscle Group</CardTitle>
          <CardDescription>Total training volume (sets × reps) per muscle group</CardDescription>
        </div>
        <Select defaultValue={period} onValueChange={handlePeriodChange}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Last Week</SelectItem>
            <SelectItem value="month">Last Month</SelectItem>
            <SelectItem value="year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-[300px] items-center justify-center">Loading...</div>
        ) : data.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No data available for this period
          </div>
        ) : (
          <ChartContainer
            config={{
              volume: {
                label: "Volume",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                <Tooltip content={<ChartTooltipContent indicator="dashed" />} />
                <Bar dataKey="volume" fill="var(--color-volume)" radius={4} name="Volume" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
