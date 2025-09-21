import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/config/prisma'
import { z } from 'zod'

const confirmPaymentSchema = z.object({
  registrationId: z.string(),
  paymentMethod: z.enum(['cash', 'terminal', 'transfer', 'card_direct', 'payment_link']),
  paymentReference: z.string().optional(),
  amount: z.number()
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tournamentId } = await params
    const body = await request.json()
    
    const validatedData = confirmPaymentSchema.parse(body)
    
    // Get tournament details
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: { Club: true }
    })
    
    if (!tournament) {
      return NextResponse.json(
        { success: false, error: 'Torneo no encontrado' },
        { status: 404 }
      )
    }

    // Get registration
    const registration = await prisma.TournamentRegistration.findUnique({
      where: { id: validatedData.registrationId }
    })

    if (!registration) {
      return NextResponse.json(
        { success: false, error: 'Inscripción no encontrada' },
        { status: 404 }
      )
    }

    // Validate payment method requires reference
    if ((validatedData.paymentMethod === 'transfer' || validatedData.paymentMethod === 'terminal') 
        && !validatedData.paymentReference?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Referencia de pago requerida para este método' },
        { status: 400 }
      )
    }

    // Update registration with payment confirmation
    const updatedRegistration = await prisma.TournamentRegistration.update({
      where: { id: validatedData.registrationId },
      data: {
        paymentStatus: 'completed',
        paymentMethod: validatedData.paymentMethod,
        paymentReference: validatedData.paymentReference,
        confirmed: true,
        paidAmount: validatedData.amount,
        paymentDate: new Date()
      }
    })


    // Create financial transaction
    await prisma.Transaction.create({
      data: {
        id: `transaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        clubId: tournament.clubId,
        type: 'INCOME',
        category: 'TOURNAMENT',
        amount: validatedData.amount,
        currency: tournament.currency || 'MXN',
        description: `Inscripción ${tournament.name} - ${registration.player1Name}${registration.player2Name ? ` & ${registration.player2Name}` : ''} (${validatedData.paymentMethod})`,
        date: new Date(),
        reference: validatedData.paymentReference,
        notes: `Torneo: ${tournamentId}, Registro: ${validatedData.registrationId}, Método: ${validatedData.paymentMethod}`,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      registration: updatedRegistration,
      message: 'Pago confirmado y registrado exitosamente'
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