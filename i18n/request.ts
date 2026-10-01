import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { getServerUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const locales = ["en", "es"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "es";

function isLocale(value: string | undefined): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}

export async function resolveLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value;
  if (isLocale(cookieLocale)) return cookieLocale;

  const user = await getServerUser();
  if (user?.id) {
    try {
      const profile = await db.profile.findUnique({
        where: { user_id: user.id },
        select: { locale: true },
      });
      if (isLocale(profile?.locale)) return profile.locale;
    } catch {
      // `Profile.locale` migration not applied yet in this environment;
      // fall through to the cookie/default below.
    }
  }

  return defaultLocale;
}

export default getRequestConfig(async () => {
  const locale = await resolveLocale();
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
