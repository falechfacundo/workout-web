import { NextRequest } from "next/server";
import { getApiUser } from "@/lib/auth";
import { getMesocycles } from "@/lib/actions/mesocycles";
import { successResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/apiResponse";

export async function GET(request: NextRequest) {
  try {
    const apiUser = await getApiUser(request);
    if (!apiUser) return unauthorizedResponse();

    const result = await getMesocycles(apiUser.id);
    if (result.error) return serverErrorResponse(result.error);

    return successResponse(result.data ?? []);
  } catch (error) {
    console.error("[MOBILE_MESOCYCLES]", error);
    return serverErrorResponse();
  }
}
