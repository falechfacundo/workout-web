import { z } from "zod";
import { SafeActionResult } from "../types/server-actions";
import { AppError, ErrorCode } from "../error";
import { createLogger } from "./logger";
import { getUser } from "../auth";

const logger = createLogger("safe-action");

/**
 * Simple safe action wrapper for functions
 *
 * This is a simpler version that can wrap existing functions without
 * requiring major refactoring
 */
export async function safeAction<T>(
  fn: () => Promise<T | { data: T | null; error: string | null }>
): Promise<SafeActionResult<T>> {
  const actionId = Math.random().toString(36).substring(2, 15);
  const actionName = fn.name || "anonymous";

  logger.debug(`Starting simple action execution`, {
    actionId,
    actionName,
  });

  try {
    const startTime = performance.now();
    const result = await fn();
    const duration = Math.round(performance.now() - startTime);

    logger.debug(`Action completed`, {
      actionId,
      actionName,
      duration,
    });

    // Si el resultado ya tiene el formato correcto (con data y error)
    if (
      result &&
      typeof result === "object" &&
      "data" in result &&
      "error" in result
    ) {
      if (result.error) {
        logger.warn(`Action returned error`, {
          actionId,
          actionName,
          error: result.error,
          duration,
        });
      }
      return result as SafeActionResult<T>;
    }

    // Si es un resultado simple, lo envolvemos en el formato correcto
    logger.debug(`Action succeeded with data`, {
      actionId,
      actionName,
      resultType: result ? typeof result : "undefined",
      resultIsArray: Array.isArray(result),
      duration,
    });

    return { data: result as T, error: null };
  } catch (e) {
    // Enhanced error logging
    if (e instanceof AppError) {
      logger.appError(e, { actionId, actionName });

      return {
        data: null,
        error: e.message,
        code: e.code,
        field: e.field,
      };
    } else {
      logger.error(
        `Unhandled error in action ${actionName}`,
        e instanceof Error ? e : new Error(String(e)),
        { actionId }
      );

      return {
        data: null,
        error:
          e instanceof Error
            ? e.message
            : "An unexpected error occurred. Please try again.",
        code: ErrorCode.SERVER_ERROR,
      };
    }
  }
}

/**
 * Creates a schema-validated safe action with integrated logging
 *
 * This is a more advanced version that adds Zod schema validation,
 * proper error handling, and comprehensive logging
 */
export function createSafeAction<TInput, TOutput>(options: {
  schema: z.ZodType<TInput>;
  handler: (input: TInput) => Promise<SafeActionResult<TOutput>>;
  name?: string;
}) {
  const actionName = options.name || options.handler.name || "anonymous";
  const actionLogger = createLogger(`action:${actionName}`);

  return async (input: unknown): Promise<SafeActionResult<TOutput>> => {
    const actionId = Math.random().toString(36).substring(2, 15);

    actionLogger.debug(`Starting schema-validated action`, {
      actionId,
      actionName,
      inputFields:
        input && typeof input === "object" ? Object.keys(input) : typeof input,
    });

    try {
      // Validate input data using Zod schema
      let validatedInput: TInput;

      try {
        validatedInput = options.schema.parse(input);
        actionLogger.debug(`Input validated successfully`, {
          actionId,
          inputFields: Object.keys(validatedInput || {}),
        });
      } catch (validationError) {
        if (validationError instanceof z.ZodError) {
          const firstError = validationError.errors[0];
          const error = AppError.validation(
            firstError.message,
            firstError.path.join("."),
            { zodError: validationError.errors }
          );

          actionLogger.appError(error, {
            actionId,
            inputFields:
              input && typeof input === "object"
                ? Object.keys(input)
                : typeof input,
          });

          return {
            data: null,
            error: firstError.message,
            code: ErrorCode.VALIDATION_ERROR,
            field: firstError.path.join("."),
          };
        }

        throw validationError;
      }

      // Execute the handler with validated input
      const startTime = performance.now();
      const result = await options.handler(validatedInput);
      const duration = Math.round(performance.now() - startTime);

      if (result.error) {
        actionLogger.warn(`Action handler returned error`, {
          actionId,
          error: result.error,
          code: result.code,
          field: result.field,
          duration,
        });
      } else {
        actionLogger.info(`Action completed successfully`, {
          actionId,
          duration,
          resultType: result.data ? typeof result.data : "null",
        });
      }

      return result;
    } catch (error) {
      // Enhanced error logging for unhandled errors
      if (error instanceof AppError) {
        actionLogger.appError(error, { actionId });

        return {
          data: null,
          error: error.message,
          code: error.code,
          field: error.field,
        };
      } else {
        actionLogger.error(
          `Unhandled error in action ${actionName}`,
          error instanceof Error ? error : new Error(String(error)),
          { actionId }
        );

        return {
          data: null,
          error:
            error instanceof Error
              ? error.message
              : "An unexpected error occurred. Please try again.",
          code: ErrorCode.SERVER_ERROR,
        };
      }
    }
  };
}

/**
 * Creates an authenticated safe action with schema validation and logging
 * This variant requires the user to be authenticated first
 */
export function createAuthenticatedAction<TInput, TOutput>(options: {
  schema: z.ZodType<TInput>;
  handler: (
    input: TInput,
    userId: string
  ) => Promise<SafeActionResult<TOutput>>;
  name?: string;
}) {
  const actionName = options.name || options.handler.name || "anonymous";
  const actionLogger = createLogger(`auth-action:${actionName}`);

  return async (input: unknown): Promise<SafeActionResult<TOutput>> => {
    const actionId = Math.random().toString(36).substring(2, 15);

    actionLogger.debug(`Starting authenticated action`, {
      actionId,
      actionName,
    });

    try {
      // Check authentication
      const user = await getUser();

      if (!user?.id) {
        const error = AppError.unauthorized();
        actionLogger.appError(error, { actionId });

        return {
          data: null,
          error: error.message,
          code: error.code,
        };
      }

      const userId = user.id;
      actionLogger.debug(`User authenticated`, { actionId, userId });

      // Validate input data using Zod schema
      let validatedInput: TInput;

      try {
        validatedInput = options.schema.parse(input);
        actionLogger.debug(`Input validated successfully`, {
          actionId,
          userId,
          inputFields: Object.keys(validatedInput || {}),
        });
      } catch (validationError) {
        if (validationError instanceof z.ZodError) {
          const firstError = validationError.errors[0];
          const error = AppError.validation(
            firstError.message,
            firstError.path.join("."),
            { zodError: validationError.errors }
          );

          actionLogger.appError(error, {
            actionId,
            userId,
            inputFields:
              input && typeof input === "object"
                ? Object.keys(input)
                : typeof input,
          });

          return {
            data: null,
            error: firstError.message,
            code: ErrorCode.VALIDATION_ERROR,
            field: firstError.path.join("."),
          };
        }

        throw validationError;
      }

      // Execute the handler
      const startTime = performance.now();
      const result = await options.handler(validatedInput, userId);
      const duration = Math.round(performance.now() - startTime);

      if (result.error) {
        actionLogger.warn(`Action handler returned error`, {
          actionId,
          userId,
          error: result.error,
          code: result.code,
          field: result.field,
          duration,
        });
      } else {
        actionLogger.info(`Action completed successfully`, {
          actionId,
          userId,
          duration,
          resultType: result.data ? typeof result.data : "null",
        });
      }

      return result;
    } catch (error) {
      // Enhanced error logging for unhandled errors
      if (error instanceof AppError) {
        actionLogger.appError(error, { actionId });

        return {
          data: null,
          error: error.message,
          code: error.code,
          field: error.field,
        };
      } else {
        actionLogger.error(
          `Unhandled error in authenticated action ${actionName}`,
          error instanceof Error ? error : new Error(String(error)),
          { actionId }
        );

        return {
          data: null,
          error:
            error instanceof Error
              ? error.message
              : "An unexpected error occurred. Please try again.",
          code: ErrorCode.SERVER_ERROR,
        };
      }
    }
  };
}
