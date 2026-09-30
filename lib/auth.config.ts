import type { NextAuthConfig, Session } from "next-auth";
import { NextResponse } from "next/server";

/**
 * Configuración de Auth.js v5 compartida entre `lib/auth.ts` (providers, base
 * de datos) y `proxy.ts`. No importa Prisma ni bcrypt a propósito: el proxy la
 * usa solo para leer la sesión JWT.
 */
export const authConfig = {
  pages: {
    signIn: "/auth/login",
  },
  // Sin esto, Auth.js v5 rechaza el host en producción (UntrustedHost) salvo
  // que se configure AUTH_TRUST_HOST=true en las envs del deployment.
  trustHost: true,
  providers: [],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.mustChangePassword = user.mustChangePassword;
      }

      // Allow useSession().update({ mustChangePassword: false }) to refresh
      // the proxy token state after changing the password.
      if (
        trigger === "update" &&
        typeof session?.mustChangePassword === "boolean"
      ) {
        token.mustChangePassword = session.mustChangePassword;
      }

      return token;
    },
    async session({ session, token }) {
      const user = session.user as unknown as Session["user"];
      user.id = token.id as string;
      user.mustChangePassword = token.mustChangePassword;
      return session;
    },
    /**
     * Protección de rutas del proxy (reemplaza a `withAuth` de v4).
     * - Páginas /auth: abiertas; si ya hay sesión, van al dashboard.
     * - Con `mustChangePassword` solo se puede ir a /change-password.
     * - El resto exige sesión (Auth.js redirige a `pages.signIn`).
     */
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const user = auth?.user;

      if (
        user?.mustChangePassword &&
        pathname !== "/change-password" &&
        !pathname.startsWith("/api/auth")
      ) {
        return NextResponse.redirect(new URL("/change-password", request.url));
      }

      if (pathname.startsWith("/auth")) {
        if (user) {
          return NextResponse.redirect(new URL("/dashboard", request.url));
        }
        return true;
      }

      return !!user;
    },
  },
} satisfies NextAuthConfig;
