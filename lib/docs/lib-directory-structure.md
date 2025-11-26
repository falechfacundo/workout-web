# Lib Directory Documentation

The `lib` directory contains the core utilities, types, schemas, stores, and server actions that power the Workout App. This document provides an overview of the directory structure and the purpose of each component.

## Directory Structure

```
lib/
├── actions/          # Server actions for data manipulation
├── providers/        # React context providers
├── schemas/          # Zod validation schemas for data models
├── stores/           # Zustand client-side stores
├── types/            # TypeScript type definitions
├── utils/            # Utility functions and helpers
├── auth.ts           # Authentication utilities
├── error.ts          # Error handling system
└── utils.ts          # General utilities
```

## Key Components

### `/actions`

Server actions for interacting with the database. These are organized by entity type:

- `analytics.ts` - Analytics data retrieval functions
- `exercises.ts` - Exercise CRUD operations
- `mesocycles.ts` - Mesocycle management
- `mesocycle-templates.ts` - Mesocycle template operations
- `muscle-groups.ts` - Muscle group operations
- `profile.ts` - User profile management
- `protected-example.ts` - Example of protected actions
- `training-sessions.ts` - Training session operations
- `workout-logs.ts` - Workout logging functions

All server actions use the `safeAction` wrapper for consistent error handling and logging.

### `/providers`

React context providers for managing global state:

- `auth-provider.tsx` - Authentication state provider
- `theme-provider.tsx` - Theme management provider

### `/schemas`

Zod validation schemas for all data models in the application:

- `auth.ts` - Authentication data schemas
- `exercise.ts` - Exercise model schema
- `exercise-log.ts` - Exercise logging schema
- `measurement.ts` - Body measurement schema
- `mesocycle.ts` - Mesocycle schema
- `mesocycle-template.ts` - Mesocycle template schema
- `muscle-group.ts` - Muscle group schema
- `profile.ts` - User profile schema
- `session-exercise.ts` - Exercise within a session schema
- `session-template.ts` - Session template schema
- `training-session.ts` - Training session schema
- `workout-log.ts` - Workout logging schema
- `workout-set.ts` - Individual workout set schema

### `/stores`

Zustand client-side stores for state management:

- `exercises-store.ts` - Client-side state for exercises
- `mesocycles-store.ts` - Client-side state for mesocycles
- `mesocycle-templates-store.ts` - Client-side state for mesocycle templates
- `muscle-groups-store.ts` - Client-side state for muscle groups
- `profile-store.ts` - Client-side state for user profile
- `training-sessions-store.ts` - Client-side state for training sessions
- `workout-logs-store.ts` - Client-side state for workout logs
- `index.ts` - Store exports and utilities

### `/types`

TypeScript type definitions:

- `server-actions.ts` - Types for server action results

### `/utils`

Utility functions and helpers:

- `logger.ts` - Application logging system
- `logging-middleware.ts` - HTTP request/response logging
- `rate-limiter.ts` - API rate limiting
- `safe-action.ts` - Server action wrapper with error handling
- `server-auth.ts` - Server-side authentication utilities
- `supabase/` - Supabase client utilities
  - `client.ts` - Browser client
  - `middleware.ts` - Middleware utilities
  - `server.ts` - Server-side client

### Root Files

- `auth.ts` - Core authentication functions
- `error.ts` - Error handling classes and utilities
- `utils.ts` - General utility functions
