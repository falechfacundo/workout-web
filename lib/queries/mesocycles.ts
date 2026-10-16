import "server-only";

import { db } from "@/lib/db";
import { safeAction } from "@/lib/utils/safe-action";
import { createLogger } from "@/lib/utils/logger";
import type { Mesocycle } from "@/lib/schemas/mesocycle";

const logger = createLogger("mesocycles-queries");

export async function getMesocycles(userId: string) {
  return safeAction(async () => {
    logger.debug("Obteniendo mesociclos para usuario", { userId });
    const startTime = performance.now();

    try {
      const data = await db.mesocycle.findMany({
        where: { user_id: userId },
        orderBy: { start_date: "desc" },
      });

      const duration = Math.round(performance.now() - startTime);
      logger.info("Mesociclos obtenidos exitosamente", {
        userId,
        count: data.length,
        duration,
      });

      return {
        data: data as unknown as Mesocycle[],
        error: null,
      };
    } catch (error) {
      logger.error(
        "Error al obtener mesociclos",
        error instanceof Error ? error : new Error(String(error)),
        { userId }
      );

      return {
        data: null,
        error: `Error fetching mesocycles: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  });
}

export async function getActiveMesocycles(userId: string) {
  return safeAction(async () => {
    logger.debug("Obteniendo mesociclos activos para usuario", { userId });
    const startTime = performance.now();

    try {
      const data = await db.mesocycle.findMany({
        where: { user_id: userId, status: "in_progress" },
        orderBy: { start_date: "asc" },
      });

      const duration = Math.round(performance.now() - startTime);
      logger.info("Mesociclos activos obtenidos exitosamente", {
        userId,
        count: data.length,
        duration,
      });

      return {
        data: data as unknown as Mesocycle[],
        error: null,
      };
    } catch (error) {
      logger.error(
        "Error al obtener mesociclos activos",
        error instanceof Error ? error : new Error(String(error)),
        { userId }
      );

      return {
        data: null,
        error: `Error fetching active mesocycles: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  });
}
