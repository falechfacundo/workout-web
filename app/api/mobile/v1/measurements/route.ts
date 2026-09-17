import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getApiUser } from "@/lib/auth";
import { measurementInputSchema } from "@/lib/schemas/measurement";
import {
  successResponse,
  createdResponse,
  unauthorizedResponse,
  errorResponse,
  serverErrorResponse,
} from "@/lib/apiResponse";
import { toPlainJSON } from "@/lib/utils/serialize";

export async function GET(request: NextRequest) {
  try {
    const apiUser = await getApiUser(request);
    if (!apiUser) return unauthorizedResponse();

    // Orden por fecha de la medición (no por created_at): editar un registro
    // viejo no debería "saltarlo" al tope del historial.
    const measurements = await db.profileMeasurement.findMany({
      where: { user_id: apiUser.id },
      orderBy: { date: "desc" },
    });

    return successResponse(toPlainJSON(measurements));
  } catch (error) {
    console.error("[MOBILE_MEASUREMENTS_LIST]", error);
    return serverErrorResponse();
  }
}

export async function POST(request: NextRequest) {
  try {
    const apiUser = await getApiUser(request);
    if (!apiUser) return unauthorizedResponse();

    const parsed = measurementInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message ?? "Datos inválidos.", 400);
    }

    const { date, ...rest } = parsed.data;

    const measurement = await db.profileMeasurement.create({
      data: { ...rest, date: new Date(date), user_id: apiUser.id },
    });

    return createdResponse(toPlainJSON(measurement));
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      (error as { code?: string }).code === "P2002"
    ) {
      return errorResponse(
        "Ya existe una medición para esa fecha. Editá esa entrada en vez de crear una nueva.",
        400
      );
    }
    console.error("[MOBILE_MEASUREMENTS_CREATE]", error);
    return serverErrorResponse();
  }
}
