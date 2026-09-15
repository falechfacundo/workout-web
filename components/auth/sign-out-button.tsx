"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface SignOutButtonProps {
  children: React.ReactNode;
  className?: string;
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
  className,
  variant = "ghost",
}: SignOutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);

    try {
      await signOut({ callbackUrl: "/auth/login" });
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ocurrió un error al cerrar sesión.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSignOut}
      disabled={isLoading}
      variant={variant}
      className={className}
    >
      {isLoading ? "Cerrando sesión..." : children}
    </Button>
  );
}