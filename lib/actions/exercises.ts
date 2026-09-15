"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getServerUser } from "@/lib/auth";
import { safeAction } from "@/lib/utils/safe-action";
import { createLogger } from "@/lib/utils/logger";
import {
  exerciseFormSchema,
  type ExerciseWithRelations,
  type ExerciseFormValues,
} from "@/lib/schemas/exercise";

const logger = createLogger("exercises-actions");

export async function getExercises() {
  return safeAction(async () => {
    logger.debug("Iniciando getExercises");

    try {
      const user = await getServerUser();

      const exercises = await db.exercise.findMany({
        where: user
          ? { OR: [{ user_id: user.id }, { is_default: true }] }
          : { is_default: true },
        include: {
          exercise_muscle_groups: {
            include: { muscle_group: true },
          },
        },
        orderBy: { name: "asc" },
      });

      logger.debug("Consulta de ejercicios completada", {
        count: exercises.length,
        hasError: false,
      });

      if (!exercises || exercises.length === 0) {
        logger.info("No se encontraron ejercicios");
        return {
          data: [],
          error: null,
        };
      }

      const processedExercises = exercises.map((exercise) => {
        const emgs = exercise.exercise_muscle_groups;

        const primaryEmg = emgs.find((emg) => emg.is_primary);
        const primary_muscle = primaryEmg
          ? {
              ...primaryEmg.muscle_group,
              incidence_level: primaryEmg.incidence_level || 10,
            }
          : null;

        const secondaryEmgs = emgs.filter((emg) => !emg.is_primary);
        const secondary_muscle_groups = secondaryEmgs.map((emg) => ({
          ...emg.muscle_group,
          incidence_level: emg.incidence_level || 5,
        }));

        const { exercise_muscle_groups, ...rest } = exercise;
        return {
          ...rest,
          primary_muscle,
          secondary_muscle_groups,
        };
      }) as any as ExerciseWithRelations[];

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

      logger.info("Ejercicios procesados exitosamente", {
        count: processedExercises.length,
        defaultExercisesCount: processedExercises.filter((e) => e.is_default)
          .length,
      });

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

    const result = await db.exercise.findUnique({
      where: { id },
      include: {
        primary_muscle_group: { select: { id: true, name: true } },
        exercise_muscle_groups: {
          where: { is_primary: false },
          select: { muscle_group_id: true },
        },
      },
    });

    if (!result) {
      logger.warn(`Error al obtener ejercicio con ID ${id}`, {
        errorCode: "NOT_FOUND",
        errorMessage: "Exercise not found",
      });

      return {
        data: null,
        error: `Error fetching exercise: Exercise not found`,
      };
    }

    const { primary_muscle_group, exercise_muscle_groups, ...rest } = result;
    const data = {
      ...rest,
      primary_muscle: primary_muscle_group,
      secondary_muscle_groups: exercise_muscle_groups.map(
        (emg) => emg.muscle_group_id
      ),
    };

    logger.debug(
      `Grupos musculares secundarios obtenidos para ejercicio ${id}`,
      {
        count: data.secondary_muscle_groups.length,
        exerciseName: data.name,
      }
    );

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

export async function createExercise(formData: ExerciseFormValues) {
  return safeAction(async () => {
    logger.debug("Iniciando creación de ejercicio", {
      exerciseName: formData.name,
    });
    const startTime = performance.now();

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

    const user = await getServerUser();

    const emgEntries = [
      {
        muscle_group_id: primary_muscle_group_id,
        is_primary: true,
      },
      ...(secondary_muscle_groups || []).map((mgId) => ({
        muscle_group_id: mgId,
        is_primary: false,
      })),
    ];

    const exercise = await db.exercise.create({
      data: {
        name,
        description,
        video_url: video_url || null,
        primary_muscle_group_id,
        user_id: user?.id ?? null,
        is_default: false,
        exercise_muscle_groups: {
          create: emgEntries,
        },
      },
    });

    logger.info("Ejercicio creado exitosamente", {
      exerciseId: exercise.id,
      name,
      duration: Math.round(performance.now() - startTime),
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

export async function updateExercise(formData: ExerciseFormValues) {
  return safeAction(async () => {
    logger.debug("Iniciando actualización de ejercicio", {
      exerciseId: formData.id,
      exerciseName: formData.name,
    });

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

    logger.info("Actualizando ejercicio", {
      exerciseId: id,
      name,
      primaryMuscleGroupId: primary_muscle_group_id,
      secondaryGroupsCount: secondary_muscle_groups?.length || 0,
    });

    const exercise = await db.exercise.update({
      where: { id },
      data: {
        name,
        description,
        video_url: video_url || null,
        primary_muscle_group_id,
      },
    });

    logger.debug("Eliminando asociaciones existentes de grupos musculares", {
      exerciseId: id,
    });

    await db.exerciseMuscleGroup.deleteMany({
      where: { exercise_id: id },
    });

    logger.debug("Añadiendo grupo muscular primario", {
      exerciseId: id,
      primaryMuscleGroupId: primary_muscle_group_id,
    });

    const emgEntries = [
      {
        exercise_id: id,
        muscle_group_id: primary_muscle_group_id,
        is_primary: true,
      },
      ...(secondary_muscle_groups || []).map((mgId) => ({
        exercise_id: id,
        muscle_group_id: mgId,
        is_primary: false,
      })),
    ];

    await db.exerciseMuscleGroup.createMany({
      data: emgEntries,
    });

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

    logger.info("Eliminando asociaciones de grupos musculares", {
      exerciseId: id,
    });

    await db.exerciseMuscleGroup.deleteMany({
      where: { exercise_id: id },
    });

    logger.info("Eliminando ejercicio", { exerciseId: id });

    await db.exercise.delete({
      where: { id },
    });

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

    const data = await db.exerciseMuscleGroup.findMany({
      where: { muscle_group_id: muscleGroupId },
      include: { exercise: true },
    });

    const duration = Math.round(performance.now() - startTime);
    logger.info("Ejercicios por grupo muscular obtenidos exitosamente", {
      muscleGroupId,
      count: data.length,
      duration,
    });

    return {
      data: data.map((item) => item.exercise),
      error: null,
    };
  });
}
