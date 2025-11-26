"use client";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useFormContext } from "react-hook-form";
import { Skeleton } from "@/components/ui/skeleton";
import { createLogger } from "@/lib/utils/logger";
import { type Exercise } from "@/lib/schemas/exercise";

const logger = createLogger("session-template-exercise-item");

interface ExerciseItemProps {
  index: number;
  exercises: Exercise[];
  isLoading: boolean;
}

export function ExerciseItem({
  index,
  exercises,
  isLoading,
}: ExerciseItemProps) {
  const form = useFormContext();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  return (
    <>
      <FormField
        control={form.control}
        name={`exercises.${index}.exercise_id`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Ejercicio</FormLabel>
            <Select
              onValueChange={(value) => {
                logger.debug("Exercise selected", {
                  exerciseId: value,
                  exerciseName: exercises.find((ex) => ex.id === value)?.name,
                });
                field.onChange(value);
              }}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un ejercicio" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {exercises.map((exercise) => (
                  <SelectItem key={exercise.id} value={exercise.id}>
                    {exercise.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name={`exercises.${index}.sets`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Series</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  {...field}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    logger.debug("Sets changed", { index, value });
                    field.onChange(value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`exercises.${index}.reps`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Repeticiones</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  {...field}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    logger.debug("Reps changed", { index, value });
                    field.onChange(value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`exercises.${index}.rir`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>RIR</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  max={10}
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) => {
                    const value = e.target.value
                      ? parseInt(e.target.value)
                      : null;
                    logger.debug("RIR changed", { index, value });
                    field.onChange(value);
                  }}
                />
              </FormControl>
              <FormDescription className="text-xs">
                Repeticiones en reserva
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name={`exercises.${index}.rest_between_sets`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descanso entre series (seg)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  {...field}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    logger.debug("Rest between sets changed", { index, value });
                    field.onChange(value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`exercises.${index}.rest_after_exercise`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descanso después (seg)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  {...field}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    logger.debug("Rest after exercise changed", {
                      index,
                      value,
                    });
                    field.onChange(value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name={`exercises.${index}.notes`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Notas</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Notas específicas para este ejercicio..."
                className="h-20"
                {...field}
                value={field.value || ""}
                onChange={(e) => {
                  logger.debug("Notes changed", { index });
                  field.onChange(e);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
