import { NextRequest } from "next/server";
import { getApiUser } from "@/lib/auth";
import { listTemplates } from "@/lib/mobile/templates";
import { successResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/apiResponse";

export async function GET(request: NextRequest) {
  try {
    const apiUser = await getApiUser(request);
    if (!apiUser) return unauthorizedResponse();
    return successResponse(await listTemplates(apiUser.id));
  } catch (error) {
    console.error("[MOBILE_TEMPLATES]", error);
    return serverErrorResponse();
  }
}
