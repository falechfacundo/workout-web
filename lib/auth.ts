import { createClient as createServerClient } from "@/lib/utils/supabase/server";
import { redirect } from "next/navigation";

/**
 * Obtener usuario autenticado - Esta es la función principal recomendada por Supabase
 * para verificar autenticación y proteger rutas/datos
 */
export async function getUser() {
  const supabase = await createServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("Error al obtener el usuario:", error);
  }

  return user;
}

/**
 * Obtener la sesión actual - Usar con precaución
 * Nota: Supabase recomienda usar getUser() en lugar de getSession()
 * para validar autenticación en el servidor
 */
export async function getSession() {
  const supabase = await createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

/**
 * Función para cerrar sesión
 */
export async function signOut() {
  const supabase = await createServerClient();
  await supabase.auth.signOut();
}

/**
 * Proteger rutas - Redirecciona a login si no hay usuario autenticado
 * @param redirectTo - URL a la que redirigir si no hay usuario autenticado
 */
export async function requireAuth(redirectTo = "/auth/login") {
  const user = await getUser();

  if (!user) {
    redirect(redirectTo);
  }

  return user;
}

/**
 * Crear cliente admin con Service Role Key - Usar con extrema precaución
 * y solo en contextos del servidor
 */
export async function createServerSupabaseAdmin() {
  if (typeof window !== "undefined") {
    throw new Error(
      "createServerSupabaseAdmin solo debe usarse en el servidor"
    );
  }

  // Importación dinámica para asegurar que solo se use en el servidor
  const { createClient } = await import("@supabase/supabase-js");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseServiceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY no está definida");
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
