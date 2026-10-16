import { NextRequest } from "next/server";
import { getApiUser } from "@/lib/auth";
import { instantiateInputSchema, instantiateTemplate } from "@/lib/mobile/templates";
import { parseBody, planningErrorResponse } from "@/lib/mobile/route-helpers";
import { createdResponse, unauthorizedResponse, notFoundResponse } from "@/lib/apiResponse";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const apiUser = await getApiUser(request);
    if (!apiUser) return unauthorizedResponse();
    const { id } = await params;

    const body = await parseBody(request, instantiateInputSchema);
    if (body.response) return body.response;

    const mesocycle = await instantiateTemplate(apiUser.id, id, body.data);
    if (!mesocycle) return notFoundResponse("Plantilla no encontrada.");
    return createdResponse(mesocycle);
  } catch (error) {
    return planningErrorResponse("[MOBILE_TEMPLATE_INSTANTIATE]", error);
  }
}
