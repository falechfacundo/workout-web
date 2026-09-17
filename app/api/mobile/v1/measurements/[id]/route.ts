import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getApiUser } from "@/lib/auth";
import { measurementInputSchema } from "@/lib/schemas/measurement";
import {
  successResponse,
  unauthorizedResponse,
  notFoundResponse,
  errorResponse,
  serverErrorResponse,
} from "@/lib/apiResponse";
import { toPlainJSON } from "@/lib/utils/serialize";

const measurementPatchSchema = measurementInputSchema.partial();

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const apiUser = await getApiUser(request);
    if (!apiUser) return unauthorizedResponse();
    const { id } = await params;

    const parsed = measurementPatchSchema.safeParse(await request.json());
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message ?? "Datos inválidos.", 400);
    }
    const { date, ...rest } = parsed.data;

    const { count } = await db.profileMeasurement.updateMany({
      where: { id, user_id: apiUser.id },
      data: { ...rest, ...(date ? { date: new Date(date) } : {}) },
    });

    if (count === 0) return notFoundResponse("Medición no encontrada.");

    const updated = await db.profileMeasurement.findFirst({
      where: { id, user_id: apiUser.id },
    });

    return successResponse(toPlainJSON(updated));
  } catch (error) {
    console.error("[MOBILE_MEASUREMENT_UPDATE]", error);
    return serverErrorResponse();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const apiUser = await getApiUser(request);
    if (!apiUser) return unauthorizedResponse();
    const { id } = await params;

    const { count } = await db.profileMeasurement.deleteMany({
      where: { id, user_id: apiUser.id },
    });

    if (count === 0) return notFoundResponse("Medición no encontrada.");

    return successResponse(null, "Medición eliminada.");
  } catch (error) {
    console.error("[MOBILE_MEASUREMENT_DELETE]", error);
    return serverErrorResponse();
  }
}
