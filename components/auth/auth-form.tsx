"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
// Reemplazando la importación de supabase por la nueva forma recomendada
import { createClient } from "@/lib/utils/supabase/client";
import {
  checkLoginRateLimit,
  resetLoginAttempts,
} from "@/lib/utils/rate-limiter";
import {
  signInSchema,
  signUpSchema,
  type SignInFormValues,
  type SignUpFormValues,
} from "@/lib/schemas/auth";
import { SocialAuth } from "./social-auth";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface AuthFormProps {
  mode: "signin" | "signup";
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  // Creando una instancia del cliente de Supabase usando la nueva forma
  const supabase = createClient();

  const signInForm = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signUpForm = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      preferred_unit: "kg",
    },
  });

  async function onSignIn(values: SignInFormValues) {
    setIsLoading(true);
    console.log("Sign in attempt with:", values.email); // Debug log

    try {
      // Verificar si el usuario ha excedido los intentos permitidos
      const rateLimitResult = await checkLoginRateLimit(values.email);
      console.log("Rate limit check:", rateLimitResult); // Debug log

      if (!rateLimitResult.allowed) {
        const minutes = Math.floor(rateLimitResult.timeToWait / 60);
        const seconds = rateLimitResult.timeToWait % 60;
        const timeMessage =
          minutes > 0
            ? `${minutes} minutos y ${seconds} segundos`
            : `${seconds} segundos`;

        toast({
          variant: "destructive",
          title: "Demasiados intentos fallidos",
          description: `Por seguridad, por favor intenta nuevamente en ${timeMessage}.`,
        });

        setIsLoading(false);
        return;
      }

      console.log("Attempting to sign in with Supabase..."); // Debug log
      // Intentar iniciar sesión usando la nueva instancia de cliente
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      console.log("Auth response:", { data, error }); // Debug log

      if (error) {
        throw error;
      }

      // Si se inicia sesión correctamente, resetear contador de intentos
      await resetLoginAttempts(values.email);

      toast({
        title: "Inicio de sesión exitoso",
        description: "¡Bienvenido de nuevo a GymTrack!",
      });

      console.log("Redirecting to dashboard..."); // Debug log
      router.push("/dashboard");
      router.refresh();
    } catch (error: any) {
      console.error("Login error:", error); // Debug log
      // Mensajes de error más específicos basados en el tipo de error
      let errorMessage = "Ocurrió un error durante el inicio de sesión";

      if (error.message?.includes("Invalid login credentials")) {
        errorMessage =
          "Credenciales inválidas. Verifica tu email y contraseña.";
      } else if (error.message?.includes("Email not confirmed")) {
        errorMessage = "Email no verificado. Por favor revisa tu correo.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        variant: "destructive",
        title: "Error de inicio de sesión",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function onSignUp(values: SignUpFormValues) {
    setIsLoading(true);

    try {
      console.log("Iniciando registro con:", {
        email: values.email,
        redirectTo: `${window.location.origin}/auth/verify`,
        preferred_unit: values.preferred_unit, // Log preferred_unit for debugging
      });

      // Solicitud con los datos completos incluyendo preferred_unit
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            preferred_unit: values.preferred_unit,
            full_name: "", // Add an empty full_name to ensure it's not null
          },
          emailRedirectTo: `${window.location.origin}/auth/verify`,
        },
      });

      console.log("Respuesta de registro:", { data, error });

      if (error) {
        throw error;
      }

      if (data?.user) {
        console.log("Usuario registrado exitosamente:", data.user.id);

        toast({
          title: "Registro exitoso",
          description: "Por favor revisa tu correo para verificar tu cuenta.",
        });

        router.push(`/auth/verify?email=${encodeURIComponent(values.email)}`);
      } else {
        throw new Error("No se pudo crear el usuario correctamente");
      }
    } catch (error: any) {
      console.error("Error completo durante el registro:", error);

      let errorMessage = "Ocurrió un error durante el registro";

      if (error.message?.includes("already registered")) {
        errorMessage = "Este email ya está registrado.";
      } else if (error.message?.includes("rate limit")) {
        errorMessage = "Demasiados intentos. Por favor intenta más tarde.";
      } else if (error.message?.includes("Database error")) {
        errorMessage =
          "Error en la base de datos. Verifica la configuración de Supabase y sus tablas.";
      } else if (error.status === 500) {
        errorMessage =
          "Error del servidor. Verifica la configuración de Supabase.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        variant: "destructive",
        title: "Error de registro",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (mode === "signin") {
    return (
      <>
        <Form {...signInForm}>
          <form
            onSubmit={(e) => {
              console.log("Form submitted"); // Debug log
              signInForm.handleSubmit(onSignIn)(e);
            }}
            className="space-y-6"
          >
            <FormField
              control={signInForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={signInForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <div className="text-right">
                    <Link
                      href="/auth/reset-password"
                      className="text-xs text-muted-foreground hover:underline"
                    >
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              onClick={() => {
                console.log("Login button clicked"); // Debug when button is clicked
                if (Object.keys(signInForm.formState.errors).length > 0) {
                  console.log("Form errors:", signInForm.formState.errors);
                }
              }}
            >
              {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
            </Button>
          </form>
        </Form>

        <SocialAuth callbackUrl="/dashboard" />
      </>
    );
  }

  return (
    <>
      <Form {...signUpForm}>
        <form
          onSubmit={signUpForm.handleSubmit(onSignUp)}
          className="space-y-6"
        >
          <FormField
            control={signUpForm.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="tu@ejemplo.com" {...field} />
                </FormControl>
                <FormDescription>
                  Te enviaremos un correo de verificación.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={signUpForm.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contraseña</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={signUpForm.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmar contraseña</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={signUpForm.control}
            name="preferred_unit"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Unidad de peso preferida</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex space-x-4"
                  >
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="kg" />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">
                        Kilogramos (kg)
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="lb" />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">
                        Libras (lb)
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creando cuenta..." : "Crear cuenta"}
          </Button>
        </form>
      </Form>

      <SocialAuth callbackUrl="/auth/verify" />
    </>
  );
}
