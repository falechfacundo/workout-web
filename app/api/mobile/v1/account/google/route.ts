import { NextRequest } from "next/server";
import { z } from "zod";
import { OAuth2Client } from "google-auth-library";
import { db } from "@/lib/db";
import { getApiUser } from "@/lib/auth";
import {
  successResponse,
  unauthorizedResponse,
  errorResponse,
  serverErrorResponse,
} from "@/lib/apiResponse";

const linkBodySchema = z.object({ id_token: z.string().min(1) });
const oauthClient = new OAuth2Client();

export async function GET(request: NextRequest) {
  try {
    const apiUser = await getApiUser(request);
    if (!apiUser) return unauthorizedResponse();

    const user = await db.user.findUnique({
      where: { id: apiUser.id },
      select: { google_id: true, password_hash: true },
    });

    return successResponse({
      linked: !!user?.google_id,
      can_unlink: !!user?.password_hash,
    });
  } catch (error) {
    console.error("[MOBILE_GOOGLE_STATUS]", error);
    return serverErrorResponse();
  }
}

// A diferencia del flujo web (/api/google-link + callback, que depende de una
// cookie de sesión para saber "quién está vinculando" durante el redirect a
// Google), acá el cliente mobile ya hizo el sign-in nativo
// (@react-native-google-signin/google-signin) y nos manda el id_token
// directo — no hace falta ningún round-trip con cookie.
export async function POST(request: NextRequest) {
  try {
    const apiUser = await getApiUser(request);
    if (!apiUser) return unauthorizedResponse();

    const body = linkBodySchema.safeParse(await request.json());
    if (!body.success) {
      return errorResponse("Falta id_token.", 400);
    }

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

    // Mismo chequeo que el callback web (app/api/google-link/callback):
    // solo se puede vincular una cuenta de Google cuyo email coincide con el
    // de la cuenta ya autenticada — si no, cualquiera con un token válido de
    // OTRA cuenta de Google podría vincularla a la sesión de otro usuario.
    if (payload.email.toLowerCase() !== apiUser.email.toLowerCase()) {
      return errorResponse(
        "El email de esa cuenta de Google no coincide con tu cuenta.",
        400
      );
    }

    try {
      await db.user.update({
        where: { id: apiUser.id },
        data: { google_id: payload.sub },
      });
    } catch (error: any) {
      if (error?.code === "P2002") {
        return errorResponse(
          "Esa cuenta de Google ya está vinculada a otro usuario.",
          400
        );
      }
      throw error;
    }

    return successResponse({ linked: true }, "Cuenta de Google vinculada.");
  } catch (error) {
    console.error("[MOBILE_GOOGLE_LINK]", error);
    return serverErrorResponse();
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const apiUser = await getApiUser(request);
    if (!apiUser) return unauthorizedResponse();

    const user = await db.user.findUnique({
      where: { id: apiUser.id },
      select: { password_hash: true },
    });

    if (!user?.password_hash) {
      return errorResponse(
        "Establecé una contraseña antes de desvincular Google, o quedarías sin forma de iniciar sesión.",
        400
      );
    }

    await db.user.update({ where: { id: apiUser.id }, data: { google_id: null } });

    return successResponse({ linked: false }, "Cuenta de Google desvinculada.");
  } catch (error) {
    console.error("[MOBILE_GOOGLE_UNLINK]", error);
    return serverErrorResponse();
  }
}
