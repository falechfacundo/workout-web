"use client";

import { useState, useEffect } from "react";
// Reemplazando la importación del cliente Supabase con el nuevo enfoque
import { createClient } from "@/lib/utils/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Loader2, Shield, Smartphone, Laptop, Globe, X } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type SessionInfo = {
  id: string;
  created_at: string;
  last_active_at: string;
  user_agent?: string;
  ip?: string;
  current: boolean;
};

export function SessionManager() {
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  // Creando una instancia del cliente de Supabase usando el nuevo enfoque
  const supabase = createClient();

  // Cargar sesiones activas
  useEffect(() => {
    const loadSessions = async () => {
      try {
        // Obtenemos la sesión actual usando la nueva instancia
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          setCurrentSessionId(session.id);
        }

        // Usando Admin API para obtener todas las sesiones del usuario
        const {
          data: { sessions: userSessions },
          error,
        } = await supabase.functions.invoke("get-user-sessions", {});

        if (error) throw error;

        if (userSessions) {
          const formattedSessions = userSessions.map((s: any) => ({
            id: s.id,
            created_at: s.created_at,
            last_active_at: s.updated_at || s.created_at,
            user_agent: s.user_agent,
            ip: s.ip,
            current: s.id === session?.id,
          }));

          setSessions(formattedSessions);
        }
      } catch (error) {
        console.error("Error al cargar sesiones:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar las sesiones activas.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, [supabase]); // Añadimos supabase al array de dependencias

  // Función para cerrar una sesión específica
  const revokeSession = async (sessionId: string) => {
    // No permitir revocar la sesión actual desde aquí
    if (sessionId === currentSessionId) {
      toast({
        title: "Acción no permitida",
        description:
          "Para cerrar la sesión actual, usa el botón 'Cerrar sesión'",
      });
      return;
    }

    setRevoking(sessionId);
    try {
      const { error } = await supabase.functions.invoke("revoke-session", {
        body: { sessionId },
      });

      if (error) throw error;

      // Actualizar la lista de sesiones
      setSessions(sessions.filter((s) => s.id !== sessionId));
      toast({
        title: "Sesión cerrada",
        description: "La sesión ha sido cerrada exitosamente.",
      });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo cerrar la sesión. Inténtalo de nuevo.",
      });
    } finally {
      setRevoking(null);
    }
  };

  // Función para renderizar el icono adecuado según el user agent
  const getDeviceIcon = (userAgent: string = "") => {
    if (
      userAgent.toLowerCase().includes("mobile") ||
      userAgent.toLowerCase().includes("android") ||
      userAgent.toLowerCase().includes("iphone")
    ) {
      return <Smartphone className="h-6 w-6" />;
    } else if (
      userAgent.toLowerCase().includes("mac") ||
      userAgent.toLowerCase().includes("windows") ||
      userAgent.toLowerCase().includes("linux")
    ) {
      return <Laptop className="h-6 w-6" />;
    }
    return <Globe className="h-6 w-6" />;
  };

  // Función para formatear la fecha
  const formatDate = (dateString: string) => {
    try {
      return format(
        new Date(dateString),
        "dd 'de' MMMM 'de' yyyy 'a las' HH:mm",
        { locale: es }
      );
    } catch {
      return "Fecha desconocida";
    }
  };

  // Si está cargando
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Sesiones activas</h3>
      <p className="text-sm text-muted-foreground">
        Estas son todas tus sesiones activas en diferentes dispositivos. Puedes
        cerrar cualquier sesión que no reconozcas.
      </p>

      <div className="grid gap-4">
        {sessions.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No hay sesiones activas.
            </CardContent>
          </Card>
        ) : (
          sessions.map((session) => (
            <Card
              key={session.id}
              className={
                session.current ? "border-primary/50 bg-primary/5" : ""
              }
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getDeviceIcon(session.user_agent)}
                    <div>
                      <p className="font-medium">
                        {session.current && (
                          <span className="text-sm text-primary mr-2">
                            <Shield className="h-4 w-4 inline-block mr-1" />
                            Sesión actual
                          </span>
                        )}
                        {session.user_agent?.split(" ")[0] ||
                          "Dispositivo desconocido"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Creada el {formatDate(session.created_at)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Actividad reciente: {formatDate(session.last_active_at)}
                      </p>
                      {session.ip && (
                        <p className="text-xs text-muted-foreground">
                          IP: {session.ip}
                        </p>
                      )}
                    </div>
                  </div>

                  {!session.current ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => revokeSession(session.id)}
                      disabled={revoking === session.id}
                    >
                      {revoking === session.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                      <span className="sr-only">Cerrar sesión</span>
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {sessions.length > 1 && (
        <Card className="bg-destructive/5 border-destructive/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              Cerrar todas las demás sesiones
            </CardTitle>
            <CardDescription>
              Cierra todas las sesiones excepto la actual. Útil si sospechas que
              alguien más tiene acceso a tu cuenta.
            </CardDescription>
          </CardHeader>
          <CardFooter className="pt-2">
            <Button
              variant="destructive"
              onClick={async () => {
                try {
                  setLoading(true);
                  const { error } = await supabase.functions.invoke(
                    "revoke-all-sessions",
                    {}
                  );
                  if (error) throw error;

                  // Mantener solo la sesión actual
                  setSessions(sessions.filter((s) => s.current));
                  toast({
                    title: "Sesiones cerradas",
                    description:
                      "Todas las demás sesiones han sido cerradas exitosamente.",
                  });
                } catch (error) {
                  console.error("Error al cerrar sesiones:", error);
                  toast({
                    variant: "destructive",
                    title: "Error",
                    description:
                      "No se pudieron cerrar todas las sesiones. Inténtalo de nuevo.",
                  });
                } finally {
                  setLoading(false);
                }
              }}
            >
              Cerrar otras sesiones
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
