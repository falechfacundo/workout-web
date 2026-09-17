"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface BodyMapProps {
  intensityByName: Record<string, number>;
  formatStat?: (name: string) => string;
  className?: string;
}

interface RegionProps {
  name: string;
  intensity: number;
  formatStat?: (name: string) => string;
  children: ReactNode;
}

function Region({ name, intensity, formatStat, children }: RegionProps) {
  const fill =
    intensity > 0
      ? `hsl(var(--primary) / ${(0.25 + 0.75 * intensity).toFixed(2)})`
      : "hsl(var(--muted))";

  return (
    <g
      fill={fill}
      stroke="hsl(var(--border))"
      strokeWidth={1}
      style={{ opacity: intensity > 0 ? 1 : 0.55, transition: "fill 300ms" }}
    >
      <title>{formatStat ? formatStat(name) : name}</title>
      {children}
    </g>
  );
}

function NeutralPart({ children }: { children: ReactNode }) {
  return (
    <g fill="hsl(var(--accent))" stroke="hsl(var(--border))" strokeWidth={1}>
      {children}
    </g>
  );
}

export function BodyMap({
  intensityByName,
  formatStat,
  className,
}: BodyMapProps) {
  const intensity = (name: string) => intensityByName[name] ?? 0;

  return (
    <div className={cn("flex flex-wrap items-start justify-center gap-6", className)}>
      <div className="flex flex-col items-center gap-2">
        <svg
          viewBox="0 0 200 480"
          className="h-[380px] w-auto"
          role="img"
          aria-label="Mapa muscular frontal"
        >
          <NeutralPart>
            <circle cx={100} cy={38} r={26} />
            <circle cx={26} cy={248} r={9} />
            <circle cx={174} cy={248} r={9} />
            <rect x={78} y={232} width={44} height={16} rx={7} />
            <circle cx={78} cy={368} r={10} />
            <circle cx={122} cy={368} r={10} />
            <ellipse cx={72} cy={456} rx={15} ry={9} />
            <ellipse cx={128} cy={456} rx={15} ry={9} />
          </NeutralPart>

          <Region name="Trapezius" intensity={intensity("Trapezius")} formatStat={formatStat}>
            <ellipse cx={100} cy={78} rx={34} ry={14} />
          </Region>
          <Region name="Front Delts" intensity={intensity("Front Delts")} formatStat={formatStat}>
            <circle cx={58} cy={96} r={17} />
            <circle cx={142} cy={96} r={17} />
          </Region>
          <Region name="Upper Chest" intensity={intensity("Upper Chest")} formatStat={formatStat}>
            <ellipse cx={76} cy={122} rx={24} ry={17} />
            <ellipse cx={124} cy={122} rx={24} ry={17} />
          </Region>
          <Region name="Lower Chest" intensity={intensity("Lower Chest")} formatStat={formatStat}>
            <ellipse cx={76} cy={152} rx={24} ry={15} />
            <ellipse cx={124} cy={152} rx={24} ry={15} />
          </Region>
          <Region name="Biceps" intensity={intensity("Biceps")} formatStat={formatStat}>
            <ellipse cx={40} cy={142} rx={14} ry={28} />
            <ellipse cx={160} cy={142} rx={14} ry={28} />
          </Region>
          <Region name="Forearms" intensity={intensity("Forearms")} formatStat={formatStat}>
            <ellipse cx={30} cy={202} rx={12} ry={34} />
            <ellipse cx={170} cy={202} rx={12} ry={34} />
          </Region>
          <Region name="Abs" intensity={intensity("Abs")} formatStat={formatStat}>
            <rect x={82} y={172} width={36} height={58} rx={8} />
          </Region>
          <Region name="Obliques" intensity={intensity("Obliques")} formatStat={formatStat}>
            <rect x={56} y={146} width={14} height={82} rx={7} />
            <rect x={130} y={146} width={14} height={82} rx={7} />
          </Region>
          <Region name="Quadriceps" intensity={intensity("Quadriceps")} formatStat={formatStat}>
            <ellipse cx={78} cy={306} rx={22} ry={52} />
            <ellipse cx={122} cy={306} rx={22} ry={52} />
          </Region>
          <Region name="Calves" intensity={intensity("Calves")} formatStat={formatStat}>
            <ellipse cx={78} cy={412} rx={15} ry={32} />
            <ellipse cx={122} cy={412} rx={15} ry={32} />
          </Region>
        </svg>
        <span className="text-xs uppercase tracking-widest text-muted-foreground">
          Frontal
        </span>
      </div>

      <div className="flex flex-col items-center gap-2">
        <svg
          viewBox="0 0 200 480"
          className="h-[380px] w-auto"
          role="img"
          aria-label="Mapa muscular posterior"
        >
          <NeutralPart>
            <circle cx={100} cy={38} r={26} />
            <circle cx={26} cy={248} r={9} />
            <circle cx={174} cy={248} r={9} />
            <rect x={78} y={232} width={44} height={16} rx={7} />
            <circle cx={78} cy={368} r={10} />
            <circle cx={122} cy={368} r={10} />
            <ellipse cx={72} cy={456} rx={15} ry={9} />
            <ellipse cx={128} cy={456} rx={15} ry={9} />
          </NeutralPart>

          <Region name="Trapezius" intensity={intensity("Trapezius")} formatStat={formatStat}>
            <ellipse cx={100} cy={80} rx={34} ry={16} />
          </Region>
          <Region name="Rear Delts" intensity={intensity("Rear Delts")} formatStat={formatStat}>
            <circle cx={58} cy={96} r={17} />
            <circle cx={142} cy={96} r={17} />
          </Region>
          <Region name="Lats" intensity={intensity("Lats")} formatStat={formatStat}>
            <ellipse cx={64} cy={152} rx={30} ry={48} />
            <ellipse cx={136} cy={152} rx={30} ry={48} />
          </Region>
          <Region name="Middle Back" intensity={intensity("Middle Back")} formatStat={formatStat}>
            <rect x={84} y={124} width={32} height={70} rx={8} />
          </Region>
          <Region name="Lower Back" intensity={intensity("Lower Back")} formatStat={formatStat}>
            <rect x={84} y={200} width={32} height={42} rx={8} />
          </Region>
          <Region name="Triceps" intensity={intensity("Triceps")} formatStat={formatStat}>
            <ellipse cx={40} cy={142} rx={14} ry={28} />
            <ellipse cx={160} cy={142} rx={14} ry={28} />
          </Region>
          <Region name="Forearms" intensity={intensity("Forearms")} formatStat={formatStat}>
            <ellipse cx={30} cy={202} rx={12} ry={34} />
            <ellipse cx={170} cy={202} rx={12} ry={34} />
          </Region>
          <Region name="Glutes" intensity={intensity("Glutes")} formatStat={formatStat}>
            <ellipse cx={78} cy={268} rx={24} ry={24} />
            <ellipse cx={122} cy={268} rx={24} ry={24} />
          </Region>
          <Region name="Hamstrings" intensity={intensity("Hamstrings")} formatStat={formatStat}>
            <ellipse cx={78} cy={330} rx={21} ry={42} />
            <ellipse cx={122} cy={330} rx={21} ry={42} />
          </Region>
          <Region name="Calves" intensity={intensity("Calves")} formatStat={formatStat}>
            <ellipse cx={78} cy={412} rx={16} ry={32} />
            <ellipse cx={122} cy={412} rx={16} ry={32} />
          </Region>
        </svg>
        <span className="text-xs uppercase tracking-widest text-muted-foreground">
          Posterior
        </span>
      </div>
    </div>
  );
}

export function BodyMapLegend() {
  return (
    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
      <span>Menos</span>
      <div className="flex h-2 overflow-hidden rounded-full">
        {[0.25, 0.45, 0.65, 0.85, 1].map((step) => (
          <span
            key={step}
            className="h-2 w-5"
            style={{ backgroundColor: `hsl(var(--primary) / ${step})` }}
          />
        ))}
      </div>
      <span>Más volumen</span>
    </div>
  );
}
