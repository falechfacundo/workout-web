"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { createClient } from "@/lib/utils/supabase/client";

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    // Recuperar el email de los parámetros de búsqueda o localStorage
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
      // Guardar en localStorage para permitir reenvíos futuros
      localStorage.setItem("verification_email", emailParam);
    } else {
      // Intentar recuperar de localStorage
      const storedEmail = localStorage.getItem("verification_email");
      if (storedEmail) setEmail(storedEmail);
    }

    // Verificar si hay un token en la URL (para flujo de verificación automática)
    const token = searchParams.get("token");
    const type = searchParams.get("type");

    if (token && type === "signup") {
      setIsVerifying(true);

      // Intercambiar el token de verificación por una sesión
      supabase.auth
        .verifyOtp({ token, type })
        .then(({ error }) => {
          if (error) {
            toast({
              variant: "destructive",
              title: "Verificación fallida",
              description:
                "El enlace de verificación es inválido o ha expirado.",
            });
          } else {
            toast({
              title: "Email verificado",
              description:
                "Tu correo ha sido verificado. Ahora puedes iniciar sesión.",
            });
            // Limpiar el email guardado ya que la verificación fue exitosa
            localStorage.removeItem("verification_email");
            // Redirigir al usuario a la página de inicio de sesión
            router.push("/auth/login");
          }
        })
        .finally(() => {
          setIsVerifying(false);
        });
    }
  }, [searchParams, router]);

  // Función para reenviar el correo de verificación
  const resendVerificationEmail = async () => {
    if (!email) {
      toast({
        variant: "destructive",
        title: "Email requerido",
        description: "Se necesita tu email para reenviar la verificación.",
      });
      return;
    }

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/verify`,
        },
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Email enviado",
        description: "Se ha reenviado el correo de verificación.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.message || "Error al reenviar el correo de verificación.",
      });
    }
  };

  // Función para manejar la navegación a la página de inicio de sesión
  const handleLoginClick = () => {
    router.push("/auth/login");
  };

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Revisa tu correo
          </h1>
          <p className="text-sm text-muted-foreground">
            Te enviamos un enlace de verificación. Por favor revisa tu correo
            para verificar tu cuenta.
            {email && <span className="block mt-2 font-medium">{email}</span>}
          </p>
        </div>

        {isVerifying ? (
          <p className="text-sm text-center">Verificando tu email...</p>
        ) : (
          <Button
            variant="outline"
            onClick={resendVerificationEmail}
            disabled={!email}
            className="mt-4"
          >
            Reenviar correo de verificación
          </Button>
        )}

        <div className="text-center text-sm">
          <Button variant="link" onClick={handleLoginClick} type="button">
            Volver al inicio de sesión
          </Button>
        </div>
      </div>
    </div>
  );
}
