import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { AuthForm } from "@/components/auth/auth-form";

export default async function RegisterPage() {
  const t = await getTranslations("auth");

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("registerTitle")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("registerSubtitle")}
          </p>
        </div>
        <Suspense>
          <AuthForm mode="signup" />
        </Suspense>
      </div>
    </div>
  );
}
