"use client"

import { useState, useEffect } from "react"
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useTranslations } from "next-intl"
import { getWorkoutFrequency } from "@/lib/actions/analytics"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"

interface WorkoutFrequencyChartProps {
  userId: string
}

export function WorkoutFrequencyChart({ userId }: WorkoutFrequencyChartProps) {
  const t = useTranslations("analytics")
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState<"week" | "month" | "year">("month")

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const result = await getWorkoutFrequency(userId, period)
        setData(Array.isArray(result.data) ? result.data : [])
      } catch (error) {
        console.error("Failed to fetch workout frequency:", error)
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
          <CardTitle>{t("workoutFrequencyTitle")}</CardTitle>
          <CardDescription>{t("workoutFrequencyDesc")}</CardDescription>
        </div>
        <Select defaultValue={period} onValueChange={handlePeriodChange}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder={t("selectPeriod")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">{t("lastWeek")}</SelectItem>
            <SelectItem value="month">{t("lastMonth")}</SelectItem>
            <SelectItem value="year">{t("lastYear")}</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[300px] w-full rounded-lg" />
        ) : data.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            {t("noDataPeriod")}
          </div>
        ) : (
          <ChartContainer
            config={{
              count: {
                label: t("workoutsLabel"),
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(value: string | number) => `${value}`} />
                <Tooltip content={<ChartTooltipContent indicator="dashed" />} />
                <Bar dataKey="count" fill="var(--color-count)" radius={4} name={t("workoutsLabel")}>
                  {data.map((_, index) => (
                    <Cell
                      key={index}
                      fill={
                        index === data.length - 1
                          ? "hsl(var(--primary))"
                          : "hsl(var(--chart-2))"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
