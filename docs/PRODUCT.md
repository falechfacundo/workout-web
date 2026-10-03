# Inventario de features — GymTrack

Qué hace el producto (web y app móvil), para quién y en qué estado está. Es la fuente para armar one-pagers, la landing, demos y contenido. Relevado contra el código y `MVP-COMPLETENESS.md` el 03/10/2026; si un cambio agrega, saca o activa una feature, se actualiza acá en el mismo commit. El detalle técnico por ruta sigue en `MVP-COMPLETENESS.md`.

**Estados**

| Marca | Significa |
| --- | --- |
| ✅ | Funciona y tiene pantalla |
| 🔌 | Programado pero inactivo: falta una configuración o un servicio externo |
| ⚙️ | Solo backend: la lógica existe, no hay pantalla que la use |
| 📝 | Pendiente, sin código |

One-pager para no técnicos (generada desde este inventario): [GymTrack — tu entrenamiento planificado y medido](https://claude.ai/code/artifact/4c3dd203-91f5-416e-892c-3c208523524e).

## Cuenta

| Feature | Qué le resuelve | Web | Móvil |
| --- | --- | --- | --- |
| Registro e ingreso con email y contraseña | — | ✅ | ✅ |
| Ingreso con Google | Entra sin crear una contraseña | ✅ | ✅ Requiere build propio (no Expo Go) |
| Vincular y desvincular Google | Pasa a usar Google sin perder su cuenta | ✅ | ✅ |
| Cambio de contraseña | — | ✅ | ✅ |
| Recuperar la contraseña por email | No queda afuera si se la olvida | 📝 No hay email | 📝 |
| Límite de intentos de login | Protege la cuenta | ✅ 5 intentos cada 15 min | ✅ |
| Cuenta demo con datos de ejemplo | Ver la app antes de cargar nada | ✅ `demo@example.com` | — |
| Idioma español e inglés | — | ✅ | — |
| Tema claro, oscuro o del sistema | — | ✅ | — |

## Planificación

| Feature | Qué le resuelve | Web | Móvil |
| --- | --- | --- | --- |
| Mesociclos: bloques de varias semanas con objetivos y foco muscular | Entrena con un plan, no a ojo | ✅ Crear, editar, duplicar | ✅ Solo lectura |
| Plantillas de mesociclo e instanciarlas con fecha de inicio | Reutiliza un bloque que funcionó | ✅ | — |
| Sesiones con ejercicios, series y descanso planificados | Sabe qué hacer cada día | ✅ Crear, editar, duplicar | ✅ Solo lectura |
| Plantillas de sesión sueltas | Reutiliza un día de entrenamiento | 📝 Se cubre en parte con plantillas de mesociclo | — |
| Biblioteca de ejercicios por grupo muscular | Arma sesiones con sus ejercicios | ✅ | — |
| Grupos musculares | — | ✅ Los del seed; ⚙️ crear nuevos sin pantalla | — |
| Cumplimiento del mesociclo | Ve qué parte del plan hizo | ✅ | — |
| Planificar desde el celular | — | — | 📝 A propósito: el móvil es "ver el plan + registrar" |

## Entrenamiento

| Feature | Qué le resuelve | Web | Móvil |
| --- | --- | --- | --- |
| Workout Player: serie por serie con peso, repeticiones y RIR, valores del plan como guía | Registra sin papel mientras entrena | ✅ | ✅ |
| Timer de descanso automático | No mira el reloj entre series | ✅ | ✅ |
| Rendimiento de la última vez en cada ejercicio | Sabe qué superar | — | ✅ |
| Registro que no se pierde si se corta la señal | Entrena en sótanos sin señal | — | ✅ Guarda en el teléfono y reintenta |
| Historial de entrenamientos con detalle | Repasa lo que hizo | ✅ | ✅ |
| Cargar un entrenamiento a mano después | Registra lo que no anotó en vivo | ✅ | — |

## Progreso

| Feature | Qué le resuelve | Web | Móvil |
| --- | --- | --- | --- |
| Récords personales (1RM estimado) | Ve si se está haciendo más fuerte | ✅ | — |
| Constancia: mapa de 20 semanas y rachas | Ve si es constante | ✅ | — |
| Frecuencia de entrenamientos | — | ✅ | — |
| Volumen por grupo muscular | Ve si equilibra el trabajo | ✅ | ✅ En el resumen |
| Mediciones del cuerpo con historial | Sigue peso y medidas | ✅ | ✅ |
| Ver el historial sin conexión | — | — | 📝 |

## Recordatorios

| Feature | Qué le resuelve | Web | Móvil |
| --- | --- | --- | --- |
| Calendario con sesiones y recordatorios | Organiza la semana | ✅ | — |
| Notificación push a la hora configurada | Se acuerda de ir | — | 🔌 Funciona con build propio y los secrets del cron cargados; la hora se toma en UTC (en Argentina llega 3 horas antes) |

## Distribución

| Feature | Estado |
| --- | --- |
| Web | ❌ Sin dominio propio; deploy de prueba en Vercel |
| Android | ⚙️ Build de prueba con EAS; no publicado en Google Play (checklist en `app-gymtrack/docs/PLAY-STORE.md`) |
| iOS | 📝 |
| Planes pagos | 📝 No hay billing |
