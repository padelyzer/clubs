import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'
import { lucia, validateRequest } from '@/lib/auth/lucia'
import { cookies } from 'next/headers'
import { securityLogger } from '@/lib/auth/security-logger'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session) {
      await securityLogger.logAccessDenied(
        null,
        "Club switch",
        "No valid session"
      )
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { clubId } = await request.json()

    if (!clubId) {
      return NextResponse.json(
        { error: 'Club ID requerido' },
        { status: 400 }
      )
    }

    // Verificar que el club existe y está activo
    const club = await prisma.club.findUnique({
      where: { id: clubId },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        active: true
      }
    })

    if (!club || !club.active || club.status !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Club no válido' },
        { status: 400 }
      )
    }

    // Solo Super Admin puede cambiar entre clubs
    if (session.role !== 'SUPER_ADMIN') {
      // Verificar que el usuario pertenece a este club
      const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { clubId: true }
      })

      if (user?.clubId !== clubId) {
        await securityLogger.logAccessDenied(
          session.userId,
          `Club switch to ${clubId}`,
          "User doesn't belong to target club",
        )
        return NextResponse.json(
          { error: 'No tienes acceso a este club' },
          { status: 403 }
        )
      }
    }

    // Actualizar el clubId del usuario en la base de datos
    await prisma.user.update({
      where: { id: session.userId },
      data: { clubId: club.id }
    })

    // Invalidar sesión actual y crear una nueva
    const { session: currentSession } = await validateRequest()
    if (currentSession) {
      await lucia.invalidateSession(currentSession.id)
    }

    // Crear nueva sesión con el club actualizado
    const newSession = await lucia.createSession(session.userId, {})
    const sessionCookie = lucia.createSessionCookie(newSession.id)
    
    ;(await cookies()).set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    )

    await securityLogger.log({
      eventType: 'CLUB_SWITCH',
      severity: 'INFO',
      userId: session.userId,
      email: session.email,
      message: `User switched to club ${club.name} (${club.id})`,
      metadata: {
        fromClubId: session.clubId,
        toClubId: club.id,
        clubName: club.name,
        clubSlug: club.slug,
        userRole: session.role,
        newSessionId: newSession.id
      }
    })

    return NextResponse.json({
      success: true,
      club: {
        id: club.id,
        name: club.name,
        slug: club.slug
      },
      redirectUrl: `/c/${club.slug}/dashboard`
    })

  } catch (error) {
    console.error('Error switching club:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}