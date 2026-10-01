"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { getPerformanceMetrics } from "@/lib/actions/analytics"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatGridSkeleton } from "@/components/ui/data-skeletons"
import { BarChart3, Clock, Dumbbell, Weight } from "lucide-react"

interface PerformanceMetricsProps {
  userId: string
}

export function PerformanceMetrics({ userId }: PerformanceMetricsProps) {
  const t = useTranslations("analytics")
  const [metrics, setMetrics] = useState<{
    totalWorkouts: number
    totalVolume: number
    totalSets: number
    avgDuration: number
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const result = await getPerformanceMetrics(userId)
        setMetrics(result.data && typeof result.data === 'object' && 'totalWorkouts' in result.data ? result.data as any : null)
      } catch (error) {
        console.error("Failed to fetch performance metrics:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [userId])

  if (isLoading) {
    return <StatGridSkeleton />
  }

  if (!metrics) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("errorTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">{t("errorLoadingMetrics")}</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t("totalWorkouts")}</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalWorkouts}</div>
          <p className="text-xs text-muted-foreground">{t("totalWorkoutsCaption")}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t("totalVolume")}</CardTitle>
          <Weight className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalVolume.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">{t("totalVolumeCaption")}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t("totalSets")}</CardTitle>
          <Dumbbell className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalSets}</div>
          <p className="text-xs text-muted-foreground">{t("totalSetsCaption")}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t("avgWorkoutTime")}</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.avgDuration}m</div>
          <p className="text-xs text-muted-foreground">{t("avgWorkoutTimeCaption")}</p>
        </CardContent>
      </Card>
    </div>
  )
}
