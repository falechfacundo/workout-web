#!/bin/bash

# Initialize Supabase project
supabase init

# Start Supabase services
supabase start

# Reset the database (if needed)
supabase db reset

# Apply the schema
supabase db push

# Generate TypeScript types
supabase gen types typescript --local > ../lib/database.types.ts

echo "Supabase project initialized successfully!"
