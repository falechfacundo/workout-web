# TODO: Gaps Criticos Confirmados (Schema vs Actions)

- [ ] Alinear nombres de tablas entre actions y schema.
  - Actions usan: `training_sessions_template`, `training_session_exercises`, `workout_log_sets`.
  - Schema define: `training_session_templates`, `session_exercises`, `exercise_logs`.
  - Referencias: `lib/actions/training-sessions.ts`, `lib/actions/workout-logs.ts`, `supabase/schema.sql`.

- [ ] Corregir clave foranea en measurements.
  - Actions usan: `profile_id` en `profile_measurements`.
  - Schema define: `user_id`.
  - Referencias: `lib/actions/measurements.ts`, `supabase/schema.sql`.

- [ ] Corregir filtro de estado en mesocycles.
  - `getActiveMesocycles` filtra por `status = active`.
  - Schema acepta: `planned`, `in_progress`, `completed`, `cancelled`.
  - Referencias: `lib/actions/mesocycles.ts`, `supabase/schema.sql`.

- [ ] Resolver dependencias de dashboard a objetos no definidos en schema.
  - `analytics_performance_metrics`.
  - RPC `get_volume_by_muscle_group`.
  - Referencias: `app/dashboard/page.tsx`, `supabase/schema.sql`.

- [ ] Alinear campos de exercises con schema.
  - Se usan campos no presentes en schema (ejemplo: `primary_muscle_group_id`).
  - Referencias: `lib/actions/exercises.ts`, `supabase/schema.sql`.

- [ ] Corregir desalineacion en capa profile.
  - En actions se exporta `getCurrentProfile`.
  - Store importa `getUserProfile`.
  - Referencias: `lib/actions/profile.ts`, `lib/stores/profile-store.ts`.
