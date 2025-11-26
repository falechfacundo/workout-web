# Workout App - Logging System

## Overview

The Workout App includes a robust and flexible logging system that provides structured logging capabilities across the application. This system helps with debugging, monitoring, analytics, and error tracking.

## Documentation

For detailed information about the logging system, please refer to these documentation files:

- [Logging System Architecture](./logging-system.md) - Complete overview of the logging system components and design
- [Logging Usage Examples](./logging-examples.md) - Practical examples of how to use the logging system
- [Lib Directory Structure](./lib-directory-structure.md) - Overview of the entire lib directory structure

## Quick Start

### Basic Usage

```typescript
import { createLogger } from "@/lib/utils/logger";

// Create a logger for your module
const logger = createLogger("my-component");

// Log at different levels
logger.debug("Detailed information for debugging");
logger.info("Something noteworthy happened");
logger.warn("Something unexpected but not critical");
logger.error("Something went wrong", new Error("Details about the error"));
```

### With Additional Context

```typescript
logger.info(
  "User action completed",
  {
    action: "profile-update",
    fields: ["name", "email"],
    timeTaken: 230, // ms
  },
  userId
);
```

### Error Handling

```typescript
import { AppError } from "@/lib/error";

try {
  // Some operation
  if (!foundItem) {
    throw AppError.notFound("Item", itemId);
  }
} catch (error) {
  if (error instanceof AppError) {
    logger.appError(error); // Automatically uses the appropriate log level
  } else {
    logger.error("Unexpected error", error);
  }
  // Handle the error...
}
```

### In Server Actions

Server actions should use the `safeAction` wrapper to ensure consistent error handling and logging:

```typescript
import { safeAction } from "@/lib/utils/safe-action";

export async function myServerAction(data) {
  return safeAction(async () => {
    // Action implementation
    // All errors are automatically logged
  });
}
```

For more advanced actions with schema validation:

```typescript
import { createSafeAction } from "@/lib/utils/safe-action";
import { z } from "zod";

export const createItem = createSafeAction({
  schema: z.object({
    /* schema definition */
  }),
  handler: async (validatedData) => {
    // Implementation with pre-validated data
  },
});
```

## Log Levels

- **DEBUG**: Fine-grained information for debugging
- **INFO**: General information about application operation
- **WARN**: Potentially harmful situations that don't prevent operation
- **ERROR**: Error conditions that may impact functionality
- **FATAL**: Severe errors that prevent application operation

## Best Practices

1. Create a specific logger for each module
2. Include relevant context data with logs
3. Use appropriate log levels
4. Log before throwing errors
5. Avoid logging sensitive information
6. Include user context when available
7. Log performance metrics for important operations
