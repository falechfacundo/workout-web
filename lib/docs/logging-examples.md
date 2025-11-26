# Logging System Usage Guide

This guide provides practical examples of how to use the logging system across different parts of the Workout App.

## Table of Contents

1. [Server Actions](#server-actions)
2. [API Routes](#api-routes)
3. [Error Handling](#error-handling)
4. [Client Components](#client-components)
5. [Database Operations](#database-operations)
6. [Authentication](#authentication)
7. [Performance Monitoring](#performance-monitoring)

## Server Actions

Server actions should use the `safeAction` wrapper or one of its variants to ensure proper logging.

### Basic Server Action

```typescript
// lib/actions/exercises.ts
"use server";

import { safeAction } from "@/lib/utils/safe-action";
import { createClient } from "@/lib/utils/supabase/server";
import { createLogger } from "@/lib/utils/logger";

const logger = createLogger("exercises-actions");

export async function getExercises() {
  return safeAction(async () => {
    logger.debug("Fetching exercises");

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("exercises")
      .select("*")
      .order("name");

    if (error) {
      logger.error("Failed to fetch exercises", error);
      return {
        data: null,
        error: `Error fetching exercises: ${error.message}`,
      };
    }

    logger.info("Exercises fetched successfully", { count: data.length });
    return {
      data,
      error: null,
    };
  });
}
```

### Schema-Validated Server Action

```typescript
// lib/actions/mesocycle-templates.ts
"use server";

import { z } from "zod";
import { createSafeAction } from "@/lib/utils/safe-action";
import { createClient } from "@/lib/utils/supabase/server";
import { mesocycleTemplateSchema } from "@/lib/schemas/mesocycle-template";
import { createLogger } from "@/lib/utils/logger";

const logger = createLogger("mesocycle-templates");

export const createMesocycleTemplate = createSafeAction({
  name: "createMesocycleTemplate",
  schema: mesocycleTemplateSchema,
  handler: async (data) => {
    try {
      logger.debug("Creating mesocycle template", { name: data.name });

      const supabase = await createClient();
      const { data: newTemplate, error } = await supabase
        .from("mesocycle_templates")
        .insert([data])
        .select()
        .single();

      if (error) {
        logger.error("Failed to create mesocycle template", error, {
          template: data.name,
        });
        return {
          data: null,
          error: `Error creating template: ${error.message}`,
        };
      }

      logger.info("Mesocycle template created", { templateId: newTemplate.id });
      return {
        data: newTemplate,
        error: null,
      };
    } catch (error) {
      logger.error(
        "Unexpected error in createMesocycleTemplate",
        error instanceof Error ? error : new Error(String(error))
      );
      return {
        data: null,
        error: "An unexpected error occurred while creating the template",
      };
    }
  },
});
```

### Authenticated Server Action

```typescript
// lib/actions/profile.ts
"use server";

import { z } from "zod";
import { createAuthenticatedAction } from "@/lib/utils/safe-action";
import { profileSchema } from "@/lib/schemas/profile";
import { createClient } from "@/lib/utils/supabase/server";

export const updateProfile = createAuthenticatedAction({
  schema: z.object({
    name: z.string().min(1, "Name is required"),
    bio: z.string().optional(),
  }),
  handler: async (data, userId) => {
    const supabase = await createClient();
    const { data: profile, error } = await supabase
      .from("profiles")
      .update({
        name: data.name,
        bio: data.bio,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      return {
        data: null,
        error: `Error updating profile: ${error.message}`,
      };
    }

    return {
      data: profile,
      error: null,
    };
  },
});
```

## API Routes

API routes should use the logging middleware for consistent HTTP request logging.

```typescript
// app/api/webhooks/stripe/route.ts
import { NextRequest } from "next/server";
import { withLogging } from "@/lib/utils/logging-middleware";
import { createLogger } from "@/lib/utils/logger";

const logger = createLogger("stripe-webhook");

async function handler(req: NextRequest) {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const body = await req.text();

    // Log the webhook event (excluding sensitive info)
    logger.info("Received Stripe webhook", {
      eventType: req.headers.get("stripe-event-type"),
    });

    // Process the webhook...

    return new Response("Success", { status: 200 });
  } catch (error) {
    logger.error(
      "Error processing Stripe webhook",
      error instanceof Error ? error : new Error(String(error))
    );
    return new Response("Internal Server Error", { status: 500 });
  }
}

export const POST = withLogging(handler);
```

## Error Handling

Use `AppError` with logging for consistent error handling.

```typescript
// lib/actions/workout-logs.ts
import { AppError } from "@/lib/error";
import { createLogger } from "@/lib/utils/logger";

const logger = createLogger("workout-logs");

export async function validateAndSaveWorkoutLog(data) {
  try {
    // Validation logic
    if (!data.exercises || data.exercises.length === 0) {
      logger.warn("Attempted to save workout log with no exercises", {
        userId: data.userId,
        sessionId: data.sessionId,
      });
      throw AppError.validation(
        "Workout log must include at least one exercise",
        "exercises"
      );
    }

    // Check if session exists
    const session = await getSession(data.sessionId);
    if (!session) {
      logger.warn(`Training session not found: ${data.sessionId}`, {
        userId: data.userId,
      });
      throw AppError.notFound("Training session", data.sessionId);
    }

    // Save logic...
  } catch (error) {
    if (error instanceof AppError) {
      // AppError is already logged by the appError method
      throw error;
    } else {
      // Log unexpected errors
      logger.error(
        "Failed to save workout log",
        error instanceof Error ? error : new Error(String(error))
      );
      throw AppError.serverError("Failed to save workout log");
    }
  }
}
```

## Database Operations

Log database operations for performance monitoring and debugging.

```typescript
// lib/db/mesocycle-repository.ts
import { createLogger } from "@/lib/utils/logger";
import { AppError } from "@/lib/error";
import { createClient } from "@/lib/utils/supabase/server";

const logger = createLogger("mesocycle-repository");

export async function getMesocycleWithSessions(id: string, userId: string) {
  logger.debug(`Fetching mesocycle ${id} with sessions`, { userId });
  const startTime = performance.now();

  try {
    const supabase = await createClient();

    // Fetch mesocycle
    const { data: mesocycle, error: mesocycleError } = await supabase
      .from("mesocycles")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (mesocycleError) {
      throw AppError.fromDatabaseError(
        mesocycleError,
        "Failed to fetch mesocycle"
      );
    }

    if (!mesocycle) {
      throw AppError.notFound("Mesocycle", id);
    }

    // Fetch sessions
    const { data: sessions, error: sessionsError } = await supabase
      .from("training_sessions")
      .select("*")
      .eq("mesocycle_id", id)
      .order("scheduled_date", { ascending: true });

    if (sessionsError) {
      throw AppError.fromDatabaseError(
        sessionsError,
        "Failed to fetch training sessions"
      );
    }

    const duration = Math.round(performance.now() - startTime);
    logger.info(`Fetched mesocycle with ${sessions.length} sessions`, {
      mesocycleId: id,
      duration,
      userId,
    });

    return {
      ...mesocycle,
      sessions: sessions || [],
    };
  } catch (error) {
    const duration = Math.round(performance.now() - startTime);

    if (error instanceof AppError) {
      logger.appError(error, { mesocycleId: id, duration, userId });
    } else {
      logger.error(
        `Failed to fetch mesocycle ${id}`,
        error instanceof Error ? error : new Error(String(error)),
        {
          duration,
          userId,
        }
      );
    }

    throw error;
  }
}
```

## Authentication

Log authentication events properly (without sensitive data).

```typescript
// lib/auth.ts
import { createLogger } from "@/lib/utils/logger";

const logger = createLogger("auth");

export async function signIn(email: string, password: string) {
  try {
    logger.info("Sign in attempt", { email: maskEmail(email) });

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      logger.warn("Sign in failed", {
        email: maskEmail(email),
        errorCode: error.code,
        errorMessage: error.message,
      });
      throw error;
    }

    logger.info("Sign in successful", {
      userId: data.user?.id,
      email: maskEmail(email),
    });

    return data;
  } catch (error) {
    throw error;
  }
}

// Helper function to mask email for logging
function maskEmail(email: string): string {
  const [localPart, domain] = email.split("@");
  const maskedLocal = localPart.slice(0, 2) + "***";
  return `${maskedLocal}@${domain}`;
}
```

## Performance Monitoring

Use logging to track performance of key operations.

```typescript
// lib/actions/analytics.ts
import { createLogger } from "@/lib/utils/logger";
import { getWeekStartDate } from "@/lib/utils";

const logger = createLogger("analytics");

export async function generateUserDashboardData(userId: string) {
  const startTime = performance.now();
  logger.debug("Generating dashboard data", { userId });

  try {
    const metrics = {};
    let totalQueries = 0;

    // Recent workouts
    const recentWorkoutsStart = performance.now();
    metrics.recentWorkouts = await getRecentWorkouts(userId, 5);
    logger.debug("Recent workouts query complete", {
      userId,
      duration: Math.round(performance.now() - recentWorkoutsStart),
      count: metrics.recentWorkouts.length,
    });
    totalQueries++;

    // Current mesocycle
    const mesocycleStart = performance.now();
    metrics.currentMesocycle = await getCurrentMesocycle(userId);
    logger.debug("Current mesocycle query complete", {
      userId,
      duration: Math.round(performance.now() - mesocycleStart),
      hasMesocycle: !!metrics.currentMesocycle,
    });
    totalQueries++;

    // Training consistency
    const weekStart = getWeekStartDate();
    const consistencyStart = performance.now();
    metrics.weeklyConsistency = await getTrainingConsistency(userId, weekStart);
    logger.debug("Training consistency query complete", {
      userId,
      duration: Math.round(performance.now() - consistencyStart),
    });
    totalQueries++;

    // More metrics...

    const totalDuration = Math.round(performance.now() - startTime);
    logger.info("Dashboard data generated", {
      userId,
      totalDuration,
      totalQueries,
      avgQueryTime: Math.round(totalDuration / totalQueries),
    });

    return metrics;
  } catch (error) {
    const duration = Math.round(performance.now() - startTime);
    logger.error(
      "Failed to generate dashboard data",
      error instanceof Error ? error : new Error(String(error)),
      {
        userId,
        duration,
      }
    );
    throw error;
  }
}
```
