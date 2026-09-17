"use server";

import { getServerUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { safeAction } from "@/lib/utils/safe-action";

export async function getGoogleLinkStatus() {
  return safeAction(async () => {
    const user = await getServerUser();

    if (!user?.id) {
      return { data: null, error: "You must be logged in" };
    }

    const dbUser = await db.user.findUnique({
      where: { id: user.id },
      select: { google_id: true, password_hash: true },
    });

    return {
      data: {
        linked: !!dbUser?.google_id,
        canUnlink: !!dbUser?.password_hash,
      },
      error: null,
    };
  });
}

export async function unlinkGoogleAccount() {
  return safeAction(async () => {
    const user = await getServerUser();

    if (!user?.id) {
      return { data: null, error: "You must be logged in" };
    }

    const dbUser = await db.user.findUnique({
      where: { id: user.id },
      select: { password_hash: true },
    });

    if (!dbUser?.password_hash) {
      return {
        data: null,
        error:
          "Establecé una contraseña antes de desvincular Google, o quedarías sin forma de iniciar sesión.",
      };
    }

    await db.user.update({
      where: { id: user.id },
      data: { google_id: null },
    });

    return { data: { linked: false }, error: null };
  });
}
