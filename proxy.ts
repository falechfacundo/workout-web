import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/utils/supabase/middleware";

export async function proxy(request: NextRequest) {
  // Get the response and Supabase client from updateSession
  const { response, supabase } = await updateSession(request);

  const { pathname } = request.nextUrl;

  // Verificar la autenticación solo para rutas protegidas
  if (pathname.startsWith("/dashboard")) {
    // Use the existing Supabase client instead of creating a new one
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Si no hay sesión activa, redirigir al login
    if (!session) {
      // Obtener la URL de retorno para redireccionar después del inicio de sesión
      const returnUrl = encodeURIComponent(request.nextUrl.pathname);
      const redirectUrl = new URL(
        `/auth/login?returnUrl=${returnUrl}`,
        request.url
      );
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Si el usuario ya está autenticado e intenta acceder a páginas de autenticación, redirigir al dashboard
  // Descomentar cuando esté listo para implementar esta funcionalidad
  if (pathname.startsWith("/auth") && pathname !== "/auth/verify") {
    // Use the existing Supabase client
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      const redirectUrl = new URL("/dashboard", request.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}

// Configuración del matcher para que el middleware sólo se ejecute en las rutas necesarias
export const config = {
  matcher: [
    // Rutas protegidas que requieren autenticación
    "/dashboard/:path*",
    // Rutas de autenticación
    "/auth/:path*",
    // Excluir rutas que no necesitan procesar autenticación
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
