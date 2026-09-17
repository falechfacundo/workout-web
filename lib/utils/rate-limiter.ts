import { db } from "@/lib/db";

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Server-side login rate limit, backed by the `login_attempts` table.
 * Must be called from authorize() in lib/auth.ts, not from the client:
 * a client-only check can be bypassed by calling signIn directly.
 */
export async function checkLoginRateLimit(
  email: string
): Promise<{ allowed: boolean; timeToWait: number }> {
  const record = await db.loginAttempt.findUnique({ where: { email } });

  if (record?.locked_until && record.locked_until > new Date()) {
    const timeToWait = Math.ceil(
      (record.locked_until.getTime() - Date.now()) / 1000
    );
    return { allowed: false, timeToWait };
  }

  return { allowed: true, timeToWait: 0 };
}

export async function recordFailedLogin(email: string): Promise<void> {
  const existing = await db.loginAttempt.findUnique({ where: { email } });
  const attempts = (existing?.attempts ?? 0) + 1;
  const locked_until =
    attempts >= MAX_ATTEMPTS ? new Date(Date.now() + LOCKOUT_MS) : null;

  await db.loginAttempt.upsert({
    where: { email },
    create: { email, attempts, locked_until },
    update: { attempts, locked_until },
  });
}

export async function resetLoginAttempts(email: string): Promise<void> {
  await db.loginAttempt.deleteMany({ where: { email } });
}
