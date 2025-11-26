"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/utils/supabase/server";
import { z } from "zod";
import { safeAction } from "@/lib/utils/safe-action";
import { createLogger } from "@/lib/utils/logger";
import { AppError } from "@/lib/error";

// Create a specific logger for this module
const logger = createLogger("training-sessions-actions");

// Schema for validation
const TrainingSessionSchema = z.object({
  id: z.string().optional(),
  user_id: z.string(),
  mesocycle_id: z.string(),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  status: z.enum(["planned", "in_progress", "completed", "cancelled"]),
  scheduled_date: z.string().optional(),
  completed_date: z.string().optional(),
});

export type TrainingSessionFormData = z.infer<typeof TrainingSessionSchema>;

// Schema for exercise in session
const SessionExerciseSchema = z.object({
  id: z.string().optional(),
  session_template_id: z.string().optional(),
  exercise_id: z.string(),
  order: z.number().default(0),
  target_sets: z.number().min(1, "At least 1 set is required"),
  target_reps_min: z.number().min(1, "Minimum reps required").optional(),
  target_reps_max: z.number().min(1, "Maximum reps required").optional(),
  target_rir: z.number().min(0).optional(),
  planned_rest_seconds: z.number().min(0).optional(),
  notes: z.string().optional(),
});

export type SessionExerciseFormData = z.infer<typeof SessionExerciseSchema>;

export async function getTrainingSessions(userId: string) {
  return safeAction(async () => {
    const startTime = performance.now();
    logger.debug("Starting getTrainingSessions", { userId });

    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("training_sessions_template")
        .select("*")
        .eq("user_id", userId)
        .order("scheduled_date", { ascending: true });

      const elapsedTime = Math.round(performance.now() - startTime);

      if (error) {
        logger.warn("Error fetching training sessions", {
          userId,
          error: error.message,
          code: error.code,
          elapsedMs: elapsedTime,
        });

        return {
          data: null,
          error: `Error fetching training sessions: ${error.message}`,
        };
      }

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
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("training_sessions_template")
        .select("*")
        .eq("mesocycle_id", mesocycleId)
        .order("scheduled_date", { ascending: true });

      const elapsedTime = Math.round(performance.now() - startTime);

      if (error) {
        logger.warn("Error fetching training sessions by mesocycle", {
          mesocycleId,
          error: error.message,
          code: error.code,
          elapsedMs: elapsedTime,
        });

        return {
          data: null,
          error: `Error fetching training sessions: ${error.message}`,
        };
      }

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
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("training_sessions_template")
        .select("*")
        .eq("id", id)
        .single();

      const elapsedTime = Math.round(performance.now() - startTime);

      if (error) {
        logger.warn("Error fetching training session", {
          sessionId: id,
          error: error.message,
          code: error.code,
          elapsedMs: elapsedTime,
        });

        return {
          data: null,
          error: `Error fetching training session: ${error.message}`,
        };
      }

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
      // Validate form data
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
        user_id,
        mesocycle_id,
        name,
        description,
        status,
        scheduled_date,
      } = validatedFields.data;

      const supabase = await createClient();
      const { data, error } = await supabase
        .from("training_sessions_template")
        .insert([
          { user_id, mesocycle_id, name, description, status, scheduled_date },
        ])
        .select()
        .single();

      const elapsedTime = Math.round(performance.now() - startTime);

      if (error) {
        logger.warn("Error creating training session", {
          name,
          mesocycleId: mesocycle_id,
          error: error.message,
          code: error.code,
          elapsedMs: elapsedTime,
        });

        return {
          data: null,
          error: `Error creating training session: ${error.message}`,
        };
      }

      logger.info("Successfully created training session", {
        name,
        mesocycleId: mesocycle_id,
        sessionId: data?.id,
        elapsedMs: elapsedTime,
      });

      revalidatePath("/dashboard/training-sessions");
      redirect("/dashboard/training-sessions");

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
      // Validate form data
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

      const { id, name, description, status, scheduled_date, completed_date } =
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

      const supabase = await createClient();
      const { data, error } = await supabase
        .from("training_sessions_template")
        .update({ name, description, status, scheduled_date, completed_date })
        .eq("id", id)
        .select()
        .single();

      const elapsedTime = Math.round(performance.now() - startTime);

      if (error) {
        logger.warn("Error updating training session", {
          id,
          name,
          error: error.message,
          code: error.code,
          elapsedMs: elapsedTime,
        });

        return {
          data: null,
          error: `Error updating training session: ${error.message}`,
        };
      }

      logger.info("Successfully updated training session", {
        id,
        name,
        status,
        elapsedMs: elapsedTime,
      });

      revalidatePath("/dashboard/training-sessions");
      redirect("/dashboard/training-sessions");

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
      const supabase = await createClient();
      const { error } = await supabase
        .from("training_sessions_template")
        .delete()
        .eq("id", id);

      const elapsedTime = Math.round(performance.now() - startTime);

      if (error) {
        logger.warn("Error deleting training session", {
          sessionId: id,
          error: error.message,
          code: error.code,
          elapsedMs: elapsedTime,
        });

        return {
          data: null,
          error: `Error deleting training session: ${error.message}`,
        };
      }

      logger.info("Successfully deleted training session", {
        sessionId: id,
        elapsedMs: elapsedTime,
      });

      revalidatePath("/dashboard/training-sessions");

      return {
        data: { success: true },
        error: null,
      };
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
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("training_session_exercises")
      .select(
        `
        *,
        exercise:exercises(*)
      `
      )
      .eq("session_template_id", sessionId)
      .order("order");

    const elapsedTime = Math.round(performance.now() - startTime);

    if (error) {
      logger.error("Error fetching session exercises", {
        sessionId,
        error: error.message,
        code: error.code,
        elapsedMs: elapsedTime,
      });

      throw new Error(`Error fetching session exercises: ${error.message}`);
    }

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
    sessionTemplateId: formData.session_template_id,
    exerciseId: formData.exercise_id,
  });

  try {
    // Validate form data
    const validatedFields = SessionExerciseSchema.safeParse(formData);

    if (!validatedFields.success) {
      logger.warn("Invalid session exercise form data", {
        errors: validatedFields.error.errors,
        sessionTemplateId: formData.session_template_id,
        exerciseId: formData.exercise_id,
      });

      return {
        error: "Invalid form data. Please check the fields and try again.",
      };
    }

    const {
      session_template_id,
      exercise_id,
      order,
      target_sets,
      target_reps_min,
      target_reps_max,
      target_rir,
      planned_rest_seconds,
      notes,
    } = validatedFields.data;

    if (!session_template_id) {
      logger.warn("Missing session template ID", {
        exerciseId: exercise_id,
      });

      return {
        error: "Session template ID is required",
      };
    }

    const supabase = await createClient();
    // Get the current highest order value
    const { data: orderData, error: orderError } = await supabase
      .from("training_session_exercises")
      .select("order")
      .eq("session_template_id", session_template_id)
      .order("order", { ascending: false })
      .limit(1);

    if (orderError) {
      logger.warn("Error fetching order data for exercise", {
        sessionTemplateId: session_template_id,
        error: orderError.message,
        code: orderError.code,
      });
    }

    const nextOrder =
      orderData && orderData.length > 0 ? orderData[0].order + 1 : 0;

    const { error } = await supabase.from("training_session_exercises").insert([
      {
        session_template_id,
        exercise_id,
        order: nextOrder,
        target_sets,
        target_reps_min: target_reps_min || null,
        target_reps_max: target_reps_max || null,
        target_rir: target_rir || null,
        planned_rest_seconds: planned_rest_seconds || null,
        notes: notes || null,
      },
    ]);

    const elapsedTime = Math.round(performance.now() - startTime);

    if (error) {
      logger.warn("Error adding exercise to session", {
        sessionTemplateId: session_template_id,
        exerciseId: exercise_id,
        error: error.message,
        code: error.code,
        elapsedMs: elapsedTime,
      });

      return {
        error: `Error adding exercise to session: ${error.message}`,
      };
    }

    // Get the mesocycle ID for the redirect
    const { data: sessionData, error: sessionError } = await supabase
      .from("training_sessions_template")
      .select("mesocycle_id")
      .eq("id", session_template_id)
      .single();

    if (sessionError) {
      logger.warn("Error fetching session data for redirect", {
        sessionTemplateId: session_template_id,
        error: sessionError.message,
        code: sessionError.code,
      });

      return {
        error: `Error fetching session data: ${sessionError.message}`,
      };
    }

    logger.info("Successfully added exercise to session", {
      sessionTemplateId: session_template_id,
      exerciseId: exercise_id,
      mesocycleId: sessionData.mesocycle_id,
      order: nextOrder,
      elapsedMs: elapsedTime,
    });

    revalidatePath(
      `/dashboard/mesocycles/${sessionData.mesocycle_id}/sessions/${session_template_id}`
    );
    redirect(
      `/dashboard/mesocycles/${sessionData.mesocycle_id}/sessions/${session_template_id}`
    );
  } catch (error) {
    logger.error(
      "Exception in addExerciseToSession",
      error instanceof Error ? error : new Error(String(error)),
      {
        sessionTemplateId: formData.session_template_id,
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
  const startTime = performance.now();
  logger.debug("Starting updateSessionExercise", {
    id: formData.id,
    sessionTemplateId: formData.session_template_id,
    exerciseId: formData.exercise_id,
  });

  try {
    // Validate form data
    const validatedFields = SessionExerciseSchema.safeParse(formData);

    if (!validatedFields.success) {
      logger.warn("Invalid session exercise update form data", {
        errors: validatedFields.error.errors,
        id: formData.id,
        sessionTemplateId: formData.session_template_id,
        exerciseId: formData.exercise_id,
      });

      return {
        error: "Invalid form data. Please check the fields and try again.",
      };
    }

    const {
      id,
      session_template_id,
      exercise_id,
      order,
      target_sets,
      target_reps_min,
      target_reps_max,
      target_rir,
      planned_rest_seconds,
      notes,
    } = validatedFields.data;

    if (!id) {
      logger.warn("Missing session exercise ID for update", {
        sessionTemplateId: session_template_id,
        exerciseId: exercise_id,
      });

      return {
        error: "Exercise ID is required for updates",
      };
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("training_session_exercises")
      .update({
        exercise_id,
        order,
        target_sets,
        target_reps_min: target_reps_min || null,
        target_reps_max: target_reps_max || null,
        target_rir: target_rir || null,
        planned_rest_seconds: planned_rest_seconds || null,
        notes: notes || null,
      })
      .eq("id", id);

    const elapsedTime = Math.round(performance.now() - startTime);

    if (error) {
      logger.warn("Error updating session exercise", {
        id,
        sessionTemplateId: session_template_id,
        exerciseId: exercise_id,
        error: error.message,
        code: error.code,
        elapsedMs: elapsedTime,
      });

      return {
        error: `Error updating session exercise: ${error.message}`,
      };
    }

    // Get the mesocycle ID for the redirect
    const { data: sessionData, error: sessionError } = await supabase
      .from("training_sessions_template")
      .select("mesocycle_id")
      .eq("id", session_template_id)
      .single();

    if (sessionError) {
      logger.warn("Error fetching session data for redirect", {
        sessionTemplateId: session_template_id,
        error: sessionError.message,
        code: sessionError.code,
      });

      return {
        error: `Error fetching session data: ${sessionError.message}`,
      };
    }

    logger.info("Successfully updated session exercise", {
      id,
      sessionTemplateId: session_template_id,
      exerciseId: exercise_id,
      mesocycleId: sessionData.mesocycle_id,
      elapsedMs: elapsedTime,
    });

    revalidatePath(
      `/dashboard/mesocycles/${sessionData.mesocycle_id}/sessions/${session_template_id}`
    );
    redirect(
      `/dashboard/mesocycles/${sessionData.mesocycle_id}/sessions/${session_template_id}`
    );
  } catch (error) {
    logger.error(
      "Exception in updateSessionExercise",
      error instanceof Error ? error : new Error(String(error)),
      {
        id: formData.id,
        sessionTemplateId: formData.session_template_id,
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
    const supabase = await createClient();
    const { error } = await supabase
      .from("training_session_exercises")
      .delete()
      .eq("id", id);

    const elapsedTime = Math.round(performance.now() - startTime);

    if (error) {
      logger.warn("Error removing exercise from session", {
        id,
        sessionId,
        error: error.message,
        code: error.code,
        elapsedMs: elapsedTime,
      });

      return {
        error: `Error removing exercise from session: ${error.message}`,
      };
    }

    logger.info("Successfully removed exercise from session", {
      id,
      sessionId,
      mesocycleId,
      elapsedMs: elapsedTime,
    });

    revalidatePath(
      `/dashboard/mesocycles/${mesocycleId}/sessions/${sessionId}`
    );
    return { success: true };
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
  const startTime = performance.now();
  logger.debug("Starting reorderSessionExercises", {
    sessionId,
    exerciseCount: exerciseIds.length,
  });

  try {
    const supabase = await createClient();

    // Update the order of each exercise
    for (let i = 0; i < exerciseIds.length; i++) {
      const { error } = await supabase
        .from("training_session_exercises")
        .update({ order: i })
        .eq("id", exerciseIds[i]);

      if (error) {
        logger.warn("Error reordering exercise", {
          sessionId,
          exerciseId: exerciseIds[i],
          newOrder: i,
          error: error.message,
          code: error.code,
        });

        return {
          error: `Error reordering exercises: ${error.message}`,
        };
      }
    }

    // Get the mesocycle ID for the revalidation
    const { data: sessionData, error: sessionError } = await supabase
      .from("training_sessions_template")
      .select("mesocycle_id")
      .eq("id", sessionId)
      .single();

    const elapsedTime = Math.round(performance.now() - startTime);

    if (sessionError) {
      logger.warn("Error fetching session data after reordering", {
        sessionId,
        error: sessionError.message,
        code: sessionError.code,
        elapsedMs: elapsedTime,
      });

      return {
        error: `Error fetching session data: ${sessionError.message}`,
      };
    }

    logger.info("Successfully reordered session exercises", {
      sessionId,
      exerciseCount: exerciseIds.length,
      mesocycleId: sessionData.mesocycle_id,
      elapsedMs: elapsedTime,
    });

    revalidatePath(
      `/dashboard/mesocycles/${sessionData.mesocycle_id}/sessions/${sessionId}`
    );

    return { success: true };
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
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("training_sessions_template")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

      const elapsedTime = Math.round(performance.now() - startTime);

      if (error) {
        logger.warn("Error updating training session status", {
          sessionId: id,
          newStatus: status,
          error: error.message,
          code: error.code,
          elapsedMs: elapsedTime,
        });

        return {
          data: null,
          error: `Error updating training session status: ${error.message}`,
        };
      }

      logger.info("Successfully updated training session status", {
        sessionId: id,
        name: data?.name,
        oldStatus: data?.status,
        newStatus: status,
        elapsedMs: elapsedTime,
      });

      revalidatePath("/dashboard/training-sessions");

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
