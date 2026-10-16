import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getApiUser } from "@/lib/auth";
import {
  successResponse,
  createdResponse,
  unauthorizedResponse,
  errorResponse,
  serverErrorResponse,
} from "@/lib/apiResponse";

// Forma compacta para el selector de ejercicios de la app: el catálogo entero viaja de una (son
// decenas, no miles) y la búsqueda se hace en el teléfono, también sin red.
const exerciseSelect = {
  id: true,
  name: true,
  equipment_needed: true,
  is_default: true,
  exercise_muscle_groups: {
    select: { is_primary: true, muscle_group: { select: { id: true, name: true } } },
    orderBy: { incidence_level: "desc" as const },
  },
};

type Row = {
  id: string;
  name: string;
  equipment_needed: string | null;
  is_default: boolean;
  exercise_muscle_groups: Array<{ is_primary: boolean; muscle_group: { id: string; name: string } }>;
};

function toApi(e: Row) {
  const primary = e.exercise_muscle_groups.find((m) => m.is_primary)?.muscle_group ?? null;
  return {
    id: e.id,
    name: e.name,
    equipment: e.equipment_needed,
    is_custom: !e.is_default,
    primary_muscle_group: primary,
    secondary_muscle_groups: e.exercise_muscle_groups.filter((m) => !m.is_primary).map((m) => m.muscle_group),
  };
}

export async function GET(request: NextRequest) {
  try {
    const apiUser = await getApiUser(request);
    if (!apiUser) return unauthorizedResponse();

    const exercises = await db.exercise.findMany({
      where: { OR: [{ is_default: true }, { user_id: apiUser.id }] },
      select: exerciseSelect,
      orderBy: { name: "asc" },
    });
    return successResponse(exercises.map(toApi));
  } catch (error) {
    console.error("[MOBILE_EXERCISES]", error);
    return serverErrorResponse();
  }
}

const createSchema = z.object({
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres.").max(100),
  equipment: z.string().trim().max(100).nullable().optional(),
  primary_muscle_group_id: z.string().uuid("Elegí el grupo muscular principal."),
  secondary_muscle_group_ids: z.array(z.string().uuid()).max(10).default([]),
});

export async function POST(request: NextRequest) {
  try {
    const apiUser = await getApiUser(request);
    if (!apiUser) return unauthorizedResponse();

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") return errorResponse("Datos inválidos.", 400);
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message ?? "Datos inválidos.", 400);
    }
    const { name, equipment, primary_muscle_group_id } = parsed.data;
    const secondary = [...new Set(parsed.data.secondary_muscle_group_ids)].filter((id) => id !== primary_muscle_group_id);

    // Solo grupos del catálogo o propios: sin esto se podría colgar un ejercicio de un grupo ajeno.
    const ids = [primary_muscle_group_id, ...secondary];
    const allowed = await db.muscleGroup.count({
      where: { id: { in: ids }, OR: [{ is_default: true }, { user_id: apiUser.id }] },
    });
    if (allowed !== ids.length) return errorResponse("Grupo muscular inválido.", 400);

    const duplicate = await db.exercise.findFirst({
      where: { name: { equals: name, mode: "insensitive" }, OR: [{ is_default: true }, { user_id: apiUser.id }] },
      select: { id: true },
    });
    if (duplicate) return errorResponse("Ya existe un ejercicio con ese nombre.", 409);

    const exercise = await db.exercise.create({
      data: {
        name,
        equipment_needed: equipment || null,
        primary_muscle_group_id,
        user_id: apiUser.id,
        is_default: false,
        exercise_muscle_groups: {
          create: [
            { muscle_group_id: primary_muscle_group_id, is_primary: true, incidence_level: 10 },
            ...secondary.map((id) => ({ muscle_group_id: id, is_primary: false, incidence_level: 5 })),
          ],
        },
      },
      select: exerciseSelect,
    });
    return createdResponse(toApi(exercise));
  } catch (error) {
    console.error("[MOBILE_EXERCISE_CREATE]", error);
    return serverErrorResponse();
  }
}
