# 💪 Workout App

Bienvenido al repositorio de **Workout App** (también llamada GymTrack), una aplicación web de gestión de entrenamientos desarrollada con Next.js, TypeScript y Supabase. Diseñada para atletas y entrenadores que necesitan un sistema para planificar, registrar y analizar sus entrenamientos.

![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript) ![Supabase](https://img.shields.io/badge/Supabase-Latest-1ea860?logo=supabase) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38b2ac?logo=tailwindcss) ![Zod](https://img.shields.io/badge/Zod-3.24-000000?logo=zod)

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

- 🛡️ **Autenticación integrada**: Sistema de autenticación con Supabase Auth
- 🔑 **Múltiples métodos**: Login con email/contraseña, recuperación de contraseña y verificación de email
- 📱 **Reset seguro**: Flujo completo de reseteo de contraseña con validación por email
- 🛡️ **Middleware protector** (`proxy.ts`): Protección a nivel de ruta con Next.js
- 🔒 **Server Actions**: Validación de autenticación en servidor para máxima seguridad

### 📊 Dashboard Inteligente

- 📈 **Analytics**: Visualización de progreso con gráficos interactivos (Recharts)
- 📋 **Panel de control**: Resumen del estado actual del entrenamiento
- 🎯 **Métricas**: Seguimiento de múltiples parámetros de rendimiento
- 📅 **Calendario de entrenamientos**: Visualización de sesiones planificadas y completadas

### 💪 Gestión de Entrenamientos

- 🏋️ **Registro de ejercicios**: Base de datos de ejercicios personalizables
- 📝 **Sesiones de entrenamiento**: Crear y editar sesiones con múltiples ejercicios
- 📦 **Mesociclos**: Planificación por fases de múltiples semanas
- 🎯 **Templates**: Plantillas reutilizables para sesiones y mesociclos
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
| [Next.js](https://nextjs.org) | ^16.2 | Framework React fullstack |
| [TypeScript](https://www.typescriptlang.org) | ^5 | Tipado estático |
| [React](https://react.dev) | ^19.2 | Biblioteca de UI |
| [TailwindCSS](https://tailwindcss.com) | ^3.4 | Framework de estilos |
| [Radix UI](https://www.radix-ui.com) | Latest | Componentes accesibles |

### Base de Datos y Autenticación

| Servicio | Propósito |
|---|---|
| [Supabase](https://supabase.com) | PostgreSQL como base de datos (accedida vía Prisma, sin Supabase Auth) |
| [Prisma](https://prisma.io) | ORM + migraciones + seed |
| [NextAuth.js](https://next-auth.js.org) | Autenticación (Credentials + bcrypt) |

### Validación y Gestión de Formularios

| Librería | Versión | Propósito |
|---|---|---|
| [Zod](https://zod.dev) | ^3.24 | Validación de esquemas |
| [React Hook Form](https://react-hook-form.com) | 7.x | Gestión de formularios |
| [@hookform/resolvers](https://github.com/react-hook-form/resolvers) | ^3.9 | Integración con Zod |

### Utilidades e Interacciones

| Librería | Versión | Propósito |
|---|---|---|
| [Zustand](https://zustand-demo.pmnd.rs) | ^5.0 | Gestión de estado global |
| [Sonner](https://sonner.emilkowal.ski) | ^1.7 | Sistema de notificaciones |
| [Lucide React](https://lucide.dev) | ^0.454 | Iconografía |
| [Recharts](https://recharts.org) | ^2.15 | Gráficos interactivos |
| [date-fns](https://date-fns.org) | ^4.1 | Utilidades para fechas |

---

## 🚀 Instalación y Configuración

### Prerrequisitos

- **Node.js**: >= 18.x (recomendado 20.x)
- **npm**: >= 9.x
- **Git**: Para clonar el repositorio
- **Cuenta de Supabase**: [https://supabase.com](https://supabase.com)
- **Supabase CLI + Docker** (para desarrollo local): [docs](https://supabase.com/docs/guides/cli)

### Instalación

```bash
git clone https://github.com/falechfacundo/workout-web.git
cd workout-app
npm install
```

### Base de datos local (Supabase)

```bash
supabase start       # levanta los servicios en Docker
supabase db reset    # aplica supabase/schema.sql + supabase/seed.sql
```

El reset crea la cuenta demo real en auth.

### Variables de entorno

```bash
cp .env.example .env.local
```

Ver la sección [Variables de Entorno](#-variables-de-entorno). Las URLs locales de Supabase quedan configuradas por `supabase start`.

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

Crea un archivo `.env` (raíz del repo) con:

```env
DATABASE_URL=postgresql://postgres.<ref>:<password>@<pooler-host>:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.<ref>:<password>@<pooler-host>:5432/postgres
NEXTAUTH_SECRET=openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

- `DATABASE_URL` / `DIRECT_URL`: conexión a Postgres vía Prisma (pooler y directa). `/prisma.config.ts` usa `DIRECT_URL` para push/seed.
- `NEXTAUTH_SECRET`: firma de las sesiones JWT. Generar una por entorno.
- `NEXTAUTH_URL` / `NEXT_PUBLIC_APP_URL`: URL base de la app.

Obtén la conexión en tu [Dashboard de Supabase](https://app.supabase.com) → Project Settings → Database. Para desarrollo local ya viene configurado en `.env`.

---

## 📁 Estructura del Proyecto

```
app/                 # Rutas (App Router)
  auth/              # login, register
  change-password/   # Cambio de contraseña (requiere actual)
  dashboard/         # página principal, analytics, calendar, ejercicios, mesociclos, logs, perfil, settings
components/
  ui/                # Componentes base (Radix + Tailwind)
  auth/              # Formularios y utilidades de auth
  dashboard/         # Componentes por sección del dashboard
  forms/             # Formularios con react-hook-form + zod
lib/
  actions/           # Server Actions (Prisma)
  schemas/           # Esquemas Zod
  stores/            # Estado Zustand
  utils/             # utilidades, logger, safe-action
  docs/              # Documentación interna del sistema de logging
prisma/
  schema.prisma      # Esquema de la base de datos
  seed.ts            # Datos demo (incluye usuario demo real)
proxy.ts             # Middleware de Next.js (Next 16, withAuth/NextAuth)
```

---

## 🧩 Componentes Principales

### Autenticación
- AuthForm.tsx - Formulario login/registro (signIn + signUp action)
- SignOutButton.tsx - Cierre de sesión

### Dashboard
- DashboardLayout.tsx - Layout principal con navegación
- Analytics/ - Gráficos y estadísticas
- Exercises/ - Gestor de ejercicios
- Mesocycles/ - Planificador de fases
- WorkoutLogs/ - Historial de entrenamientos

### UI Base (Radix + Tailwind)
30+ componentes UI reutilizables como Button, Card, Input, Dialog, etc.

---

## 🔐 Sistema de Autenticación

Implementa **múltiples niveles de protección**:

1. **Middleware** (`proxy.ts`) - Protección a nivel de ruta
2. **Auth Provider** - Sincronización de estado global
3. **Client Hooks** - `useRequireAuth()`, `withAuth()`
4. **Server Actions** - Validación en servidor

Para más detalles, consulta [AUTH-SYSTEM.md](./AUTH-SYSTEM.md).

### 🔑 Cuenta de demostración

Para probar la app sin registrarte, podés usar la cuenta demo que se crea con el seed (`supabase db reset`). También aparece listada en la página de login con botones para copiar al portapapeles:

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
| npm run build | Build de producción |
| npm start | Modo producción |
| npm run lint | Linting |

### Convenciones

- **TypeScript**: Tipar todas las variables
- **React**: Componentes funcionales con hooks
- **Styling**: TailwindCSS classes
- **Validación**: Zod schemas
- **Commits**: Conventional Commits

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
vercel --prod
```

### Supabase en producción

La app necesita un proyecto creado en supabase.com con:

- `supabase/schema.sql` + `supabase/seed.sql` aplicados
- Auth configurado: `site_url` y redirect URLs apuntando a la URL de Vercel

---

## 📊 Estado del MVP

Todos los módulos principales están implementados y verificados (typecheck 0 errores, lint 0 errores). Estado por feature y gaps pendientes en [MVP-COMPLETENESS.md](./docs/MVP-COMPLETENESS.md).

> **¿Querés lanzar en ~2h?** Seguí [LAUNCH-CHECKLIST.md](./docs/LAUNCH-CHECKLIST.md): diagnóstico, fixes concretos de bloqueos y runbook de deploy.

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
- [Supabase Docs](https://supabase.com/docs)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/)
- [Zod](https://zod.dev)

---

## 📄 Licencia

**MIT License** - Copyright (c) 2025 Workout App