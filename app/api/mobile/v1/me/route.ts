import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getApiUser } from "@/lib/auth";
import { successResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/apiResponse";
import { toPlainJSON } from "@/lib/utils/serialize";

export async function GET(request: NextRequest) {
  try {
    const apiUser = await getApiUser(request);
    if (!apiUser) return unauthorizedResponse();

    const user = await db.user.findUnique({
      where: { id: apiUser.id },
      select: {
        id: true,
        email: true,
        name: true,
        must_change_password: true,
        google_id: true,
        profile: true,
      },
    });

    if (!user) return unauthorizedResponse();

    return successResponse(toPlainJSON(user));
  } catch (error) {
    console.error("[MOBILE_ME]", error);
    return serverErrorResponse();
  }
}
