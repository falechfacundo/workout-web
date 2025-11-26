import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  // Crear una respuesta mutable basada en la solicitud entrante
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Crear cliente de Supabase con las cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options) {
          // Si la cookie se va a eliminar, obtener sus opciones actuales
          if (options.maxAge === 0) {
            const cookieValue = request.cookies.get(name)?.value;
            if (!cookieValue) return;
          }

          // Establecer la cookie en la respuesta y en el objeto de cookies del request
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options) {
          // Eliminar la cookie en la respuesta y en el objeto de cookies del request
          request.cookies.set({
            name,
            value: "",
            ...options,
            maxAge: 0,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: "",
            ...options,
            maxAge: 0,
          });
        },
      },
    }
  );

  // Refrescar la sesión si existe
  await supabase.auth.getUser();

  // Return both response and the supabase client so it can be reused
  return { response, supabase };
}
