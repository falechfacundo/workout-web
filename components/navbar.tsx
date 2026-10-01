import Link from "next/link";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/brand-mark";
import { LocaleToggle } from "@/components/locale-toggle";

export function Navbar() {
  const t = useTranslations("navbar");

  return (
    <header className="flex h-16 items-center px-4 md:px-6">
      <Link href="/" className="flex items-center gap-2 font-semibold">
        <BrandMark className="h-8 w-8 text-primary" />
        <span>GymTrack</span>
      </Link>
      <div className="ml-auto flex items-center gap-2">
        <LocaleToggle />
        <Button variant="outline" asChild>
          <Link href="/auth/login">{t("signIn")}</Link>
        </Button>
        <Button asChild>
          <Link href="/auth/register">{t("signUp")}</Link>
        </Button>
      </div>
    </header>
  );
}
