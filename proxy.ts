import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Auth.js v5: el proxy usa solo la config edge-safe (sin Prisma ni bcrypt).
// Las reglas de acceso (auth pages, mustChangePassword, sesión obligatoria)
// viven en el callback `authorized` de lib/auth.config.ts.
const { auth } = NextAuth(authConfig);

export const proxy = auth as unknown as (
  request: Request
) => Promise<Response | undefined>;

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*", "/change-password"],
};
