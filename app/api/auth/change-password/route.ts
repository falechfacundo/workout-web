import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import {
  successResponse,
  unauthorizedResponse,
  errorResponse,
  serverErrorResponse,
} from "@/lib/apiResponse";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return unauthorizedResponse();

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return errorResponse("Faltan campos requeridos.", 400);
    }

    if (newPassword.length < 8) {
      return errorResponse(
        "La nueva contraseña debe tener al menos 8 caracteres.",
        400
      );
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
    });
    if (!user) return unauthorizedResponse();

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
    console.error("[CHANGE_PASSWORD]", error);
    return serverErrorResponse();
  }
}