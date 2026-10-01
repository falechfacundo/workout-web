"use server";

import { cookies } from "next/headers";
import { getServerUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { safeAction } from "@/lib/utils/safe-action";
import { locales, type Locale } from "@/i18n/request";

export async function setLocale(locale: Locale) {
  return safeAction(async () => {
    if (!locales.includes(locale)) {
      return { data: null, error: "Invalid locale" };
    }

    const cookieStore = await cookies();
    cookieStore.set("NEXT_LOCALE", locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });

    const user = await getServerUser();
    if (user?.id) {
      try {
        await db.profile.update({
          where: { user_id: user.id },
          data: { locale },
        });
      } catch {
        // `Profile.locale` migration not applied yet in this environment;
        // the cookie above still persists the choice for this browser.
      }
    }

    return { data: null, error: null };
  });
}
