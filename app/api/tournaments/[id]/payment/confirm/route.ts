import { NextRequest, NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'
import { z } from 'zod'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
})

const confirmPaymentSchema = z.object({
  registrationId: z.string().cuid(),
  paymentMethod: z.enum(['ONSITE', 'TRANSFER', 'STRIPE']),
  paymentReference: z.string().optional(),
  amount: z.number().int().positive(),
  notes: z.string().optional()
})

// POST - Confirm tournament payment (admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const session = await requireAuthAPI()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    const tournamentId = id
    const body = await request.json()
    
    const validatedData = confirmPaymentSchema.parse(body)
    
    // Verify tournament belongs to club
    const tournament = await prisma.tournament.findFirst({
      where: {
        id: tournamentId,
        clubId: session.clubId
      }
    })
    
    if (!tournament) {
      return NextResponse.json(
        { success: false, error: 'Torneo no encontrado' },
        { status: 404 }
      )
    }
    
    // Get registration
    const registration = await prisma.tournamentRegistration.findFirst({
      where: {
        id: validatedData.registrationId,
        tournamentId
      }
    })
    
    if (!registration) {
      return NextResponse.json(
        { success: false, error: 'Inscripción no encontrada' },
        { status: 404 }
      )
    }
    
    // If registration already confirmed
    if (registration.confirmed && registration.paymentStatus === 'completed') {
      return NextResponse.json(
        { success: false, error: 'Esta inscripción ya está confirmada' },
        { status: 400 }
      )
    }
    
    // Update registration
    const updatedRegistration = await prisma.tournamentRegistration.update({
      where: { id: validatedData.registrationId },
      data: {
        paymentStatus: 'completed',
        paymentMethod: validatedData.paymentMethod,
        paymentReference: validatedData.paymentReference,
        paidAmount: validatedData.amount,
        paidAt: new Date(),
        confirmed: true
      }
    })
    
    // Create payment record
    await prisma.$executeRaw`
      INSERT INTO "TournamentPayment" (
        id, "tournamentId", "registrationId", amount, currency, 
        method, status, reference, notes, "completedAt", "createdAt", "updatedAt"
      ) VALUES (
        ${`payment_${Date.now()}`},
        ${tournamentId},
        ${validatedData.registrationId},
        ${validatedData.amount},
        ${tournament.currency || 'MXN'},
        ${validatedData.paymentMethod},
        'completed',
        ${validatedData.paymentReference || null},
        ${validatedData.notes || null},
        NOW(),
        NOW(),
        NOW()
      )
    `
    
    // Create financial transaction
    await prisma.transaction.create({
      data: {
        clubId: session.clubId,
        type: 'INCOME',
        category: 'TOURNAMENT',
        amount: validatedData.amount,
        currency: tournament.currency || 'MXN',
        description: `Inscripción Torneo: ${tournament.name} - ${registration.player1Name} & ${registration.player2Name}`,
        reference: validatedData.paymentReference,
        date: new Date(),
        createdBy: session.userId,
        notes: validatedData.notes
      }
    })
    
    return NextResponse.json({
      success: true,
      registration: updatedRegistration,
      message: 'Pago confirmado exitosamente'
    })
    
  } catch (error) {
    console.error('Error confirming payment:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Error al confirmar pago' },
      { status: 500 }
    )
  }
}

// POST - Handle Stripe webhook for automatic payment confirmation
// NOTA: Esta función debe moverse a un archivo separado de webhook
// TODO: Crear /app/api/webhooks/stripe/tournament-payment/route.ts
/*
async function webhook(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!
  
  let event: Stripe.Event
  
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }
  
  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      
      // Get registration from metadata
      const registrationId = paymentIntent.metadata.registrationId
      const tournamentId = paymentIntent.metadata.tournamentId
      
      if (registrationId && tournamentId) {
        // Update registration
        await prisma.tournamentRegistration.update({
          where: { id: registrationId },
          data: {
            paymentStatus: 'completed',
            paidAmount: paymentIntent.amount,
            paidAt: new Date(),
            confirmed: true,
            stripePaymentIntentId: paymentIntent.id
          }
        })
        
        // Update payment record
        await prisma.$executeRaw`
          UPDATE "TournamentPayment" 
          SET status = 'completed',
              "stripeChargeId" = ${paymentIntent.latest_charge as string},
              "completedAt" = NOW(),
              "updatedAt" = NOW()
          WHERE "stripePaymentIntentId" = ${paymentIntent.id}
        `
        
        // Create transaction record
        await prisma.transaction.create({
          data: {
            clubId: paymentIntent.metadata.clubId,
            type: 'INCOME',
            category: 'TOURNAMENT',
            amount: paymentIntent.amount,
            currency: paymentIntent.currency.toUpperCase(),
            description: `Inscripción Torneo (Stripe): ${paymentIntent.metadata.player1Name} & ${paymentIntent.metadata.player2Name}`,
            reference: paymentIntent.id,
            date: new Date()
          }
        })
      }
      break
      
    case 'payment_intent.payment_failed':
      const failedIntent = event.data.object as Stripe.PaymentIntent
      const failedRegistrationId = failedIntent.metadata.registrationId
      
      if (failedRegistrationId) {
        await prisma.tournamentRegistration.update({
          where: { id: failedRegistrationId },
          data: {
            paymentStatus: 'failed'
          }
        })
        
        await prisma.$executeRaw`
          UPDATE "TournamentPayment" 
          SET status = 'failed',
              "updatedAt" = NOW()
          WHERE "stripePaymentIntentId" = ${failedIntent.id}
        `
      }
      break
  }
  
  return NextResponse.json({ received: true })
}
}
*/
