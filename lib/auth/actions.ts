'use server'

import { prisma } from "@/lib/config/prisma"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { lucia, validateRequest } from "./lucia"

// Export getSession as an async wrapper for backward compatibility
export async function getSession() {
  try {
    const { user, session } = await validateRequest()
    if (!user || !session) {
      return null
    }

    return {
      userId: user.id,
      userEmail: user.email,
      role: user.role,
      clubId: user.clubId,
      active: user.active
    }
  } catch (error) {
    console.error('getSession error:', error)
    return null
  }
}

// Export getCurrentUser for backward compatibility
export async function getCurrentUser() {
  try {
    const { user } = await validateRequest()
    return user
  } catch (error) {
    console.error('getCurrentUser error:', error)
    return null
  }
}

// Require functions for different roles
export async function requireClubStaff() {
  try {
    const { user, session } = await validateRequest()

    if (!user || !session) {
      redirect('/login')
    }

    // Check if user has club staff permissions
    if (user.role !== 'super_admin' && user.role !== 'club_admin' && user.role !== 'club_staff') {
      redirect('/unauthorized')
    }

    if (!user.active) {
      redirect('/inactive')
    }

    return {
      userId: user.id,
      userEmail: user.email,
      role: user.role,
      clubId: user.clubId,
      active: user.active
    }
  } catch (error) {
    console.error('requireClubStaff error:', error)
    redirect('/login')
  }
}

// Funciones de autenticación - Usa Lucia Auth
export async function requireAuth() {
  try {
    const { user, session } = await validateRequest()

    if (!user || !session) {
      redirect('/login')
    }

    return {
      userId: user.id,
      userEmail: user.email,
      role: user.role,
      clubId: user.clubId,
      active: user.active
    }
  } catch (error) {
    console.error('requireAuth error:', error)
    redirect('/login')
  }
}

// API-specific auth function that returns null instead of redirecting
export async function requireAuthAPI() {
  try {
    const { user, session } = await validateRequest()

    if (!user || !session) {
      return null
    }

    return {
      userId: user.id,
      userEmail: user.email,
      role: user.role,
      clubId: user.clubId,
      active: user.active
    }
  } catch (error) {
    console.error('requireAuthAPI error:', error)
    return null
  }
}

export async function requireSuperAdmin() {
  try {
    const session = await requireAuth()

    if (session.role !== 'SUPER_ADMIN') {
      redirect('/dashboard')
    }

    return session
  } catch (error) {
    console.error('requireSuperAdmin error:', error)
    redirect('/login')
  }
}

export async function requireStaffAuth() {
  try {
    const session = await requireAuth()

    if (!['CLUB_OWNER', 'CLUB_STAFF', 'SUPER_ADMIN'].includes(session.role)) {
      redirect('/login')
    }

    return session
  } catch (error) {
    console.error('requireStaffAuth error:', error)
    redirect('/login')
  }
}

// Logout function
export async function logoutAction() {
  try {
    const { session } = await validateRequest()

    if (session) {
      await lucia.invalidateSession(session.id)
    }

    const sessionCookie = lucia.createBlankSessionCookie()
    const cookiesStore = await cookies()

    cookiesStore.set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    )
  } catch (error) {
    console.error('Logout error:', error)
  }

  redirect('/login')
}