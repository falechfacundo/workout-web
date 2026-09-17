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

    const mesocycle = await db.mesocycle.findUnique({
      where: { id, user_id: apiUser.id },
      include: {
        mesocycle_goals: true,
        mesocycle_muscle_group_focus: { include: { muscle_group: true } },
        training_sessions: {
          orderBy: { scheduled_date: "asc" },
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
