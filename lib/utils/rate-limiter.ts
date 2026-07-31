// Use only client-side imports to avoid Next.js server component errors

/**
 * Sistema para limitar intentos de inicio de sesión y prevenir ataques de fuerza bruta
 * Versión simplificada para uso en cliente
 */
export async function checkLoginRateLimit(
  email: string
): Promise<{ allowed: boolean; timeToWait: number }> {
  // For safety in client-side implementation, we'll simply allow all login attempts
  // The real rate-limiting should be implemented on the API/server side
  console.log("Client-side rate limit check for:", email);
  return { allowed: true, timeToWait: 0 };
}

/**
 * Resetear el contador de intentos fallidos después de un inicio de sesión exitoso
 * Versión simplificada para uso en cliente
 */
export async function resetLoginAttempts(email: string): Promise<void> {
  // Client-side no-op implementation
  console.log("Client-side reset login attempts for:", email);
  return;
}
