# TODO: Gaps Criticos Confirmados (Schema vs Actions)

Estado: **Todos los gaps fueron verificados y resueltos** (2026-08-03).

- [x] Alinear nombres de tablas entre actions y schema.
  - Verificado: actions usan `training_sessions`, `session_exercises`, `workout_logs`, `exercise_logs`, `training_session_templates`, `template_session_exercises`, `mesocycle_templates`, `mesocycle_template_goals`, `mesocycle_template_muscle_focus`.
  - Coinciden con `supabase/schema.sql`. No quedan referencias a `training_sessions_template`, `training_session_exercises` ni `workout_log_sets`.
  - Referencias: `lib/actions/training-sessions.ts`, `lib/actions/workout-logs.ts`, `lib/actions/mesocycle-templates.ts`, `supabase/schema.sql`.

- [x] Corregir clave foranea en measurements.
  - Verificado: `profile_measurements` usa `user_id` en schema y en actions (`insert` y `.eq("user_id", ...)` en `lib/actions/measurements.ts`). Ya no se usa `profile_id`.

- [x] Corregir filtro de estado en mesocycles.
  - Verificado: `getActiveMesocycles` filtra con `.eq("status", "in_progress")` (lib/actions/mesocycles.ts:65), un valor válido del CHECK del schema (`planned`, `in_progress`, `completed`, `cancelled`).

- [x] Resolver dependencias de dashboard a objetos no definidos en schema.
  - Verificado: no hay referencias a `analytics_performance_metrics` en el codigo (solo quedaba en este TODO).
  - La RPC `get_volume_by_muscle_group(user_id_param UUID, period_param TEXT)` esta definida en `supabase/schema.sql` y coincide con la llamada en `app/dashboard/page.tsx` (`{ user_id_param, period_param }`).

- [x] Alinear campos de exercises con schema.
  - Verificado: `primary_muscle_group_id` existe en la tabla `exercises` del schema y se usa en `lib/actions/exercises.ts`; `exercise_muscle_groups` define `is_primary` e `incidence_level` usados por actions y por la RPC de volumen.

- [x] Corregir desalineacion en capa profile.
  - Verificado: `lib/actions/profile.ts` exporta `getCurrentProfile` y `lib/stores/profile-store.ts` lo importa correctamente. No se importa `getUserProfile`.
