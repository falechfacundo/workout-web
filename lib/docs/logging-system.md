# Logging System Documentation

The Workout App implements a comprehensive logging system that provides structured logging capabilities across the application. This document describes the logging architecture, components, and usage patterns.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Core Components](#core-components)
3. [Logging Levels](#logging-levels)
4. [Usage Examples](#usage-examples)
5. [Error Handling Integration](#error-handling-integration)
6. [HTTP Request Logging](#http-request-logging)
7. [Server Action Logging](#server-action-logging)
8. [Best Practices](#best-practices)

## Architecture Overview

The logging system is designed with the following goals:

- **Structured logging**: All logs follow a consistent format with metadata
- **Modularity**: Independent modules have their own loggers for clear source identification
- **Configurable**: Different log levels and transports based on environment
- **Integration**: Seamless integration with error handling and server actions
- **Performance**: Minimal overhead for production environments

The system consists of a main `Logger` class that manages log transports, and module-specific loggers that provide context-aware logging capabilities.

## Core Components

### Logger Class

The primary class that handles the logging infrastructure:

```typescript
class Logger {
  private static instance: Logger;
  private transports: LoggerTransport[] = [];
  private defaultContext: Record<string, any> = {};

  // Singleton pattern
  public static getInstance(): Logger;

  // Add logging destinations
  public addTransport(transport: LoggerTransport): void;

  // Set default context for all logs
  public setDefaultContext(context: Record<string, any>): void;

  // Create a module-specific logger
  public createLogger(module: string): ModuleLogger;

  // Log an entry internally
  public logEntry(entry: LogEntry): void;
}
```

### ModuleLogger Class

Module-specific logger that provides context for each log:

```typescript
class ModuleLogger {
  constructor(private logger: Logger, private module: string);

  // Log methods for various levels
  debug(message: string, data?: Record<string, any>, userId?: string): void;
  info(message: string, data?: Record<string, any>, userId?: string): void;
  warn(
    message: string,
    data?: Record<string, any>,
    error?: Error,
    userId?: string
  ): void;
  error(
    message: string,
    error?: Error | AppError,
    data?: Record<string, any>,
    userId?: string
  ): void;
  fatal(
    message: string,
    error?: Error | AppError,
    data?: Record<string, any>,
    userId?: string
  ): void;
  appError(error: AppError, data?: Record<string, any>, userId?: string): void;
}
```

### LoggerTransport Interface

Interface for implementing different logging destinations:

```typescript
interface LoggerTransport {
  log(entry: LogEntry): void;
}
```

### Built-in Transports

- **ConsoleTransport**: Outputs logs to the console with proper formatting
- **ServerFileTransport**: Placeholder for server-side file logging (can be extended for production)

## Logging Levels

The system supports five logging levels in order of increasing severity:

1. **DEBUG**: Fine-grained information for debugging purposes
2. **INFO**: General information about application operation
3. **WARN**: Potentially harmful situations that don't prevent operation
4. **ERROR**: Error conditions that may impact functionality
5. **FATAL**: Severe errors that prevent application operation

## Usage Examples

### Basic Usage

```typescript
import { createLogger } from "@/lib/utils/logger";

// Create a logger for a specific module
const logger = createLogger("my-module");

// Log at different levels
logger.debug("Debugging information", { contextData: "value" });
logger.info("User registered successfully", { userId: "123" });
logger.warn("API rate limit approaching", { currentUsage: 85 });
logger.error("Failed to process payment", new Error("Payment gateway error"), {
  orderId: "123",
});
```

### With User Context

```typescript
// When you have user information
const userId = "user-123";
logger.info(
  "User profile updated",
  { updatedFields: ["name", "email"] },
  userId
);
```

### Logging Application Errors

```typescript
import { AppError } from "@/lib/error";

try {
  // Some operation
} catch (error) {
  if (error instanceof AppError) {
    // AppError automatically maps to appropriate log level
    logger.appError(error, { contextData: "value" });
  } else {
    logger.error("Unexpected error", error);
  }
}
```

## Error Handling Integration

The logging system is deeply integrated with the application's error handling:

- **AppError Class**: Custom error class with standardized error codes
- **Error to Log Level Mapping**: AppError codes automatically map to appropriate log levels
- **Context Preservation**: Error context is preserved in logs

```typescript
// AppError codes map to log levels
const levelMap: Record<ErrorCode, LogLevel> = {
  [ErrorCode.VALIDATION_ERROR]: LogLevel.WARN,
  [ErrorCode.NOT_FOUND]: LogLevel.WARN,
  [ErrorCode.UNAUTHORIZED]: LogLevel.WARN,
  [ErrorCode.CONFLICT]: LogLevel.WARN,
  [ErrorCode.SERVER_ERROR]: LogLevel.ERROR,
};
```

## HTTP Request Logging

The application includes middleware for logging HTTP requests and responses:

```typescript
// In an API route
import { withLogging } from "@/lib/utils/logging-middleware";

export const GET = withLogging(async (req: NextRequest) => {
  // Route handler logic
});
```

This logs:

- Request details (method, URL, user agent, IP)
- Response status and timing
- Any errors that occur during request handling

## Server Action Logging

Server actions use the `safeAction` wrapper to integrate with the logging system:

```typescript
import { safeAction } from "@/lib/utils/safe-action";

export async function createItem(data: ItemData) {
  return safeAction(async () => {
    // Action logic here
  });
}
```

The `safeAction` wrapper:

- Logs action start and completion with timing
- Captures and logs errors
- Formats response consistently

For schema validation and more advanced logging:

```typescript
import { createSafeAction } from "@/lib/utils/safe-action";
import { z } from "zod";

export const createItem = createSafeAction({
  schema: z.object({ name: z.string() }),
  handler: async (data) => {
    // Action logic
  },
  name: "createItem", // Optional name for logs
});
```

## Best Practices

1. **Create Module-Specific Loggers**

   ```typescript
   // Create at file level for module context
   const logger = createLogger("user-service");
   ```

2. **Include Relevant Context**

   ```typescript
   // Add contextual data to assist debugging
   logger.info("Order processed", { orderId, amount, paymentMethod });
   ```

3. **Log at Appropriate Levels**

   - DEBUG: Development details
   - INFO: Normal operations, state changes
   - WARN: Potential issues that don't break functionality
   - ERROR: Errors that impact functionality
   - FATAL: Severe errors that prevent operation

4. **Use AppError for Structured Errors**

   ```typescript
   // Instead of throwing generic errors
   throw AppError.notFound("User", userId);
   ```

5. **Log Before Throwing**

   ```typescript
   logger.warn("Invalid input received", { input });
   throw AppError.validation("Invalid input");
   ```

6. **Include User Context When Available**

   ```typescript
   logger.info("Profile updated", { updatedFields }, userId);
   ```

7. **Avoid Sensitive Information in Logs**

   ```typescript
   // DON'T: logger.info("User logged in", { password: "secret" });
   // DO: logger.info("User logged in", { userId: "123" });
   ```

8. **Use Try/Catch with Error Logging**
   ```typescript
   try {
     await riskyOperation();
   } catch (error) {
     logger.error("Failed to complete operation", error);
     throw error; // Re-throw if needed
   }
   ```
