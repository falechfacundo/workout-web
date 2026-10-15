import { Suspense } from "react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { AuthForm } from "@/components/auth/auth-form";

export default async function RegisterPage() {
  const t = await getTranslations("auth");

  return (
    <div className="container flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center py-8">
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
        <p className="text-center text-sm text-muted-foreground">
          {t("haveAccount")}{" "}
          <Link
            href="/auth/login"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            {t("signInLink")}
          </Link>
        </p>
      </div>
    </div>
  );
}
