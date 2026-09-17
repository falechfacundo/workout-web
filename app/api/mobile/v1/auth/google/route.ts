import { NextRequest } from "next/server";
import { z } from "zod";
import { OAuth2Client } from "google-auth-library";
import { db } from "@/lib/db";
import { signMobileToken } from "@/lib/auth";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/apiResponse";

const bodySchema = z.object({ id_token: z.string().min(1) });

const oauthClient = new OAuth2Client();

export async function POST(request: NextRequest) {
  try {
    const body = bodySchema.safeParse(await request.json());
    if (!body.success) {
      return errorResponse("Falta id_token.", 400);
    }

    // El id_token lo emite Google al hacer GoogleSignin.configure({ webClientId })
    // en mobile: su audience es ese Web Client ID, el mismo que usa NextAuth
    // (GOOGLE_CLIENT_ID) para el login web — no hace falta un client ID nuevo.
    let payload;
    try {
      const ticket = await oauthClient.verifyIdToken({
        idToken: body.data.id_token,
        audience: process.env.GOOGLE_CLIENT_ID as string,
      });
      payload = ticket.getPayload();
    } catch {
      return errorResponse("Token de Google inválido.", 401);
    }

    if (!payload?.email || !payload.email_verified || !payload.sub) {
      return errorResponse("No se pudo verificar el email de Google.", 401);
    }

    const googleId = payload.sub;
    const email = payload.email;
    const existing = await db.user.findUnique({ where: { email } });

    let userId: string;
    let mustChangePassword: boolean;
    let name: string | null;

    if (!existing) {
      const created = await db.user.create({
        data: {
          email,
          name: payload.name ?? null,
          google_id: googleId,
          password_hash: null,
          must_change_password: false,
          profile: payload.name ? { create: { full_name: payload.name } } : undefined,
        },
      });
      userId = created.id;
      mustChangePassword = false;
      name = created.name;
    } else if (existing.google_id === googleId) {
      userId = existing.id;
      mustChangePassword = existing.must_change_password;
      name = existing.name;
    } else {
      // Mismo email pero no vinculado a esta cuenta de Google (ej: se registró
      // con contraseña). No auto-linkear silenciosamente — mismo criterio que
      // el signIn callback de NextAuth (lib/auth.ts). Debe iniciar sesión con
      // contraseña y vincular Google desde el dashboard web (Configuración);
      // vincular desde mobile todavía no está implementado, ver
      // docs/MOBILE-API-CONTRACT.md.
      return errorResponse(
        "Ese email ya tiene una cuenta. Iniciá sesión con tu contraseña y vinculá Google desde el dashboard web (Configuración).",
        400
      );
    }

    const apiUser = { id: userId, email, name, mustChangePassword };
    const token = await signMobileToken(apiUser);

    return successResponse({ token, user: apiUser });
  } catch (error) {
    console.error("[MOBILE_GOOGLE_SIGNIN]", error);
    return serverErrorResponse();
  }
}
