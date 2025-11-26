/**
 * Error handling and coding system for the application
 * This module provides standardized error types and error creation utilities
 */

/**
 * Standardized error codes for the application
 * Use these codes consistently throughout the application to enable
 * proper error handling, logging, and user notifications
 */
export enum ErrorCode {
  UNAUTHORIZED = "UNAUTHORIZED",
  NOT_FOUND = "NOT_FOUND",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  SERVER_ERROR = "SERVER_ERROR",
  CONFLICT = "CONFLICT",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  BAD_REQUEST = "BAD_REQUEST",
  FORBIDDEN = "FORBIDDEN",
  // Añadir más códigos según sea necesario
}

/**
 * Application-specific error class
 * This class extends the standard Error with additional properties
 * to support better error handling and logging
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: ErrorCode,
    public field?: string,
    public httpStatus: number = 400,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = "AppError";
    
    // Capture stack trace for better debugging
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  static unauthorized(message = "Authentication required", context?: Record<string, any>) {
    return new AppError(message, ErrorCode.UNAUTHORIZED, undefined, 401, context);
  }
  static notFound(entity: string, id?: string, context?: Record<string, any>) {
    const message = id
      ? `${entity} with id ${id} not found`
      : `${entity} not found`;
    return new AppError(message, ErrorCode.NOT_FOUND, undefined, 404, context);
  }

  static validation(message: string, field?: string, context?: Record<string, any>) {
    return new AppError(message, ErrorCode.VALIDATION_ERROR, field, 400, context);
  }
  static serverError(message = "Internal server error", context?: Record<string, any>) {
    return new AppError(message, ErrorCode.SERVER_ERROR, undefined, 500, context);
  }

  static conflict(message: string, field?: string, context?: Record<string, any>) {
    return new AppError(message, ErrorCode.CONFLICT, field, 409, context);
  }

  static badRequest(message: string, field?: string, context?: Record<string, any>) {
    return new AppError(message, ErrorCode.BAD_REQUEST, field, 400, context);
  }

  static forbidden(message = "You don't have permission to access this resource", context?: Record<string, any>) {
    return new AppError(message, ErrorCode.FORBIDDEN, undefined, 403, context);
  }

  static rateLimit(message = "Rate limit exceeded, please try again later", context?: Record<string, any>) {
    return new AppError(message, ErrorCode.RATE_LIMIT_EXCEEDED, undefined, 429, context);
  }

  /**
   * Helper method to ensure consistent handling of database errors
   */
  static fromDatabaseError(error: any, defaultMessage = "Database operation failed"): AppError {
    // Handle specific database errors
    if (error.code === "P2002") { // Prisma unique constraint error
      const field = error.meta?.target?.[0];
      return AppError.conflict(
        `A record with this ${field || 'value'} already exists`,
        field,
        { originalError: error }
      );
    }
    
    if (error.code === "P2025") { // Prisma not found error
      return AppError.notFound(
        error.meta?.cause || defaultMessage,
        undefined,
        { originalError: error }
      );
    }
    
    // Default to server error for all other database errors
    return AppError.serverError(
      defaultMessage,
      { 
        originalError: {
          code: error.code,
          message: error.message,
          meta: error.meta,
        } 
      }
    );
  }
}
