# Documentación

| Documento | Para qué |
| --- | --- |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Mapa general: web + móvil sobre un backend, auth, modelo de datos, flujos (planificar, entrenar, analizar, recordar), decisiones. Empezar por acá. |
| [`PRODUCT.md`](./PRODUCT.md) | Inventario de features de la web y la app móvil con su estado. Fuente para one-pagers, landing y contenido. |
| [`AUTH.md`](./AUTH.md) | Sistema de auth: proxy, SessionProvider, hooks, server actions con `safeAction`, Google Sign-In, rate limiting. (En inglés.) |
| [`DESIGN-SYSTEM.md`](./DESIGN-SYSTEM.md) | Principios, tokens de color y tipografía, componentes. Lo usan también `../gymtrack-videos` y la landing. |
| [`MOBILE-API-CONTRACT.md`](./MOBILE-API-CONTRACT.md) | Contrato de `/api/mobile/v1` con la app móvil. Cambios de forma = breaking. |
| [`PUSH-NOTIFICATIONS.md`](./PUSH-NOTIFICATIONS.md) | Recordatorios push: qué se construyó, decisiones y pasos manuales (secrets). |
| [`DEPLOYMENT.md`](./DEPLOYMENT.md) | Runbook de deploy en Vercel + Supabase (para cuando haya dominio). |
| [`MVP-COMPLETENESS.md`](./MVP-COMPLETENESS.md) | Estado por feature, calidad y deuda técnica. |
| [`ROADMAP.md`](./ROADMAP.md) | Pendientes (Google Sign-In, coordinación, decisión estratégica). |
| [`archive/`](./archive/) | Checklists de lanzamiento del 14/09/2026 y gaps de schema viejos. Contexto histórico. |
| [`../lib/docs/`](../lib/docs/README.md) | Sistema de logging y estructura de `lib/`. |

## Convenciones

- Idioma: español. Nombres de archivo en `MAYÚSCULAS-CON-GUIONES.md`.
- `ROADMAP.md` lista lo pendiente; cuando un ítem se resuelve, se borra en el mismo commit.
- Un documento con fecha en el nombre es una foto de ese momento: va a `archive/`.
