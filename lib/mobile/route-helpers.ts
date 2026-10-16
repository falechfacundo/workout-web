import { NextRequest } from "next/server";
import type { z } from "zod";
import { errorResponse, serverErrorResponse } from "@/lib/apiResponse";
import { PlanningError } from "@/lib/mobile/planning";

/** Parsea y valida el body JSON. Devuelve los datos o la respuesta 400 lista para devolver. */
export async function parseBody<S extends z.ZodTypeAny>(
  request: NextRequest,
  schema: S
): Promise<{ data: z.infer<S>; response?: never } | { data?: never; response: Response }> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return { response: errorResponse("El cuerpo de la solicitud no es JSON válido.", 400) };
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return { response: errorResponse(parsed.error.issues[0]?.message ?? "Datos inválidos.", 400) };
  }
  return { data: parsed.data };
}

/** Errores de validación de negocio → 400; el resto se loguea y es 500. */
export function planningErrorResponse(tag: string, error: unknown) {
  if (error instanceof PlanningError) return errorResponse(error.message, 400);
  console.error(tag, error);
  return serverErrorResponse();
}
