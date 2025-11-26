// components/auth/password-reset-form.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
// Actualizando la importación para usar el nuevo enfoque recomendado
import { createClient } from "@/lib/utils/supabase/client";

const formSchema = z.object({
  email: z.string().email("Por favor ingresa un email válido"),
});

type FormValues = z.infer<typeof formSchema>;

export function PasswordResetForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  // Creando una instancia del cliente de Supabase usando el nuevo enfoque
  const supabase = createClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);

    try {
      // Usar el método resetPasswordForEmail con la nueva instancia del cliente
      const { error } = await supabase.auth.resetPasswordForEmail(
        values.email,
        {
          redirectTo: `${window.location.origin}/auth/update-password`,
        }
      );

      if (error) {
        throw error;
      }

      toast({
        title: "Email enviado",
        description: "Revisa tu correo para restablecer la contraseña.",
      });

      router.push("/auth/verify");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.message ||
          "Ocurrió un error al enviar el email de recuperación.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="tu@ejemplo.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Enviando..." : "Enviar enlace de recuperación"}
        </Button>
      </form>
    </Form>
  );
}
