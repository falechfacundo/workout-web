# Supabase Configuration for GymTrack

This directory contains the Supabase configuration for the GymTrack application, including database schema, seed data, and setup scripts.

## Overview

GymTrack uses Supabase as its backend, providing:
- PostgreSQL database
- Authentication
- Row Level Security (RLS)
- Storage
- Realtime subscriptions

## Directory Structure

\`\`\`
supabase/
├── schema.sql           # Database schema definition
├── seed.sql             # Sample data for development
├── config.toml          # Supabase configuration
├── init.sh              # Initialization script
└── README.md            # This file
\`\`\`

## Database Schema

The database schema is defined in `schema.sql` and includes the following tables:

### Core Tables

1. **profiles**
   - User profiles linked to Supabase Auth
   - Stores user preferences and personal information

2. **muscle_groups**
   - Muscle groups that can be targeted in exercises
   - Includes name, description, and color for UI display

3. **exercises**
   - Exercise definitions
   - Includes name, description, instructions, and video URL

4. **exercise_muscle_groups**
   - Junction table linking exercises to muscle groups
   - Indicates whether a muscle group is primary or secondary for an exercise

5. **mesocycles**
   - Training programs with start/end dates
   - Includes name, description, goal, and status

6. **training_sessions**
   - Workout templates within mesocycles
   - Includes name, description, day of week, and duration

7. **session_exercises**
   - Exercises within training sessions
   - Includes sets, reps, RIR (Reps In Reserve), rest times, and order

8. **workout_logs**
   - Logged workout instances
   - Includes date, start/end time, notes, and rating

9. **exercise_logs**
   - Individual exercise performance within workouts
   - Includes set number, reps, weight, RIR achieved, and notes

10. **workout_reminders**
    - Notification settings for workouts
    - Includes day of week, time of day, and notification type

### Analytics Functions

The schema also includes several PostgreSQL functions for analytics:

1. **get_workout_volume_by_muscle_group**
   - Calculates total volume (sets * reps * weight) per muscle group for a workout

2. **get_workout_sets_by_muscle_group**
   - Calculates total sets per muscle group for a workout

3. **get_exercise_progress**
   - Retrieves exercise progress over time (max weight and total volume)

### Row Level Security (RLS)

All tables have Row Level Security policies to ensure users can only access their own data. The policies are defined for SELECT, INSERT, UPDATE, and DELETE operations.

## Seed Data

The `seed.sql` file contains sample data for development and testing, including:

1. **Sample User**
   - Demo user with profile

2. **Muscle Groups**
   - Common muscle groups (chest, back, legs, shoulders, arms, core)

3. **Exercises**
   - Popular exercises (bench press, deadlift, squat, etc.)
   - Linked to appropriate muscle groups

4. **Mesocycles**
   - Sample training programs (strength phases, hypertrophy phase)

5. **Training Sessions**
   - Workout templates for different body parts and goals

6. **Session Exercises**
   - Exercise configurations within training sessions

7. **Workout Logs**
   - Sample logged workouts

8. **Exercise Logs**
   - Sample exercise performance data

9. **Workout Reminders**
   - Sample reminder settings

## Setup and Management

### Initial Setup

Run the initialization script to set up Supabase for local development:

\`\`\`bash
chmod +x init.sh
./init.sh
\`\`\`

This script will:
1. Initialize a Supabase project
2. Start Supabase services
3. Reset the database (if needed)
4. Apply the schema
5. Generate TypeScript types

### Managing Supabase

The following npm scripts are available in the root `package.json`:

- `npm run supabase:start` - Start Supabase services
- `npm run supabase:stop` - Stop Supabase services
- `npm run supabase:reset` - Reset the database
- `npm run supabase:generate-types` - Generate TypeScript types

### Updating the Schema

To update the database schema:

1. Modify `schema.sql`
2. Run `supabase db reset` to apply changes
3. Run `supabase gen types typescript --local > ../lib/database.types.ts` to update types

### Local Development vs. Production

For local development, Supabase runs in Docker containers on your machine. For production, you'll need to:

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Apply the schema and seed data to your production database
3. Update your environment variables with production credentials

## Authentication

GymTrack uses Supabase Authentication with email/password login. The auth configuration is in `config.toml`.

Key settings:
- `site_url` - The base URL of your website
- `jwt_expiry` - How long tokens are valid (3600 seconds = 1 hour)
- `enable_signup` - Allow/disallow new user signups

## Row Level Security (RLS)

All tables have RLS policies to ensure data security. For example, users can only:
- View their own profile
- Create/update/delete their own muscle groups
- View/log their own workouts

The policies use `auth.uid()` to identify the current user and restrict access accordingly.

## Database Functions

The schema includes several PostgreSQL functions for analytics:

1. **update_modified_column**
   - Trigger function to automatically update `updated_at` timestamps

2. **get_workout_volume_by_muscle_group**
   - Calculates volume per muscle group for a workout

3. **get_workout_sets_by_muscle_group**
   - Calculates sets per muscle group for a workout

4. **get_exercise_progress**
   - Retrieves exercise progress over time

## Troubleshooting

### Common Issues

1. **Supabase CLI not found**
   - Install with `npm install -g supabase`

2. **Docker not running**
   - Ensure Docker is installed and running

3. **Port conflicts**
   - Check if ports 54321-54328 are available

4. **Database reset fails**
   - Try stopping and starting Supabase: `supabase stop && supabase start`

### Getting Help

For Supabase-specific issues, refer to:
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase GitHub](https://github.com/supabase/supabase)
- [Supabase Discord](https://discord.supabase.com)
