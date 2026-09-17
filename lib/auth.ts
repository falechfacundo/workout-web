import type { AuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { encode as encodeJwt, decode as decodeJwt } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import {
  checkLoginRateLimit,
  recordFailedLogin,
  resetLoginAttempts,
} from "@/lib/utils/rate-limiter";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const rateLimit = await checkLoginRateLimit(credentials.email);
        if (!rateLimit.allowed) {
          throw new Error(
            `Too many failed attempts. Try again in ${Math.ceil(
              rateLimit.timeToWait / 60
            )} minute(s).`
          );
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password_hash) {
          await recordFailedLogin(credentials.email);
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password_hash
        );
        if (!isValid) {
          await recordFailedLogin(credentials.email);
          return null;
        }

        await resetLoginAttempts(credentials.email);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          mustChangePassword: user.must_change_password,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
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
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.mustChangePassword = user.mustChangePassword;
      }

      // Allow useSession().update({ mustChangePassword: false }) to refresh
      // the middleware token state after changing the password.
      if (
        trigger === "update" &&
        typeof session?.mustChangePassword === "boolean"
      ) {
        token.mustChangePassword = session.mustChangePassword;
      }

      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.mustChangePassword = token.mustChangePassword;
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

/**
 * Obtener el usuario autenticado en el servidor (mediante la sesión de NextAuth)
 */
export async function getServerUser() {
  const session = await getServerSession(authOptions);
  return session?.user ?? null;
}

export type ApiUser = {
  id: string;
  email: string;
  name: string | null;
  mustChangePassword: boolean;
};

const MOBILE_TOKEN_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

/**
 * Firma un JWT (mismo formato/algoritmo que la sesión de NextAuth) para
 * clientes que no pueden mantener cookies, como la app mobile. Se manda
 * como `Authorization: Bearer <token>`.
 */
export async function signMobileToken(user: ApiUser): Promise<string> {
  return encodeJwt({
    token: { id: user.id, email: user.email, name: user.name, mustChangePassword: user.mustChangePassword },
    secret: process.env.NEXTAUTH_SECRET as string,
    maxAge: MOBILE_TOKEN_MAX_AGE,
  });
}

/**
 * Resuelve el usuario autenticado para route handlers consumidos por la app
 * mobile: primero intenta el bearer token (app RN), y si no hay, cae a la
 * cookie de sesión de NextAuth (útil para probar desde el browser).
 */
export async function getApiUser(req: NextRequest): Promise<ApiUser | null> {
  const authHeader = req.headers.get("authorization");
  const bearerToken = authHeader?.match(/^Bearer\s+(.+)$/i)?.[1];

  if (bearerToken) {
    try {
      const decoded = await decodeJwt({
        token: bearerToken,
        secret: process.env.NEXTAUTH_SECRET as string,
      });
      if (decoded?.id && decoded?.email) {
        return {
          id: decoded.id,
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

  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.email) return null;

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name ?? null,
    mustChangePassword: !!session.user.mustChangePassword,
  };
}