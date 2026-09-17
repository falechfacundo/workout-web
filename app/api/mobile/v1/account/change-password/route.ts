import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { getApiUser } from "@/lib/auth";
import {
  successResponse,
  unauthorizedResponse,
  errorResponse,
  serverErrorResponse,
} from "@/lib/apiResponse";

// Mismas reglas que /api/auth/change-password (cookie-only, usado por el
// dashboard web) — endpoint aparte en vez de tocar ese, que además maneja
// el flujo forzado de must_change_password del middleware web.
export async function POST(request: NextRequest) {
  try {
    const apiUser = await getApiUser(request);
    if (!apiUser) return unauthorizedResponse();

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return errorResponse("Faltan campos requeridos.", 400);
    }
    if (newPassword.length < 8) {
      return errorResponse("La nueva contraseña debe tener al menos 8 caracteres.", 400);
    }

    const user = await db.user.findUnique({ where: { id: apiUser.id } });
    if (!user) return unauthorizedResponse();

    if (!user.password_hash) {
      return errorResponse(
        "Esta cuenta inició sesión con Google y no tiene contraseña todavía.",
        400
      );
    }

    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValid) {
      return errorResponse("La contraseña actual es incorrecta.", 400);
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await db.user.update({
      where: { id: user.id },
      data: { password_hash: hashed, must_change_password: false },
    });

    return successResponse(null, "Contraseña actualizada correctamente.");
  } catch (error) {
    console.error("[MOBILE_CHANGE_PASSWORD]", error);
    return serverErrorResponse();
  }
}
