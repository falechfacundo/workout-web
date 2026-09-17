import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { signMobileToken } from "@/lib/auth";
import {
  checkLoginRateLimit,
  recordFailedLogin,
  resetLoginAttempts,
} from "@/lib/utils/rate-limiter";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/apiResponse";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = loginSchema.safeParse(await request.json());
    if (!body.success) {
      return errorResponse("Email y contraseña son requeridos.", 400);
    }
    const { email, password } = body.data;

    const rateLimit = await checkLoginRateLimit(email);
    if (!rateLimit.allowed) {
      return errorResponse(
        `Demasiados intentos fallidos. Probá de nuevo en ${Math.ceil(rateLimit.timeToWait / 60)} minuto(s).`,
        429
      );
    }

    const user = await db.user.findUnique({ where: { email } });

    if (!user || !user.password_hash) {
      await recordFailedLogin(email);
      return errorResponse("Credenciales inválidas.", 401);
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      await recordFailedLogin(email);
      return errorResponse("Credenciales inválidas.", 401);
    }

    await resetLoginAttempts(email);

    const apiUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      mustChangePassword: user.must_change_password,
    };
    const token = await signMobileToken(apiUser);

    return successResponse({ token, user: apiUser });
  } catch (error) {
    console.error("[MOBILE_LOGIN]", error);
    return serverErrorResponse();
  }
}
