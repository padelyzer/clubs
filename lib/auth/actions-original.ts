'use server'

import { prisma } from "@/lib/config/prisma"
import { verify } from "argon2"
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { authLogger } from "@/lib/utils/logger"
import { lucia, validateRequest } from "./lucia"
import { getSession as getSessionInternal, getCurrentUser as getCurrentUserInternal } from "./session"
import { securityLogger, SecurityEventType, SecuritySeverity } from "./security-logger"

// Export getSession as an async wrapper for backward compatibility
export async function getSession() {
  return getSessionInternal()
}

// Export getCurrentUser for backward compatibility
export async function getCurrentUser() {
  return getCurrentUserInternal()
}

// Server Action para login - Usa Lucia Auth
export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  authLogger.auth('login_attempt', undefined, { email })
  await securityLogger.logLoginAttempt(email)

  if (!email || !password) {
    await securityLogger.logLoginFailed(email, "Missing credentials")
    return {
      error: "Email y contraseña son requeridos"
    }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { Club: true }
    })

    if (!user || !user.password) {
      await securityLogger.logLoginFailed(email, "User not found")
      return {
        error: "Email o contraseña incorrectos"
      }
    }

    // Try Argon2 first (new), then bcrypt (legacy)
    let isPasswordValid = false
    
    // Check if it's an Argon2 hash (starts with $argon2)
    if (user.password.startsWith('$argon2')) {
      try {
        isPasswordValid = await verify(user.password, password)
      } catch (argon2Error) {
        isPasswordValid = false
      }
    }
    
    // If not Argon2 or failed, try bcrypt
    if (!isPasswordValid) {
      try {
        isPasswordValid = await bcrypt.compare(password, user.password)
      } catch (bcryptError) {
        isPasswordValid = false
      }
    }
    
    if (!isPasswordValid) {
      await securityLogger.logLoginFailed(email, "Invalid password", {
        userId: user.id,
        attempts: await checkRecentFailedAttempts(user.id)
      })
      
      // Verificar si hay demasiados intentos fallidos
      const patterns = await securityLogger.analyzeSecurityPatterns(user.id)
      if (patterns.shouldBlockUser) {
        await securityLogger.logSuspiciousActivity(
          user.id,
          "Too many failed login attempts",
          { failedAttempts: patterns.recentFailedLogins }
        )
      }
      
      return {
        error: "Email o contraseña incorrectos"
      }
    }

    if (!user.active) {
      await securityLogger.logLoginFailed(email, "Account disabled", {
        userId: user.id
      })
      return {
        error: "Cuenta desactivada. Contacta al administrador"
      }
    }

    // Crear sesión con Lucia
    const session = await lucia.createSession(user.id, {})
    const sessionCookie = lucia.createSessionCookie(session.id)
    
    ;(await cookies()).set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    )

    authLogger.auth('session_created', user.id, { email: user.email, role: user.role })
    await securityLogger.logLoginSuccess(user.id, user.email, {
      role: user.role,
      clubId: user.clubId,
      sessionId: session.id
    })
    
    // Redirigir directamente desde el server action
    if (user.role === 'SUPER_ADMIN') {
      redirect('/admin/dashboard')
    } else {
      // Obtener el slug del club para redirigir correctamente
      const club = await prisma.club.findUnique({
        where: { id: user.clubId },
        select: { slug: true }
      })
      
      if (club?.slug) {
        redirect(`/c/${club.slug}/dashboard`)
      } else {
        redirect('/dashboard') // Fallback
      }
    }

  } catch (error: any) {
    // Si es un redirect de Next.js, relanzarlo
    if (error?.digest?.startsWith('NEXT_REDIRECT')) {
      throw error
    }
    
    console.error('Login error:', error)
    await securityLogger.log({
      eventType: SecurityEventType.LOGIN_FAILED,
      severity: SecuritySeverity.ERROR,
      email,
      message: `Login error: ${error.message}`,
      metadata: { error: error.message }
    })
    
    return {
      error: "Error interno del servidor"
    }
  }
}

// Server Action para logout - Usa Lucia Auth
export async function logoutAction() {
  const { session, user } = await validateRequest()
  
  if (session && user) {
    await securityLogger.logLogout(user.id, user.email)
    await lucia.invalidateSession(session.id)
    
    const sessionCookie = lucia.createBlankSessionCookie()
    ;(await cookies()).set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    )
  }
  
  redirect('/login')
}

// Funciones de autenticación - Usa Lucia Auth
export async function requireAuth() {
  const { user, session } = await validateRequest()
  
  if (!user || !session) {
    await securityLogger.logAccessDenied(
      null,
      "Protected route",
      "No valid session"
    )
    redirect('/login')
  }
  
  // Return in the expected format for backward compatibility
  return {
    userId: user.id,
    clubId: user.clubId,
    email: user.email,
    name: user.name || user.email,
    role: user.role,
    active: user.active
  }
}

// API-specific auth function that returns null instead of redirecting
export async function requireAuthAPI() {
  try {
    const { user, session } = await validateRequest()
    
    if (!user || !session) {
      await securityLogger.logAccessDenied(
        null,
        "Protected API route",
        "No valid session"
      )
      return null
    }
    
    // Return in the expected format for backward compatibility
    return {
      userId: user.id,
      clubId: user.clubId,
      email: user.email,
      name: user.name || user.email,
      role: user.role,
      active: user.active
    }
  } catch (error) {
    console.error('Auth validation error:', error)
    return null
  }
}

export async function requireSuperAdmin() {
  const session = await requireAuth()
  
  if (session.role !== 'SUPER_ADMIN') {
    await securityLogger.logAccessDenied(
      session.userId,
      "Super Admin area",
      "Insufficient permissions"
    )
    redirect('/dashboard')
  }
  
  return session
}

export async function requireStaffAuth() {
  const session = await requireAuth()
  
  if (!['CLUB_OWNER', 'CLUB_STAFF', 'SUPER_ADMIN'].includes(session.role)) {
    await securityLogger.logAccessDenied(
      session.userId,
      "Staff area",
      `Role ${session.role} not allowed`
    )
    redirect('/login')
  }
  
  return session
}

// Helper para verificar intentos fallidos recientes
async function checkRecentFailedAttempts(userId: string): Promise<number> {
  const patterns = await securityLogger.analyzeSecurityPatterns(userId)
  return patterns.recentFailedLogins
}

// Alias for backward compatibility
export const requireClubStaff = requireStaffAuth