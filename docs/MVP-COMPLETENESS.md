# MVP Completeness Checklist

Estado: **MVP funcional en local, NO listo para producción hasta resolver Fase 1 de [LAUNCH-CHECKLIST.md](./LAUNCH-CHECKLIST.md)**.

Fecha de última verificación: 2026-09-14.

## Estado por feature

| Feature | Ruta | Estado | Verificado | Notas |
|---|---|---|---|---|
| Landing page | `/` | ✅ Listo | Sí | Copy comercial promete pricing/Rest Timer/mobile no cableados (BL-4 en LAUNCH-CHECKLIST). |
| Login | `/auth/login` | ✅ Listo | Sí | Credenciales demo con botones de copia. |
| Registro | `/auth/register` | ✅ Listo | Sí | Crea `user` + `profile` vía acción `signUp` (bcrypt, sin trigger). |
| Change password | `/change-password` | ✅ Listo | Sí | Requiere password actual (API `/api/auth/change-password`). Sin reset por email. |
| Login | `/auth/login` | ✅ Listo | Sí | Credenciales demo con botones de copia. |
| Dashboard (resumen) | `/dashboard` | ✅ Listo | Sí | Métricas + volumen por grupo muscular (`getVolumeByMuscleGroup`). |
| Analytics | `/dashboard/analytics` | ⚠️ Orphan | Sí | Ruta existe pero no está en el nav del layout (solo por URL directa). |
| Calendar | `/dashboard/calendar` | ✅ Listo | Sí | Calendario + reminders (store + action cableados). |
| Muscle Groups | `/dashboard/muscle-groups` | ⚠️ Con 404 | Sí | Link "Add Muscle Group" → `/muscle-groups/new` no existe (BL-2). Action `createMuscleGroup` lista. |
| Exercises CRUD | `/dashboard/exercises` (+ `new`, `edit/[id]`) | ✅ Listo | Sí | |
| Mesocycles | `/dashboard/mesocycles` (+ `new`, `edit/[id]`, `[id]`) | ✅ Listo | Sí | |
| Mesocycle Templates | `/dashboard/mesocycles/templates` | ⚠️ Incompleto | Parcial | Lista OK, pero `new`/`edit`/`[id]` no existen (BL-2); "Plantillas Públicas" comentado. Store y form ya existen. |
| Session Templates | — | ❌ No implementado | No | `session-template-form` usa store placeholder que no guarda; sin rutas; no importado en ninguna página (BL-5). |
| Training Sessions (crear/editar) | `mesocycles/[id]/sessions/new` + `edit/[id]` | ❌ **No persiste** | No | `onSubmit` de `training-session-form.tsx` NO llama ninguna action/store (BL-1, crítico). |
| Workout Logs | `/dashboard/workout-logs` (+ `new`, `[id]`) | ⚠️ Parcial | Sí | Form funcional; el link `?template=` se ignora (BL-3). |
| Profile & Measurements | `/dashboard/profile` | ⚠️ Falta layout | Sí | Página no envuelta en `DashboardLayout` (sin sidebar). |
| Settings | `/dashboard/settings` | ✅ Listo | ¿? | Página nueva (2026-09-11) sin trackear; pendiente revisión visual en runtime. |
| Sign out | `SignOutButton` en layout/settings | ✅ Listo | Sí | Link roto `/auth/signout` reemplazado. |
| Tema claro/oscuro | next-themes | ✅ Listo | Sí | `ThemeProvider` en `app/layout.tsx`. |
| Auth (middleware + sesión) | `proxy.ts` (NextAuth `withAuth`) + `lib/auth.ts` | ✅ Listo | Sí | Migrado a NextAuth v4 (Credentials + bcrypt) + Prisma. |

## Calidad

| Chequeo | Resultado |
|---|---|
| `npx tsc --noEmit` | 0 errores (última verificación) |
| `npm run lint` | 0 errores, ~156 warnings `no-explicit-any` (no bloqueantes) |
| `npm run build` | **SIN reverificar** desde upgrade Next 16 + remoción de `ignoreBuildErrors` → Fase 0 de LAUNCH-CHECKLIST. |

## Gaps / pendientes confirmados

### Críticos para deploy (Fase 1 — [LAUNCH-CHECKLIST.md](./LAUNCH-CHECKLIST.md))
- [ ] BL-1: Cablear `training-session-form` a `createTrainingSession`/`updateTrainingSession`.
- [ ] BL-2: Resolver 404 de rutas (`muscle-groups/new`, `mesocycles/templates/{new,edit,[id]}`, edit de ejercicio en sesión).
- [ ] BL-3: Hacer efectivo el param `?template=` en `workout-logs/new`.
- [ ] BL-4: Recortar copy de landing (pricing, Rest Timer, mobile apps, footer links).
- [ ] BL-5: Eliminar session templates rotos o implementarlos.

### Deploy (Fase 3 — [DEPLOYMENT.md](./DEPLOYMENT.md))
- [ ] Crear proyecto Supabase (solo Postgres) en la nube y aplicar schema + seed con `npx prisma db push` / `npx prisma db seed`.
- [ ] Setear env vars en el hosting (`DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_APP_URL`).
- [ ] Push de `main` (está adelantado respecto de `origin`).
- [ ] `npm run build` en limpio (sin `ignoreBuildErrors`).

### Mejoras y deuda técnica
- [ ] ~156 warnings de `any` — tipar contra `lib/schemas/*` (Zod) o tipos de Prisma.
- [ ] Componentes muertos (nunca importados): `components/dashboard/workout/export-import.tsx`, `workout-timer.tsx`, `workout-reminders.tsx`, error-boundaries, `lib/actions/protected-example.ts`, `lib/actions/measurements.ts` (stubs no-arg). Borrar o cablear.
- [ ] `lib/utils/rate-limiter.ts` es no-op — el rate limiting real debe ir del lado servidor.
- [ ] `app/dashboard/profile/page.tsx` sin `DashboardLayout`.
- [ ] Duplicado de toasts: `hooks/use-toast.ts` vs `components/ui/use-toast.ts`.
- [ ] Landing page promete features inexistentes (BL-4).
- [ ] `supabase/` folder obsoleto (schema.sql/seed.sql/README): borrar o archivar.

### Docs
- [x] LAUNCH-CHECKLIST.md (runbook de lanzamiento 2h).
- [x] MVP-COMPLETENESS.md (este archivo).
- [x] DEPLOYMENT.md (runbook de producción).
- [x] `.env.example`.
- [ ] README.md actualizado (stacks, fences, scripts).
- [ ] Archivar `SCHEMA-ACTIONS-GAPS-TODO.md` (todas sus tareas están resueltas).

## Cómo correr en local

1. `npm install`
2. `supabase start` (Docker)
3. `supabase db reset` (aplica `supabase/schema.sql` + `supabase/seed.sql`)
4. Copiar `.env.example` a `.env.local` con las URLs de Supabase local.
5. `npm run dev`