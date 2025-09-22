// Sistema de autenticación alternativo cuando las cookies fallan
// Este es un WORKAROUND para el problema de cookies en Vercel

import { SignJWT, jwtVerify } from 'jose'
import type { User } from '@prisma/client'

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key-change-in-production'
)

export interface FallbackSession {
  userId: string
  email: string
  role: string
  clubId?: string | null
  exp: number
}

// Crear token JWT
export async function createFallbackToken(user: User): Promise<string> {
  const token = await new SignJWT({
    userId: user.id,
    email: user.email,
    role: user.role,
    clubId: user.clubId,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .setIssuedAt()
    .sign(SECRET_KEY)
  
  return token
}

// Verificar token JWT
export async function verifyFallbackToken(token: string): Promise<FallbackSession | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY)
    return payload as FallbackSession
  } catch (error) {
    console.error('Invalid fallback token:', error)
    return null
  }
}

// Cliente-side: Guardar token
export function saveFallbackToken(token: string) {
  if (typeof window !== 'undefined') {
    // Guardar en localStorage para persistencia
    localStorage.setItem('padelyzer-fallback-token', token)
    // También en sessionStorage como respaldo
    sessionStorage.setItem('padelyzer-fallback-token', token)
  }
}

// Cliente-side: Obtener token
export function getFallbackToken(): string | null {
  if (typeof window === 'undefined') return null
  
  return (
    localStorage.getItem('padelyzer-fallback-token') ||
    sessionStorage.getItem('padelyzer-fallback-token')
  )
}

// Cliente-side: Limpiar token
export function clearFallbackToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('padelyzer-fallback-token')
    sessionStorage.removeItem('padelyzer-fallback-token')
  }
}

// Server-side: Obtener token del header
export function getFallbackTokenFromHeader(request: Request): string | null {
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  
  // También intentar obtener de un header personalizado
  return request.headers.get('x-fallback-token')
}