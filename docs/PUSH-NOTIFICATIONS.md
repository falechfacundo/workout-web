# Push notifications (WorkoutReminder → mobile)

Igual que `docs/GOOGLE-SIGNIN.md` en `workout-mobile`: el código ya está.
Lo que falta son 3 secrets que dependen de tus cuentas (Vercel + GitHub) y
ningún agente puede crearlos por vos.

## Qué se construyó

`WorkoutReminder` (día de la semana + hora + tipo de notificación) ya
existía, pero era **puro CRUD sin dispatcher real** — nada leía esa tabla
más que el form del dashboard. Se agregó:

1. **`PushToken`** (tabla nueva): guarda el Expo push token por usuario/device.
   - `POST/DELETE /api/mobile/v1/push-token` — mobile se registra al loguearse
     y se desregistra al hacer logout (ver `docs/MOBILE-API-CONTRACT.md`).
2. **`WorkoutReminder.last_sent_at`** (columna nueva): para no mandar el mismo
   recordatorio dos veces el mismo día.
3. **`notification_type: "push"`** — opción nueva en el enum (Zod, no un enum
   de Postgres — `lib/schemas/workout-reminder.ts`) + en el `<Select>` del
   form web (`components/dashboard/reminders/reminder-form.tsx`). Hoy es la
   única forma de crear un `WorkoutReminder`: no hay UI en mobile para esto
   todavía, se crea desde el dashboard web y se recibe en mobile.
4. **`GET /api/cron/workout-reminders`** — el dispatcher. Protegido por
   `CRON_SECRET` (header `Authorization: Bearer <secret>`, 401 si no matchea).
   Busca `WorkoutReminder`s `is_enabled` cuyo `day_of_week`/`time_of_day` cae
   en la ventana de los últimos 20 minutos y no se mandaron hoy, junta los
   `PushToken` del usuario, y les pega a todos vía la Expo Push API
   (`https://exp.host/--/api/v2/push/send`). Si Expo devuelve
   `DeviceNotRegistered` para un token, se borra (app desinstalada).

## ⚠️ Decisiones que quedaron simplificadas (leer antes de confiar en esto)

- **Timezone: todo es UTC.** `time_of_day` sale de un `<input type="time">`
  web sin timezone, y el dispatcher lo compara contra la hora UTC del
  servidor. Si el usuario no vive en UTC, el recordatorio suena corrido por
  su offset (ej: un usuario en Argentina, UTC-3, que pone "08:00" recibe el
  push a las 08:00 UTC = 05:00 su hora local). Arreglar esto bien es agregar
  un campo de timezone a `Profile` y convertir — no está hecho, es la
  limitación más importante de esta versión.
- **Dedupe por día, no por horario exacto.** Si el cron no corre durante más
  de `WINDOW_MINUTES` (20 min, en `app/api/cron/workout-reminders/route.ts`)
  alrededor de la hora configurada, ese recordatorio se saltea ese día
  entero (no hay "reintento" más tarde en el mismo día).
- **Sin token registrado en el momento del envío = recordatorio perdido ese
  día**, aunque el usuario registre un token después. Ver el comentario en el
  route sobre por qué (evitar reprocesar el mismo `WorkoutReminder` en cada
  corrida del cron hasta medianoche).
- **Cron por GitHub Actions, no Vercel Cron** — a propósito: Vercel Hobby
  limita los cron jobs a 1 ejecución/día, insuficiente para "sonar cerca de
  la hora exacta". GitHub Actions con `schedule` corre cada 5 min gratis sin
  esa restricción, a costa de no ser puntual al minuto (por eso la ventana de
  tolerancia de 20 min) y de que GitHub lo desactiva solo si el repo pasa 60
  días sin ningún push (no por inactividad del cron en sí — un `git push`
  cualquiera lo reactiva).

## Pasos manuales

### 1. Generar y configurar `CRON_SECRET`

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

- Agregalo a `workout-app/.env` local.
- Agregalo como env var en Vercel (mismo nombre, Production **y** Preview si
  usás preview deploys) — Project Settings → Environment Variables.
- Agregalo como **GitHub Actions secret** en el repo `workout-app` (no en
  `workout-mobile`, el workflow vive ahí):
  Settings → Secrets and variables → Actions → New repository secret →
  `CRON_SECRET` con el mismo valor.

### 2. Confirmar que el workflow apunta a tu deploy

`.github/workflows/workout-reminders-cron.yml` ya está commiteado y le pega a
`https://workout-web-tau.vercel.app/api/cron/workout-reminders` — si tu URL
de producción es otra, actualizala ahí. El workflow corre solo una vez que
esté en la rama por defecto del repo en GitHub (no hace falta nada más para
"activarlo" más que el push).

### 3. Probar sin esperar al cron

```bash
curl -H "Authorization: Bearer <CRON_SECRET>" \
  https://workout-web-tau.vercel.app/api/cron/workout-reminders
```
o desde la pestaña **Actions** del repo en GitHub → el workflow → "Run
workflow" (está el trigger `workflow_dispatch` para esto).

### 4. Mobile: requiere dev client, no Expo Go

Mismo build que ya necesitás para Google Sign-In (`docs/GOOGLE-SIGNIN.md` en
`workout-mobile`) — **push remoto no funciona en Expo Go en Android desde el
SDK 53** (sí en iOS, pero mejor probar con dev client en los dos para que sea
consistente). Además necesita el `projectId` real de EAS (`eas init`, ver
`docs/DISTRIBUTION.md`) — sin eso, `getExpoPushTokenAsync` no tiene con qué
pedir el token y `registerForPushNotifications()` no hace nada silenciosamente.

### 5. Crear un WorkoutReminder de prueba

Todavía no hay UI en mobile para esto — creálo desde el dashboard web
(`/dashboard/calendar` o donde esté montado `ReminderForm`), con
**Notification Type = "Push (mobile app)"**, día de hoy (UTC — ver la
limitación de timezone arriba) y una hora dentro de los próximos minutos.

## Qué NO incluye esto todavía

- UI en mobile para crear/editar `WorkoutReminder` (solo lectura implícita:
  se crean desde la web, se notifican en mobile).
- Timezone por usuario (ver arriba).
- Canales `"email"` y `"both"` — siguen sin dispatcher, igual que antes de
  este cambio (fuera de scope, no se tocó).
- Deep link al tapear la notificación: hoy navega a
  `/session/:training_session_id/live` en mobile si el `WorkoutReminder`
  tiene una `training_session_id` asociada; si no la tiene (reminder genérico
  sin sesión), el tap no navega a ningún lado.
