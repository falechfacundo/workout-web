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
import { deleteMesocycle, mesocyclePatchSchema, updateMesocycle } from "@/lib/mobile/planning";
import { parseBody, planningErrorResponse } from "@/lib/mobile/route-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const apiUser = await getApiUser(request);
    if (!apiUser) return unauthorizedResponse();

    const { id } = await params;

    const mesocycle = await db.mesocycle.findUnique({
      where: { id, user_id: apiUser.id },
      include: {
        mesocycle_goals: true,
        mesocycle_muscle_group_focus: { include: { muscle_group: true } },
        training_sessions: {
          // Las sesiones sin fecha (sin día de la semana) van al final, en orden de creación.
          orderBy: [{ scheduled_date: { sort: "asc", nulls: "last" } }, { created_at: "asc" }],
          include: {
            session_exercises: {
              orderBy: { order_index: "asc" },
              include: { exercise: true },
            },
          },
        },
      },
    });

    if (!mesocycle) return notFoundResponse("Mesociclo no encontrado.");

    return successResponse(
      toPlainJSON({
        ...mesocycle,
        goals: mesocycle.mesocycle_goals,
        focus_muscle_groups: mesocycle.mesocycle_muscle_group_focus.map(
          (item) => item.muscle_group_id
        ),
      })
    );
  } catch (error) {
    console.error("[MOBILE_MESOCYCLE_DETAIL]", error);
    return serverErrorResponse();
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const apiUser = await getApiUser(request);
    if (!apiUser) return unauthorizedResponse();
    const { id } = await params;

    const body = await parseBody(request, mesocyclePatchSchema);
    if (body.response) return body.response;

    const updated = await updateMesocycle(apiUser.id, id, body.data);
    if (!updated) return notFoundResponse("Mesociclo no encontrado.");
    return successResponse(updated);
  } catch (error) {
    return planningErrorResponse("[MOBILE_MESOCYCLE_UPDATE]", error);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const apiUser = await getApiUser(request);
    if (!apiUser) return unauthorizedResponse();
    const { id } = await params;

    if (!(await deleteMesocycle(apiUser.id, id))) return notFoundResponse("Mesociclo no encontrado.");
    return successResponse(null, "Mesociclo eliminado.");
  } catch (error) {
    return planningErrorResponse("[MOBILE_MESOCYCLE_DELETE]", error);
  }
}
