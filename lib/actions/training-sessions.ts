"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { z } from "zod";
import { safeAction } from "@/lib/utils/safe-action";
import { createLogger } from "@/lib/utils/logger";

const logger = createLogger("training-sessions-actions");

// Schema for validation
const TrainingSessionSchema = z.object({
  id: z.string().optional(),
  mesocycle_id: z.string(),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  day_of_week: z.number().min(0).max(6).optional(),
  duration_minutes: z.number().min(1).optional(),
  status: z.enum(["planned", "in_progress", "completed", "cancelled"]).default("planned"),
  scheduled_date: z.string().optional(),
  completed_date: z.string().optional(),
});

export type TrainingSessionFormData = z.infer<typeof TrainingSessionSchema>;

// Schema for exercise in session
const SessionExerciseSchema = z.object({
  id: z.string().optional(),
  training_session_id: z.string().optional(),
  exercise_id: z.string(),
  order_index: z.number().default(0),
  sets: z.number().min(1, "At least 1 set is required"),
  reps: z.number().min(1, "Reps required"),
  rir: z.number().min(0).max(10).optional(),
  rest_between_sets: z.number().min(0).optional(),
  rest_after_exercise: z.number().min(0).optional(),
  notes: z.string().optional(),
});

export type SessionExerciseFormData = z.infer<typeof SessionExerciseSchema>;

export async function getTrainingSessions(userId: string) {
  return safeAction(async () => {
    const startTime = performance.now();
    logger.debug("Starting getTrainingSessions", { userId });

    try {
      const data = await db.trainingSession.findMany({
        where: {
          mesocycle: { user_id: userId },
        },
        orderBy: { scheduled_date: "asc" },
      });

      const elapsedTime = Math.round(performance.now() - startTime);

      logger.info("Successfully fetched training sessions", {
        userId,
        count: data?.length || 0,
        elapsedMs: elapsedTime,
      });

      return {
        data,
        error: null,
      };
    } catch (error) {
      logger.error(
        "Exception in getTrainingSessions",
        error instanceof Error ? error : new Error(String(error)),
        { userId }
      );

      return {
        data: null,
        error: "An unexpected error occurred while fetching training sessions",
      };
    }
  });
}

export async function getTrainingSessionsByMesocycle(mesocycleId: string) {
  return safeAction(async () => {
    const startTime = performance.now();
    logger.debug("Starting getTrainingSessionsByMesocycle", { mesocycleId });

    try {
      const data = await db.trainingSession.findMany({
        where: { mesocycle_id: mesocycleId },
        orderBy: { scheduled_date: "asc" },
      });

      const elapsedTime = Math.round(performance.now() - startTime);

      logger.info("Successfully fetched training sessions by mesocycle", {
        mesocycleId,
        count: data?.length || 0,
        elapsedMs: elapsedTime,
      });

      return {
        data,
        error: null,
      };
    } catch (error) {
      logger.error(
        "Exception in getTrainingSessionsByMesocycle",
        error instanceof Error ? error : new Error(String(error)),
        { mesocycleId }
      );

      return {
        data: null,
        error: "An unexpected error occurred while fetching training sessions",
      };
    }
  });
}

export async function getTrainingSession(id: string) {
  return safeAction(async () => {
    const startTime = performance.now();
    logger.debug("Starting getTrainingSession", { sessionId: id });

    try {
      const data = await db.trainingSession.findUnique({
        where: { id },
      });

      const elapsedTime = Math.round(performance.now() - startTime);

      logger.info("Successfully fetched training session", {
        sessionId: id,
        name: data?.name,
        elapsedMs: elapsedTime,
      });

      return {
        data,
        error: null,
      };
    } catch (error) {
      logger.error(
        "Exception in getTrainingSession",
        error instanceof Error ? error : new Error(String(error)),
        { sessionId: id }
      );

      return {
        data: null,
        error:
          "An unexpected error occurred while fetching the training session",
      };
    }
  });
}

export async function createTrainingSession(formData: TrainingSessionFormData) {
  return safeAction(async () => {
    const startTime = performance.now();
    logger.debug("Starting createTrainingSession", {
      name: formData.name,
      mesocycleId: formData.mesocycle_id,
    });

    try {
      const validatedFields = TrainingSessionSchema.safeParse(formData);

      if (!validatedFields.success) {
        logger.warn("Invalid training session form data", {
          errors: validatedFields.error.errors,
          formData: {
            name: formData.name,
            mesocycleId: formData.mesocycle_id,
          },
        });

        return {
          data: null,
          error: "Invalid form data. Please check the fields and try again.",
        };
      }

      const {
        mesocycle_id,
        name,
        description,
        day_of_week,
        duration_minutes,
        status,
        scheduled_date,
      } = validatedFields.data;

      const data = await db.trainingSession.create({
        data: {
          mesocycle_id,
          name,
          description: description || null,
          day_of_week: day_of_week ?? null,
          duration_minutes: duration_minutes ?? null,
          status,
          scheduled_date: scheduled_date ? new Date(scheduled_date) : null,
        },
      });

      const elapsedTime = Math.round(performance.now() - startTime);

      logger.info("Successfully created training session", {
        name,
        mesocycleId: mesocycle_id,
        sessionId: data?.id,
        elapsedMs: elapsedTime,
      });

      revalidatePath("/dashboard/mesocycles");
      redirect(`/dashboard/mesocycles/${mesocycle_id}`);

      return {
        data,
        error: null,
      };
    } catch (error) {
      logger.error(
        "Exception in createTrainingSession",
        error instanceof Error ? error : new Error(String(error)),
        {
          name: formData.name,
          mesocycleId: formData.mesocycle_id,
        }
      );

      return {
        data: null,
        error:
          "An unexpected error occurred while creating the training session",
      };
    }
  });
}

export async function updateTrainingSession(formData: TrainingSessionFormData) {
  return safeAction(async () => {
    const startTime = performance.now();
    logger.debug("Starting updateTrainingSession", {
      id: formData.id,
      name: formData.name,
    });

    try {
      const validatedFields = TrainingSessionSchema.safeParse(formData);

      if (!validatedFields.success) {
        logger.warn("Invalid training session update form data", {
          errors: validatedFields.error.errors,
          id: formData.id,
          name: formData.name,
        });

        return {
          data: null,
          error: "Invalid form data. Please check the fields and try again.",
        };
      }

      const { id, name, description, day_of_week, duration_minutes, status, scheduled_date, completed_date } =
        validatedFields.data;

      if (!id) {
        logger.warn("Missing session ID for update", {
          name: formData.name,
        });

        return {
          data: null,
          error: "Training session ID is required for updates",
        };
      }

      const data = await db.trainingSession.update({
        where: { id },
        data: {
          name,
          description: description || null,
          day_of_week: day_of_week ?? null,
          duration_minutes: duration_minutes ?? null,
          status,
          scheduled_date: scheduled_date ? new Date(scheduled_date) : null,
          completed_date: completed_date ? new Date(completed_date) : null,
        },
      });

      const elapsedTime = Math.round(performance.now() - startTime);

      logger.info("Successfully updated training session", {
        id,
        name,
        status,
        elapsedMs: elapsedTime,
      });

      revalidatePath("/dashboard/mesocycles");

      return {
        data,
        error: null,
      };
    } catch (error) {
      logger.error(
        "Exception in updateTrainingSession",
        error instanceof Error ? error : new Error(String(error)),
        { id: formData.id, name: formData.name }
      );

      return {
        data: null,
        error:
          "An unexpected error occurred while updating the training session",
      };
    }
  });
}

export async function deleteTrainingSession(id: string) {
  return safeAction(async () => {
    const startTime = performance.now();
    logger.debug("Starting deleteTrainingSession", { sessionId: id });

    try {
      await db.trainingSession.delete({
        where: { id },
      });

      const elapsedTime = Math.round(performance.now() - startTime);

      logger.info("Successfully deleted training session", {
        sessionId: id,
        elapsedMs: elapsedTime,
      });

      revalidatePath("/dashboard/mesocycles");

      return { data: { success: true }, error: null };
    } catch (error) {
      logger.error(
        "Exception in deleteTrainingSession",
        error instanceof Error ? error : new Error(String(error)),
        { sessionId: id }
      );

      return {
        data: null,
        error:
          "An unexpected error occurred while deleting the training session",
      };
    }
  });
}

export async function getSessionExercises(sessionId: string) {
  const startTime = performance.now();
  logger.debug("Starting getSessionExercises", { sessionId });

  try {
    const data = await db.sessionExercise.findMany({
      where: { training_session_id: sessionId },
      include: {
        exercise: true,
      },
      orderBy: { order_index: "asc" },
    });

    const elapsedTime = Math.round(performance.now() - startTime);

    logger.info("Successfully fetched session exercises", {
      sessionId,
      count: data?.length || 0,
      elapsedMs: elapsedTime,
    });

    return data;
  } catch (error) {
    logger.error(
      "Exception in getSessionExercises",
      error instanceof Error ? error : new Error(String(error)),
      { sessionId }
    );

    throw error;
  }
}

export async function addExerciseToSession(formData: SessionExerciseFormData) {
  const startTime = performance.now();
  logger.debug("Starting addExerciseToSession", {
    trainingSessionId: formData.training_session_id,
    exerciseId: formData.exercise_id,
  });

  try {
    const validatedFields = SessionExerciseSchema.safeParse(formData);

    if (!validatedFields.success) {
      logger.warn("Invalid session exercise form data", {
        errors: validatedFields.error.errors,
        trainingSessionId: formData.training_session_id,
        exerciseId: formData.exercise_id,
      });

      return {
        error: "Invalid form data. Please check the fields and try again.",
      };
    }

    const {
      training_session_id,
      exercise_id,
      order_index,
      sets,
      reps,
      rir,
      rest_between_sets,
      rest_after_exercise,
      notes,
    } = validatedFields.data;

    if (!training_session_id) {
      return {
        error: "Training session ID is required",
      };
    }

    // Get the current highest order value
    const latest = await db.sessionExercise.findFirst({
      where: { training_session_id },
      orderBy: { order_index: "desc" },
      select: { order_index: true },
    });

    const nextOrder = latest ? latest.order_index + 1 : 0;

    await db.sessionExercise.create({
      data: {
        training_session_id,
        exercise_id,
        order_index: order_index ?? nextOrder,
        sets,
        reps,
        rir: rir ?? null,
        rest_between_sets: rest_between_sets ?? null,
        rest_after_exercise: rest_after_exercise ?? null,
        notes: notes || null,
      },
    });

    const elapsedTime = Math.round(performance.now() - startTime);

    // Get the mesocycle ID for the revalidation
    const sessionData = await db.trainingSession.findUnique({
      where: { id: training_session_id },
      select: { mesocycle_id: true },
    });

    logger.info("Successfully added exercise to session", {
      trainingSessionId: training_session_id,
      exerciseId: exercise_id,
      mesocycleId: sessionData?.mesocycle_id,
      order: nextOrder,
      elapsedMs: elapsedTime,
    });

    if (sessionData) {
      revalidatePath(
        `/dashboard/mesocycles/${sessionData.mesocycle_id}/sessions/${training_session_id}`
      );
    }

    return { data: { success: true }, error: null };
  } catch (error) {
    logger.error(
      "Exception in addExerciseToSession",
      error instanceof Error ? error : new Error(String(error)),
      {
        trainingSessionId: formData.training_session_id,
        exerciseId: formData.exercise_id,
      }
    );

    return {
      error:
        "An unexpected error occurred while adding the exercise to the session",
    };
  }
}

export async function updateSessionExercise(formData: SessionExerciseFormData) {
  logger.debug("Starting updateSessionExercise", {
    id: formData.id,
    trainingSessionId: formData.training_session_id,
    exerciseId: formData.exercise_id,
  });

  try {
    const validatedFields = SessionExerciseSchema.safeParse(formData);

    if (!validatedFields.success) {
      return {
        error: "Invalid form data. Please check the fields and try again.",
      };
    }

    const {
      id,
      training_session_id,
      exercise_id,
      order_index,
      sets,
      reps,
      rir,
      rest_between_sets,
      rest_after_exercise,
      notes,
    } = validatedFields.data;

    if (!id) {
      return {
        error: "Exercise ID is required for updates",
      };
    }

    await db.sessionExercise.update({
      where: { id },
      data: {
        exercise_id,
        order_index: order_index ?? 0,
        sets,
        reps,
        rir: rir ?? null,
        rest_between_sets: rest_between_sets ?? null,
        rest_after_exercise: rest_after_exercise ?? null,
        notes: notes || null,
      },
    });

    // Get the mesocycle ID for the revalidation
    if (training_session_id) {
      const sessionData = await db.trainingSession.findUnique({
        where: { id: training_session_id },
        select: { mesocycle_id: true },
      });

      if (sessionData) {
        revalidatePath(
          `/dashboard/mesocycles/${sessionData.mesocycle_id}/sessions/${training_session_id}`
        );
      }
    }

    return { data: { success: true }, error: null };
  } catch (error) {
    logger.error(
      "Exception in updateSessionExercise",
      error instanceof Error ? error : new Error(String(error)),
      {
        id: formData.id,
        trainingSessionId: formData.training_session_id,
        exerciseId: formData.exercise_id,
      }
    );

    return {
      error: "An unexpected error occurred while updating the session exercise",
    };
  }
}

export async function removeExerciseFromSession(
  id: string,
  sessionId: string,
  mesocycleId: string
) {
  const startTime = performance.now();
  logger.debug("Starting removeExerciseFromSession", {
    id,
    sessionId,
    mesocycleId,
  });

  try {
    await db.sessionExercise.delete({
      where: { id },
    });

    const elapsedTime = Math.round(performance.now() - startTime);

    logger.info("Successfully removed exercise from session", {
      id,
      sessionId,
      mesocycleId,
      elapsedMs: elapsedTime,
    });

    revalidatePath(
      `/dashboard/mesocycles/${mesocycleId}/sessions/${sessionId}`
    );
    return { data: { success: true }, error: null };
  } catch (error) {
    logger.error(
      "Exception in removeExerciseFromSession",
      error instanceof Error ? error : new Error(String(error)),
      { id, sessionId, mesocycleId }
    );

    return {
      error:
        "An unexpected error occurred while removing the exercise from the session",
    };
  }
}

export async function reorderSessionExercises(
  sessionId: string,
  exerciseIds: string[]
) {
  logger.debug("Starting reorderSessionExercises", {
    sessionId,
    exerciseCount: exerciseIds.length,
  });

  try {
    for (let i = 0; i < exerciseIds.length; i++) {
      await db.sessionExercise.update({
        where: { id: exerciseIds[i] },
        data: { order_index: i },
      });
    }

    // Get the mesocycle ID for the revalidation
    const sessionData = await db.trainingSession.findUnique({
      where: { id: sessionId },
      select: { mesocycle_id: true },
    });

    if (sessionData) {
      revalidatePath(
        `/dashboard/mesocycles/${sessionData.mesocycle_id}/sessions/${sessionId}`
      );
    }

    return { data: { success: true }, error: null };
  } catch (error) {
    logger.error(
      "Exception in reorderSessionExercises",
      error instanceof Error ? error : new Error(String(error)),
      {
        sessionId,
        exerciseCount: exerciseIds.length,
      }
    );

    return {
      error:
        "An unexpected error occurred while reordering the session exercises",
    };
  }
}

export async function updateTrainingSessionStatus(id: string, status: string) {
  return safeAction(async () => {
    const startTime = performance.now();
    logger.debug("Starting updateTrainingSessionStatus", {
      sessionId: id,
      newStatus: status,
    });

    try {
      const data = await db.trainingSession.update({
        where: { id },
        data: { status },
      });

      const elapsedTime = Math.round(performance.now() - startTime);

      logger.info("Successfully updated training session status", {
        sessionId: id,
        name: data?.name,
        newStatus: status,
        elapsedMs: elapsedTime,
      });

      revalidatePath("/dashboard/mesocycles");

      return {
        data,
        error: null,
      };
    } catch (error) {
      logger.error(
        "Exception in updateTrainingSessionStatus",
        error instanceof Error ? error : new Error(String(error)),
        { sessionId: id, newStatus: status }
      );

      return {
        data: null,
        error:
          "An unexpected error occurred while updating the training session status",
      };
    }
  });
}

export async function getScheduledSessionsByDateRange(
  userId: string,
  startDate: string,
  endDate: string
) {
  return safeAction(async () => {
    try {
      const data = await db.trainingSession.findMany({
        where: {
          scheduled_date: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
        include: {
          mesocycle: { select: { name: true, user_id: true } },
        },
        orderBy: { scheduled_date: "asc" },
      });

      // Filter to only sessions belonging to this user's mesocycles
      const userSessions = (data || []).filter(
        (s: any) => s.mesocycle?.user_id === userId
      );

      return {
        data: userSessions,
        error: null,
      };
    } catch {
      return {
        data: null,
        error: "An unexpected error occurred",
      };
    }
  });
}