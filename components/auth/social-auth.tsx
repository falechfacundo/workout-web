"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
// Reemplazando la importación del cliente de Supabase con el nuevo enfoque
import { createClient } from "@/lib/utils/supabase/client";
import { Github, Mail } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface SocialAuthProps {
  callbackUrl?: string;
}

export function SocialAuth({ callbackUrl = "/dashboard" }: SocialAuthProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  // Creando una instancia del cliente de Supabase usando el nuevo enfoque
  const supabase = createClient();

  const handleSocialLogin = async (provider: "google" | "github") => {
    try {
      setIsLoading(provider);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}${callbackUrl}`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error de autenticación",
        description: error.message || "Hubo un problema al iniciar sesión",
      });
      setIsLoading(null);
    }
  };

  return (
    <div className="flex flex-col gap-3 mt-6">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            O continuar con
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-3">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => handleSocialLogin("google")}
          disabled={isLoading !== null}
        >
          {isLoading === "google" ? (
            <span className="h-4 w-4 animate-spin" />
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" className="mr-2">
              <g transform="matrix(0.666667, 0, 0, 0.666667, 0, 0)">
                <path
                  d="M23.745,12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29,1.48-1.14,2.73-2.4,3.58v3h3.86c2.26-2.09,3.56-5.17,3.56-8.82Z"
                  fill="#4285F4"
                />
                <path
                  d="M12.255,24c3.24,0,5.95-1.08,7.93-2.91l-3.86-3c-1.08.72-2.45,1.16-4.07,1.16-3.13,0-5.78-2.11-6.73-4.96h-3.98v3.09c1.97,3.92,6.02,6.62,10.71,6.62Z"
                  fill="#34A853"
                />
                <path
                  d="M5.525,14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29v-3.09h-3.98c-.8,1.6-1.26,3.41-1.26,5.38s.46,3.78,1.26,5.38l3.98-3.09Z"
                  fill="#FBBC05"
                />
                <path
                  d="M12.255,5.04c1.77,0,3.35.61,4.6,1.8l3.42-3.42c-2.07-1.94-4.78-3.13-8.02-3.13-4.69,0-8.74,2.7-10.71,6.62l3.98,3.09c.95-2.85,3.6-4.96,6.73-4.96Z"
                  fill="#EA4335"
                />
              </g>
            </svg>
          )}
          Google
        </Button>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => handleSocialLogin("github")}
          disabled={isLoading !== null}
        >
          {isLoading === "github" ? (
            <span className="h-4 w-4 animate-spin" />
          ) : (
            <Github className="mr-2 h-4 w-4" />
          )}
          GitHub
        </Button>
      </div>
    </div>
  );
}
