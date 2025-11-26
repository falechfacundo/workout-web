"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/utils/supabase/server";
import { safeAction } from "@/lib/utils/safe-action";
import { createLogger } from "@/lib/utils/logger";
import { AppError } from "@/lib/error";
import {
  exerciseFormSchema,
  type Exercise,
  type ExerciseWithRelations,
  type ExerciseFormData,
  type MuscleGroup,
} from "@/lib/schemas/exercise";

// Crear un logger específico para el módulo de ejercicios
const logger = createLogger("exercises-actions");

export async function getExercises() {
  return safeAction(async () => {
    logger.debug("Iniciando getExercises");

    try {
      const supabase = await createClient();
      // Consultamos primero los ejercicios del usuario y los ejercicios por defecto
      const { data: exercises, error: exercisesError } = await supabase
        .from("exercises")
        .select("*")
        .order("name");

      logger.debug("Consulta de ejercicios completada", {
        count: exercises?.length,
        hasError: !!exercisesError,
      });

      if (exercisesError) {
        logger.error("Error al obtener ejercicios", exercisesError, {
          errorCode: exercisesError.code,
        });
        return {
          data: null,
          error: `Error fetching exercises: ${exercisesError.message}`,
        };
      }

      if (!exercises || exercises.length === 0) {
        logger.info("No se encontraron ejercicios");
        return {
          data: [],
          error: null,
        };
      }

      // Para cada ejercicio, obtenemos su grupo muscular primario
      const processedExercises = [...exercises] as ExerciseWithRelations[];

      for (const exercise of processedExercises) {
        logger.debug(`Procesando ejercicio: ${exercise.name}`, {
          exerciseId: exercise.id,
        });

        // Obtenemos el grupo muscular primario con su nivel de incidencia
        const { data: primaryMuscleRelation, error: primaryRelError } =
          await supabase
            .from("exercise_muscle_groups")
            .select("muscle_group_id, incidence_level")
            .eq("exercise_id", exercise.id)
            .eq("is_primary", true)
            .single();

        if (primaryRelError) {
          logger.warn(
            `Error al obtener relación del músculo primario para ejercicio ${exercise.id}`,
            { exerciseId: exercise.id, exerciseName: exercise.name },
            primaryRelError
          );
        }

        const { data: primaryMuscle, error: primaryError } = await supabase
          .from("muscle_groups")
          .select("*")
          .eq("id", exercise.primary_muscle_group_id)
          .single();

        if (primaryError) {
          logger.warn(
            `Error al obtener músculo primario para ejercicio ${exercise.id}`,
            { exerciseId: exercise.id, exerciseName: exercise.name },
            primaryError
          );
          exercise.primary_muscle = null;
        } else {
          // Add incidence level to primary muscle
          exercise.primary_muscle = {
            ...primaryMuscle,
            incidence_level: primaryMuscleRelation?.incidence_level || 10, // Default to 10 (100%) if not specified
          };

          logger.debug(`Músculo primario encontrado para ${exercise.name}`, {
            exerciseId: exercise.id,
            muscleName: primaryMuscle.name,
            incidenceLevel: primaryMuscleRelation?.incidence_level || 10,
          });
        }

        // Obtenemos los grupos musculares secundarios con sus niveles de incidencia
        const { data: secondaryMusclesRelations, error: secondaryError } =
          await supabase
            .from("exercise_muscle_groups")
            .select("muscle_group_id, incidence_level")
            .eq("exercise_id", exercise.id)
            .eq("is_primary", false);

        if (secondaryError) {
          logger.warn(
            `Error al obtener músculos secundarios para ejercicio ${exercise.id}`,
            { exerciseId: exercise.id, exerciseName: exercise.name },
            secondaryError
          );
          exercise.secondary_muscle_groups = [];
          continue;
        }

        // Si hay grupos musculares secundarios, los obtenemos individualmente
        if (secondaryMusclesRelations && secondaryMusclesRelations.length > 0) {
          const secondaryIds = secondaryMusclesRelations.map(
            (rel) => rel.muscle_group_id
          );

          const { data: secondaryMuscles, error: secondaryMusclesError } =
            await supabase
              .from("muscle_groups")
              .select("*")
              .in("id", secondaryIds);

          if (secondaryMusclesError) {
            logger.warn(
              `Error al obtener detalles de músculos secundarios para ejercicio ${exercise.id}`,
              { exerciseId: exercise.id, exerciseName: exercise.name },
              secondaryMusclesError
            );
            exercise.secondary_muscle_groups = [];
          } else {
            // Add incidence levels to secondary muscles
            exercise.secondary_muscle_groups = secondaryMuscles
              ? secondaryMuscles.map((muscle) => {
                  const relation = secondaryMusclesRelations.find(
                    (rel) => rel.muscle_group_id === muscle.id
                  );
                  return {
                    ...muscle,
                    incidence_level: relation?.incidence_level || 5, // Default to 5 (50%) if not specified
                  };
                })
              : [];
          }
        } else {
          exercise.secondary_muscle_groups = [];
        }
      }

      logger.info("Ejercicios procesados exitosamente", {
        count: processedExercises.length,
        defaultExercisesCount: processedExercises.filter((e) => e.is_default)
          .length,
      });

      if (processedExercises.length > 0) {
        logger.debug("Detalles del primer ejercicio procesado", {
          id: processedExercises[0].id,
          name: processedExercises[0].name,
          is_default: processedExercises[0].is_default,
          hasPrimaryMuscle: !!processedExercises[0].primary_muscle,
          secondaryMusclesCount:
            processedExercises[0].secondary_muscle_groups?.length || 0,
        });
      }

      return {
        data: processedExercises,
        error: null,
      };
    } catch (err) {
      logger.error(
        "Error al procesar ejercicios",
        err instanceof Error ? err : new Error(String(err)),
        { errorType: err instanceof Error ? err.constructor.name : typeof err }
      );

      return {
        data: null,
        error:
          err instanceof Error
            ? err.message
            : "Error desconocido al cargar ejercicios",
      };
    }
  });
}

export async function getExercise(id: string) {
  return safeAction(async () => {
    logger.debug("Obteniendo ejercicio por ID", { exerciseId: id });
    const startTime = performance.now();

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("exercises")
      .select(
        `
        *,
        primary_muscle: muscle_groups!primary_muscle_group_id(id, name)
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      logger.warn(`Error al obtener ejercicio con ID ${id}`, error, {
        errorCode: error.code,
        errorMessage: error.message,
      });

      return {
        data: null,
        error: `Error fetching exercise: ${error.message}`,
      };
    }

    // Get secondary muscle groups
    const { data: muscleGroups, error: muscleGroupsError } = await supabase
      .from("exercise_muscle_groups")
      .select(
        `
        muscle_group_id
      `
      )
      .eq("exercise_id", id)
      .eq("is_primary", false);

    if (muscleGroupsError) {
      logger.warn(
        `Error al obtener grupos musculares para ejercicio ${id}`,
        muscleGroupsError,
        { exerciseId: id, exerciseName: data.name }
      );
    } else {
      data.secondary_muscle_groups =
        muscleGroups?.map((mg) => mg.muscle_group_id) || [];

      logger.debug(
        `Grupos musculares secundarios obtenidos para ejercicio ${id}`,
        {
          count: data.secondary_muscle_groups.length,
          exerciseName: data.name,
        }
      );
    }

    const duration = Math.round(performance.now() - startTime);
    logger.info(`Ejercicio ${id} obtenido con éxito`, {
      exerciseName: data.name,
      duration: duration,
      hasSecondaryMuscles: data.secondary_muscle_groups?.length > 0,
    });

    return {
      data,
      error: null,
    };
  });
}

export async function createExercise(formData: ExerciseFormData) {
  return safeAction(async () => {
    logger.debug("Iniciando creación de ejercicio", {
      exerciseName: formData.name,
    });
    const startTime = performance.now();

    // Validate form data
    const validatedFields = exerciseFormSchema.safeParse(formData);

    if (!validatedFields.success) {
      const formattedErrors = validatedFields.error.format();
      logger.warn("Validación fallida en formulario de ejercicio", {
        exerciseName: formData.name,
        errors: formattedErrors,
      });

      return {
        data: null,
        error: "Invalid form data. Please check the fields and try again.",
      };
    }

    const {
      name,
      description,
      video_url,
      primary_muscle_group_id,
      secondary_muscle_groups,
    } = validatedFields.data;

    logger.info("Creando nuevo ejercicio", {
      name,
      primaryMuscleGroupId: primary_muscle_group_id,
      hasSecondaryGroups:
        secondary_muscle_groups && secondary_muscle_groups.length > 0,
      secondaryGroupsCount: secondary_muscle_groups?.length || 0,
    });

    const supabase = await createClient();
    // Start a transaction
    const { data: exercise, error: exerciseError } = await supabase
      .from("exercises")
      .insert([
        {
          name,
          description,
          video_url: video_url || null,
          primary_muscle_group_id,
        },
      ])
      .select()
      .single();

    if (exerciseError) {
      logger.error(
        "Error al crear ejercicio en la base de datos",
        exerciseError,
        {
          name,
          errorCode: exerciseError.code,
          details: exerciseError.details,
        }
      );

      return {
        data: null,
        error: `Error creating exercise: ${exerciseError.message}`,
      };
    }

    // Add primary muscle group to exercise_muscle_groups
    const { error: primaryError } = await supabase
      .from("exercise_muscle_groups")
      .insert([
        {
          exercise_id: exercise.id,
          muscle_group_id: primary_muscle_group_id,
          is_primary: true,
        },
      ]);

    if (primaryError) {
      logger.error(
        "Error al vincular músculo primario al ejercicio",
        primaryError,
        {
          exerciseId: exercise.id,
          name,
          primaryMuscleGroupId: primary_muscle_group_id,
        }
      );

      return {
        data: null,
        error: `Error linking primary muscle group: ${primaryError.message}`,
      };
    }

    // Add secondary muscle groups
    if (secondary_muscle_groups && secondary_muscle_groups.length > 0) {
      logger.debug("Vinculando grupos musculares secundarios", {
        exerciseId: exercise.id,
        secondaryCount: secondary_muscle_groups.length,
        secondaryGroups: secondary_muscle_groups,
      });

      const secondaryEntries = secondary_muscle_groups.map((mgId) => ({
        exercise_id: exercise.id,
        muscle_group_id: mgId,
        is_primary: false,
      }));

      const { error: secondaryError } = await supabase
        .from("exercise_muscle_groups")
        .insert(secondaryEntries);

      if (secondaryError) {
        logger.error("Error al vincular músculos secundarios", secondaryError, {
          exerciseId: exercise.id,
          name,
        });

        return {
          data: null,
          error: `Error linking secondary muscle groups: ${secondaryError.message}`,
        };
      }
    }

    const duration = Math.round(performance.now() - startTime);
    logger.info("Ejercicio creado exitosamente", {
      exerciseId: exercise.id,
      name,
      duration,
      hasSecondaryGroups:
        secondary_muscle_groups && secondary_muscle_groups.length > 0,
    });

    revalidatePath("/dashboard/exercises");
    redirect("/dashboard/exercises");

    return {
      data: exercise,
      error: null,
    };
  });
}

export async function updateExercise(formData: ExerciseFormData) {
  return safeAction(async () => {
    logger.debug("Iniciando actualización de ejercicio", {
      exerciseId: formData.id,
      exerciseName: formData.name,
    });
    const startTime = performance.now();

    // Validate form data
    const validatedFields = exerciseFormSchema.safeParse(formData);

    if (!validatedFields.success) {
      const formattedErrors = validatedFields.error.format();
      logger.warn("Validación fallida en actualización de ejercicio", {
        exerciseId: formData.id,
        errors: formattedErrors,
      });

      return {
        data: null,
        error: "Invalid form data. Please check the fields and try again.",
      };
    }

    const {
      id,
      name,
      description,
      video_url,
      primary_muscle_group_id,
      secondary_muscle_groups,
    } = validatedFields.data;

    if (!id) {
      logger.warn("Intento de actualización sin ID de ejercicio", { name });
      return {
        data: null,
        error: "Exercise ID is required for updates",
      };
    }

    const supabase = await createClient();

    logger.info("Actualizando ejercicio", {
      exerciseId: id,
      name,
      primaryMuscleGroupId: primary_muscle_group_id,
      secondaryGroupsCount: secondary_muscle_groups?.length || 0,
    });

    // Update exercise
    const { data: exercise, error: exerciseError } = await supabase
      .from("exercises")
      .update({
        name,
        description,
        video_url: video_url || null,
        primary_muscle_group_id,
      })
      .eq("id", id)
      .select()
      .single();

    if (exerciseError) {
      logger.error("Error al actualizar ejercicio", exerciseError, {
        exerciseId: id,
        name,
        errorCode: exerciseError.code,
      });

      return {
        data: null,
        error: `Error updating exercise: ${exerciseError.message}`,
      };
    }

    // Delete all existing muscle group associations
    logger.debug("Eliminando asociaciones existentes de grupos musculares", {
      exerciseId: id,
    });

    const { error: deleteError } = await supabase
      .from("exercise_muscle_groups")
      .delete()
      .eq("exercise_id", id);

    if (deleteError) {
      logger.error(
        "Error al eliminar asociaciones de grupos musculares",
        deleteError,
        {
          exerciseId: id,
          name,
          errorCode: deleteError.code,
        }
      );

      return {
        data: null,
        error: `Error updating muscle groups: ${deleteError.message}`,
      };
    }

    // Add primary muscle group
    logger.debug("Añadiendo grupo muscular primario", {
      exerciseId: id,
      primaryMuscleGroupId: primary_muscle_group_id,
    });

    const { error: primaryError } = await supabase
      .from("exercise_muscle_groups")
      .insert([
        {
          exercise_id: id,
          muscle_group_id: primary_muscle_group_id,
          is_primary: true,
        },
      ]);

    if (primaryError) {
      logger.error(
        "Error al vincular músculo primario en actualización",
        primaryError,
        {
          exerciseId: id,
          name,
          primaryMuscleGroupId: primary_muscle_group_id,
          errorCode: primaryError.code,
        }
      );

      return {
        data: null,
        error: `Error linking primary muscle group: ${primaryError.message}`,
      };
    }

    // Add secondary muscle groups
    if (secondary_muscle_groups && secondary_muscle_groups.length > 0) {
      logger.debug("Añadiendo grupos musculares secundarios", {
        exerciseId: id,
        secondaryCount: secondary_muscle_groups.length,
        secondaryGroups: secondary_muscle_groups,
      });

      const secondaryEntries = secondary_muscle_groups.map((mgId) => ({
        exercise_id: id,
        muscle_group_id: mgId,
        is_primary: false,
      }));

      const { error: secondaryError } = await supabase
        .from("exercise_muscle_groups")
        .insert(secondaryEntries);

      if (secondaryError) {
        logger.error(
          "Error al vincular músculos secundarios en actualización",
          secondaryError,
          {
            exerciseId: id,
            name,
            secondaryCount: secondary_muscle_groups.length,
            errorCode: secondaryError.code,
          }
        );

        return {
          data: null,
          error: `Error linking secondary muscle groups: ${secondaryError.message}`,
        };
      }
    }

    revalidatePath("/dashboard/exercises");
    redirect("/dashboard/exercises");

    return {
      data: exercise,
      error: null,
    };
  });
}

export async function deleteExercise(id: string) {
  return safeAction(async () => {
    logger.debug("Iniciando eliminación de ejercicio", { exerciseId: id });
    const startTime = performance.now();

    const supabase = await createClient();
    // Delete muscle group associations first
    logger.info("Eliminando asociaciones de grupos musculares", {
      exerciseId: id,
    });

    const { error: mgError } = await supabase
      .from("exercise_muscle_groups")
      .delete()
      .eq("exercise_id", id);

    if (mgError) {
      logger.error(
        "Error al eliminar asociaciones de grupos musculares",
        mgError,
        {
          exerciseId: id,
          errorCode: mgError.code,
        }
      );

      return {
        data: null,
        error: `Error deleting exercise associations: ${mgError.message}`,
      };
    }

    // Delete the exercise
    logger.info("Eliminando ejercicio", { exerciseId: id });

    const { error } = await supabase.from("exercises").delete().eq("id", id);

    if (error) {
      logger.error("Error al eliminar ejercicio", error, {
        exerciseId: id,
        errorCode: error.code,
      });

      return {
        data: null,
        error: `Error deleting exercise: ${error.message}`,
      };
    }

    const duration = Math.round(performance.now() - startTime);
    logger.info("Ejercicio eliminado exitosamente", {
      exerciseId: id,
      duration,
    });

    revalidatePath("/dashboard/exercises");

    return {
      data: { success: true },
      error: null,
    };
  });
}

export async function getExercisesByMuscleGroup(muscleGroupId: string) {
  return safeAction(async () => {
    logger.debug("Obteniendo ejercicios por grupo muscular", { muscleGroupId });
    const startTime = performance.now();

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("exercise_muscle_groups")
      .select(
        `
        exercises(*)
      `
      )
      .eq("muscle_group_id", muscleGroupId);

    if (error) {
      logger.error("Error al obtener ejercicios por grupo muscular", error, {
        muscleGroupId,
        errorCode: error.code,
      });

      return {
        data: null,
        error: `Error fetching exercises by muscle group: ${error.message}`,
      };
    }

    const duration = Math.round(performance.now() - startTime);
    logger.info("Ejercicios por grupo muscular obtenidos exitosamente", {
      muscleGroupId,
      count: data.length,
      duration,
    });

    return {
      data: data.map((item) => item.exercises),
      error: null,
    };
  });
}
