import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'
import { lucia, validateRequest } from '@/lib/auth/lucia'
import { cookies } from 'next/headers'
import { securityLogger } from '@/lib/auth/security-logger'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params in Next.js 15
    const paramData = await params
    const { id } = paramData
    
    console.log('Accessing club with ID:', id)
    
    // Verificar que el usuario es Super Admin
    const session = await getSession()
    
    console.log('Session:', session)
    
    if (!session || session.role !== 'SUPER_ADMIN') {
      await securityLogger.logAccessDenied(
        session?.userId || null,
        `Super Admin club access ${id}`,
        session ? 'Insufficient permissions' : 'No valid session'
      )
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Obtener el club
    const club = await prisma.club.findUnique({
      where: { id: id }
    })
    
    console.log('Club found:', club?.name)

    if (!club) {
      return NextResponse.json(
        { error: 'Club no encontrado' },
        { status: 404 }
      )
    }

    if (club.status !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Solo puedes acceder a clubs aprobados' },
        { status: 400 }
      )
    }
    
    // Buscar usuarios del club
    const users = await prisma.user.findMany({
      where: {
        clubId: club.id,
        role: 'CLUB_OWNER',
        active: true
      },
      take: 1
    })

    // Buscar el usuario owner del club
    let clubOwner = users[0]

    // Si no hay owner, crear uno temporal para el super admin
    if (!clubOwner) {
      // Buscar si ya existe un owner para este club
      clubOwner = await prisma.user.findFirst({
        where: {
          clubId: club.id,
          role: 'CLUB_OWNER'
        }
      })

      // Si no existe, crear uno temporal
      if (!clubOwner) {
        const bcrypt = await import('bcryptjs')
        const tempPassword = await bcrypt.hash(`temp_${club.id}_${Date.now()}`, 10)
        
        clubOwner = await prisma.user.create({
          data: {
            email: `admin_access_${club.id}@padelyzer.temp`,
            name: `Super Admin Access - ${club.name}`,
            password: tempPassword,
            role: 'CLUB_OWNER',
            clubId: club.id,
            active: true,
            emailVerified: new Date()
          }
        })
      }
    }

    // Invalidar sesión actual si existe
    const { session: currentSession } = await validateRequest()
    if (currentSession) {
      await lucia.invalidateSession(currentSession.id)
    }

    // Crear nueva sesión con Lucia para el owner del club
    const newSession = await lucia.createSession(clubOwner.id, {
      // Metadata adicional para auditoría
      superAdminAccess: true,
      originalAdminId: session.userId,
      originalAdminEmail: session.email,
      accessedAt: new Date().toISOString()
    })

    const sessionCookie = lucia.createSessionCookie(newSession.id)
    
    ;(await cookies()).set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    )

    // Log de auditoría con SecurityLogger
    await securityLogger.log({
      eventType: 'CLUB_ACCESS',
      severity: 'WARNING', // Esta es una acción sensible
      userId: session.userId,
      email: session.email,
      message: `Super Admin accessed club ${club.name} (${club.id})`,
      metadata: {
        action: 'super_admin_club_access',
        clubId: club.id,
        clubName: club.name,
        clubSlug: club.slug,
        targetUserId: clubOwner.id,
        targetUserEmail: clubOwner.email,
        sessionId: newSession.id,
        accessedAt: new Date().toISOString()
      }
    })

    // Redirigir al dashboard del club con la nueva estructura
    return NextResponse.redirect(new URL(`/c/${club.slug}/dashboard`, request.url))

  } catch (error) {
    console.error('Error al acceder al panel del club:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Endpoint para restaurar la sesión original del Super Admin
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { session } = await validateRequest()
    
    if (!session) {
      await securityLogger.logAccessDenied(
        null,
        "End super admin access",
        "No valid session"
      )
      return NextResponse.json(
        { error: 'No hay sesión activa' },
        { status: 401 }
      )
    }

    // Log de finalización de acceso
    await securityLogger.log({
      eventType: 'SESSION_INVALIDATED',
      severity: 'INFO',
      userId: session.userId,
      message: `Super admin ended club access session`,
      metadata: {
        sessionId: session.id,
        action: 'end_super_admin_club_access'
      }
    })

    // Invalidar sesión actual
    await lucia.invalidateSession(session.id)
    
    // Limpiar cookie
    const sessionCookie = lucia.createBlankSessionCookie()
    ;(await cookies()).set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    )

    return NextResponse.json({
      success: true,
      message: 'Sesión terminada. Por favor, inicie sesión nuevamente.'
    })

  } catch (error) {
    console.error('Error al restaurar sesión:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}