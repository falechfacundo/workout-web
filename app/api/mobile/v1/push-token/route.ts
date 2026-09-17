import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getApiUser } from "@/lib/auth";
import { successResponse, unauthorizedResponse, errorResponse, serverErrorResponse } from "@/lib/apiResponse";

const registerSchema = z.object({
  token: z.string().min(1),
  platform: z.enum(["ios", "android"]),
});

const unregisterSchema = z.object({ token: z.string().min(1) });

// Un mismo token de Expo puede haber quedado registrado a nombre de otro
// usuario (reinstalación del device, o logout + login con otra cuenta) — por
// eso es upsert por `token` (que es @unique), no un create liso.
export async function POST(request: NextRequest) {
  try {
    const apiUser = await getApiUser(request);
    if (!apiUser) return unauthorizedResponse();

    const body = registerSchema.safeParse(await request.json());
    if (!body.success) {
      return errorResponse("Faltan token/platform.", 400);
    }

    await db.pushToken.upsert({
      where: { token: body.data.token },
      create: { token: body.data.token, platform: body.data.platform, user_id: apiUser.id },
      update: { platform: body.data.platform, user_id: apiUser.id },
    });

    return successResponse({ registered: true });
  } catch (error) {
    console.error("[MOBILE_PUSH_TOKEN_REGISTER]", error);
    return serverErrorResponse();
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const apiUser = await getApiUser(request);
    if (!apiUser) return unauthorizedResponse();

    const body = unregisterSchema.safeParse(await request.json());
    if (!body.success) {
      return errorResponse("Falta token.", 400);
    }

    // Scopeado por user_id además de token: no borrar el registro de otro
    // usuario aunque alguien mande un token ajeno.
    await db.pushToken.deleteMany({
      where: { token: body.data.token, user_id: apiUser.id },
    });

    return successResponse({ registered: false });
  } catch (error) {
    console.error("[MOBILE_PUSH_TOKEN_UNREGISTER]", error);
    return serverErrorResponse();
  }
}
