type DecimalLike = { toNumber: () => number; toFixed: (dp?: number) => string };

function isDecimalLike(value: unknown): value is DecimalLike {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Record<string, unknown>).toNumber === "function" &&
    typeof (value as Record<string, unknown>).toFixed === "function"
  );
}

/**
 * Convierte recursivamente instancias de Prisma.Decimal a `number` plano.
 * decimal.js (lo que usa Prisma por debajo) define `toJSON = toString`, así
 * que cualquier campo Decimal (weight_kg, body_fat_percentage, target_value,
 * ExerciseLog.weight, etc.) le llega al cliente mobile como *string* si se
 * manda tal cual — rompe el contrato "number" que esperan los Zod schemas
 * del lado mobile en cualquier request de escritura posterior (ej: prefillear
 * un form con un valor de un GET y mandarlo de vuelta en un PATCH). Usar en
 * cualquier response de `/api/mobile/v1/*` que incluya un modelo de Prisma
 * con columnas `Decimal`.
 */
export function toPlainJSON<T>(value: T): T {
  if (isDecimalLike(value)) {
    return value.toNumber() as unknown as T;
  }
  if (value instanceof Date) {
    return value as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => toPlainJSON(item)) as unknown as T;
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = toPlainJSON(v);
    }
    return out as T;
  }
  return value;
}
