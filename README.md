# 💪 Workout App

Bienvenido al repositorio de **Workout App** (también llamada GymTrack), una aplicación web de gestión de entrenamientos desarrollada con Next.js, TypeScript y PostgreSQL (Supabase vía Prisma). Diseñada para atletas y entrenadores que necesitan un sistema para planificar, registrar y analizar sus entrenamientos.

![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript) ![Prisma](https://img.shields.io/badge/Prisma-7-2d3748?logo=prisma) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38b2ac?logo=tailwindcss) ![Zod](https://img.shields.io/badge/Zod-3.24-000000?logo=zod)

> ⚠️ **En producción.** Los cambios afectan datos reales. Si sos un agente/desarrollador (humano o IA), leé primero [AGENTS.md](./AGENTS.md).

## 📑 Tabla de Contenidos

- [✨ Características Principales](#-características-principales)
- [🛠 Stack Tecnológico](#-stack-tecnológico)
- [🚀 Instalación y Configuración](#-instalación-y-configuración)
- [🔧 Variables de Entorno](#-variables-de-entorno)
- [📁 Estructura del Proyecto](#-estructura-del-proyecto)
- [🔐 Sistema de Autenticación](#-sistema-de-autenticación)
- [🔨 Desarrollo](#-desarrollo)
- [🚢 Despliegue](#-despliegue)
- [📊 Estado del MVP](#-estado-del-mvp)
- [🤝 Contribución](#-contribución)
- [📄 Licencia](#-licencia)

---

## ✨ Características Principales

### 🔐 Autenticación y Seguridad

- 🛡️ **NextAuth v4 (Credentials)**: Login/registro con email + contraseña (bcrypt, 10 rounds)
- 🔒 **Server Actions**: Validación de autenticación en servidor (`getServerUser()`) y contrato `{ data, error }` vía `safeAction`
- 🛡️ **Middleware protector** (`proxy.ts`): Protección a nivel de ruta con Next.js 16
- 🔑 **Cambio de contraseña**: Flujo `/change-password` que requiere la contraseña actual

### 📊 Dashboard Inteligente

- 📈 **Analytics**: Visualización de progreso con gráficos interactivos (Recharts)
- 📋 **Panel de control**: Resumen del estado actual del entrenamiento
- 🎯 **Métricas**: Seguimiento de múltiples parámetros de rendimiento
- 📅 **Calendario de entrenamientos**: Visualización de sesiones planificadas, completadas y reminders

### 💪 Gestión de Entrenamientos

- 🏋️ **Registro de ejercicios**: Base de datos de ejercicios personalizables
- 📝 **Sesiones de entrenamiento**: Crear y editar sesiones con múltiples ejercicios (persisten vía server actions)
- 📦 **Mesociclos**: Planificación por fases de múltiples semanas
- 🎯 **Templates**: Plantillas reutilizables de mesociclos (listado, detalle, creación y edición)
- 📊 **Logs de sesiones**: Registro detallado de cada entrenamiento

### 📏 Mediciones y Progreso

- 📐 **Tracking de medidas**: Registra y visualiza medidas corporales
- 📈 **Gráficos de progreso**: Análisis visual del progreso en el tiempo
- 💪 **Grupos musculares**: Organización y seguimiento por grupos musculares

### 👤 Perfil de Usuario

- 🔧 **Configuración personalizada**: Ajusta preferencias de perfil
- 🛡️ **Gestión de sesiones**: Control sobre la sesión activa (sign out)
- 🚪 **Sign out seguro**: Cierre de sesión desde el sidebar y Settings

---

## 🛠 Stack Tecnológico

### Frontend

| Tecnología | Versión | Propósito |
|---|---|---|
| [Next.js](https://nextjs.org) | ^16.2 | Framework React fullstack (App Router + Turbopack) |
| [TypeScript](https://www.typescriptlang.org) | ^5 | Tipado estático |
| [React](https://react.dev) | ^19.2 | Biblioteca de UI |
| [TailwindCSS](https://tailwindcss.com) | ^3.4 | Framework de estilos |
| [Radix UI](https://www.radix-ui.com) | Latest | Componentes accesibles (shadcn/ui) |

### Base de Datos y Autenticación

| Servicio | Propósito |
|---|---|
| [Supabase](https://supabase.com) | **solo PostgreSQL** (accedida vía Prisma; sin Supabase Auth, RLS, Storage ni functions) |
| [Prisma](https://prisma.io) | ORM + migraciones + seed (`prisma/schema.prisma`, `prisma.config.ts`) |
| [NextAuth.js](https://next-auth.js.org) | Autenticación (Credentials + bcrypt) |

### Validación y Gestión de Formularios

| Librería | Versión | Propósito |
|---|---|---|
| [Zod](https://zod.dev) | ^3.24 | Validación de esquemas (`lib/schemas/*`) |
| [React Hook Form](https://react-hook-form.com) | 7.x | Gestión de formularios |
| [@hookform/resolvers](https://github.com/react-hook-form/resolvers) | ^3.9 | Integración con Zod |

### Utilidades e Interacciones

| Librería | Versión | Propósito |
|---|---|---|
| [Zustand](https://zustand-demo.pmnd.rs) | ^5.0 | Gestión de estado global (`lib/stores/*`) |
| [Sonner](https://sonner.emilkowal.ski) | ^1.7 | Sistema de notificaciones |
| [Lucide React](https://lucide.dev) | ^0.454 | Iconografía |
| [Recharts](https://recharts.org) | ^2.15 | Gráficos interactivos |
| [date-fns](https://date-fns.org) | ^4.1 | Utilidades para fechas |

---

## 🚀 Instalación y Configuración

### Prerrequisitos

- **Node.js**: >= 20.x
- **npm**: >= 9.x
- **Git**: Para clonar el repositorio
- **Credenciales de la DB**: el repo usa la base PostgreSQL de Supabase (ver [Variables de Entorno](#-variables-de-entorno))

### Instalación

```bash
git clone https://github.com/falechfacundo/workout-web.git
cd workout-app
npm install
```

### Base de datos (Supabase PostgreSQL vía Prisma)

> ⚠️ **El `.env` local apunta a la misma base de datos que producción** (Supabase pooler). No existe una DB local separada. Ver [AGENTS.md](./AGENTS.md).

```bash
cp .env.example .env        # completar DATABASE_URL / DIRECT_URL / NEXTAUTH_SECRET
npx prisma generate
npx prisma db push          # aplicar schema (CUIDADO: va contra la DB del .env)
npx prisma db seed          # crear demo user + catálogos + datos demo (borra y re-crea todo)
```

### Iniciar servidor de desarrollo

```bash
npm run dev
```

El servidor estará en [http://localhost:3000](http://localhost:3000).

### Build para Producción

```bash
npm run build
npm start
```

---

## 🔧 Variables de Entorno

Crea un archivo `.env` (raíz del repo, gitignoreado) con la plantilla de `.env.example`:

```env
# PostgreSQL (Supabase). DATABASE_URL se usa en RUNTIME: debe apuntar al POOLER 6543.
DATABASE_URL=postgresql://postgres.<project_ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true
# DIRECT_URL = conexión DIRECTA 5432, reservada para el CLI de Prisma (db push/migrate/seed).
DIRECT_URL=postgresql://postgres.<project_ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres

# NextAuth (v4)
NEXTAUTH_SECRET=openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

- `DATABASE_URL` / `DIRECT_URL`: conexión a Postgres vía Prisma (pooler 6543 en runtime; directa 5432 para el CLI, ver `prisma.config.ts`).
- `NEXTAUTH_SECRET`: firma de las sesiones JWT. Generar una por entorno.
- `NEXTAUTH_URL` / `NEXT_PUBLIC_APP_URL`: URL base de la app.

Obtén la conexión en tu [Dashboard de Supabase](https://app.supabase.com) → Project Settings → Database.

---

## 📁 Estructura del Proyecto

```
app/                 # Rutas (App Router)
  auth/              # login, register
  change-password/   # Cambio de contraseña (requiere actual)
  dashboard/         # página principal, analytics, calendar, ejercicios, mesociclos, logs, perfil, settings
components/
  ui/                # Componentes base (Radix + Tailwind), skeletons (`ui/data-skeletons.tsx`)
  auth/              # Formularios y utilidades de auth
  dashboard/         # Componentes por sección del dashboard
  forms/             # Formularios con react-hook-form + zod
hooks/               # useRequireAuth, useSession helpers
lib/
  actions/           # Server Actions (Prisma) → contrato { data, error }
  schemas/           # Esquemas Zod
  stores/            # Estado Zustand
  utils/             # utilidades, logger, safe-action
  docs/              # Documentación interna del sistema de logging
prisma/
  schema.prisma      # Esquema de la base de datos
  seed.ts            # Seed (borra y re-crea): demo user + catálogos + datos demo
proxy.ts             # Middleware de Next.js (Next 16, withAuth/NextAuth — protege /dashboard/*)
AGENTS.md            # Guía para agentes (advertencias de producción, verificación, convenciones)
docs/                # DEPLOYMENT.md, MVP-COMPLETENESS.md, archive/
```

---

## 🧩 Componentes Principales

### Autenticación
- AuthForm.tsx - Formulario login/registro (signIn + signUp)
- SignOutButton.tsx - Cierre de sesión

### Dashboard
- DashboardLayout.tsx - Layout principal con navegación
- Analytics/ - Gráficos y estadísticas
- Exercises/ - Gestor de ejercicios
- Mesocycles/ - Planificador de fases (+ templates)
- WorkoutLogs/ - Historial de entrenamientos
- Calendar/ - Calendario y reminders

### UI Base (Radix + Tailwind)
30+ componentes UI reutilizables como Button, Card, Input, Dialog, Skeleton, etc.

---

## 🔐 Sistema de Autenticación

Implementa **múltiples niveles de protección**:

1. **Middleware** (`proxy.ts`) - Protección a nivel de ruta
2. **Auth Provider** (NextAuth `SessionProvider`) - Sincronización de estado global
3. **Client Hooks** - `useRequireAuth()`, `withAuth()`
4. **Server Actions** - Validación en servidor con `getServerUser()`

Para más detalles, consulta [AUTH-SYSTEM.md](./AUTH-SYSTEM.md).

### 🔑 Cuenta de demostración

Para probar la app sin registrarte, usá la cuenta demo que crea `npm run db:seed` (borra y re-crea la base). También aparece listada en la página de login con botones para copiar al portapapeles:

| Campo | Valor |
|---|---|
| Email | demo@example.com |
| Username | demo_user |
| Contraseña | password1234 |

---

## 🔨 Desarrollo

### Scripts

| Comando | Acción |
|---|---|
| npm run dev | Servidor de desarrollo |
| npm run build | Build de producción (incluye typecheck) |
| npm start | Modo producción |
| npm run lint | Linting |
| npm run db:push | `prisma db push` (⚠️ apunta a la DB del `.env` → producción) |
| npm run db:migrate | `prisma migrate dev` (⚠️ idem) |
| npm run db:seed | `prisma db seed` (**borra y re-crea TODA la DB**) |
| npm run db:studio | `prisma studio` |

### Convenciones

- **TypeScript**: Tipar todas las variables (sin `any`)
- **React**: Componentes funcionales con hooks
- **Styling**: TailwindCSS classes
- **Validación**: Zod schemas + `safeAction` para server actions
- **Commits**: Conventional Commits en español, estilo imperativo

```bash
git commit -m "feat(exercises): agregar página de gestión"
git commit -m "fix(auth): corregir redireccionamiento"
```

---

## 🚢 Despliegue

> Documentación paso a paso en [DEPLOYMENT.md](./docs/DEPLOYMENT.md).

### Vercel (recomendado)

1. Push a GitHub: `git push origin main`
2. Conectar el repo `falechfacundo/workout-web` en vercel.com
3. Setear las variables de entorno del proyecto
4. Deploy (automático en cada push)

O vía CLI:

```bash
npm i -g vercel
vercel login
npx -y vercel@latest --prod -y
```

### Supabase en producción

El proyecto Supabase se usa **solo como PostgreSQL**. El schema y el seed viven en `prisma/`:

- `npx prisma db push` aplica el schema (producción: considerar migraciones versionadas con `prisma migrate deploy`).
- `npx prisma db seed` crea la cuenta demo + catálogos + datos demo.
- En Vercel se setean `DATABASE_URL` (pooler 6543), `DIRECT_URL` (5432), `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_APP_URL`. Eliminar cualquier `NEXT_PUBLIC_SUPABASE_*` antigua.

---

## 📊 Estado del MVP

En producción. Estado por feature y deuda técnica pendiente en [MVP-COMPLETENESS.md](./docs/MVP-COMPLETENESS.md). Verificación base: `npx tsc --noEmit` (0 errores), `npm run lint` (0 errores, ~135 warnings de `any` no bloqueantes), `npm run build` (pasa).

---

## 🤝 Contribución

### Pasos

1. **Fork** el repositorio
2. **Crear rama**: `git checkout -b feature/nombre`
3. **Hacer cambios** y probar: `npm run dev`
4. **Commit**: `git commit -m "feat: descripción"`
5. **Push**: `git push origin feature/nombre`
6. **Pull Request** en GitHub

### Reportar Issues

Usa labels: `bug`, `enhancement`, `documentation`, `question`

---

## 📞 Soporte

### Recursos

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth v4 Docs](https://next-auth.js.org)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/)
- [Zod](https://zod.dev)

---

## 📄 Licencia

**MIT License** - Copyright (c) 2026 Workout App