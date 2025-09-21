import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/config/prisma'
import { paymentService } from '@/lib/services/payment-service'
import { z } from 'zod'

const paymentLinkSchema = z.object({
  player1Name: z.string().min(1),
  player1Email: z.string().email().optional(),
  player1Phone: z.string().min(10),
  player2Name: z.string().min(1),
  player2Email: z.string().email().optional(),
  player2Phone: z.string().min(10),
  teamName: z.string().optional(),
  expiresInMinutes: z.number().min(10).max(10080).optional().default(1440) // Default 24 hours
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const tournamentId = id
    const body = await request.json()
    
    const validatedData = paymentLinkSchema.parse(body)
    
    // Get tournament details
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        Club: true,
        _count: {
          select: {
            TournamentRegistration: {
              where: { confirmed: true }
            }
          }
        }
      }
    })
    
    if (!tournament) {
      return NextResponse.json(
        { success: false, error: 'Torneo no encontrado' },
        { status: 404 }
      )
    }
    
    // Validate tournament status
    if (tournament.status !== 'REGISTRATION_OPEN') {
      return NextResponse.json(
        { success: false, error: 'Las inscripciones no están abiertas' },
        { status: 400 }
      )
    }
    
    // Check if tournament is full
    if (tournament._count.TournamentRegistration >= tournament.maxPlayers) {
      return NextResponse.json(
        { success: false, error: 'El torneo está lleno' },
        { status: 400 }
      )
    }
    
    // Check if registration deadline has passed
    const now = new Date()
    if (tournament.registrationEnd && tournament.registrationEnd < now) {
      return NextResponse.json(
        { success: false, error: 'El periodo de inscripción ha terminado' },
        { status: 400 }
      )
    }

    // Check if registration fee exists
    if (!tournament.registrationFee || tournament.registrationFee <= 0) {
      return NextResponse.json(
        { success: false, error: 'Este torneo no requiere pago online' },
        { status: 400 }
      )
    }
    
    // Check if players are already registered
    const existingPlayer1 = await prisma.player.findFirst({
      where: {
        clubId: tournament.clubId,
        phone: validatedData.player1Phone
      }
    })
    
    const existingPlayer2 = await prisma.player.findFirst({
      where: {
        clubId: tournament.clubId,
        phone: validatedData.player2Phone
      }
    })

    // Check for existing registrations
    if (existingPlayer1 || existingPlayer2) {
      const existingRegistration = await prisma.tournamentRegistration.findFirst({
        where: {
          tournamentId,
          OR: [
            { player1Id: existingPlayer1?.id },
            { player1Id: existingPlayer2?.id },
            { player2Id: existingPlayer1?.id },
            { player2Id: existingPlayer2?.id }
          ]
        }
      })
      
      if (existingRegistration) {
        return NextResponse.json(
          { success: false, error: 'Uno de los jugadores ya está inscrito en este torneo' },
          { status: 400 }
        )
      }
    }

    // Check payment configuration
    const paymentConfig = await paymentService.getPaymentConfig(tournament.clubId)
    const stripeProvider = paymentConfig.providers.find(p => p.providerId === 'stripe')
    
    if (!stripeProvider) {
      return NextResponse.json(
        { success: false, error: 'Pagos online no disponibles para este torneo' },
        { status: 400 }
      )
    }

    // Create pending registration record for tracking
    const registrationId = `reg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Create payment link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const successUrl = `${baseUrl}/tournament/${tournament.id}/payment-success?registration=${registrationId}`
    const cancelUrl = `${baseUrl}/tournament/${tournament.id}/register?cancelled=true`

    const paymentLink = await paymentService.createPaymentLink(tournament.clubId, {
      amount: tournament.registrationFee,
      currency: tournament.currency || 'MXN',
      description: `Inscripción ${tournament.name}`,
      metadata: {
        type: 'tournament_registration',
        tournamentId: tournament.id,
        registrationId,
        player1Name: validatedData.player1Name,
        player1Phone: validatedData.player1Phone,
        player1Email: validatedData.player1Email || '',
        player2Name: validatedData.player2Name,
        player2Phone: validatedData.player2Phone,
        player2Email: validatedData.player2Email || '',
        teamName: validatedData.teamName || '',
        clubId: tournament.clubId
      },
      successUrl,
      cancelUrl,
      expiresAfter: validatedData.expiresInMinutes
    })

    if (!paymentLink) {
      return NextResponse.json(
        { success: false, error: 'Error al generar link de pago' },
        { status: 500 }
      )
    }

    // Store payment link reference in database
    await prisma.tournamentPayment.create({
      data: {
        id: registrationId,
        tournamentId: tournament.id,
        amount: tournament.registrationFee,
        currency: tournament.currency || 'MXN',
        method: 'STRIPE_LINK',
        status: 'pending',
        metadata: {
          paymentLink: paymentLink,
          player1Name: validatedData.player1Name,
          player1Phone: validatedData.player1Phone,
          player1Email: validatedData.player1Email,
          player2Name: validatedData.player2Name,
          player2Phone: validatedData.player2Phone,
          player2Email: validatedData.player2Email,
          teamName: validatedData.teamName,
          expiresAt: new Date(Date.now() + validatedData.expiresInMinutes * 60 * 1000).toISOString()
        }
      }
    })

    // Calculate fees for transparency
    const fees = await paymentService.calculateFees(tournament.clubId, tournament.registrationFee, 'STRIPE')

    return NextResponse.json({
      success: true,
      data: {
        paymentLink,
        registrationId,
        amount: tournament.registrationFee,
        currency: tournament.currency || 'MXN',
        fees: {
          processing: fees.processingFee,
          platform: fees.platformFee,
          total: fees.total
        },
        tournament: {
          id: tournament.id,
          name: tournament.name,
          registrationFee: tournament.registrationFee,
          currency: tournament.currency || 'MXN'
        },
        expiresAt: new Date(Date.now() + validatedData.expiresInMinutes * 60 * 1000),
        players: {
          player1: {
            name: validatedData.player1Name,
            phone: validatedData.player1Phone,
            email: validatedData.player1Email
          },
          player2: {
            name: validatedData.player2Name,
            phone: validatedData.player2Phone,
            email: validatedData.player2Email
          },
          teamName: validatedData.teamName
        }
      }
    })
    
  } catch (error) {
    console.error('Error creating tournament payment link:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Error al crear link de pago' },
      { status: 500 }
    )
  }
}

// GET - Get payment link status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const url = new URL(request.url)
    const registrationId = url.searchParams.get('registrationId')
    
    if (!registrationId) {
      return NextResponse.json(
        { success: false, error: 'Registration ID requerido' },
        { status: 400 }
      )
    }

    const payment = await prisma.tournamentPayment.findUnique({
      where: { id: registrationId },
      include: {
        tournament: {
          select: {
            id: true,
            name: true,
            registrationFee: true,
            currency: true
          }
        }
      }
    })

    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Pago no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        method: payment.method,
        createdAt: payment.createdAt,
        tournament: payment.tournament,
        metadata: payment.metadata,
        // Check if link has expired
        expired: payment.metadata && 
          typeof payment.metadata === 'object' && 
          'expiresAt' in payment.metadata &&
          new Date(payment.metadata.expiresAt as string) < new Date()
      }
    })
    
  } catch (error) {
    console.error('Error getting payment link status:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener estado del pago' },
      { status: 500 }
    )
  }
}