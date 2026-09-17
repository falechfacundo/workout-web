import { NextRequest } from "next/server";
import { getApiUser } from "@/lib/auth";
import { getActiveMesocycles } from "@/lib/actions/mesocycles";
import { getPerformanceMetrics, getVolumeByMuscleGroup } from "@/lib/actions/analytics";
import { successResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/apiResponse";

export async function GET(request: NextRequest) {
  try {
    const apiUser = await getApiUser(request);
    if (!apiUser) return unauthorizedResponse();

    const [metrics, volume, activeMesocycles] = await Promise.all([
      getPerformanceMetrics(apiUser.id),
      getVolumeByMuscleGroup(apiUser.id, "month"),
      getActiveMesocycles(apiUser.id),
    ]);

    return successResponse({
      metrics: metrics.data ?? { totalWorkouts: 0, totalVolume: 0, totalSets: 0, avgDuration: 0 },
      muscleGroupVolume: volume.data ?? [],
      activeMesocycles: activeMesocycles.data ?? [],
    });
  } catch (error) {
    console.error("[MOBILE_DASHBOARD]", error);
    return serverErrorResponse();
  }
}
