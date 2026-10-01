"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import Model, {
  type IExerciseData,
  type IMuscleStats,
  type Muscle,
} from "react-body-highlighter";

import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface BodyMapProps {
  intensityByName: Record<string, number>;
  formatStat?: (name: string) => string;
  className?: string;
}

// Our muscle-group region names (from getMuscleVolumeByRegion) mapped to the
// anatomical slugs react-body-highlighter's SVG model knows about. A few of
// our regions collapse onto the same slug because the model only has one
// shape for that area (e.g. Upper/Lower Chest both highlight "chest").
const REGION_TO_MUSCLE: Record<string, Muscle> = {
  Trapezius: "trapezius",
  "Front Delts": "front-deltoids",
  "Rear Delts": "back-deltoids",
  "Upper Chest": "chest",
  "Lower Chest": "chest",
  Biceps: "biceps",
  Triceps: "triceps",
  Forearms: "forearm",
  Abs: "abs",
  Obliques: "obliques",
  Quadriceps: "quadriceps",
  Hamstrings: "hamstring",
  Calves: "calves",
  Glutes: "gluteal",
  Lats: "upper-back",
  "Middle Back": "upper-back",
  "Lower Back": "lower-back",
};

const INTENSITY_STEPS = 10;
const HIGHLIGHTED_COLORS = Array.from({ length: INTENSITY_STEPS }, (_, i) =>
  `hsl(var(--primary) / ${(0.2 + (0.8 * (i + 1)) / INTENSITY_STEPS).toFixed(2)})`
);
const BODY_COLOR = "hsl(var(--muted))";

function buildExerciseData(
  intensityByName: Record<string, number>,
  formatStat?: (name: string) => string
): IExerciseData[] {
  const byMuscle = new Map<Muscle, { intensity: number; label: string }>();

  for (const [region, intensity] of Object.entries(intensityByName)) {
    if (intensity <= 0) continue;
    const muscle = REGION_TO_MUSCLE[region];
    if (!muscle) continue;

    const existing = byMuscle.get(muscle);
    if (!existing || intensity > existing.intensity) {
      byMuscle.set(muscle, {
        intensity,
        label: formatStat ? formatStat(region) : region,
      });
    }
  }

  return Array.from(byMuscle.entries()).map(([muscle, { intensity, label }]) => ({
    name: label,
    muscles: [muscle],
    frequency: Math.max(
      1,
      Math.min(INTENSITY_STEPS, Math.ceil(intensity * INTENSITY_STEPS))
    ),
  }));
}

export function BodyMap({ intensityByName, formatStat, className }: BodyMapProps) {
  const t = useTranslations("bodyMap");

  const data = useMemo(
    () => buildExerciseData(intensityByName, formatStat),
    [intensityByName, formatStat]
  );

  const handleClick = ({ data: stat }: IMuscleStats) => {
    const label = stat.exercises[stat.exercises.length - 1];
    if (label) toast({ description: label });
  };

  return (
    <div className={cn("flex flex-wrap items-start justify-center gap-6", className)}>
      <div className="flex flex-col items-center gap-2">
        <div className="w-[220px]" role="img" aria-label={t("frontAlt")}>
          <Model
            type="anterior"
            data={data}
            highlightedColors={HIGHLIGHTED_COLORS}
            bodyColor={BODY_COLOR}
            onClick={handleClick}
          />
        </div>
        <span className="text-xs uppercase tracking-widest text-muted-foreground">
          {t("frontal")}
        </span>
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="w-[220px]" role="img" aria-label={t("backAlt")}>
          <Model
            type="posterior"
            data={data}
            highlightedColors={HIGHLIGHTED_COLORS}
            bodyColor={BODY_COLOR}
            onClick={handleClick}
          />
        </div>
        <span className="text-xs uppercase tracking-widest text-muted-foreground">
          {t("posterior")}
        </span>
      </div>
    </div>
  );
}

export function BodyMapLegend() {
  const t = useTranslations("bodyMap");

  return (
    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
      <span>{t("less")}</span>
      <div className="flex h-2 overflow-hidden rounded-full">
        {[0.25, 0.45, 0.65, 0.85, 1].map((step) => (
          <span
            key={step}
            className="h-2 w-5"
            style={{ backgroundColor: `hsl(var(--primary) / ${step})` }}
          />
        ))}
      </div>
      <span>{t("more")}</span>
    </div>
  );
}
