import { NextRequest } from "next/server";
import { getApiUser } from "@/lib/auth";
import { duplicateMesocycle } from "@/lib/mobile/planning";
import { planningErrorResponse } from "@/lib/mobile/route-helpers";
import { createdResponse, unauthorizedResponse, notFoundResponse } from "@/lib/apiResponse";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const apiUser = await getApiUser(request);
    if (!apiUser) return unauthorizedResponse();
    const { id } = await params;

    const copy = await duplicateMesocycle(apiUser.id, id);
    if (!copy) return notFoundResponse("Mesociclo no encontrado.");
    return createdResponse(copy);
  } catch (error) {
    return planningErrorResponse("[MOBILE_MESOCYCLE_DUPLICATE]", error);
  }
}
