import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getApiUser } from "@/lib/auth";
import { createMesocycle, mesocycleInputSchema } from "@/lib/mobile/planning";
import { parseBody, planningErrorResponse } from "@/lib/mobile/route-helpers";
import { successResponse, createdResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/apiResponse";

export async function GET(request: NextRequest) {
  try {
    const apiUser = await getApiUser(request);
    if (!apiUser) return unauthorizedResponse();

    // Mismo orden que la web; `_count` le permite a la lista mostrar cuántas sesiones tiene cada uno.
    const mesocycles = await db.mesocycle.findMany({
      where: { user_id: apiUser.id },
      orderBy: { start_date: "desc" },
      include: { _count: { select: { training_sessions: true } } },
    });

    return successResponse(mesocycles);
  } catch (error) {
    console.error("[MOBILE_MESOCYCLES]", error);
    return serverErrorResponse();
  }
}

export async function POST(request: NextRequest) {
  try {
    const apiUser = await getApiUser(request);
    if (!apiUser) return unauthorizedResponse();

    const body = await parseBody(request, mesocycleInputSchema);
    if (body.response) return body.response;

    return createdResponse(await createMesocycle(apiUser.id, body.data));
  } catch (error) {
    return planningErrorResponse("[MOBILE_MESOCYCLE_CREATE]", error);
  }
}
