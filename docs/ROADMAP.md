# Roadmap (pendientes)

Otros pendientes: deuda técnica en [`MVP-COMPLETENESS.md`](./MVP-COMPLETENESS.md#deuda-técnica-post-mvp) y pasos manuales de push en [`PUSH-NOTIFICATIONS.md`](./PUSH-NOTIFICATIONS.md).

## Server Components y seguridad de server actions

- [ ] **Urgente:** fase 0 de [`REFACTOR-SERVER-COMPONENTS.md`](./REFACTOR-SERVER-COMPONENTS.md#fase-0-seguridad-hacer-primero-pr-propio). Varias server actions no verifican la sesión (`deleteMesocycleTemplate` borra cualquier plantilla sin login; `createWorkoutLog` y las lecturas por `userId` confían en el cliente).
- [ ] Migrar las páginas cliente del dashboard a Server Components, empezando por las de prioridad 1 del mismo documento.

## Google Sign-In (código listo, falta config + aplicar a producción)

- [ ] Confirmar que el client secret de Google OAuth compartido en el chat con Claude fue **rotado** en Google Cloud Console (quedó expuesto en el historial de esa conversación).
- [ ] En Google Cloud Console → el OAuth client → **Authorized redirect URIs**, agregar:
  - `https://workout-web-tau.vercel.app/api/auth/callback/google`
  - `https://workout-web-tau.vercel.app/api/google-link/callback`
  - (+ las versiones `http://localhost:3000/...` si se prueba local)
- [ ] Cargar `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` en `.env` local y en Vercel (Settings → Environment Variables).
- [ ] Correr `npx prisma db push` para aplicar a producción el cambio de schema (`password_hash` nullable + `google_id` en `User`, tabla `login_attempts` ya aplicada).
- [ ] Probar el flujo completo: login nuevo con Google, login con Google en email ya registrado con password (debe rechazar), vincular/desvincular desde Configuración.

## Coordinación entre agentes

- [ ] Definir cómo coordinar Claude Code y Codebuff trabajando sobre el mismo `main` en paralelo (esta vez no hubo conflictos porque tocaron archivos distintos, pero es un riesgo real a futuro: ramas separadas, o avisar qué archivos toca cada uno antes de empezar).

## Decisión estratégica pendiente

- [ ] Definir prioridad entre completar más roadmap (B) vs. invertir en diferenciación/innovación (C) — ver el documento "GymTrack — Estado real y decisión estratégica" para el detalle y las opciones.
