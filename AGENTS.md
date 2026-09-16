# AGENTS.md — Guía para agentes que trabajan en este repo (PRODUCCIÓN)

Este proyecto está **en producción**. Los cambios afectan datos y usuarios reales. Leé esto completo antes de tocar código.

## Stack real (NO es Supabase Auth)

- **Next.js 16** (App Router, Turbopack, root middleware en `proxy.ts`).
- **TypeScript** tipado; server actions devuelven contrato `{ data, error }` vía `safeAction` (`lib/utils/safe-action.ts`).
- **Auth**: NextAuth v4 (Credentials + bcrypt) + `getServerUser()` (`lib/auth.ts`).
- **DB**: **Supabase solo como PostgreSQL**, accedida con **Prisma 7** + `@prisma/adapter-pg` (`lib/db.ts`, `prisma/schema.prisma`, `prisma.config.ts`). **No** hay Supabase Auth, RLS, Storage ni functions.
- **UI/estado**: shadcn/ui (Radix + Tailwind), Zustand (`lib/stores/*`), React Hook Form + Zod (`lib/schemas/*`), Recharts, date-fns, Sonner.
- **Docs de referencia**: `docs/DEPLOYMENT.md`, `AUTH-SYSTEM.md`, `lib/docs/*` (logging). No tocar `lib/docs/*` salvo que se pida.

## ⚠️ CRÍTICO: el entorno local apunta a PRODUCCIÓN

- `.env` local conecta a la **misma base de datos que Vercel** (Supabase pooler `aws-0-sa-east-1.pooler.supabase.com:6543`, project ref `dnzhjiwrvrbetzffgsjs`). No hay DB local separada.
- `DATABASE_URL` = pooler 6543 (usado en RUNTIME). `DIRECT_URL` = conexión directa 5432 (usado por el CLI de Prisma, ver `prisma.config.ts`).
- `npm run db:seed` (alias de `prisma db seed`) **borra TODAS las tablas (`deleteMany` en orden de FK) y recrea la DB de producción inmutable + demo data**. No correrlo salvo que el usuario lo pida explícitamente.
- `npx prisma db push` / `db:migrate` también apuntan a producción (vía `DIRECT_URL`). Cuidado al aplicar cambios de schema.
- Credenciales demo (creadas por seed): `demo@example.com` / `password1234` (`must_change_password = false`).

## Verificación OBLIGATORIA antes de commitear

```bash
npx tsc --noEmit   # 0 errores
npm run lint       # 0 errores (los ~135 warnings de no-explicit-any son preexistentes, no agregar nuevos)
npm run build      # smoke: build de producción pasa (incluye typecheck)
```

Scripts disponibles: `npm run dev`, `build`, `start`, `lint`, `db:push`, `db:migrate`, `db:seed`, `db:studio`.

## Convenciones

- Commits: Conventional Commits en español, estilo imperativo (`feat(scope): ...`, `fix(...): ...`, `refactor(ui): ...`, `docs: ...`). Commitear y pushear solo cuando el usuario lo pida explicitamente (p. ej. "commitpush").
- `proxy.ts` protege `/dashboard/*`: las acciones del servidor igual deben validar con `getServerUser()`.
- Validar formularios con Zod (`lib/schemas/*`) y `safeAction` para server actions.
- No agregar comentarios de código salvo que se pidan; no loggear secretos.
- Al refactorizar loaders/UI, los skeletons estilo shadcn viven en `components/ui/data-skeletons.tsx`. La shell de cada página (`DashboardLayout`) debe verse siempre; los skeleton reemplazan solo las zonas de datos.
- Para cambios "a ciegas" sobre features, consultá `docs/MVP-COMPLETENESS.md` (estado actual + deuda técnica).