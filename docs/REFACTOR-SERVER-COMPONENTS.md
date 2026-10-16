# Refactor: páginas del dashboard a Server Components

Plan para pasar las páginas de `/dashboard/*` que hoy cargan datos en el cliente a Server Components. Incluye una **fase 0 de seguridad que hay que hacer primero** (y que se puede hacer sola, sin el resto del refactor).

Origen: auditoría de UX móvil del 15/10/2026 (PR #2 y #3). Estado del código: `main` en `2c0277a`.

## Por qué

Hoy 19 de las 24 páginas del dashboard son `"use client"` y cargan sus datos así:

1. El servidor manda HTML con skeletons y todo el JS de la página (stores, formularios, Recharts).
2. Hidrata `SessionProvider` y `useRequireAuth()` espera a `useSession()`.
3. Un `useEffect` llama a un store de Zustand (`lib/stores/*`), que llama a una server action con `userId`.
4. Recién ahí se renderizan los datos.

En un teléfono con 4G son 2 o 3 round-trips en serie después de descargar e hidratar el JS. Eso pega en LCP (los datos son el contenido principal) y en INP (más JS en el hilo principal). Con un Server Component, el HTML llega con los datos en un solo round-trip, y el JS cliente queda solo para lo interactivo.

Mitigación ya aplicada en el PR #3: Recharts se carga con `next/dynamic` en `/dashboard` y `/dashboard/workout-logs`. Esto no cambia el waterfall de datos.

## Fase 0: seguridad (hacer primero, PR propio)

**Estado: hecha.** Todas las acciones de `lib/actions/*` validan la sesión (el script de abajo no devuelve nada). `lib/queries/analytics.ts` tiene las lecturas de analytics por `userId` y `lib/queries/mesocycles.ts` tiene `getMesocycles` y `getActiveMesocycles`. Las rutas mobile importan de ahí. El resto de las lecturas (`workout-logs`, `training-sessions`, `mesocycle-templates`) sigue en las acciones con `getServerUser()`; se pasan a `lib/queries` cuando se migre la página que las use.

Las server actions son endpoints POST públicos: cualquiera que tenga el ID de la acción puede invocarlas con los argumentos que quiera. Estas acciones **no verifican la sesión** y operan sobre el `userId` o `id` que reciben del cliente:

| Acción | Archivo | Riesgo |
|---|---|---|
| `deleteMesocycleTemplate(templateId)` | `mesocycle-templates.ts` | **Borra cualquier plantilla (incluidas las default) sin estar logueado.** |
| `createWorkoutLog(formData)` | `workout-logs.ts` | Crea logs a nombre de cualquier `user_id`. |
| `getMesocycles`, `getActiveMesocycles` | `mesocycles.ts` | Lectura de datos de otro usuario por `userId`. |
| `getWorkoutLogs`, `getWorkoutLogsByDateRange`, `getWorkoutStats` | `workout-logs.ts` | Idem. |
| `getTrainingSessions`, `getTrainingSessionsByMesocycle`, `getScheduledSessionsByDateRange` | `training-sessions.ts` | Idem. |
| `getMesocycleTemplates`, `getMesocycleTemplate` | `mesocycle-templates.ts` | Idem. |
| `getVolumeByMuscleGroup`, `getExerciseProgress`, `getWorkoutFrequency`, `getPerformanceMetrics`, `getPersonalRecords`, `getWorkoutStreak`, `getWorkoutHeatmap`, `getMuscleVolumeByRegion`, `getRirWeeklyTrend`, `getLastExercisePerformance`, `getMesocycleCompliance` | `analytics.ts` | Idem. |
| `getExercisesByMuscleGroup`, `getExerciseCountByMuscleGroup` | `exercises.ts`, `muscle-groups.ts` | Revisar: recursos compartidos (`is_default`), probablemente bajo riesgo. |

Para regenerar la lista:

```bash
for f in lib/actions/*.ts; do awk -v F="$(basename $f)" '/^export async function /{ if(name) print (auth?"ok ":"NO ") F":"name; name=$4; sub(/\(.*/,"",name); auth=0 } /getServerUser|getApiUser/{auth=1} END{ if(name) print (auth?"ok ":"NO ") F":"name }' "$f"; done | grep "^NO"
```

**Trampa: la API mobile reusa algunas de estas acciones.** `app/api/mobile/v1/dashboard/route.ts` y `mesocycles/route.ts` llaman a `getActiveMesocycles`, `getMesocycles`, `getPerformanceMetrics` y `getVolumeByMuscleGroup` pasando `apiUser.id`, que sale del token Bearer, no de la cookie. Si a esas acciones se les agrega `getServerUser()`, **la app móvil se rompe** (ver `MOBILE-API-CONTRACT.md`).

Patrón propuesto (sirve también para las fases siguientes):

- **`lib/queries/<dominio>.ts`** (nuevo, sin `"use server"`, con `import "server-only"`; hay que agregar la dependencia con `pnpm add server-only`): funciones puras de lectura que reciben `userId` y consultan Prisma. No son invocables desde el cliente. Las usan los Server Components y la API mobile.
- **`lib/actions/<dominio>.ts`**: las server actions dejan de recibir `userId`, lo obtienen con `getServerUser()` y delegan en `lib/queries`. Las mutaciones por `id` filtran por dueño (`updateMany`/`deleteMany` + `count`, como ya se hizo en el arreglo de IDOR del 17/09; ver `MVP-COMPLETENESS.md`).
- Rutas mobile: cambiar `import { getMesocycles } from "@/lib/actions/..."` por `lib/queries/...`. La forma de la respuesta no cambia, así que no es un cambio breaking del contrato.

Orden sugerido: `deleteMesocycleTemplate` y `createWorkoutLog` (mutaciones) → lecturas de `workout-logs`/`mesocycles`/`training-sessions` → `analytics`. Los stores siguen funcionando si se les saca el argumento `userId` (lo ignoran o se elimina de la firma).

Verificación: `tsc`, `lint`, build, y probar la app móvil contra el preview (`/api/mobile/v1/dashboard` y `/mesocycles`).

## Inventario actual

Páginas que **ya son Server Components** (sirven de patrón): `exercises/edit/[id]`, `mesocycles/edit/[id]`, `mesocycles/[id]/sessions/new`, `mesocycles/[id]/sessions/[sessionId]/exercises/new`, `workout-logs/[id]`. Patrón: `async` page → `await params` → acción o query → `notFound()` si falla → `<DashboardLayout>` (cliente) con hijos server. `getTranslations` de `next-intl/server`. `loading.tsx` con skeletons de `components/ui/data-skeletons.tsx`.

Páginas cliente (líneas | stores | acciones directas):

| Ruta | Líneas | Stores | Notas |
|---|---|---|---|
| `/dashboard` | 444 | mesocycles, workout-logs | + `getPerformanceMetrics`, `getVolumeByMuscleGroup`. **Prioridad 1** (landing post-login). |
| `/dashboard/workout-logs` | 557 | mesocycles, workout-logs | Búsqueda y filtro en cliente; cálculo de volumen por log en cliente. **Prioridad 1.** |
| `/dashboard/mesocycles/[id]` | 326 | mesocycles | + `duplicateMesocycle`. **Prioridad 1.** |
| `/dashboard/mesocycles/[id]/sessions/[sessionId]` | 282 | training-sessions | + `duplicateTrainingSession`. **Prioridad 1** (entrada al live workout). |
| `/dashboard/mesocycles/[id]/sessions/[sessionId]/live` | 127 | training-sessions | + `getLastExercisePerformance`. Cargar datos en server y pasar a `LiveWorkout` (cliente). **Prioridad 1.** |
| `/dashboard/mesocycles` | 130 | mesocycles | Búsqueda/filtro en cliente. |
| `/dashboard/exercises` | 112 | exercises, muscle-groups | Filtros en cliente. |
| `/dashboard/muscle-groups` | 81 | muscle-groups | |
| `/dashboard/mesocycles/templates` | 75 | mesocycle-templates | |
| `/dashboard/mesocycles/templates/[id]` | 178 | mesocycle-templates | |
| `/dashboard/mesocycles/templates/[id]/edit` | 77 | mesocycle-templates | Form cliente; solo la carga inicial pasa a server. |
| `/dashboard/profile` | 101 | profile | `MeasurementHistory` sigue cliente (dialogs, charts). |
| `/dashboard/settings` | 165 | — | `google-link`; mayormente interactiva, beneficio bajo. |
| `/dashboard/analytics` | 77 | — | Ya es casi un shell; los charts piden datos solos. Pasar las queries al server y dar `data` como props. |
| `/dashboard/calendar` | 25 | — | Shell de `WorkoutCalendar` (cliente, cambia de mes). Dejar cliente o precargar el mes actual. |
| `/dashboard/exercises/new`, `mesocycles/new`, `mesocycles/templates/new`, `workout-logs/new` | 27–97 | — | Formularios: el page puede ser server y el form cliente. Beneficio bajo. |

Stores (`lib/stores/*`): además de las páginas los usan los formularios (`components/forms/**`) y `components/dashboard/mesocycles/week-content.tsx`. **No hay que borrarlos en este refactor**: las páginas dejan de usarlos para la carga inicial, y los formularios siguen usándolos para mutaciones hasta que se migren a server actions + `revalidatePath`/`router.refresh()`.

## Receta por página

1. Separar la página en `page.tsx` (server, `async`) y un `*-client.tsx` con lo interactivo (búsqueda, filtros, tabs, dialogs). Mantener la UI y las clases tal cual.
2. En el server: `const user = await getServerUser()` (el proxy ya garantiza la sesión, pero se valida igual) → queries de `lib/queries` en paralelo con `Promise.all` → props serializables al cliente. Ojo con `Decimal` de Prisma (`weight`): usar `toPlainJSON` de `lib/utils/serialize.ts`.
3. Sacar `useRequireAuth()` y el `useEffect` de carga de la página migrada.
4. `loading.tsx` en la ruta con los skeletons actuales: la shell (`DashboardLayout`) se ve siempre y el skeleton reemplaza solo la zona de datos (regla de `AGENTS.md`).
5. Mutaciones existentes: después de crear, editar o borrar, `revalidatePath` en la action o `router.refresh()` en el cliente, para que el server vuelva a traer los datos.
6. Textos: `getTranslations` en server y `useTranslations` en cliente (mismas claves).
7. Charts: siguen siendo componentes cliente y reciben `data` por props. Mantener `next/dynamic` donde ya está.

## Riesgos y decisiones abiertas

- **Comportamiento offline o con mala señal:** hoy los stores conservan el estado entre navegaciones cliente. Con Server Components cada navegación pide datos al server (con cache del router de Next). Aceptable, pero conviene probarlo en 3G.
- **Cache:** el proyecto no usa Cache Components ni `use cache`. Arrancar sin cache (render dinámico por request, porque depende del usuario) y medir antes de agregarlo.
- **`DashboardLayout`** sigue siendo cliente (drawer, menú); no bloquea nada.
- **No tocar el contrato `/api/mobile/v1`** (forma de las respuestas). La fase 0 solo cambia de dónde importan las rutas.
- La base es compartida con el deploy de prueba: probar las mutaciones solo con el usuario demo.

## Checklist por PR

- [ ] `pnpm exec tsc --noEmit` → 0 errores.
- [ ] `pnpm lint` → 0 errores, sin warnings nuevos.
- [ ] `pnpm build` (o el build del preview de Vercel si el local falla por el cache de SWC).
- [ ] Probar la ruta a 360px: los datos aparecen sin esperar al JS, el skeleton respeta la shell y no hay CLS.
- [ ] Si se tocaron queries que usa la API mobile: probar `../app-gymtrack` contra el preview.
- [ ] Actualizar este documento (marcar la página migrada) y `MVP-COMPLETENESS.md`.
