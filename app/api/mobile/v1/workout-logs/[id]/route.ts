import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getApiUser } from "@/lib/auth";
import {
  successResponse,
  unauthorizedResponse,
  notFoundResponse,
  serverErrorResponse,
} from "@/lib/apiResponse";
import { toPlainJSON } from "@/lib/utils/serialize";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const apiUser = await getApiUser(request);
    if (!apiUser) return unauthorizedResponse();

    const { id } = await params;

    const log = await db.workoutLog.findFirst({
      where: { id, user_id: apiUser.id },
      include: {
        exercise_logs: { include: { exercise: true } },
        training_session: { select: { name: true } },
        mesocycle: { select: { name: true } },
      },
    });

    if (!log) return notFoundResponse("Entrenamiento no encontrado.");

    return successResponse(toPlainJSON(log));
  } catch (error) {
    console.error("[MOBILE_WORKOUT_LOG_DETAIL]", error);
    return serverErrorResponse();
  }
}
