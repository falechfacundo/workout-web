import { NextRequest } from "next/server";
import { getApiUser } from "@/lib/auth";
import { createSession, sessionInputSchema } from "@/lib/mobile/planning";
import { parseBody, planningErrorResponse } from "@/lib/mobile/route-helpers";
import { createdResponse, unauthorizedResponse, notFoundResponse } from "@/lib/apiResponse";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const apiUser = await getApiUser(request);
    if (!apiUser) return unauthorizedResponse();
    const { id } = await params;

    const body = await parseBody(request, sessionInputSchema);
    if (body.response) return body.response;

    const session = await createSession(apiUser.id, id, body.data);
    if (!session) return notFoundResponse("Mesociclo no encontrado.");
    return createdResponse(session);
  } catch (error) {
    return planningErrorResponse("[MOBILE_SESSION_CREATE]", error);
  }
}
