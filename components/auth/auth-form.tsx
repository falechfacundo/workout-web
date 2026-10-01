"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  signInSchema,
  signUpSchema,
  type SignInFormValues,
  type SignUpFormValues,
} from "@/lib/schemas/auth";
import { signUp as signUpAction } from "@/lib/actions/auth";

interface AuthFormProps {
  mode: "signin" | "signup";
}

export function AuthForm({ mode }: AuthFormProps) {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    const error = searchParams.get("error");
    if (!error) return;

    const description =
      error === "OAuthAccountNotLinked"
        ? t("googleErrorAccountNotLinked")
        : t("googleErrorGeneric");

    toast({
      variant: "destructive",
      title: t("googleErrorTitle"),
      description,
    });
  }, [searchParams, t]);

  async function onGoogleSignIn() {
    setIsGoogleLoading(true);
    await signIn("google", { callbackUrl: "/dashboard" });
  }

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

    try {
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        toast({
          variant: "destructive",
          title: t("loginErrorTitle"),
          description: t("loginErrorInvalid"),
        });
        return;
      }

      toast({
        title: t("loginSuccessTitle"),
        description: t("loginSuccessDescription"),
      });

      router.push("/dashboard");
      router.refresh();
    } catch {
      toast({
        variant: "destructive",
        title: t("loginErrorTitle"),
        description: t("loginErrorGeneric"),
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function onSignUp(values: SignUpFormValues) {
    setIsLoading(true);

    try {
      const result = await signUpAction({
        email: values.email,
        password: values.password,
        preferred_unit: values.preferred_unit,
      });

      if (result.error) {
        toast({
          variant: "destructive",
          title: t("registerErrorTitle"),
          description: result.error,
        });
        return;
      }

      // Iniciar sesión automáticamente con las credenciales recién creadas
      const signInResult = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (signInResult?.error) {
        toast({
          title: t("registerSuccessTitle"),
          description: t("registerSuccessNeedsLogin"),
        });
        router.push("/auth/login");
        return;
      }

      toast({
        title: t("registerSuccessTitle"),
        description: t("registerSuccessDescription"),
      });

      router.push("/dashboard");
      router.refresh();
    } catch {
      toast({
        variant: "destructive",
        title: t("registerErrorTitle"),
        description: t("registerErrorGeneric"),
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (mode === "signin") {
    return (
      <Form {...signInForm}>
        <form
          onSubmit={signInForm.handleSubmit(onSignIn)}
          className="space-y-6"
        >
          <FormField
            control={signInForm.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("email")}</FormLabel>
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
                <FormLabel>{t("password")}</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? t("signingIn") : t("signIn")}
          </Button>
        </form>
        <GoogleButton onClick={onGoogleSignIn} isLoading={isGoogleLoading} />
      </Form>
    );
  }

  return (
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
              <FormLabel>{t("email")}</FormLabel>
              <FormControl>
                <Input placeholder="tu@ejemplo.com" {...field} />
              </FormControl>
              <FormDescription>{t("emailDescription")}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={signUpForm.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("password")}</FormLabel>
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
              <FormLabel>{t("confirmPassword")}</FormLabel>
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
              <FormLabel>{t("preferredUnit")}</FormLabel>
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
                      {t("kilograms")}
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="lb" />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">
                      {t("pounds")}
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? t("creatingAccount") : t("createAccount")}
        </Button>
      </form>
      <GoogleButton onClick={onGoogleSignIn} isLoading={isGoogleLoading} />
    </Form>
  );
}

function GoogleButton({
  onClick,
  isLoading,
}: {
  onClick: () => void;
  isLoading: boolean;
}) {
  const t = useTranslations("auth");

  return (
    <div className="mt-6 space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            {t("orContinueWith")}
          </span>
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={isLoading}
        onClick={onClick}
      >
        {isLoading ? t("redirecting") : t("continueWithGoogle")}
      </Button>
    </div>
  );
}