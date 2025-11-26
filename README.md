# 💪 Workout App

Bienvenido al repositorio de **Workout App**, una aplicación web moderna de gestión de entrenamientos desarrollada con Next.js, TypeScript y Supabase. Diseñada para atletas y entrenadores que necesitan un sistema robusto, escalable y fácil de usar para planificar, registrar y analizar sus entrenamientos.

![Next.js](https://img.shields.io/badge/Next.js-14.2.8-black?logo=next.js) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript) ![Supabase](https://img.shields.io/badge/Supabase-Latest-1ea860?logo=supabase) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.17-38b2ac?logo=tailwindcss) ![Zod](https://img.shields.io/badge/Zod-3.24.1-000000?logo=zod)

## 📑 Tabla de Contenidos

- [✨ Características Principales](#-características-principales)
- [🛠 Stack Tecnológico](#-stack-tecnológico)
- [🏗 Arquitectura del Proyecto](#-arquitectura-del-proyecto)
- [🚀 Instalación y Configuración](#-instalación-y-configuración)
- [🔧 Variables de Entorno](#-variables-de-entorno)
- [📁 Estructura del Proyecto](#-estructura-del-proyecto)
- [🧩 Componentes Principales](#-componentes-principales)
- [🔐 Sistema de Autenticación](#-sistema-de-autenticación)
- [🔨 Desarrollo](#-desarrollo)
- [🚢 Despliegue](#-despliegue)
- [🤝 Contribución](#-contribución)
- [📞 Soporte](#-soporte)
- [📄 Licencia](#-licencia)

---

## ✨ Características Principales

### 🔐 Autenticación y Seguridad

- 🛡️ **Autenticación integrada**: Sistema de autenticación robusto con Supabase Auth
- 🔑 **Múltiples métodos**: Login con email/contraseña, recuperación de contraseña y verificación de email
- 📱 **Reset seguro**: Flujo completo de reseteo de contraseña con validación por email
- 🛡️ **Middleware protector**: Protección a nivel de ruta con Next.js middleware
- 🔒 **Server Actions**: Validación de autenticación en servidor para máxima seguridad

### 📊 Dashboard Inteligente

- 📈 **Analytics avanzados**: Visualización de progreso con gráficos interactivos
- 📋 **Panel de control**: Resumen completo del estado actual del entrenamiento
- 🎯 **Métricas personalizadas**: Seguimiento de múltiples parámetros de rendimiento
- 📅 **Calendario de entrenamientos**: Visualización de sesiones planificadas y completadas

### 💪 Gestión de Entrenamientos

- 🏋️ **Registro de ejercicios**: Base de datos completa de ejercicios personalizables
- 📝 **Sesiones de entrenamiento**: Crear y editar sesiones con múltiples ejercicios
- 📦 **Mesociclos**: Planificación de entrenamientos por fases de múltiples semanas
- 🎯 **Templates**: Plantillas reutilizables para sesiones y mesociclos
- 📊 **Logs de sesiones**: Registro detallado de cada entrenamiento realizado

### 📏 Mediciones y Progreso

- 📐 **Tracking de medidas**: Registra y visualiza medidas corporales
- 📈 **Gráficos de progreso**: Análisis visual del progreso a lo largo del tiempo
- 💪 **Grupos musculares**: Organización y seguimiento por grupos musculares específicos
- 🎯 **Objetivos personalizados**: Define y monitorea tus objetivos de entrenamiento

### 👤 Perfil de Usuario

- 🔧 **Configuración personalizada**: Ajusta preferencias y configuración de la app
- 📱 **Tema claro/oscuro**: Soporte para modos de visualización
- 🛡️ **Gestión de sesiones**: Control de sesiones activas
- 🚪 **Sign out seguro**: Cierre de sesión seguro en todos los dispositivos

---

## 🛠 Stack Tecnológico

### Frontend

| Tecnología | Versión | Propósito |
|---|---|---|
| [Next.js](https://nextjs.org) | 14.2.8 | Framework React fullstack |
| [TypeScript](https://www.typescriptlang.org) | 5.0 | Tipado estático |
| [React](https://react.dev) | 19 | Biblioteca de UI |
| [TailwindCSS](https://tailwindcss.com) | 3.4.17 | Framework de estilos |
| [Radix UI](https://www.radix-ui.com) | Latest | Componentes accesibles |

### Base de Datos y Autenticación

| Servicio | Propósito |
|---|---|
| [Supabase](https://supabase.com) | Base de datos PostgreSQL + Auth |
| [@supabase/ssr](https://supabase.com) | Integración SSR con Supabase |

### Validación y Gestión de Formularios

| Librería | Versión | Propósito |
|---|---|---|
| [Zod](https://zod.dev) | 3.24.1 | Validación de esquemas |
| [React Hook Form](https://react-hook-form.com) | 7.x | Gestión de formularios |
| [@hookform/resolvers](https://github.com/react-hook-form/resolvers) | 3.9.1 | Integración con Zod |

### Utilidades e Interacciones

| Librería | Versión | Propósito |
|---|---|---|
| [Zustand](https://zustand-demo.pmnd.rs) | 5.0.3 | Gestión de estado global |
| [Sonner](https://sonner.emilkowal.ski) | 1.7.1 | Sistema de notificaciones |
| [Lucide React](https://lucide.dev) | 0.454 | Iconografía moderna |
| [Recharts](https://recharts.org) | 2.15 | Gráficos interactivos |
| [date-fns](https://date-fns.org) | 4.1.0 | Utilidades para fechas |

### Componentes UI

| Librería | Propósito |
|---|---|
| [Radix UI Primitives](https://www.radix-ui.com) | Base de componentes accesibles |
| [CVA](https://cva.style/) | Gestión de variantes de componentes |
| [Embla Carousel](https://www.embla-carousel.com/) | Carruseles accesibles |
| [React Day Picker](https://react-day-picker.js.org/) | Selector de fechas |

---

## 🚀 Instalación y Configuración

### Prerrequisitos

- **Node.js**: >= 18.x (recomendado 20.x)
- **npm**: >= 9.x o **pnpm** >= 8.x
- **Git**: Para clonar el repositorio
- **Cuenta de Supabase**: [https://supabase.com](https://supabase.com)

### Instalación

1. **Clonar el repositorio**
   \\\ash
   git clone https://github.com/usuario/workout-app.git
   cd workout-app
   \\\

2. **Instalar dependencias**
   \\\ash
   npm install
   \\\

3. **Configurar variables de entorno**
   \\\ash
   cp .env.example .env.local
   \\\
   Consulta la sección [Variables de Entorno](#-variables-de-entorno).

4. **Iniciar servidor de desarrollo**
   \\\ash
   npm run dev
   \\\
   
   El servidor estará en [http://localhost:3000](http://localhost:3000)

### Build para Producción

\\\ash
npm run build
npm start
\\\

---

## 🔧 Variables de Entorno

Crea un archivo .env.local con:

\\\env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
NEXT_PUBLIC_APP_URL=http://localhost:3000
\\\

Obtén las credenciales en tu [Dashboard de Supabase](https://app.supabase.com) → Settings → API.

---

## 🧩 Componentes Principales

### Autenticación
- AuthForm.tsx - Formulario login/registro
- PasswordResetForm.tsx - Recuperación de contraseña
- UpdatePasswordForm.tsx - Cambio de contraseña
- SessionManager.tsx - Gestor de sesiones

### Dashboard
- DashboardLayout.tsx - Layout principal
- Analytics/ - Gráficos y estadísticas
- Exercises/ - Gestor de ejercicios
- Mesocycles/ - Planificador de fases
- WorkoutLogs/ - Historial de entrenamientos

### UI Base (Radix + Tailwind)
30+ componentes UI reutilizables como Button, Card, Input, Dialog, etc.

---

## 🔐 Sistema de Autenticación

Implementa **4 niveles de protección**:

1. **Middleware** - Protección a nivel de ruta
2. **Auth Provider** - Sincronización de estado global
3. **Client Hooks** - useRequireAuth(), withAuth()
4. **Server Actions** - Validación en servidor

Para más detalles, consulta [AUTH-SYSTEM.md](./AUTH-SYSTEM.md).

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

\\\ash
git commit -m "feat(exercises): agregar página de gestión"
git commit -m "fix(auth): corregir redireccionamiento"
\\\

---

## 🚢 Despliegue

### Vercel (Recomendado)

\\\ash
npm i -g vercel
vercel login
vercel --prod
\\\

**O conecta tu GitHub para CI/CD automático.**

### Otras Plataformas

- **Netlify**: Build: 
pm run build, Publish: .next
- **AWS Amplify**: mplify add hosting && amplify publish
- **Railway/Render**: Deploy automático desde GitHub

### Checklist

- ✅ Verificar variables de entorno
- ✅ 
pm run build sin errores
- ✅ TypeScript sin errores
- ✅ Configurar Supabase en producción
- ✅ Probar autenticación
- ✅ Configurar dominio
- ✅ Habilitar HTTPS

---

## 🤝 Contribución

### Pasos

1. **Fork** el repositorio
2. **Crear rama**: git checkout -b feature/nombre
3. **Hacer cambios** y probar: 
pm run dev
4. **Commit**: git commit -m "feat: descripción"
5. **Push**: git push origin feature/nombre
6. **Pull Request** en GitHub

### Estándares

- ✅ TypeScript: Sin ny, tipos claros
- ✅ React: Componentes funcionales
- ✅ Tailwind: Solo clases, sin !important
- ✅ Accesibilidad: ARIA labels, navegación con teclado
- ✅ Formularios: Validación Zod, mensajes claros

### Reportar Issues

Usa etiquetas: ug, enhancement, documentation, question

---

## 📞 Soporte

### Recursos

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/)
- [Zod](https://zod.dev)

### Community

- [Next.js Discord](https://nextjs.org/discord)
- Stack Overflow: 
extjs, supabase, 	ypescript
- GitHub Discussions

---

## 📄 Licencia

**MIT License** - Copyright (c) 2025 Workout App

Puedes usar, modificar y distribuir este software libremente. Ver LICENSE para más detalles.

---

<div align="center">

**¿Te resultó útil?** ⭐ ¡Dale una estrella en GitHub!

**¿Encontraste un bug?** 🐛 [Abre un issue](https://github.com/usuario/workout-app/issues)

---

> _Documentación generada con ❤️ por GitHub Copilot_  
> _Última actualización: Noviembre 2025 | Versión: 1.0.0_

</div>
