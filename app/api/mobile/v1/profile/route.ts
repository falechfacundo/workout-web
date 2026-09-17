import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getApiUser } from "@/lib/auth";
import { profileFormSchema } from "@/lib/schemas/profile";
import {
  successResponse,
  unauthorizedResponse,
  errorResponse,
  serverErrorResponse,
} from "@/lib/apiResponse";
import { toPlainJSON } from "@/lib/utils/serialize";

// profileFormSchema.partial() haría opcional preferred_unit pero conserva su
// z.default("kg") interno — un PATCH que no lo manda pisaría el valor real
// del usuario con "kg". Se reconstruye sin ese default para que omitido
// signifique "no tocar", no "usar el default".
const profilePatchSchema = profileFormSchema
  .omit({ preferred_unit: true })
  .partial()
  .extend({ preferred_unit: z.enum(["kg", "lb"]).optional() });

export async function PATCH(request: NextRequest) {
  try {
    const apiUser = await getApiUser(request);
    if (!apiUser) return unauthorizedResponse();

    const body = await request.json();
    if (body && typeof body.birth_date === "string") {
      body.birth_date = new Date(body.birth_date);
    }

    const parsed = profilePatchSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message ?? "Datos inválidos.", 400);
    }

    const profile = await db.profile.update({
      where: { user_id: apiUser.id },
      data: parsed.data,
    });

    return successResponse(toPlainJSON(profile));
  } catch (error) {
    console.error("[MOBILE_PROFILE_UPDATE]", error);
    return serverErrorResponse();
  }
}
