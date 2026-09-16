# Launch Checklist — MVP a Producción en ~2h

Runbook de lanzamiento: diagnóstico del estado actual + fixes concretos, ordenados por impacto/tiempo.
Objetivo: pasar de "funciona en local" a "disponible en producción" sin deuda bloqueante.

- Fecha de relevamiento: 2026-09-14
- Documentos relacionados: [MVP-COMPLETENESS.md](./MVP-COMPLETENESS.md) (estado por feature) y [DEPLOYMENT.md](./DEPLOYMENT.md) (runbook de deploy paso a paso).

---

## 1. Estado del repo

| Chequeo | Resultado |
|---|---|
| `git status` | `main` adelantada 2 commits contra `origin/main`. Working tree **sucio** (5 archivos modificados). `app/dashboard/settings/` y `docs/` **sin trackear**. |
| `git fetch origin` | Nada nuevo del remoto: **no hay nada que pull**. |
| `npx tsc --noEmit` | 0 errores (última verificación) |
| `npm run lint` | 0 errores, ~156 warnings `no-explicit-any` (no bloqueantes) |
| `npm run build` | **SIN reverificar** desde el upgrade a Next 16 + remoción de `typescript.ignoreBuildErrors` → **Fase 0**. |

Los cambios sin commitear son fixes legítimos, no basura:

| Archivo | Cambio |
|---|---|
| `components/auth/auth-form.tsx` | Removidos `console.log` de debug |
| `components/dashboard/dashboard-layout.tsx` | Sign Out ahora usa `SignOutButton` (era link roto a `/auth/signout`) |
| `next.config.mjs` | Quitado `typescript.ignoreBuildErrors` |
| `README.md` / `AUTH-SYSTEM.md` | Docs actualizados |

> Antes del push: commitear esos cambios (o descartarlos) para dejar el tree limpio.

---

## 2. Fase 0 — Verificación local (~5 min)

```bash
git add -A && git commit -m "chore: cleanup pre-launch"   # o descartar
npm run lint
npx tsc --noEmit
npm run build        # DEBE pasar sin ignoreBuildErrors
```

Si el build falla: resolver errores de tipos/imports antes de continuar (el tipado de datos vive en `prisma/schema.prisma` y `lib/schemas/*`; los server actions devuelven el contrato `{ data, error }`).

---

## 3. Fase 1 — Bloqueos del MVP (fixes concretos)

### BL-1. El formulario de sesión de entrenamiento NO persiste nada — CRÍTICO

- **Ubicación:** `components/forms/training-session/training-session-form.tsx:51` (`onSubmit`).
- **Problema:** solo muestra toast + `router.push`. Aunque la UI diga "created successfully", no se inserta nada en la DB. La página `app/dashboard/mesocycles/[id]/sessions/new` queda como feature fantasma.
- **Las acciones ya existen y están listas:**
  - `createTrainingSession(formData)` → `lib/actions/training-sessions.ts:205`
  - `updateTrainingSession(formData)` → `lib/actions/training-sessions.ts:308`
  - Ambos reciben `TrainingSessionFormData` (`lib/schemas/training-session.ts`) y resuelven `user_id` del lado servidor.
- **Fix:** en `onSubmit`, antes del toast:
  ```ts
  const result = initialData?.id
    ? await updateTrainingSession({ ...values, id: initialData.id })
    : await createTrainingSession(values);
  if (result?.error) throw new Error(result.error);
  ```
  Verificar que `TrainingSessionFormData` incluya `mesocycle_id` (o pasarlo explícitamente desde el prop `mesocycleId`).
- **Estimación:** 20-30 min.

### BL-2. Rutas rotas (links → 404)

| Ruta | Origen del link | Estado | Fix recomendado (MVP) |
|---|---|---|---|
| `/dashboard/muscle-groups/new` | `app/dashboard/muscle-groups/page.tsx:82,105` | No existe ruta ni form | Opción A (rápida): quitar el botón "Add Muscle Group" — los defaults vienen del seed. Opción B: crear la ruta con un form simple que llame `createMuscleGroup` (`lib/actions/muscle-groups.ts:82`, no requiere store). |
| `/dashboard/mesocycles/templates/new` | `components/dashboard/mesocycles/templates/template-page-header.tsx:17`, `template-empty-state.tsx` | Sin ruta | Crear `app/dashboard/mesocycles/templates/new/page.tsx` usando `mesocycle-template-form.tsx` + `useMesocycleTemplatesStore.createTemplate` (`lib/stores/mesocycle-templates-store.ts:121`). Los componentes ya existen. |
| `/dashboard/mesocycles/templates/edit/[id]` y `[id]` | `templates/template-card.tsx` | Sin rutas | Crear `edit/[id]` (con `updateTemplate` → store:147) y `[id]` (detalle con `fetchTemplate` → store:95). |
| `/dashboard/templates` | `components/forms/session-template/session-template-form.tsx:53` (`router.push`) | Sin ruta; el form usa un store **placeholder que no guarda** (ver BL-4) | Quitar la UI que redirige ahí o eliminar el form (no está importado en ninguna página). |
| `.../exercises/[exerciseId]/edit` | `app/dashboard/mesocycles/[id]/sessions/[sessionId]/page.tsx:235` | Sin ruta (solo `exercises/new`) | Redirigir el link a `exercises/new` (recién creados) o quitarlo. |

- **Estimación total:** 40-60 min (depende de cuántas rutas se creen vs se quiten).

### BL-3. `?template=` en `workout-logs/new` se ignora

- **Origen:** `components/dashboard/mesocycles/week-content.tsx` genera `/dashboard/workout-logs/new?template=${session.id}`.
- **Problema:** `app/dashboard/workout-logs/new/page.tsx` no lee `searchParams`; el `WorkoutLogForm` arranca vacío.
- **Fix:**
  1. En `app/dashboard/workout-logs/new/page.tsx`: `searchParams` es async en Next 16 → `const { template } = await searchParams;` y pasarlo al `WorkoutLogForm` como prop opcional (`initialSessionId`).
  2. En `components/forms/workout-log/workout-log-form.tsx`: si llega, preseleccionar el `SessionSelector` / mesociclo usando `useTrainingSessionsStore.fetchSession`.
- **Estimación:** 15-20 min.

### BL-4. Copia de la landing promete features inexistentes

- **Ubicación:** `app/page.tsx`.
  - Card "Rest Timer" (L112-121) — no existe componente cableado.
  - Sección "Pricing" completa (L125-377): Free $0 / Pro $9.99 / Elite $19.99 — **no hay subscripciones**. Los CTA van a `/auth/register` (crea cuenta gratis).
  - FAQ "Is there a mobile app?" (L434) — apps nativas "coming soon", no existen.
  - Footer: Terms y Privacy con `href="#"` (L459-464).
- **Fix MVP:** eliminar la sección Pricing y la card Rest Timer (o marcarlas); corregir el FAQ de mobile a "responsive web app"; poner los links de Terms/Privacy a rutas reales o quitarlos.
- **Estimación:** 15 min.

### BL-5. Session templates: feature a medio hacer (se solapa con BL-2)

- `components/forms/session-template/session-template-form.tsx:20-21,48-55` — "store not yet created", `saveSessionTemplate` no implementado (solo `logger.warn`).
- **No está importado en ninguna página** (grep de imports: cero). La tabla `training_session_templates` existe en schema, pero no hay UI/wiring.
- **Fix MVP:** eliminar el componente + secciones (`components/forms/session-template/`, `components/dashboard/.../template-tabs.tsx` bloque público comentado) y cualquier `router.push("/dashboard/templates")`. Dejarlo como deuda post-MVP.
- **Estimación:** 10 min.

---

## 4. Fase 2 — Limpieza rápida (~15 min)

Verificado por grep (cero imports). Borrar o cablear:

- `components/dashboard/workout/export-import.tsx` — export hardcodeado vacío + import que no hace nada.
- `components/dashboard/workout/workout-timer.tsx` — referencia `/sounds/timer-complete.mp3` que no existe.
- `components/dashboard/workout/workout-reminders.tsx` — UI-only, `userId` descartado (`userId: _userId`). El feature REAL de reminders está cableado en `app/dashboard/calendar` (store + action), este componente es duplicado muerto.
- `components/auth/session-manager.tsx` — llama edge functions `get-user-sessions` / `revoke-session` / `revoke-all-sessions`; **no existe `supabase/functions/`**.
- `lib/actions/protected-example.ts` — inserte en `protected_table` que no está en `supabase/schema.sql`.
- `components/error-boundary.tsx`, `server-error-boundary.tsx`, `server-error.tsx` — solo se importan entre sí.
- `app/dashboard/profile/page.tsx` — **no está envuelto en `DashboardLayout`** (sin sidebar, inconsistente con el resto). Envolverlo.

No bloqueante (dejar con TODO):
- `lib/utils/rate-limiter.ts` — no-op (siempre permite): el rate-limit real va del lado servidor.
- `lib/actions/measurements.ts` — stubs sin args (`getMeasurements` devuelve todos, `add/update/delete` no hacen nada útil): cablear o eliminar.
- Duplicado de toasts: `hooks/use-toast.ts` vs `components/ui/use-toast.ts`.

---

## 5. Fase 3 — Deploy (~40 min)

Resumen ejecutivo. Runbook completo: [DEPLOYMENT.md](./DEPLOYMENT.md).

1. **Supabase Cloud (solo Postgres)** — crear proyecto; copiar las connection strings (`DATABASE_URL` / `DIRECT_URL`) y generar `NEXTAUTH_SECRET`.
2. **Aplicar schema + seed:**
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   # crea demo@example.com / password1234 + catálogos (muscle groups, exercises, EMG, templates)
   ```
3. **Env vars en Vercel:** `DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_APP_URL`. Eliminar cualquier `NEXT_PUBLIC_SUPABASE_*`.
4. **Deploy** — importar `falechfacundo/workout-web` en Vercel (o `vercel --prod`). Cada push a `main` redeploya.
5. **Push de `main`** (está 2 commits adelante).

> ⚠️ Credenciales demo hardcodeadas en la página de login (`components/auth/demo-credentials.tsx`) quedan en el bundle público. Aceptable para MVP; rotar/remover si el repo se vuelve público.

---

## 6. Fase 4 — Verificación post-deploy (~15 min)

- [ ] Login demo `demo@example.com` / `password1234` (copiar desde la página de login).
- [ ] Registrar un usuario nuevo → se crea su `user` + `profile` (acción `signUp`, sin trigger).
- [ ] Crear un ejercicio → aparece en Analytics.
- [ ] Crear un mesociclo + sesiones (valida el fix **BL-1**) → ver datos guardados en dashboard.
- [ ] Crear un workout log (y uno desde el link con `?template=` si se fixeó BL-3).
- [ ] Cambio de password desde `/change-password` (requiere password actual; no hay reset por email).
- [ ] Recorrer todas las secciones del sidebar: **ningún 404** (valida BL-2).
- [ ] Logout desde el sidebar (valida `SignOutButton`).
- [ ] `npm run build` + `npm run lint` en CI/local pasando.

---

## 7. Deuda post-MVP (no bloquea el lanzamiento)

- Tipar los ~156 `any` contra `lib/schemas/*` (Zod) o los tipos de Prisma.
- Rate limiting de login server-side (hoy no-op).
- Session manager (edge functions) o eliminar.
- Session/reset de templates: implementar store + rutas o dejar fuera del MVP.
- Verificar scoping por `user_id` en las queries Prisma (sin RLS; cada action filtra datos propios).
- Configurar SMTP propio si se reactivara el reset de password por email.
- No hay test suite: considerar al menos smoke test de auth + CRUD.
- `npm audit` post-install.

---

## Estimación total

| Fase | Tiempo |
|---|---|
| Fase 0 — build local | 5 min |
| Fase 1 — bloqueos MVP | 70-90 min |
| Fase 2 — limpieza | 15 min |
| Fase 3 — deploy | 40 min |
| Fase 4 — verificación | 15 min |
| **Total** | **≈ 2-2.5 h** |