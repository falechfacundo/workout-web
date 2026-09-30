import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { encode as encodeJwt, decode as decodeJwt } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { authConfig } from "@/lib/auth.config";
import {
  checkLoginRateLimit,
  recordFailedLogin,
  resetLoginAttempts,
} from "@/lib/utils/rate-limiter";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // En v5 las credenciales llegan como `unknown`: validar el tipo.
        const email =
          typeof credentials?.email === "string" ? credentials.email : "";
        const password =
          typeof credentials?.password === "string" ? credentials.password : "";
        if (!email || !password) return null;

        const rateLimit = await checkLoginRateLimit(email);
        if (!rateLimit.allowed) {
          throw new Error(
            `Too many failed attempts. Try again in ${Math.ceil(
              rateLimit.timeToWait / 60
            )} minute(s).`
          );
        }

        const user = await db.user.findUnique({
          where: { email },
        });

        if (!user || !user.password_hash) {
          await recordFailedLogin(email);
          return null;
        }

        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
          await recordFailedLogin(email);
          return null;
        }

        await resetLoginAttempts(email);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          mustChangePassword: user.must_change_password,
        };
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    // Solo en el servidor completo (usa la base): el proxy no lo necesita.
    async signIn({ user, account, profile }) {
      if (account?.provider !== "google" || !profile?.email) return true;

      const googleId = account.providerAccountId;
      const existing = await db.user.findUnique({
        where: { email: profile.email },
      });

      if (!existing) {
        const created = await db.user.create({
          data: {
            email: profile.email,
            name: profile.name,
            google_id: googleId,
            password_hash: null,
            must_change_password: false,
            profile: {
              create: {
                full_name: profile.name,
              },
            },
          },
        });
        user.id = created.id;
        user.mustChangePassword = false;
        return true;
      }

      if (existing.google_id !== googleId) {
        // Email already registered with a password (or a different Google
        // account): don't auto-link. The user must sign in with their
        // password and link Google from Settings.
        return "/auth/login?error=OAuthAccountNotLinked";
      }

      user.id = existing.id;
      user.mustChangePassword = existing.must_change_password;
      return true;
    },
  },
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
});

/**
 * Obtener el usuario autenticado en el servidor (mediante la sesión de Auth.js)
 */
export async function getServerUser() {
  const session = await auth();
  return session?.user ?? null;
}

export type ApiUser = {
  id: string;
  email: string;
  name: string | null;
  mustChangePassword: boolean;
};

const MOBILE_TOKEN_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

// En Auth.js v5, encode/decode exigen una "salt" (el nombre de la cookie de
// sesión). Se fija una constante: estos tokens solo los firma y lee este módulo.
const MOBILE_TOKEN_SALT = "authjs.session-token";

function authSecret(): string {
  return (process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET) as string;
}

/**
 * Firma un JWT (mismo formato/algoritmo que la sesión de Auth.js) para
 * clientes que no pueden mantener cookies, como la app mobile. Se manda
 * como `Authorization: Bearer <token>`.
 */
export async function signMobileToken(user: ApiUser): Promise<string> {
  return encodeJwt({
    token: { id: user.id, email: user.email, name: user.name, mustChangePassword: user.mustChangePassword },
    secret: authSecret(),
    salt: MOBILE_TOKEN_SALT,
    maxAge: MOBILE_TOKEN_MAX_AGE,
  });
}

/**
 * Resuelve el usuario autenticado para route handlers consumidos por la app
 * mobile: primero intenta el bearer token (app RN), y si no hay, cae a la
 * cookie de sesión de Auth.js (útil para probar desde el browser).
 */
export async function getApiUser(req: NextRequest): Promise<ApiUser | null> {
  const authHeader = req.headers.get("authorization");
  const bearerToken = authHeader?.match(/^Bearer\s+(.+)$/i)?.[1];

  if (bearerToken) {
    try {
      const decoded = await decodeJwt({
        token: bearerToken,
        secret: authSecret(),
        salt: MOBILE_TOKEN_SALT,
      });
      if (decoded?.id && decoded?.email) {
        return {
          id: decoded.id as string,
          email: decoded.email,
          name: (decoded.name as string | null) ?? null,
          mustChangePassword: !!decoded.mustChangePassword,
        };
      }
    } catch {
      return null;
    }
    return null;
  }

  const session = await auth();
  if (!session?.user?.id || !session.user.email) return null;

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name ?? null,
    mustChangePassword: !!session.user.mustChangePassword,
  };
}
