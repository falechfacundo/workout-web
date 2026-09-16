# MVP Completeness Checklist — Estado en Producción

Estado: **En producción.** Actualizado al 2026-09-16 tras el deploy en Vercel (Supabase solo como Postgres vía Prisma + NextAuth v4).

Este doc es la fuente de verdad del estado por feature y de la deuda técnica. Para agentes/desarrolladores: leé también [AGENTS.md](../AGENTS.md) (advertencias de producción y verificación obligatoria).

## Estado por feature

| Feature | Ruta | Estado | Verificado | Notas |
|---|---|---|---|---|
| Landing page | `/` | ✅ Listo | Sí | Copy alineada; sin secciones de features inexistentes (pricing/Rest Timer removidos). |
| Login | `/auth/login` | ✅ Listo | Sí | Credenciales demo con botones de copia. |
| Registro | `/auth/register` | ✅ Listo | Sí | Crea `user` + `profile` vía acción `signUp` (bcrypt, sin trigger). |
| Change password | `/change-password` | ✅ Listo | Sí | Requiere password actual (API `/api/auth/change-password`). Sin reset por email (post-MVP). |
| Dashboard (resumen) | `/dashboard` | ✅ Listo | Sí | Métricas + volumen por grupo muscular; shell con skeletons durante carga. |
| Analytics | `/dashboard/analytics` | ⚠️ Orphan | Sí | Ruta y widgets funcionales, pero **no está en el nav del sidebar** (`dashboard-layout.tsx`); accesible solo por URL directa. Ver deuda. |
| Calendar | `/dashboard/calendar` | ✅ Listo | Sí | Calendario + reminders (store + action cableados). |
| Muscle Groups | `/dashboard/muscle-groups` | ✅ Listo | Sí | Sin botón "Add" (los defaults vienen del seed). Action `createMuscleGroup` lista si se agrega UI. |
| Exercises CRUD | `/dashboard/exercises` (+ `new`, `edit/[id]`) | ✅ Listo | Sí | |
| Mesocycles | `/dashboard/mesocycles` (+ `new`, `edit/[id]`, `[id]`) | ✅ Listo | Sí | |
| Mesocycle Templates | `/dashboard/mesocycles/templates` (+ `new`, `[id]`, `[id]/edit`) | ✅ Listo | Sí | Rutas creadas y funcionales. |
| Session Templates | — | ❌ No implementado | No | Componente/UI eliminado (deuda post-MVP: feature completo). |
| Training Sessions (crear/editar) | `mesocycles/[id]/sessions/new`, `[id]/sessions/[sessionId]` | ✅ Listo | Sí | Persisten vía `createTrainingSession`/`updateTrainingSession` (BL-1 resuelto). |
| Workout Logs | `/dashboard/workout-logs` (+ `new`, `[id]`) | ✅ Listo | Sí | `?template=<sessionId>` preselecciona la sesión en el form (BL-3 resuelto). |
| Profile & Measurements | `/dashboard/profile` | ✅ Listo | Sí | Envuelto en `DashboardLayout`; forms de perfil + historial de medidas. Las actions de measurements siguen siendo stubs (ver deuda). |
| Settings | `/dashboard/settings` | ✅ Listo | Sí | Sign out desde aquí y desde el sidebar. |
| Sign out | `SignOutButton` en layout/settings | ✅ Listo | Sí | |
| Tema claro/oscuro | next-themes | ✅ Listo | Sí | `ThemeProvider` en `app/layout.tsx`. |
| Auth (middleware + sesión) | `proxy.ts` (NextAuth `withAuth`) + `lib/auth.ts` | ✅ Listo | Sí | NextAuth v4 (Credentials + bcrypt) + Prisma. Seed demo con `must_change_password = false`. |
| Loaders del dashboard | skeletons shadcn | ✅ Listo | Sí | Shell de cada página siempre visible; skeletons en zonas de datos (`components/ui/data-skeletons.tsx` + `loading.tsx` por segmento). |

## Calidad

| Chequeo | Resultado |
|---|---|
| `npx tsc --noEmit` | 0 errores |
| `npm run lint` | 0 errores, ~135 warnings `no-explicit-any` (preexistentes, no agregar nuevos) |
| `npm run build` | Pasa (16.2.12, Turbopack) — verificado 2026-09-16 |

## Deuda técnica (post-MVP)

- [ ] **~135 warnings `no-explicit-any`**: tipar contra `lib/schemas/*` (Zod) o los tipos de Prisma. No agregar `any` nuevos.
- [ ] **`lib/utils/rate-limiter.ts` es no-op** (siempre permite): el rate limiting real del login debe ir del lado servidor. La app está expuesta en prod: priorizar.
- [ ] **`lib/actions/measurements.ts` son stubs**: `getMeasurements()` sin args; `add/update/deleteMeasurement()` no-arg. Cablearlas al dominio real o eliminar.
- [ ] **Analytics fuera del nav** del sidebar (`/dashboard/analytics` no está en `components/dashboard/dashboard-layout.tsx`).
- [ ] **Toasts duplicados**: `hooks/use-toast.ts` vs `components/ui/use-toast.ts` — unificar.
- [ ] **Migraciones versionadas**: hoy se usa `prisma db push` contra prod. Considerar `prisma migrate dev`/`deploy` con archivos de migración.
- [ ] **Sin test suite**: agregar al menos smoke tests de auth + CRUD básico.
- [ ] **`npm audit`** post-install.
- [ ] **Reset de password por email** no implementado (solo cambio de password con la actual). Requiere SMTP.
- [ ] **Scoping por `user_id` en queries Prisma**: sin RLS, cada action debe filtrar datos propios. Revisar acciones nuevas.

## Cuenta demo

Creada por `npm run db:seed` (borra y re-crea TODA la DB): `demo@example.com` / `password1234` (`must_change_password = false`, entra directo al dashboard).

## Cómo correr en local

> ⚠️ El `.env` local apunta a la **misma DB de producción**. `npm run db:seed` borra y re-crea todo — no correrlo salvo intención explícita.

1. `npm install`
2. Completar `.env` según `.env.example` (`DATABASE_URL` pooler 6543, `DIRECT_URL` 5432, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`)
3. `npm run dev`

## Histórico

- Docs de lanzamiento (2026-09-14) archivados en `docs/archive/`: `LAUNCH-CHECKLIST-2026-09-14.md`, `MVP-COMPLETENESS-2026-09-14.md`.
- `SCHEMA-ACTIONS-GAPS-TODO.md` (gaps schema vs actions, todos resueltos) → `docs/archive/SCHEMA-ACTIONS-GAPS-TODO.md`.