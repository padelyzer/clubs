import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/config/prisma'
import { paymentService } from '@/lib/services/payment-service'
import { z } from 'zod'

const registrationSchema = z.object({
  player1: z.object({
    name: z.string().min(1),
    email: z.string().email().optional(),
    phone: z.string().min(10),
    level: z.string().optional(),
  }),
  player2: z.object({
    name: z.string().min(1),
    email: z.string().email().optional(),
    phone: z.string().min(10),
    level: z.string().optional(),
  }),
  teamName: z.string().optional(),
  teamLevel: z.string().optional(),
  modality: z.string().optional(),
  category: z.string().optional(),
  paymentMethod: z.enum(['ONSITE', 'STRIPE', 'ONSITE_TERMINAL', 'TRANSFER', 'ONSITE_CASH']),
  paymentReference: z.string().optional(),
})

// POST - Register team for tournament
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tournamentId } = await params
    const body = await request.json()
    
    const validatedData = registrationSchema.parse(body)
    
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
    
    // Check if registration is open
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
    if (tournament.registrationEnd < now) {
      return NextResponse.json(
        { success: false, error: 'El periodo de inscripción ha terminado' },
        { status: 400 }
      )
    }
    
    // Create or find players
    let player1 = await prisma.player.findFirst({
      where: {
        clubId: tournament.clubId,
        phone: validatedData.player1.phone
      }
    })
    
    if (!player1) {
      player1 = await prisma.player.create({
        data: {
          clubId: tournament.clubId,
          name: validatedData.player1.name,
          email: validatedData.player1.email,
          phone: validatedData.player1.phone
        }
      })
    }
    
    let player2 = await prisma.player.findFirst({
      where: {
        clubId: tournament.clubId,
        phone: validatedData.player2.phone
      }
    })
    
    if (!player2) {
      player2 = await prisma.player.create({
        data: {
          clubId: tournament.clubId,
          name: validatedData.player2.name,
          email: validatedData.player2.email,
          phone: validatedData.player2.phone
        }
      })
    }
    
    // Check if either player is already registered
    const existingRegistration = await prisma.tournamentRegistration.findFirst({
      where: {
        tournamentId,
        OR: [
          { player1Id: player1.id },
          { player1Id: player2.id },
          { player2Id: player1.id },
          { player2Id: player2.id }
        ]
      }
    })
    
    if (existingRegistration) {
      return NextResponse.json(
        { success: false, error: 'Uno de los jugadores ya está inscrito en este torneo' },
        { status: 400 }
      )
    }
    
    // Generate partner ID to link team members
    const partnerId = `team_${Date.now()}`
    
    // Create registration
    const registration = await prisma.tournamentRegistration.create({
      data: {
        tournamentId,
        player1Id: player1.id,
        player1Name: player1.name,
        player1Email: player1.email,
        player1Phone: player1.phone,
        player1Level: validatedData.player1.level,
        player2Id: player2.id,
        player2Name: player2.name,
        player2Email: player2.email,
        player2Phone: player2.phone,
        player2Level: validatedData.player2.level,
        partnerId,
        teamName: validatedData.teamName,
        teamLevel: validatedData.teamLevel,
        modality: validatedData.modality,
        category: validatedData.category,
        paymentStatus: getPaymentStatus(validatedData.paymentMethod),
        paymentMethod: validatedData.paymentMethod,
        paymentReference: validatedData.paymentReference,
        confirmed: shouldConfirmImmediately(validatedData.paymentMethod),
        paidAmount: 0
      },
      include: {
        tournament: {
          include: {
            Club: true
          }
        }
      }
    })
    
    // If payment method is Stripe, create payment intent using the service
    if (validatedData.paymentMethod === 'STRIPE' && tournament.registrationFee > 0) {
      // Check payment configuration
      const paymentConfig = await paymentService.getPaymentConfig(tournament.clubId)
      const stripeProvider = paymentConfig.providers.find(p => p.providerId === 'stripe')
      
      if (!stripeProvider) {
        return NextResponse.json(
          { success: false, error: 'Pagos con tarjeta no disponibles' },
          { status: 400 }
        )
      }
      
      // Create payment intent using the service
      const paymentIntent = await paymentService.createPaymentIntent(tournament.clubId, {
        amount: tournament.registrationFee,
        currency: tournament.currency || 'MXN',
        description: `Inscripción Torneo: ${tournament.name}`,
        metadata: {
          type: 'tournament_registration',
          tournamentId: tournament.id,
          registrationId: registration.id,
          player1Name: player1.name,
          player2Name: player2.name,
          clubId: tournament.clubId
        }
      })
      
      if (!paymentIntent) {
        return NextResponse.json(
          { success: false, error: 'Error creando intención de pago' },
          { status: 500 }
        )
      }
      
      // Update registration with payment intent ID
      await prisma.tournamentRegistration.update({
        where: { id: registration.id },
        data: {
          stripePaymentIntentId: paymentIntent.id
        }
      })
      
      // Create tournament payment record
      await prisma.tournamentPayment.create({
        data: {
          id: `payment_${Date.now()}`,
          tournamentId,
          registrationId: registration.id,
          amount: tournament.registrationFee,
          currency: tournament.currency || 'MXN',
          method: 'STRIPE',
          status: 'pending',
          stripePaymentIntentId: paymentIntent.id
        }
      })
      
      return NextResponse.json({
        success: true,
        registration,
        paymentIntent: {
          clientSecret: paymentIntent.client_secret,
          amount: tournament.registrationFee,
          currency: tournament.currency || 'MXN'
        }
      })
    }
    
    // For onsite payment
    return NextResponse.json({
      success: true,
      registration,
      message: 'Inscripción registrada. Por favor realiza el pago en el club.'
    })
    
  } catch (error) {
    console.error('Error creating tournament registration:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Error al procesar inscripción' },
      { status: 500 }
    )
  }
}

// GET - Get tournament registrations
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tournamentId } = await params
    
    const registrations = await prisma.tournamentRegistration.findMany({
      where: { tournamentId },
      orderBy: [
        { confirmed: 'desc' },
        { createdAt: 'asc' }
      ]
    })
    
    return NextResponse.json({
      success: true,
      registrations
    })
    
  } catch (error) {
    console.error('Error fetching registrations:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener inscripciones' },
      { status: 500 }
    )
  }
}

// Helper functions for payment status logic
function getPaymentStatus(paymentMethod: string): string {
  switch (paymentMethod) {
    case 'STRIPE':
      return 'pending' // Will be updated via webhook
    case 'ONSITE_CASH':
      return 'pending' // Pending until paid at club
    case 'ONSITE_TERMINAL':
      return 'completed' // Confirmed with terminal receipt
    case 'TRANSFER':
      return 'completed' // Confirmed with transfer reference
    default:
      return 'pending'
  }
}

function shouldConfirmImmediately(paymentMethod: string): boolean {
  // Only confirm immediately if payment reference is provided (terminal/transfer)
  return paymentMethod === 'ONSITE_TERMINAL' || paymentMethod === 'TRANSFER'
}