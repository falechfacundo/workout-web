"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Play, Pause, RotateCcw, Timer } from "lucide-react"
import { cn } from "@/lib/utils"

interface WorkoutTimerProps {
  defaultRestTime?: number // in seconds
  onTimerComplete?: () => void
  className?: string
}

export function WorkoutTimer({ defaultRestTime = 90, onTimerComplete, className }: WorkoutTimerProps) {
  const [isActive, setIsActive] = useState(false)
  const [isPaused, setIsPaused] = useState(true)
  const [time, setTime] = useState(0)
  const [restTime, setRestTime] = useState(defaultRestTime)
  const [isRestTimer, setIsRestTimer] = useState(false)
  const countRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const handleTimerComplete = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().catch((e) => console.error("Error playing audio:", e))
    }
    setIsPaused(true)
    onTimerComplete?.()
  }, [onTimerComplete])

  const handleTimerCompleteRef = useRef(handleTimerComplete)
  useEffect(() => {
    handleTimerCompleteRef.current = handleTimerComplete
  }, [handleTimerComplete])

  useEffect(() => {
    // Initialize audio
    audioRef.current = new Audio("/sounds/timer-complete.mp3")

    return () => {
      // Cleanup
      if (countRef.current) {
        clearInterval(countRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (isActive && !isPaused) {
      countRef.current = setInterval(() => {
        setTime((time) => time + 1)
      }, 1000)
    } else if (countRef.current) {
      clearInterval(countRef.current)
    }

    return () => {
      if (countRef.current) {
        clearInterval(countRef.current)
      }
    }
  }, [isActive, isPaused])

  // Detectar la finalización del descanso cuando el tiempo alcanza el límite
  useEffect(() => {
    if (isActive && !isPaused && isRestTimer && time >= restTime) {
      handleTimerCompleteRef.current()
    }
  }, [isActive, isPaused, isRestTimer, time, restTime])

  const handleStart = () => {
    setIsActive(true)
    setIsPaused(false)
  }

  const handlePause = () => {
    setIsPaused(true)
  }

  const handleResume = () => {
    setIsPaused(false)
  }

  const handleReset = () => {
    setIsActive(false)
    setTime(0)
  }

  const startRestTimer = (seconds: number = defaultRestTime) => {
    setRestTime(seconds)
    setIsRestTimer(true)
    setTime(0)
    setIsActive(true)
    setIsPaused(false)
  }

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60)
    const seconds = timeInSeconds % 60
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  const getProgressPercentage = () => {
    if (isRestTimer) {
      return Math.min(100, (time / restTime) * 100)
    }
    return 0
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-0">
        <div className="relative">
          {isRestTimer && (
            <div
              className="absolute bottom-0 left-0 h-1 bg-primary transition-all"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          )}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-muted-foreground" />
              <div className="text-xl font-mono font-medium">{formatTime(time)}</div>
              {isRestTimer && (
                <span className="text-xs text-muted-foreground">Rest: {formatTime(restTime - time)} remaining</span>
              )}
            </div>
            <div className="flex gap-2">
              {!isActive ? (
                <Button size="sm" onClick={handleStart}>
                  <Play className="mr-1 h-4 w-4" />
                  Start
                </Button>
              ) : isPaused ? (
                <Button size="sm" onClick={handleResume}>
                  <Play className="mr-1 h-4 w-4" />
                  Resume
                </Button>
              ) : (
                <Button size="sm" variant="outline" onClick={handlePause}>
                  <Pause className="mr-1 h-4 w-4" />
                  Pause
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={handleReset}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-1 border-t p-2">
            <Button size="sm" variant="outline" className="h-8" onClick={() => startRestTimer(30)}>
              30s
            </Button>
            <Button size="sm" variant="outline" className="h-8" onClick={() => startRestTimer(60)}>
              60s
            </Button>
            <Button size="sm" variant="outline" className="h-8" onClick={() => startRestTimer(90)}>
              90s
            </Button>
            <Button size="sm" variant="outline" className="h-8" onClick={() => startRestTimer(120)}>
              2m
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
