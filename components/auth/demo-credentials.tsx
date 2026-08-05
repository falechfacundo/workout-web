"use client";

import { useState } from "react";
import { Check, Copy, KeyRound, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

const DEMO_CREDENTIALS = [
  { label: "Email", value: "demo@example.com", icon: Mail },
  { label: "Usuario", value: "demo_user", icon: User },
  { label: "Contraseña", value: "password1234", icon: KeyRound },
] as const;

export function DemoCredentials() {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      toast({
        title: "Copiado al portapapeles",
        description: `${label}: ${value}`,
      });
      window.setTimeout(() => setCopied(null), 2000);
    } catch {
      toast({
        variant: "destructive",
        title: "No se pudo copiar",
        description: "Tu navegador bloqueó el acceso al portapapeles.",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Cuenta de demostración</CardTitle>
        <CardDescription>
          Usá estas credenciales para probar la app
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {DEMO_CREDENTIALS.map((credential) => (
          <div
            key={credential.label}
            className="flex items-center justify-between gap-2 rounded-md border px-3 py-2"
          >
            <div className="flex min-w-0 items-center gap-3">
              <credential.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">
                  {credential.label}
                </p>
                <p className="truncate font-mono text-sm">{credential.value}</p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              aria-label={`Copiar ${credential.label}`}
              title={`Copiar ${credential.label}`}
              onClick={() =>
                copyToClipboard(credential.label, credential.value)
              }
            >
              {copied === credential.label ? (
                <Check className="h-4 w-4 text-emerald-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
