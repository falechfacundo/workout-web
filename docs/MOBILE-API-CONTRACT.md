# Mobile API Contract — `/api/mobile/v1`

Fuente de verdad del contrato entre este backend (`workout-app`, Next.js) y el
cliente mobile (`workout-mobile`, Expo/React Native — repo separado). Vive acá
porque el backend es quien lo implementa y lo rompe si cambia sin avisar.
Cualquier cambio de forma/response en estos endpoints es **breaking** para un
repo que no puede verse en el mismo PR — tratarlo como se trataría un cambio
de API pública.

Última actualización: 2026-09-17. Versión de contrato: **v1** (prefijo de ruta
estable; un cambio incompatible se lanza como `/api/mobile/v2`, no se
modifica v1 in-place).

## Por qué existe esto (y no se reusan los server actions)

`lib/actions/*.ts` son Server Actions de Next.js: no son un protocolo
versionado ni pensado para un cliente externo (el wire format es interno de
React/Next y puede cambiar entre minor versions). Todo lo que el cliente
mobile necesita se expone acá como endpoints REST normales con un contrato
JSON explícito.

**Importante — esto NO es un espejo 1:1 de los server actions.** Todo
endpoint de este contrato escopea explícitamente por el usuario resuelto en
`getApiUser()`, en vez de reusar los server actions tal cual.

*(Histórico: al escribir esto, varios actions en `lib/actions/workout-logs.ts`,
`lib/actions/training-sessions.ts`, `lib/actions/exercises.ts`,
`lib/actions/muscle-groups.ts` y `lib/actions/workout-reminders.ts` no
filtraban por `user_id`/ownership en sus `get`/`update`/`delete` — cualquier
usuario autenticado podía operar sobre el recurso de otro por ID, sin siquiera
pasar por acá. Se arregló en el propio repo web (2026-09-17): ahora usan
`updateMany`/`deleteMany` + chequeo de `count` escopeados por `user_id` (o,
para `Exercise`/`MuscleGroup`, por `user_id` + `!is_default`), y algunos
`create` que confiaban en un `user_id` del formulario ahora usan el de la
sesión. Se deja esta nota porque es la razón original de "no reusar los
actions tal cual" — ya no aplica igual de literal, pero el principio de
"cada endpoint mobile escopea explícitamente, no asume que el action de abajo
ya lo hace" se mantiene.)*

## Auth

- Header: `Authorization: Bearer <token>`
- El token se obtiene de `POST /auth/login` o `POST /auth/register`.
- Es un JWT firmado con `NEXTAUTH_SECRET` (mismo secret que las cookies de
  sesión de NextAuth, formato compatible vía `next-auth/jwt`), no una tabla de
  sesiones propia. Verificarlo no pega contra la DB.
- **Vida: 30 días** (`MOBILE_TOKEN_MAX_AGE` en `lib/auth.ts`). No hay refresh
  token todavía — al expirar, cualquier request devuelve 401 y el cliente
  debe forzar logout (re-login). Ver "Pendiente" más abajo.
- `getApiUser(req)` (`lib/auth.ts`) resuelve el usuario: primero intenta el
  bearer, y si no hay, cae a la cookie de sesión de NextAuth (permite pegarle
  a estos endpoints desde el browser/Postman con una sesión activa, sin token
  aparte — útil para debug, el cliente mobile real siempre manda bearer).

## Números vs. Decimal de Prisma

Cualquier response que incluya un campo `Decimal` de Prisma (`weight_kg`,
`body_fat_percentage`, `*_cm`, `ExerciseLog.weight`, `MesocycleGoal.target_value`)
pasa por `toPlainJSON()` (`lib/utils/serialize.ts`) antes de
`successResponse`/`createdResponse`. Sin eso, decimal.js (lo que usa Prisma
por debajo) serializa esos campos como **string** (`toJSON = toString`), no
como `number` — rompería cualquier Zod schema del lado mobile que espere
`z.number()` en un request de escritura posterior (ej: prefillear un form de
edición con un valor que vino de un GET). Si se agrega un endpoint nuevo que
devuelva un modelo con columnas `Decimal`, envolver la respuesta en
`toPlainJSON(...)` — es recursivo y no-op sobre lo que ya es plano.

## Envelope de respuesta

Todas las respuestas usan `lib/apiResponse.ts` (mismo helper que ya usaban
`/api/auth/change-password` y `/api/google-link`):

```ts
// éxito
{ success: true, data: T, message?: string }
// error
{ success: false, error: string }
```

El cliente mobile (`lib/api/client.ts` en `workout-mobile`) desempaqueta esto
y tira `ApiError(message, status)` si `success` es `false` o el HTTP status
no es 2xx. **No asumir nunca que `data` viene presente solo por `success`
ausente** — siempre chequear `success === true` explícitamente (así está
implementado el cliente).

### Códigos de status usados

| Status | Cuándo |
|---|---|
| 200 | Lectura OK / escritura sin creación de recurso |
| 201 | Recurso creado (`POST /auth/register`, `POST /workout-logs`) |
| 400 | Body inválido (Zod) o regla de negocio violada |
| 401 | Sin token / token inválido o expirado / credenciales incorrectas |
| 404 | Recurso no encontrado *o perteneciente a otro usuario* (mismo código para ambos casos — no filtrar si un ID existe pero no es tuyo) |
| 429 | Rate limit de login (`login_attempts`, 5 intentos / 15 min) |
| 500 | Error no esperado (loggeado server-side con `console.error("[MOBILE_X]", ...)`, nunca se manda el mensaje interno al cliente) |

## Endpoints

### `POST /auth/login`

```ts
// request
{ email: string; password: string }
// response 200
{ token: string; user: { id, email, name: string | null, mustChangePassword: boolean } }
```
Mismo `authorize()` que NextAuth: bcrypt + rate limiting server-side
(`lib/utils/rate-limiter.ts`, tabla `login_attempts`). 401 en credenciales
inválidas, 429 si está bloqueado.

### `POST /auth/register`

```ts
// request
{ email: string; password: string /* min 8 */; preferred_unit?: "kg" | "lb" }
// response 201
{ token: string; user: { id, email, name: null, mustChangePassword: false } }
```
Reusa `signUp` de `lib/actions/auth.ts` tal cual (mismo `AppError.conflict`
si el email ya existe → 400 "Este email ya está registrado.").

### `GET /me`

Requiere auth. Devuelve el usuario + su `profile` (puede ser `null` si nunca
se completó). Éste es el endpoint que la app usa al arrancar para validar que
el token guardado en SecureStore siga vivo (`lib/auth/auth-context.tsx`).

### `GET /dashboard`

Requiere auth.
```ts
{
  metrics: { totalWorkouts: number; totalVolume: number; totalSets: number; avgDuration: number };
  muscleGroupVolume: Array<{ muscle_group: string; volume: number }>; // ver lib/actions/analytics.ts
  activeMesocycles: Mesocycle[]; // status = "in_progress"
}
```
Ventana fija: últimas 4 semanas (mismo período `"month"` que usa el dashboard
web). Sin parámetro de rango todavía — si mobile necesita elegir semana/año,
es un cambio de contrato (agregar `?period=week|month|year`), no asumirlo.

### `GET /mesocycles`

Requiere auth. Lista completa del usuario (`getMesocycles`), sin paginar.
**Nota de escala:** si un usuario acumula muchos mesociclos esto no pagina —
aceptable para el volumen actual de la app, revisar si se vuelve un
problema real antes de agregar cursor pagination.

### `GET /mesocycles/:id`

Requiere auth, escopeado por `user_id` (404 si no es tuyo). Incluye
`goals`, `focus_muscle_groups` (array de IDs, no objetos completos — igual
que el action web) y `training_sessions` con sus `session_exercises`
(incluye el `exercise` completo, no solo el ID).

### `GET /training-sessions/:id`

Requiere auth, escopeado vía `mesocycle.user_id`. Pensado para la pantalla
del Workout Player. Devuelve la sesión + `session_exercises` (con `exercise`)
+ `last_performance`: un mapa `exercise_id -> { weight, reps, rir, date }`
con el set más reciente registrado de cada ejercicio **de esta sesión**
(no de todos los ejercicios del usuario — más barato que
`getLastExercisePerformance`, que trae los últimos 60 logs completos).

### `GET /workout-logs`

Requiere auth. Últimos 50, orden por fecha desc, incluye `exercise_logs`,
`training_session.name`, `mesocycle.name`.

### `GET /workout-logs/:id`

Requiere auth, escopeado por `user_id`. Incluye `exercise_logs` con el
`exercise` completo (nombre, etc.) para poder renderizar el detalle sin
otro round-trip.

### `POST /workout-logs`

Requiere auth. **Transaccional** — crea el `WorkoutLog` + todos sus
`ExerciseLog` + (opcional) marca la `TrainingSession` como `completed`, todo
en un único `db.$transaction`.

```ts
// request
{
  training_session_id?: string | null;
  mesocycle_id?: string | null;
  date: string;        // "YYYY-MM-DD"
  start_time: string;  // ISO datetime
  end_time: string;    // ISO datetime
  duration_minutes?: number;
  notes?: string;
  rating?: number;      // 1-5
  sets: Array<{
    exercise_id: string;
    set_number: number;  // 1-indexed dentro del ejercicio
    reps: number;
    weight?: number | null;
    rir?: number | null; // 0-10
  }>;
  complete_session?: boolean; // default true — solo aplica si viene training_session_id
}
// response 201: WorkoutLog completo con exercise_logs
```

**Por qué transaccional y no incremental (a diferencia del flujo web):** el
componente web (`components/dashboard/workout/live-workout.tsx`) hace
`createWorkoutLog` y después un `createExerciseLogSet` por set, secuencial,
más un `updateWorkoutLog` y un `updateTrainingSessionStatus` al final — 4+N
llamadas de red. Sobre wifi de oficina eso nunca falla a la mitad. Sobre una
red mobile eso sí puede pasar, y dejaría un `WorkoutLog` sin `end_time`/sets
o una sesión sin marcar completada. El cliente mobile mantiene el
entrenamiento **100% en estado local** (sin pegarle a la red) mientras el
usuario entrena, y recién al tocar "Finalizar" manda todo junto en un solo
POST. Si ese POST falla, no hay estado parcial server-side que limpiar — el
usuario reintenta desde el mismo estado local.

### `PATCH /profile`

Requiere auth. Body: subset parcial de `profileFormSchema`
(`lib/schemas/profile.ts`) — cualquier campo omitido no se toca.
**Cuidado si se reusa `profileFormSchema.partial()` a mano en otro lado:**
ese schema tiene `preferred_unit: z.enum(["kg","lb"]).default("kg")`, y
`.partial()` no elimina el `.default()` interno — un PATCH que no mande
`preferred_unit` terminaría pisándolo a `"kg"` igual. Por eso este endpoint
usa un schema propio (`profilePatchSchema` en el route handler) que separa
`preferred_unit` antes del `.partial()` y lo vuelve a agregar sin default.
`birth_date` llega como string ISO (JSON no tiene tipo Date) y se convierte
a `Date` antes de validar con el schema compartido (que espera `z.date()`).

Response: el `Profile` actualizado completo. No hay `GET /profile` separado
— la lectura va por `GET /me` (ya trae `profile` anidado).

### `GET /measurements`

Requiere auth. Todas las mediciones del usuario, **ordenadas por `date` desc**
(no por `created_at` como el server action web — a propósito: editar un
registro viejo no debería hacer que salte al tope del historial).

### `POST /measurements`

Requiere auth. Body: `MeasurementInput` (`lib/schemas/measurement.ts`),
`date` como string ISO. 400 si ya existe una medición para esa fecha (unique
constraint `[user_id, date]` en el schema de Prisma) — el mensaje de error
le dice al usuario que edite la entrada existente en vez de reintentar crear.

### `PATCH /measurements/:id` / `DELETE /measurements/:id`

Requieren auth, escopeados por `user_id` (404 si no es tuyo o no existe).
`PATCH` acepta cualquier subset de `MeasurementInput`.

### `POST /account/change-password`

Requiere auth. Body: `{ currentPassword: string; newPassword: string }`
(mín. 8 caracteres). Mismas reglas que `/api/auth/change-password` (usado
por el dashboard web) — endpoint separado a propósito, no se tocó el
existente porque además maneja el redirect forzado de `must_change_password`
del middleware web, que no aplica a mobile. 400 si la cuenta no tiene
`password_hash` (login solo con Google) o si `currentPassword` no matchea.

### `GET /account/google`

Requiere auth. `{ linked: boolean; can_unlink: boolean }` — `can_unlink` es
`false` si el usuario nunca puso password (se quedaría sin forma de entrar).

### `DELETE /account/google`

Requiere auth. Desvincula `google_id`. 400 con `can_unlink: false` (ver
arriba). **No hay endpoint para *vincular* Google desde mobile todavía** —
el flujo web (`/api/google-link` + `/api/google-link/callback`) es un
redirect OAuth que identifica "quién está vinculando" por la cookie de
sesión de NextAuth; no hay forma de pasarle el bearer token mobile a través
de ese round-trip con Google sin rediseñar el callback para aceptar también
un token (ej. vía `state`). Pendiente — ver Google Sign-In nativo en el
roadmap de `workout-mobile`.

## Optimistic updates — dónde sí y dónde no

- **Sets del Workout Player (peso/reps/RIR, check de "hecho"):** son estado
  local puro (`useState` en la pantalla del player) hasta el POST final — no
  hay red de por medio, así que no hay nada que "optimizar": ya es instantáneo.
  Ésta es la razón de diseño de arriba, no una casualidad de implementación.
- **Después de `POST /workout-logs` exitoso:** el cliente hace
  `queryClient.setQueryData(["mesocycle", mesocycleId], ...)` para marcar esa
  `training_session` como `completed` en caché sin esperar un refetch, e
  invalida `["dashboard"]` (las métricas si cambiaron). Esto es
  post-confirmación del servidor, no optimismo real — no tiene sentido
  mostrar "completado" antes de que el servidor confirme un guardado que
  puede fallar por validación.
- **No implementado (y por qué):** optimismo *pre-respuesta* en el propio
  `POST /workout-logs` (ej: navegar como si estuviera guardado antes de la
  respuesta) — el ID real del log lo genera el servidor y la navegación
  post-guardado (`/workout-logs/:id`) lo necesita; simularlo requeriría un ID
  temporal + reconciliación + rollback UI si falla la validación (ej. un
  `exercise_id` que ya no existe). El costo de esa complejidad no se
  justifica para una acción que el usuario hace una vez al final del
  entrenamiento (no es una interacción de alta frecuencia tipo "like").

## Pendiente / fuera de este contrato todavía

No implementado — si mobile lo necesita, agregar acá primero, documentar,
después codear:

- **Refresh token / rotación.** Hoy: token de 30 días, sin revocación server-side
  salvo cambiar `NEXTAUTH_SECRET` (lo cual invalida también las cookies web).
  Un 401 en cualquier request (no solo `/me`) limpia el token guardado y
  fuerza logout limpio (`setUnauthorizedHandler` en `lib/api/client.ts` del
  repo mobile) — así que al menos no queda la UI mobile mostrando errores 401
  en loop, pero el usuario sí tiene que loguearse de nuevo entero.
- **Mesocycle / training-session / exercise CRUD (crear/editar/borrar) desde mobile.**
  Deliberadamente fuera de v1: la planificación se hace en el dashboard web,
  mobile es "ver el plan + loguear el entrenamiento". Si eso cambia, es
  trabajo nuevo, no un gap a completar rápido.
- **Vincular Google desde mobile** (solo desvincular está implementado —
  ver `DELETE /account/google` arriba) y **Google Sign-In nativo** (login,
  no solo linking) — ambos requieren `expo-auth-session` contra el mismo
  `GoogleProvider` + rediseñar el callback para aceptar bearer.
- **Push notifications** — `WorkoutReminder.notification_type` solo soporta
  `"browser"` hoy; agregar `"push"` + guardar el Expo push token es cambio de
  schema + endpoint nuevo (`POST /me/push-token`).
- **Paginación** en `/mesocycles` y `/workout-logs` (hoy: lista completa /
  últimos 50 fijo).
- **CORS** — no configurado porque `fetch` de React Native no lo aplica
  (solo importa si algún día se sirve `workout-mobile` como PWA/web).
