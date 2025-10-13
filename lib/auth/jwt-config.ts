/**
 * JWT Configuration
 *
 * Este módulo proporciona utilidades para validación de tokens JWT.
 * Actualmente el sistema usa Lucia Auth para sesiones, pero este módulo
 * se mantiene para compatibilidad con código legacy.
 */

export type JWTPayload = {
  userId: string
  email: string
  role: string
  clubId?: string
  iat?: number
  exp?: number
}

/**
 * Valida un token JWT
 * @param token - El token JWT a validar
 * @returns El payload decodificado si es válido, null si no lo es
 *
 * @deprecated Este método es legacy. Usa lucia.validateRequest() en su lugar.
 */
export async function validateAuthToken(token: string): Promise<JWTPayload | null> {
  // TODO: Implement JWT validation if needed for API routes
  // For now, this is a stub for backward compatibility
  console.warn('validateAuthToken is deprecated. Use lucia.validateRequest() instead.')
  return null
}

/**
 * Genera un nuevo token JWT
 * @param payload - Los datos a incluir en el token
 * @returns El token JWT generado
 *
 * @deprecated Este método es legacy. Usa lucia.createSession() en su lugar.
 */
export async function generateAuthToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  // TODO: Implement JWT generation if needed
  console.warn('generateAuthToken is deprecated. Use lucia.createSession() instead.')
  return ''
}
