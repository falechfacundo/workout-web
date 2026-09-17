import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getApiUser } from "@/lib/auth";
import {
  successResponse,
  unauthorizedResponse,
  errorResponse,
  serverErrorResponse,
} from "@/lib/apiResponse";

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

// Vincular Google desde mobile no está implementado todavía: el flujo actual
// (/api/google-link + callback) es un redirect OAuth pensado para browser y
// autentica "quién está vinculando" vía cookie de sesión — no hay forma de
// pasarle el bearer token del usuario mobile a través del round-trip con
// Google sin rediseñar ese callback. Ver docs/MOBILE-API-CONTRACT.md.
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
