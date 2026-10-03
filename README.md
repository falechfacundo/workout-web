# GymTrack — webapp

Gestión de entrenamientos para atletas y entrenadores: mesociclos y templates, sesiones con ejercicios, registro de entrenamientos, mediciones corporales, calendario con recordatorios y analytics (PRs, consistencia, volumen por grupo muscular). También es el backend de la app móvil (`../app-gymtrack`) vía `/api/mobile/v1`. Nombre interno: `workout-app`.

## Estado

| | |
| --- | --- |
| Etapa | MVP completo. Arquitectura en [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md); estado por feature y deuda en [`docs/MVP-COMPLETENESS.md`](docs/MVP-COMPLETENESS.md); pendientes en [`docs/ROADMAP.md`](docs/ROADMAP.md) |
| Base de datos | Supabase **solo como Postgres** (Prisma 7). ⚠️ El `.env` local y el deploy de prueba usan **la misma base**: leé [AGENTS.md](AGENTS.md) antes de migrar o seedear |
| Auth | Auth.js v5 (Credentials + bcrypt, Google opcional, rate limit de login). La app móvil usa un JWT Bearer firmado con el mismo secreto |
| Pagos | ❌ No aplica |
| Email | ❌ No aplica (no hay reset de contraseña por mail) |
| Push | Recordatorios a la app móvil por cron (GitHub Actions → `/api/cron/workout-reminders`). Ver [`docs/PUSH-NOTIFICATIONS.md`](docs/PUSH-NOTIFICATIONS.md) |
| Deploy | ❌ No operativo (sin dominio). Hay un deploy de prueba en Vercel (`workout-web-tau.vercel.app`) |

## Stack

| Capa | Tecnología |
| --- | --- |
| Framework | Next.js 16.2 (App Router, Turbopack) + React 19 + TypeScript |
| UI | Tailwind CSS 3.4 + shadcn/ui (Radix), Recharts, Lucide, Sonner |
| i18n | next-intl (`messages/es.json`, `messages/en.json`) |
| Formularios | React Hook Form + Zod (`lib/schemas/*`) |
| Estado | Zustand (`lib/stores/*`) |
| Datos | Prisma 7.9 + `@prisma/adapter-pg` sobre Supabase Postgres |
| Auth | Auth.js v5 (`next-auth@5.0.0-beta.32`) |

## Puesta en marcha

Requisitos: Node 20+, pnpm (`corepack enable`), credenciales de la base de Supabase.

```bash
pnpm install
cp .env.example .env          # DATABASE_URL, DIRECT_URL, NEXTAUTH_SECRET, NEXTAUTH_URL
pnpm exec prisma generate
pnpm dev                      # http://localhost:3000
```

> ⚠️ `pnpm db:push`, `db:migrate` y sobre todo `db:seed` (borra y recrea **toda** la base) van contra la base del `.env`, que es la misma del deploy de prueba. No correrlos sin querer hacerlo.

Cuenta demo (la crea el seed y aparece en la pantalla de login): `demo@example.com` / `password1234`.

## Variables de entorno

Ver [`.env.example`](.env.example).

| Variable | Requerida | Uso |
| --- | --- | --- |
| `DATABASE_URL` | Sí | Postgres en runtime (pooler 6543) |
| `DIRECT_URL` | Sí | CLI de Prisma (directa 5432) |
| `NEXTAUTH_SECRET` | Sí | Firma de sesión y del JWT móvil (acepta `AUTH_SECRET`) |
| `NEXTAUTH_URL` / `NEXT_PUBLIC_APP_URL` | Sí | URL base |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | No | Google Sign-In (web y móvil, mismo client ID). Ver [`docs/AUTH.md`](docs/AUTH.md) |
| `CRON_SECRET` | No | Protege `/api/cron/workout-reminders` |

## Scripts

| Comando | Qué hace |
| --- | --- |
| `pnpm dev` | Servidor de desarrollo |
| `pnpm build` / `pnpm start` | Build (incluye typecheck) y servidor de producción |
| `pnpm lint` | ESLint (~135 warnings de `any` previos, 0 errores) |
| `pnpm db:push` / `db:migrate` | ⚠️ Schema contra la base compartida |
| `pnpm db:seed` | ⚠️ Borra y recrea toda la base (catálogos + demo) |
| `pnpm db:studio` | Prisma Studio |

## Estructura

```
app/
  auth/ change-password/      Login, registro, cambio de contraseña
  dashboard/                  Resumen, analytics, calendar, exercises, mesocycles (+ templates),
                              workout-logs, muscle-groups, profile (mediciones), settings
  api/mobile/v1/              API REST de la app móvil (contrato en docs/MOBILE-API-CONTRACT.md)
  api/cron/workout-reminders  Dispatcher de push
components/                   ui (shadcn + skeletons), auth, dashboard, forms
lib/
  actions/                    Server Actions → contrato { data, error } vía safeAction
  schemas/ stores/ utils/     Zod, Zustand, logger y safe-action
  auth.ts, auth.config.ts     Auth.js (config edge-safe + providers)
  db.ts                       Único PrismaClient
  docs/                       Docs internos del sistema de logging
prisma/                       schema y seed
proxy.ts                      Protección de /dashboard/* (Next 16)
.github/workflows/            Cron de recordatorios (cada 5 min)
```

## Documentación

- [`AGENTS.md`](AGENTS.md): reglas para agentes y para quien toque código (advertencias sobre la base y verificación obligatoria).
- [`docs/README.md`](docs/README.md): índice de la documentación.
