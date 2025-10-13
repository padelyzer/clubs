import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'
import { ClubAdminIntegrationService } from '@/lib/services/club-admin-integration'
import { auditSuccess, auditFailure, AuditActions } from '@/lib/security/audit'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const paramData = await params
  const { id } = paramData

  try {
    const session = await requireSuperAdmin()
    
    // Validate club exists and is pending
    const club = await prisma.club.findUnique({
      where: { id: id }
    })
    
    if (!club) {
      await auditFailure(
        request,
        AuditActions.CLUB_APPROVED,
        'club',
        id,
        'Club no encontrado',
        undefined,
        session.userId
      )
      
      return NextResponse.json(
        { error: 'Club no encontrado' },
        { status: 404 }
      )
    }
    
    if (club.status !== 'PENDING') {
      await auditFailure(
        request,
        AuditActions.CLUB_APPROVED,
        'club',
        id,
        'Solo se pueden aprobar clubes pendientes',
        { currentStatus: club.status },
        session.userId
      )
      
      return NextResponse.json(
        { error: 'Solo se pueden aprobar clubes pendientes' },
        { status: 400 }
      )
    }
    
    // Get optional plan ID from request body
    const body = await request.json().catch(() => ({}))
    const planId = body.planId
    
    // Approve club with integration service
    const result = await ClubAdminIntegrationService.approveClub({
      clubId: id,
      approvedBy: session.userId,
      planId
    })
    
    // Audit success
    await auditSuccess(
      request,
      AuditActions.CLUB_APPROVED,
      'club',
      id,
      {
        clubName: club.name,
        subscriptionId: result.subscription.id,
        planId: result.subscription.planId
      },
      session.userId
    )
    
    return NextResponse.json({
      success: true,
      club: result.club,
      subscription: result.subscription
    })
    
  } catch (error) {
    console.error('Error approving club:', error)
    
    await auditFailure(
      request,
      AuditActions.CLUB_APPROVED,
      'club',
      id,
      error instanceof Error ? error.message : 'Error desconocido',
      undefined,
      undefined
    )
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}