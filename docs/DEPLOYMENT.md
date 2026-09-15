# Deployment Runbook — Vercel + Supabase Postgres (Prisma)

Guía paso a paso para llevar la app a producción. Plataformas: **Vercel** (frontend) + **Supabase Cloud Postgres** (base de datos, accedida vía Prisma).

## Fase 0 — Requisitos

- Proyecto de base de datos en [supabase.com](https://supabase.com) (solo se usa el Postgres, no Supabase Auth).
- Cuenta en [vercel.com](https://vercel.com) (puede conectarse con GitHub).
- Repo remoto: `https://github.com/falechfacundo/workout-web`.
- Node 20+.

## Fase 1 — Preparar el repo (local)

```bash
git status                # working tree limpio
git push origin main      # publicar commits locales
npm install
npm run lint              # 0 errores
npm run build             # build de producción SIN errores (incluye typecheck)
```

Nota: `typescript.ignoreBuildErrors` no está en `next.config.mjs`; el build debe pasar el typecheck.

## Fase 2 — Crear proyecto Supabase Cloud (solo Postgres)

1. En supabase.com → **New Project** → nombre (ej. `workout-app`) + password de DB.
2. Desde **Project Settings → Database → Connection string** (URI, con la password de la DB):
   - `DATABASE_URL` → `postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true`
   - `DIRECT_URL` → `postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres`
3. Desde **Project Settings → API → JWT Settings**:
   - `NEXTAUTH_SECRET` → `openssl rand -base64 32`

### Aplicar schema y seed

Desde la raíz del repo:

```bash
npx prisma generate
npx prisma db push          # aplica el schema (producción: usar `prisma migrate deploy`)
npx prisma db seed          # crea la cuenta demo (demo@example.com / password1234) y catálogos
```

## Fase 3 — Deploy en Vercel

### Opción A: GitHub (recomendada)

1. vercel.com → **Add New Project** → importar `falechfacundo/workout-web`.
2. Framework preset: Next.js (auto).
3. Agregar env vars bajo **Settings → Environment Variables**:

| Key | Valor |
|---|---|
| `DATABASE_URL` | Connection URI (pooler) |
| `DIRECT_URL` | Connection URI (directa) |
| `NEXTAUTH_SECRET` | mismo valor usado localmente |
| `NEXTAUTH_URL` | `https://<tu-app>.vercel.app` |
| `NEXT_PUBLIC_APP_URL` | `https://<tu-app>.vercel.app` |

> Eliminar cualquier `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` antigua: la app ya no usa el cliente de Supabase.

4. **Deploy**. Cada push a `main` redeploya automáticamente.

### Opción B: CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```
Setear las mismas env vars con `vercel env add`.

## Fase 4 — Verificación post-deploy

1. Abrir la URL `https://<tu-app>.vercel.app`.
2. Login demo: `demo@example.com` / `password1234` (copiar desde la página de login). Forzar el cambio de password si `must_change_password` está activo.
3. Registrar un usuario nuevo y confirmar que se crea su perfil (la acción `signUp` crea `user` + `profile`).
4. Crear un ejercicio, un mesociclo, un workout log y ver que Analytics muestre datos.
5. Cambiar password desde `/change-password` (requiere el password actual; no hay reset por email).
6. Navegar todas las secciones del sidebar (ningún 404).
7. Hacer logout desde el sidebar.

## Rollback

- **App**: en Vercel, **Settings → Deployments** → `...` → **Promote to Production** de un deploy anterior.
- **DB**: Supabase **Database → Backups** (requiere plan con backups habilitado) o `prisma db push` hacia atrás.

## Recomendaciones de seguridad (antes de dar acceso público)

- Rotá `NEXTAUTH_SECRET` y la password de la DB si el repo es público.
- El hashing de passwords usa bcrypt (10 rounds) en `users.password_hash`.
- El rate limiting de login (`lib/utils/rate-limiter.ts`) es `no-op`: implementar del lado servidor antes de exponer la app a tráfico público.
- Eventualmente migrar a `prisma migrate deploy` (archivos de migración versionados) en vez de `db push` para producción.