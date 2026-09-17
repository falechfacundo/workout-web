import { NextRequest } from "next/server";
import { signUp } from "@/lib/actions/auth";
import { signMobileToken } from "@/lib/auth";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/apiResponse";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await signUp(body);

    if (result.error || !result.data) {
      return errorResponse(result.error ?? "No se pudo completar el registro.", 400);
    }

    const apiUser = {
      id: result.data.id,
      email: result.data.email,
      name: null,
      mustChangePassword: false,
    };
    const token = await signMobileToken(apiUser);

    return successResponse({ token, user: apiUser });
  } catch (error) {
    console.error("[MOBILE_REGISTER]", error);
    return serverErrorResponse();
  }
}
