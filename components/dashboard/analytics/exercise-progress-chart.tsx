"use client"

import { useState, useEffect } from "react"
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useTranslations } from "next-intl"
import { getExerciseProgress } from "@/lib/actions/analytics"
import { getExercises } from "@/lib/actions/exercises"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"

interface ExerciseProgressChartProps {
  userId: string
}

export function ExerciseProgressChart({ userId }: ExerciseProgressChartProps) {
  const t = useTranslations("analytics")
  const [data, setData] = useState<any[]>([])
  const [exercises, setExercises] = useState<any[]>([])
  const [selectedExercise, setSelectedExercise] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [isExercisesLoading, setIsExercisesLoading] = useState(true)

  useEffect(() => {
    const fetchExercises = async () => {
      setIsExercisesLoading(true)
      try {
        const result = await getExercises()
        const exercisesData = Array.isArray(result.data) ? result.data : []
        setExercises(exercisesData)
        setSelectedExercise((prev) => prev || exercisesData[0]?.id || "")
      } catch (error) {
        console.error("Failed to fetch exercises:", error)
      } finally {
        setIsExercisesLoading(false)
      }
    }

    fetchExercises()
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedExercise) return

      setIsLoading(true)
      try {
        const result = await getExerciseProgress(userId, selectedExercise)
        setData(Array.isArray(result.data) ? result.data : [])
      } catch (error) {
        console.error("Failed to fetch exercise progress:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [userId, selectedExercise])

  const handleExerciseChange = (value: string) => {
    setSelectedExercise(value)
  }

  const getExerciseName = () => {
    const exercise = exercises.find((e) => e.id === selectedExercise)
    return exercise ? exercise.name : t("selectExercise")
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-0.5">
          <CardTitle>{t("exerciseProgressTitle")}</CardTitle>
          <CardDescription>{t("exerciseProgressDesc")}</CardDescription>
        </div>
        <Select value={selectedExercise} onValueChange={handleExerciseChange} disabled={isExercisesLoading}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t("selectExercise")} />
          </SelectTrigger>
          <SelectContent>
            {exercises.map((exercise) => (
              <SelectItem key={exercise.id} value={exercise.id}>
                {exercise.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {isLoading || isExercisesLoading ? (
          <Skeleton className="h-[300px] w-full rounded-lg" />
        ) : data.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            {t("noDataExercise", { exercise: getExerciseName() })}
          </div>
        ) : (
          <ChartContainer
            config={{
              weight: {
                label: t("weightLabel"),
                color: "hsl(var(--chart-1))",
              },
              volume: {
                label: t("volumeLabel"),
                color: "hsl(var(--chart-2))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" tickLine={false} axisLine={false} tickFormatter={(value: string | number) => `${value}`} />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value: string | number) => `${value}`}
                />
                <Tooltip content={<ChartTooltipContent indicator="dashed" />} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="weight"
                  stroke="var(--color-weight)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  name={t("weightLabel")}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="volume"
                  stroke="var(--color-volume)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  name={t("volumeLabel")}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
