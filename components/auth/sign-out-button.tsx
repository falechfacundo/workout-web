"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
// Reemplazando la importación del cliente Supabase con el nuevo enfoque
import { createClient } from "@/lib/utils/supabase/client";

interface SignOutButtonProps {
  children: React.ReactNode;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
}

export function SignOutButton({
  children,
  variant = "ghost",
}: SignOutButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  // Creando una instancia del cliente de Supabase usando el nuevo enfoque
  const supabase = createClient();

  const handleSignOut = async () => {
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente.",
      });

      router.push("/auth/login");
      router.refresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Ocurrió un error al cerrar sesión.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleSignOut} disabled={isLoading} variant={variant}>
      {isLoading ? "Cerrando sesión..." : children}
    </Button>
  );
}
