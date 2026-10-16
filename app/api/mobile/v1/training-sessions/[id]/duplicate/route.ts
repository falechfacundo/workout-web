import { NextRequest } from "next/server";
import { getApiUser } from "@/lib/auth";
import { duplicateSession } from "@/lib/mobile/planning";
import { planningErrorResponse } from "@/lib/mobile/route-helpers";
import { createdResponse, unauthorizedResponse, notFoundResponse } from "@/lib/apiResponse";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const apiUser = await getApiUser(request);
    if (!apiUser) return unauthorizedResponse();
    const { id } = await params;

    const copy = await duplicateSession(apiUser.id, id);
    if (!copy) return notFoundResponse("Sesión no encontrada.");
    return createdResponse(copy);
  } catch (error) {
    return planningErrorResponse("[MOBILE_SESSION_DUPLICATE]", error);
  }
}
