"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { useState, useEffect } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { Plus, GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createLogger } from "@/lib/utils/logger";
import { ExerciseItem } from "./exercise-item";
import { useExercisesStore } from "@/lib/stores/exercises-store";

const logger = createLogger("session-template-exercise-list");

export function ExerciseList() {
  const form = useFormContext();
  const { exercises, isLoading, fetchExercises } = useExercisesStore();

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "exercises",
  });

  useEffect(() => {
    logger.debug("Initializing exercise list");
    fetchExercises();
  }, [fetchExercises]);

  // Handler for drag and drop
  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    logger.debug("Reordering exercise", {
      from: result.source.index,
      to: result.destination.index,
    });

    move(result.source.index, result.destination.index);
  };

  const addExercise = () => {
    logger.debug("Adding new exercise to template");
    append({
      exercise_id: "",
      sets: 3,
      reps: 10,
      rir: 2,
      rest_between_sets: 90,
      rest_after_exercise: 120,
      notes: "",
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Ejercicios</h3>
        <Button type="button" onClick={addExercise} size="sm">
          <Plus className="mr-1 h-4 w-4" />
          Añadir Ejercicio
        </Button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="exercises">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {fields.map((field, index) => (
                <Draggable key={field.id} draggableId={field.id} index={index}>
                  {(provided) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="relative"
                    >
                      <div
                        {...provided.dragHandleProps}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 cursor-grab h-full flex items-center"
                      >
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                      </div>

                      <CardHeader className="pb-2 pl-10">
                        <CardTitle className="text-base">
                          Ejercicio {index + 1}
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="space-y-4 pt-0">
                        <ExerciseItem
                          index={index}
                          exercises={exercises}
                          isLoading={isLoading}
                        />
                      </CardContent>

                      <CardFooter className="flex justify-end">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            logger.debug("Removing exercise", { index });
                            remove(index);
                          }}
                        >
                          <Trash2 className="mr-1 h-4 w-4" />
                          Eliminar
                        </Button>
                      </CardFooter>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}

              {fields.length === 0 && (
                <Card className="flex items-center justify-center p-8 text-center text-muted-foreground">
                  <div>
                    <p className="mb-2">No hay ejercicios en esta sesión</p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addExercise}
                    >
                      <Plus className="mr-1 h-4 w-4" />
                      Añadir el primer ejercicio
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
