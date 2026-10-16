import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getApiUser } from "@/lib/auth";
import { successResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/apiResponse";

export async function GET(request: NextRequest) {
  try {
    const apiUser = await getApiUser(request);
    if (!apiUser) return unauthorizedResponse();

    const groups = await db.muscleGroup.findMany({
      where: { OR: [{ is_default: true }, { user_id: apiUser.id }] },
      select: { id: true, name: true, is_default: true },
      orderBy: { name: "asc" },
    });
    return successResponse(groups.map((g) => ({ id: g.id, name: g.name, is_custom: !g.is_default })));
  } catch (error) {
    console.error("[MOBILE_MUSCLE_GROUPS]", error);
    return serverErrorResponse();
  }
}
