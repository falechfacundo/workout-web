# Arquitectura — GymTrack (webapp)

Mapa de cómo encajan las piezas. Los temas que ya tienen doc propio se resumen acá y se enlazan: auth (`AUTH.md`), API móvil (`MOBILE-API-CONTRACT.md`), push (`PUSH-NOTIFICATIONS.md`), diseño (`DESIGN-SYSTEM.md`) y estado por feature (`MVP-COMPLETENESS.md`).

## 1. Qué resuelve

El atleta planifica por **mesociclos** (bloques de varias semanas con objetivos y foco muscular), arma **sesiones** con ejercicios, registra cada entrenamiento (**workout logs** con series), mide su cuerpo y ve su progreso (PRs, consistencia, volumen por grupo muscular). La misma base sirve a la web (dashboard) y a la app móvil (`../app-gymtrack`), que es "ver el plan + registrar".

## 2. Dos clientes, un backend

```
Web (dashboard)  ── Server Actions (lib/actions/*) ──┐
                                                     ├── Prisma (lib/db.ts) ── Supabase Postgres
App móvil (Expo) ── REST /api/mobile/v1/* ───────────┘
                     (JWT Bearer, mismo secreto que la sesión web)
```

- **La web** usa Server Actions con el contrato `{ data, error }` envuelto por `safeAction` (`lib/utils/safe-action.ts`).
- **La app móvil** no puede usar Server Actions (no son un contrato estable), así que tiene una **API REST versionada** en `app/api/mobile/v1/` (`auth`, `me`, `dashboard`, `mesocycles`, `training-sessions`, `workout-logs`, `measurements`, `profile`, `account`, `push-token`). Un cambio de forma es breaking: se publica como `v2`, no se toca `v1`. Detalle en `MOBILE-API-CONTRACT.md`.

## 3. Auth

- Auth.js v5: Credentials (bcrypt) + Google opcional, sesión JWT. Config edge-safe en `lib/auth.config.ts`; providers en `lib/auth.ts`.
- `proxy.ts` protege `/dashboard/*`; **igual cada action valida con `getServerUser()`**.
- La app móvil usa `getApiUser()`: acepta la cookie de la web o un JWT propio (`Authorization: Bearer`) firmado con `AUTH_SECRET`/`NEXTAUTH_SECRET`, que dura 30 días y no tiene refresh.
- Rate limit de login persistido en la base (`LoginAttempt`).
- Google: login, registro y vinculación/desvinculación desde Configuración (`app/api/google-link`), web y móvil con el mismo client ID.

Detalle completo en `AUTH.md`.

## 4. Modelo de datos

| Dominio | Modelos |
| --- | --- |
| Cuenta | `User`, `Profile` (incluye `locale`), `LoginAttempt`, `PushToken` |
| Catálogo | `MuscleGroup`, `Exercise`, `ExerciseMuscleGroup` (los defaults vienen del seed) |
| Planificación | `Mesocycle`, `MesocycleGoal`, `MesocycleMuscleGroupFocus`, `TrainingSession`, `SessionExercise` |
| Templates | `MesocycleTemplate` (+ `Goal`, `MuscleFocus`), `TrainingSessionTemplate`, `TemplateSessionExercise` |
| Registro | `WorkoutLog`, `ExerciseLog` (series) |
| Cuerpo | `ProfileMeasurement` |
| Recordatorios | `WorkoutReminder` (día de la semana + hora) |

**No hay RLS:** Supabase se usa solo como Postgres, así que **cada query tiene que filtrar por `user_id`**. Hubo un IDOR por esto en varias actions, corregido el 17/09/2026 (ver `MVP-COMPLETENESS.md`).

## 5. Flujos principales

1. **Planificar:** crear un mesociclo (de cero, duplicando uno o instanciando un template), agregar sesiones y ejercicios. Actions: `mesocycles.ts`, `training-sessions.ts`, `mesocycle-templates.ts`.
2. **Entrenar:** el **Workout Player** (`/dashboard/mesocycles/[id]/sessions/[sessionId]/live` en la web; pantalla equivalente en el móvil) guía las series con timer de descanso. En el móvil el estado es 100 % local hasta "Finalizar", que manda **un solo** `POST /workout-logs` transaccional. El backend es idempotente por `(user_id, start_time)`, así que reintentar no duplica.
3. **Analizar:** `analytics.ts` calcula PRs (1RM estimado), heatmap y rachas, frecuencia y volumen por grupo muscular.
4. **Recordar:** un GitHub Action (`.github/workflows/workout-reminders-cron.yml`) llama cada 5 minutos a `/api/cron/workout-reminders` con `CRON_SECRET`; el endpoint busca recordatorios que vencen y manda push con Expo a los `PushToken` del usuario. Todo corre en UTC (no hay zona horaria en `Profile`). Ver `PUSH-NOTIFICATIONS.md`.

## 6. UI

- shadcn/ui (Radix) + Tailwind 3.4, tokens del design system de `DESIGN-SYSTEM.md` (fondo `#0E1116`, verde como único acento).
- Zustand (`lib/stores/*`) para estado de pantalla; React Hook Form + Zod (`lib/schemas/*`) en formularios.
- i18n con next-intl (`messages/en.json`, `messages/es.json`); el idioma se guarda en `Profile.locale` (`i18n/request.ts`).
- La shell (`DashboardLayout`) siempre se ve; los skeletons (`components/ui/data-skeletons.tsx`) reemplazan solo las zonas de datos.

## 7. Transversales

| Tema | Dónde |
| --- | --- |
| Logging estructurado | `lib/utils/logger.ts`, `logging-middleware.ts`. Docs en `lib/docs/` |
| Errores de actions | `safeAction` normaliza a `{ data, error }` y loguea |
| Base compartida | El `.env` local y el deploy de prueba usan la misma base: ver `AGENTS.md` |
| Schema | Se aplica con `prisma db push` (no hay migraciones versionadas todavía) |

## 8. Decisiones vigentes

1. API REST versionada para el móvil, separada de las Server Actions.
2. El Workout Player del móvil guarda todo local y envía una sola vez; el backend es idempotente.
3. Push disparado por GitHub Actions, porque Vercel Cron en el plan Hobby no da la frecuencia necesaria.
4. Planificación compleja (CRUD de mesociclos y ejercicios, analytics completo) solo en la web; el móvil es "ver el plan + registrar".
5. Sin RLS: el scoping por usuario es responsabilidad de cada action.
