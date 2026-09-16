# MVP Completeness Checklist — Estado en Producción

Estado: **En producción.** Actualizado al 2026-09-16 tras el deploy en Vercel (Supabase solo como Postgres vía Prisma + NextAuth v4).

Este doc es la fuente de verdad del estado por feature y de la deuda técnica. Para agentes/desarrolladores: leé también [AGENTS.md](../AGENTS.md) (advertencias de producción y verificación obligatoria).

## Estado por feature

| Feature                          | Ruta                                                             | Estado            | Verificado | Notas                                                                                                                                   |
| -------------------------------- | ---------------------------------------------------------------- | ----------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Landing page                     | `/`                                                              | ✅ Listo           | Sí         | Copy alineada; sin secciones de features inexistentes (pricing/Rest Timer removidos).                                                   |
| Login                            | `/auth/login`                                                    | ✅ Listo           | Sí         | Credenciales demo con botones de copia.                                                                                                 |
| Registro                         | `/auth/register`                                                 | ✅ Listo           | Sí         | Crea `user` + `profile` vía acción `signUp` (bcrypt, sin trigger).                                                                      |
| Change password                  | `/change-password`                                               | ✅ Listo           | Sí         | Requiere password actual (API `/api/auth/change-password`). Sin reset por email (post-MVP).                                             |
| Dashboard (resumen)              | `/dashboard`                                                     | ✅ Listo           | Sí         | Métricas + volumen por grupo muscular; shell con skeletons durante carga.                                                               |
| Analytics                        | `/dashboard/analytics`                                           | ⚠️ Orphan         | Sí         | Ruta y widgets funcionales, pero **no está en el nav del sidebar** (`dashboard-layout.tsx`); accesible solo por URL directa. Ver deuda. |
| Calendar                         | `/dashboard/calendar`                                            | ✅ Listo           | Sí         | Calendario + reminders (store + action cableados).                                                                                      |
| Muscle Groups                    | `/dashboard/muscle-groups`                                       | ✅ Listo           | Sí         | Sin botón "Add" (los defaults vienen del seed). Action `createMuscleGroup` lista si se agrega UI.                                       |
| Exercises CRUD                   | `/dashboard/exercises` (+ `new`, `edit/[id]`)                    | ✅ Listo           | Sí         |                                                                                                                                         |
| Mesocycles                       | `/dashboard/mesocycles` (+ `new`, `edit/[id]`, `[id]`)           | ✅ Listo           | Sí         |                                                                                                                                         |
| Mesocycle Templates              | `/dashboard/mesocycles/templates` (+ `new`, `[id]`, `[id]/edit`) | ✅ Listo           | Sí         | Rutas creadas y funcionales.                                                                                                            |
| Session Templates                | —                                                                | ❌ No implementado | No         | Componente/UI eliminado (deuda post-MVP: feature completo).                                                                             |
| Training Sessions (crear/editar) | `mesocycles/[id]/sessions/new`, `[id]/sessions/[sessionId]`      | ✅ Listo           | Sí         | Persisten vía `createTrainingSession`/`updateTrainingSession` (BL-1 resuelto).                                                          |
| Workout Logs                     | `/dashboard/workout-logs` (+ `new`, `[id]`)                      | ✅ Listo           | Sí         | `?template=<sessionId>` preselecciona la sesión en el form (BL-3 resuelto).                                                             |
| Profile & Measurements           | `/dashboard/profile`                                             | ✅ Listo           | Sí         | Envuelto en `DashboardLayout`; forms de perfil + historial de medidas. Las actions de measurements siguen siendo stubs (ver deuda).     |
| Settings                         | `/dashboard/settings`                                            | ✅ Listo           | Sí         | Sign out desde aquí y desde el sidebar.                                                                                                 |
| Sign out                         | `SignOutButton` en layout/settings                               | ✅ Listo           | Sí         |                                                                                                                                         |
| Tema claro/oscuro                | next-themes                                                      | ✅ Listo           | Sí         | `ThemeProvider` en `app/layout.tsx`.                                                                                                    |
| Auth (middleware + sesión)       | `proxy.ts` (NextAuth `withAuth`) + `lib/auth.ts`                 | ✅ Listo           | Sí         | NextAuth v4 (Credentials + bcrypt) + Prisma. Seed demo con `must_change_password = false`.                                              |
| Loaders del dashboard            | skeletons shadcn                                                 | ✅ Listo           | Sí         | Shell de cada página siempre visible; skeletons en zonas de datos (`components/ui/data-skeletons.tsx` + `loading.tsx` por segmento).    |

## Calidad

| Chequeo            | Resultado                                                                     |
| ------------------ | ----------------------------------------------------------------------------- |
| `npx tsc --noEmit` | 0 errores                                                                     |
| `npm run lint`     | 0 errores, ~135 warnings `no-explicit-any` (preexistentes, no agregar nuevos) |
| `npm run build`    | Pasa (16.2.12, Turbopack) — verificado 2026-09-16                             |

## Deuda técnica (post-MVP)

- [ ] **~135 warnings `no-explicit-any`**: tipar contra `lib/schemas/*` (Zod) o los tipos de Prisma. No agregar `any` nuevos.
- [ ] **`lib/utils/rate-limiter.ts` es no-op** (siempre permite): el rate limiting real del login debe ir del lado servidor. La app está expuesta en prod: priorizar.
- [ ] **`lib/actions/measurements.ts` son stubs**: `getMeasurements()` sin args; `add/update/deleteMeasurement()` no-arg. Cablearlas al dominio real o eliminar.
- [ ] **Analytics fuera del nav** del sidebar (`/dashboard/analytics` no está en `components/dashboard/dashboard-layout.tsx`).
- [ ] **Toasts duplicados**: `hooks/use-toast.ts` vs `components/ui/use-toast.ts` — unificar.
- [ ] **Migraciones versionadas**: hoy se usa `prisma db push` contra prod. Considerar `prisma migrate dev`/`deploy` con archivos de migración.
- [ ] **Sin test suite**: agregar al menos smoke tests de auth + CRUD básico.
- [ ] **`npm audit`** post-install.
- [ ] **Reset de password por email** no implementado (solo cambio de password con la actual). Requiere SMTP.
- [ ] **Scoping por `user_id` en queries Prisma**: sin RLS, cada action debe filtrar datos propios. Revisar acciones nuevas.

## Cuenta demo

Creada por `npm run db:seed` (borra y re-crea TODA la DB): `demo@example.com` / `password1234` (`must_change_password = false`, entra directo al dashboard).

## Cómo correr en local

> ⚠️ El `.env` local apunta a la **misma DB de producción**. `npm run db:seed` borra y re-crea todo — no correrlo salvo intención explícit# Design System — GymTrack
> 
> > **Fuente:** 1 imagen (artboard "Direction A — Brand & UI Art Direction") que contiene: brand mark, tagline, specimen tipográfico, 3 swatches de color, y una vista de dashboard (sidebar + 4 cards + un componente de toggle Push/Pull/Leg + un dock de iconos).
> > 
> > **Nota metodológica:** el brief original pedía analizar 4 imágenes en conjunto para detectar patrones *repetidos*. Con una sola imagen no puedo confirmar qué es un patrón sistémico y qué es una decisión puntual de esta pantalla. Por eso el documento marca explícitamente cada afirmación como **[OBSERVADO]**, **[INFERIDO]** o **[PROPUESTO]**, y la sección 11 lo resume todo en una sola tabla de trazabilidad.
> 
> ---
> 
> ## 1. Design Principles
> 
> **[INFERIDO]** a partir de la combinación de tagline, paleta y layout:
> 
> 1. **Precisión sobre decoración.** Cero elementos ornamentales sin función. Cada línea, número o ícono comunica un dato (esto está reforzado literalmente por la tagline "PRECISION • DISCIPLINE • PROGRESS").
> 2. **Oscuridad como lienzo neutro, no como estética.** El fondo casi negro (#0E1116) no es "modo oscuro decorativo": funciona como base de máximo contraste para que un único color de acento (verde) concentre toda la atención.
> 3. **Un solo acento, uso disciplinado.** El verde aparece únicamente en: progreso positivo, estado activo/seleccionado, y foco principal. Nunca se usa para decorar cards, íconos neutros o texto informativo.
> 4. **Densidad media, jerarquía por tamaño y peso, no por color.** Las cards son compactas (mucha data por pantalla: gráfico + número + label + período), pero la jerarquía se logra con escala tipográfica y contraste tonal (blanco/gris/verde), no con más colores.
> 5. **Chrome mínimo, superficies casi planas.** No hay sombras visibles ni bordes marcados; la separación entre superficies se logra con diferencias sutiles de luminosidad, no con líneas duras.
> 6. **Componentes "tácticos" — geometría dura, esquinas suaves.** El logo (rombo/flecha), los iconos de línea fina y los botones pill conviven: formas geométricas simples + radius generoso, sin curvas orgánicas.
> 
> **Nivel de minimalismo:** alto, pero no vacío — es minimalismo funcional/data-denso, no minimalismo tipo landing page. **Densidad de información:** media-alta (4 widgets de datos visibles simultáneamente en una sola vista). **Sensación general:** "tactical performance software" — mezcla de dashboard fitness y herramienta de precisión (más cerca de un panel de control que de una app de bienestar).
> 
> ---
> 
> ## 2. Design Tokens
> 
> ### Colors
> 
> | Token                            | Valor HEX               | Fuente                              | Uso observado                                                                         |
> | -------------------------------- | ----------------------- | ----------------------------------- | ------------------------------------------------------------------------------------- |
> | `color.background`               | `#0E1116` (Charcoal)    | **[OBSERVADO]**                     | Fondo global de la app                                                                |
> | `color.accent` / `color.success` | `#22C55E` (Signal)      | **[OBSERVADO]**                     | Progreso positivo, estado activo (botón LEG), acentos de gráficos                     |
> | `color.neutral.steel`            | `#3A9543`*              | **[OBSERVADO, con inconsistencia]** | —                                                                                     |
> | `color.surface`                  | ~`#151920` aprox.       | **[INFERIDO]**                      | Fondo de cards y sidebar (ligeramente más claro que el background)                    |
> | `color.surface.elevated`         | ~`#1C2128` aprox.       | **[INFERIDO]**                      | Ítem activo de sidebar, header de cards                                               |
> | `color.primary`                  | sin evidencia directa   | **[PROPUESTO]**                     | Ver Open Questions — no hay botón "primary" saturado visible; el verde cumple ese rol |
> | `color.text.primary`             | `#FFFFFF` / casi blanco | **[OBSERVADO]**                     | Títulos, números grandes (ej. "1,240 kg")                                             |
> | `color.text.secondary`           | gris claro ~`#A3A9B0`   | **[INFERIDO]**                      | Labels de cards ("Weekly Volume")                                                     |
> | `color.text.muted`               | gris medio ~`#6B7280`   | **[INFERIDO]**                      | Metadata ("WEEK 47", nav inactivo)                                                    |
> | `color.border` / `color.divider` | gris oscuro translúcido | **[INFERIDO]**                      | Separadores sutiles del calendario semanal                                            |
> | `color.warning`                  | sin evidencia           | **[PROPUESTO]**                     | No aparece en la imagen                                                               |
> | `color.error`                    | sin evidencia           | **[PROPUESTO]**                     | No aparece en la imagen                                                               |
> | `color.info`                     | sin evidencia           | **[PROPUESTO]**                     | No aparece en la imagen                                                               |
> 
> ***Inconsistencia detectada:** el swatch etiquetado "STEEL" se ve gris en la imagen, pero el HEX impreso al lado (`#3A9543`) corresponde a un tono **verde**, no gris. Es probablemente un error de la propia imagen fuente (mismatch entre swatch y label) y no algo que deba propagarse al sistema. **Recomendación:** tratar "Steel" como un gris neutro (`~#8A929B` estimado visualmente) hasta confirmar el HEX real, y no usar `#3A9543` como token porque generaría un segundo verde inconsistente con Signal (`#22C55E`).
> 
> **Regla de aplicación [PROPUESTO]:** el verde es el único color saturado del sistema. No se agregan colores nuevos "para completar la lista" (warning/error/info) porque no hay evidencia visual — se dejan como extensión a definir cuando aparezcan pantallas de formularios/validación.
> 
> ### Typography
> 
> | Token                  | Familia                                                                             | Peso                                     | Tamaño aprox. | Uso                                                                                                                                       |
> | ---------------------- | ----------------------------------------------------------------------------------- | ---------------------------------------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
> | Familia                | Inter / Geist Sans (ambigüedad explícita en la propia imagen: "INTER / GEIST SANS") | —                                        | —             | **[OBSERVADO]** — la imagen no resuelve cuál de las dos es; probablemente Geist Sans para números/brand y Inter como fallback de sistema. |
> | `type.display` (brand) | Geist Sans / Inter                                                                  | Bold/Black                               | ~32–40px      | "GYMTRACK" — **[OBSERVADO]**                                                                                                              |
> | `type.heading`         | idem                                                                                | Semibold                                 | ~18–20px      | Títulos de card ("Weekly Volume") — **[INFERIDO]**                                                                                        |
> | `type.metric`          | idem                                                                                | Bold                                     | ~24–28px      | Números destacados ("1,240 kg", "+8.2%") — **[OBSERVADO]**                                                                                |
> | `type.body`            | idem                                                                                | Regular                                  | ~14px         | Texto de párrafo del specimen — **[OBSERVADO]**                                                                                           |
> | `type.label` (eyebrow) | idem                                                                                | Medium, uppercase, letter-spacing amplio | ~11–12px      | "DIRECTION A", "WEEK 47", nav items — **[OBSERVADO]**                                                                                     |
> | `type.caption`         | idem                                                                                | Regular                                  | ~11px         | Metadata secundaria — **[INFERIDO]**                                                                                                      |
> | `type.button`          | idem                                                                                | Semibold, uppercase                      | ~13–14px      | "PUSH", "PULL", "LEG" — **[OBSERVADO]**                                                                                                   |
> 
> **Line height:** no medible con precisión desde la imagen; **[PROPUESTO]** usar ~1.4 para body y ~1.1–1.2 para métricas grandes (estándar para dashboards data-dense). **Letter spacing:** notablemente amplio en todo texto uppercase/label (tracking alto tipo "tactical/military"). **[OBSERVADO]** patrón consistente en: "DIRECTION A", "BRAND & UI ART DIRECTION", "PRECISION • DISCIPLINE • PROGRESS", nombres de nav, días de la semana (MON/TUE/...).
> 
> ### Spacing
> 
> **[INFERIDO]**, escala geométrica ~1.5x adaptada a lo observado (gaps de card generosos, padding interno compacto):
> 
> ```
> xs   = 4px
> sm   = 8px
> md   = 16px
> lg   = 24px
> xl   = 32px
> 2xl  = 48px
> 3xl  = 64px
> ```
> 
> ### Border Radius
> 
> | Token             | Valor aprox. | Uso observado                                                                                   |
> | ----------------- | ------------ | ----------------------------------------------------------------------------------------------- |
> | `radius.small`    | 6–8px        | Íconos del dock, chips del calendario semanal                                                   |
> | `radius.medium`   | 12–14px      | Cards del dashboard, sidebar                                                                    |
> | `radius.large`    | 16px         | Contenedor del input de búsqueda                                                                |
> | `radius.pill`     | full (999px) | Botones PUSH/PULL/LEG                                                                           |
> | `radius.circular` | 50%          | No se observa directamente (el logo es un rombo, no un círculo) — **[PROPUESTO]** para avatares |
> 
> Todo **[OBSERVADO]** salvo circular, que es **[PROPUESTO]** por analogía.
> 
> ### Borders
> 
> **[OBSERVADO]**: no hay bordes marcados en cards ni sidebar; la separación es por diferencia de luminosidad de superficie. El único borde claramente visible es el contorno del botón "PUSH" (estado inactivo/outline), sugiriendo:
> 
> - **Grosor:** 1px
> - **Estilo:** sólido
> - **Intensidad:** baja (gris tenue), reservado para el estado "outline/inactivo" de botones, no para separar cards.
> 
> ### Shadows / Elevation
> 
> **[OBSERVADO]:** no se detectan sombras (drop shadows) en ningún elemento. La elevación se comunica exclusivamente por **tono de superficie** (surface más clara que background) y, en el caso del sidebar activo, por un bloque de fondo más claro detrás del ítem. **Regla del sistema [PROPUESTO]:** este Design System es "flat con jerarquía tonal" — no introducir box-shadows salvo, eventualmente, para overlays flotantes (modales/tooltips) que aún no están documentados en las imágenes.
> 
> ### Iconography
> 
> **[OBSERVADO]:**
> 
> - Estilo: línea (outline), no filled, no duotone.
> - Grosor: fino y uniforme (~1.5px de trazo aparente).
> - Tamaño: pequeño y consistente, ~18–20px, siempre acompañado de label en el sidebar.
> - En el dock inferior derecho, los iconos van solos (sin label) dentro de contenedores cuadrados pequeños con radius suave.
> - Relación con texto: en sidebar, ícono + label en la misma línea, ícono a la izquierda, mismo tamaño óptico que el texto.
> - Color: monocromático gris/blanco; no se tiñen del verde de acento salvo, presumiblemente, en estado activo (no confirmable 100% en esta imagen, pero el ítem "ANALYTICS" activo se ve con fondo resaltado, no ícono verde).
> 
> ---
> 
> ## 3. Components
> 
> ### Button (pill / segmented)
> 
> **[OBSERVADO]** — visible como grupo de 3 (PUSH / PULL / LEG).
> 
> - **Propósito:** selector de categoría/modo, mutuamente excluyente (parece un segmented control vertical, no 3 botones independientes).
> - **Anatomía:** contenedor full-width, radius pill, texto centrado, uppercase, letter-spacing amplio.
> - **Variantes observadas:**
>   - *Outline/inactivo* — fondo transparente u oscuro, borde gris fino (PUSH).
>   - *Neutral/secundario* — fondo gris sólido (steel), texto oscuro (PULL).
>   - *Activo/acento* — fondo verde sólido, texto oscuro/negro para máximo contraste (LEG).
> - **Tamaños:** solo se observa un tamaño (grande, full-width del contenedor).
> - **Estados:** default (outline), seleccionado (relleno gris o verde). Hover/focus/disabled — **[PROPUESTO]**, no observables.
> - **Cuándo usar:** selección entre pocas opciones (2–4) de igual jerarquía, donde una debe leerse como "la activa".
> - **Cuándo NO usar:** acciones destructivas o CTAs únicos (no hay evidencia de un botón "primary" clásico rectangular).
> 
> ### IconButton (dock)
> 
> **[OBSERVADO]**
> 
> - Propósito: accesos rápidos a acciones (según iconografía: pesa, clipboard, gráfico, lápiz, libro, settings).
> - Anatomía: cuadrado pequeño, radius small, ícono centrado, sin label.
> - Variantes: solo default visible.
> - Cuándo usar: toolbar de acciones secundarias/rápidas fuera del flujo principal.
> 
> ### Search Input
> 
> **[OBSERVADO]** (header superior)
> 
> - Anatomía: contenedor ancho, radius large, ícono de lupa a la derecha, fondo surface, sin borde visible marcado.
> - Cuándo usar: búsqueda global en el header.
> 
> ### Card
> 
> **[OBSERVADO]** — el componente más repetido (4 instancias en la misma pantalla, ya es un patrón real aunque de una sola vista).
> 
> - Anatomía: contenedor surface, radius medium, padding interno (~16–24px), título arriba (label secundario), contenido de datos (chart/lista/heatmap) debajo, metadata pequeña en la esquina inferior.
> - Variantes: card con gráfico de barras, con gráfico de línea, con lista/tabs, con heatmap. Mismo shell, contenido intercambiable → confirma que "Card" es un contenedor genérico de widgets de dashboard.
> - Cuándo usar: agrupar un widget de datos autocontenido.
> - Cuándo NO usar: para agrupar navegación (eso es Sidebar) o para un solo dato aislado sin contexto (usar simplemente texto).
> 
> ### Navigation / Sidebar
> 
> **[OBSERVADO]**
> 
> - Anatomía: columna fija angosta, logo arriba, título de sección ("Dashboard"), lista vertical de ítems ícono+label.
> - Estado activo: fondo de superficie más clara ocupando el ancho completo del ítem (no solo el texto/ícono en otro color).
> - Cuándo usar: navegación principal persistente de la app.
> 
> ### Header (top bar)
> 
> **[OBSERVADO]**
> 
> - Anatomía: logo pequeño a la izquierda, search input centrado/flexible, ícono de settings a la derecha.
> 
> ### Tabs / Weekday strip
> 
> **[OBSERVADO]** (dentro de la card "Mesocycle 04")
> 
> - Anatomía: fila horizontal de 7 ítems (MON–SUN), separados por dividers verticales finos, uno marcado como activo con fondo resaltado.
> - Cuándo usar: selector de día/período dentro de una card, no como navegación global.
> 
> ### Data Visualization (bar chart, line chart, heatmap)
> 
> **[OBSERVADO]**
> 
> - Bar chart: barras grises finas, una barra o segmento final en verde para destacar el punto actual/reciente.
> - Line chart: línea gris que se torna verde al final del período (progreso reciente destacado).
> - Heatmap: grid de celdas cuadradas pequeñas, escala monocromática de intensidad (gris oscuro → verde), patrón tipo "contribution graph".
> - **Regla de color en charts [PROPUESTO]:** usar gris para "histórico/neutro" y verde exclusivamente para el tramo o valor más reciente/positivo — nunca gradientes multicolor.
> 
> ### Componentes sin evidencia (no se documentan en detalle)
> 
> **[NO OBSERVADO — fuera de alcance por ahora]:** Modal, Dropdown, Tooltip, Table, Alert, Toast, Pagination, Empty state, Avatar, Badge, Select formal. No aparecen en la imagen; documentarlos ahora sería inventar, contra tu indicación explícita. Quedan listados en la sección 11 como pendientes de definir cuando haya más pantallas de referencia.
> 
> ---
> 
> ## 4. States
> 
> | Estado          | Evidencia       | Regla                                                                                                    |
> | --------------- | --------------- | -------------------------------------------------------------------------------------------------------- |
> | Default         | **[OBSERVADO]** | Superficie base, texto secundario/gris                                                                   |
> | Active/Selected | **[OBSERVADO]** | Fondo verde sólido (botones) o fondo de superficie elevada (nav/tabs)                                    |
> | Hover           | **[PROPUESTO]** | Aclarar levemente la superficie (+4–6% de luminosidad), sin cambiar de color                             |
> | Focus           | **[PROPUESTO]** | Ring/outline verde de 2px, coherente con el único acento del sistema                                     |
> | Disabled        | **[PROPUESTO]** | Reducir opacidad al ~40%, mantener forma                                                                 |
> | Loading         | **[PROPUESTO]** | Skeleton en tono surface, sin shimmer llamativo (coherente con la sobriedad general)                     |
> | Error           | **[PROPUESTO]** | Requiere definir un rojo — no inventarlo sin más referencia; por ahora, marcar como gap                  |
> | Warning         | **[PROPUESTO]** | Idem, requiere definición futura                                                                         |
> | Success         | **[OBSERVADO]** | Es literalmente el color de acento (verde) — no es un color aparte, es el mismo signal                   |
> | Empty           | **[PROPUESTO]** | No observado; se propone mantener minimalismo: ícono line-art + texto muted, sin ilustraciones coloridas |
> 
> ---
> 
> ## 5. Layout
> 
> **[OBSERVADO]/[INFERIDO]** a partir del único artboard:
> 
> - Estructura de 3 columnas: **sidebar fija** (angosta, ~200px estimado) + **contenido principal** (grid 2×2 de cards, flexible) + **rail derecho** (el bloque Push/Pull/Leg parece más un "component showcase" aislado del layout real que parte literal del dashboard — tratarlo como módulo standalone, no como parte fija del grid).
> - Grid principal: 2 columnas × 2 filas de cards, gap generoso (~24px estimado).
> - Alineación: todo alineado a una grilla estricta, sin elementos flotantes o superpuestos.
> - Max-width: no determinable (el dashboard parece ocupar el viewport completo, sin contenedor centrado).
> 
> ---
> 
> ## 6. Responsive Rules
> 
> **[PROPUESTO en su totalidad]** — no hay evidencia de ninguna otra resolución en la imagen. Se propone coherente con el lenguaje observado:
> 
> - **Mobile:** sidebar colapsa a bottom-nav o drawer; grid de cards pasa a 1 columna; spacing se reduce un escalón (`lg`→`md`); el grupo Push/Pull/Leg pasa de vertical a horizontal full-width.
> - **Tablet:** grid de cards 2 columnas se mantiene si el ancho lo permite, sidebar puede colapsar a modo icon-only (sin labels).
> - **Desktop:** layout observado tal cual (sidebar expandida + grid 2×2).
> - **Wide desktop:** el grid podría pasar a 3–4 columnas de cards en lugar de estirar las existentes, para no perder la densidad compacta característica.
> 
> ---
> 
> ## 7. UI Patterns
> 
> **[OBSERVADO]:** el único patrón confirmable con certeza es **Dashboard de métricas** — combinación de cards de datos heterogéneos (chart, número, heatmap, selector de período) en una grilla, con navegación lateral persistente y un selector de categoría (Push/Pull/Leg) que probablemente filtra el contenido del dashboard.
> 
> **[PROPUESTO]** para patrones no observados pero previsibles en una app de este dominio (CRUD de ejercicios, formularios de sesión, calendario completo): deberían construirse reusando Card como contenedor, Button pill para acciones binarias/selección, y mantener la regla de "un solo acento verde" para el estado activo/éxito en cualquier flujo nuevo.
> 
> ---
> 
> ## 8. Consistency Rules
> 
> **[PROPUESTO, derivado de los principios observados]**
> 
> 1. **Verde = únicamente** progreso positivo, selección activa o éxito. Nunca decorativo.
> 2. **Nunca dos verdes distintos.** Un solo valor de acento (`#22C55E`) en todo el sistema — de ahí la recomendación de descartar el hex verde mal etiquetado como "Steel".
> 3. **Sombra = nunca**, salvo overlays flotantes futuros (modal/tooltip) que se evalúen aparte.
> 4. **Borde = solo para estado outline/inactivo de botones**, no para separar cards o secciones (eso lo hace el tono de superficie).
> 5. **Uppercase + letter-spacing amplio = reservado para labels/eyebrow/nav/botones**, nunca para body text o headings largos (perdería legibilidad).
> 6. **Radius grande y pill se reservan para elementos interactivos** (botones); las cards usan radius medium, más contenido.
> 7. **Texto secundario/muted siempre en gris, nunca en el color de acento** — el acento es exclusivo de datos/estado, no de jerarquía tipográfica.
> 8. **Iconos siempre line-style y monocromáticos** — no mezclar con iconos filled o a color en el mismo producto.
> 
> ---
> 
> ## 9. Web Implementation Notes
> 
> **[PROPUESTO]**
> 
> - Tokens → variables CSS / Tailwind theme extend (`colors.background`, `colors.surface`, etc.).
> - Tipografía → `font-family: 'Geist Sans', 'Inter', sans-serif` con fallback explícito dado que la imagen no resuelve la ambigüedad.
> - Cards → `rounded-[radius.medium] bg-surface p-4 md:p-6`.
> - Botones pill → `rounded-full` + variantes de fondo vía props (`variant="outline" | "neutral" | "accent"`).
> - Charts → librería agnóstica (Recharts/D3), pero la *regla de color* (gris histórico + verde para el tramo reciente) debe aplicarse en la capa de configuración de color de la librería, no hardcodeada por gráfico.
> 
> ## 10. React Native Implementation Notes
> 
> **[PROPUESTO]**
> 
> - Tokens → objeto JS plano (`theme.colors.background`, etc.) consumido por `StyleSheet.create`, mismo naming que en web para portabilidad conceptual.
> - Radius y spacing → mismos valores numéricos (no hay unidades relativas tipo `rem` que no traduzcan 1:1 a RN).
> - Sombra → en RN no aplica (`elevation`/`shadow*` deben quedar en 0 por defecto, coherente con "shadows = nunca" del sistema web).
> - Segmented control (Push/Pull/Leg) → conviene modelarlo como un solo componente `SegmentedControl` con array de opciones, no 3 botones sueltos, para que la lógica de estado activo sea compartida entre plataformas.
> 
> ---
> 
> ## 11. Open Questions / Inferences — Tabla de trazabilidad
> 
> | Ítem                                                                                               | Estado                                                                          |
> | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
> | Charcoal `#0E1116`, Signal `#22C55E`                                                               | **Observado** directamente (hex impreso en imagen)                              |
> | Hex "Steel" `#3A9543`                                                                              | **Observado pero inconsistente** con el swatch gris mostrado — no usar tal cual |
> | Familia tipográfica exacta (Inter vs. Geist Sans)                                                  | **Observado como ambigüedad de la propia fuente** — no resuelto                 |
> | Colores surface / surface elevated                                                                 | **Inferido** por contraste tonal, sin hex exacto                                |
> | Texto secundario/muted, bordes/dividers                                                            | **Inferido** visualmente, sin valores exactos                                   |
> | Spacing scale, line-heights exactos                                                                | **Inferido/estimado** — no medible con precisión desde una imagen               |
> | Estados hover/focus/disabled/loading/error/warning/empty                                           | **Propuestos** — cero evidencia visual, coherentes con el lenguaje observado    |
> | Responsive (mobile/tablet/wide)                                                                    | **100% propuesto** — no hay otra resolución en la imagen                        |
> | Componentes: Input, Card, Sidebar, Header, Tabs, Botón pill, IconButton, Charts                    | **Observados** con al menos una instancia real                                  |
> | Componentes: Modal, Dropdown, Tooltip, Table, Alert, Toast, Pagination, Avatar, Badge, Empty state | **No observados** — deliberadamente no documentados en detalle                  |
> | Patrón "Dashboard"                                                                                 | **Observado**                                                                   |
> | Patrones CRUD, formularios, filtros, confirmaciones                                                | **No observados** — no hay evidencia en esta imagen                             |
> 
> **Recomendación final:** este documento es una base confiable para *tokens de color, tipografía, radius y el componente Card/Sidebar/Button pill*, pero **no es suficiente** para cerrar estados de interacción, responsive real ni componentes de overlay/formulario. Si consigues las otras 3 imágenes mencionadas originalmente (o cualquier pantalla adicional de login, formulario, lista o modal), el sistema pasaría de ~40% observado / 60% propuesto a un nivel de fidelidad mucho más alto, que es justamente tu prioridad #1.a.

1. `npm install`
2. Completar `.env` según `.env.example` (`DATABASE_URL` pooler 6543, `DIRECT_URL` 5432, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`)
3. `npm run dev`

## Histórico

- Docs de lanzamiento (2026-09-14) archivados en `docs/archive/`: `LAUNCH-CHECKLIST-2026-09-14.md`, `MVP-COMPLETENESS-2026-09-14.md`.
- `SCHEMA-ACTIONS-GAPS-TODO.md` (gaps schema vs actions, todos resueltos) → `docs/archive/SCHEMA-ACTIONS-GAPS-TODO.md`.