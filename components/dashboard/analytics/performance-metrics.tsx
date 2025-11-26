"use client"

import { useState, useEffect } from "react"
import { getPerformanceMetrics } from "@/lib/actions/analytics"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Clock, Dumbbell, Weight } from "lucide-react"

interface PerformanceMetricsProps {
  userId: string
}

export function PerformanceMetrics({ userId }: PerformanceMetricsProps) {
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
        const data = await getPerformanceMetrics(userId)
        setMetrics(data)
      } catch (error) {
        console.error("Failed to fetch performance metrics:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [userId])

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">Failed to load metrics</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Workouts</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalWorkouts}</div>
          <p className="text-xs text-muted-foreground">Completed training sessions</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
          <Weight className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalVolume.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Weight × reps across all workouts</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Sets</CardTitle>
          <Dumbbell className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalSets}</div>
          <p className="text-xs text-muted-foreground">Sets performed across all workouts</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg. Workout Time</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.avgDuration}m</div>
          <p className="text-xs text-muted-foreground">Average workout duration</p>
        </CardContent>
      </Card>
    </div>
  )
}
