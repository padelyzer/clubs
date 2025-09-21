import { NextRequest, NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'
import { z } from 'zod'

const refundSchema = z.object({
  registrationId: z.string().cuid(),
  reason: z.string().optional(),
  amount: z.number().optional() // Optional partial refund amount
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuthAPI()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    const { id: tournamentId } = await params
    const body = await request.json()
    
    const validatedData = refundSchema.parse(body)
    
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
    
    if (registration.paymentStatus !== 'completed') {
      return NextResponse.json(
        { success: false, error: 'No se puede reembolsar un pago no completado' },
        { status: 400 }
      )
    }
    
    // Calculate refund amount
    const refundAmount = validatedData.amount || registration.paidAmount || tournament.registrationFee
    
    // Get the original payment
    const originalPayment = await prisma.payment.findFirst({
      where: {
        tournamentId,
        metadata: {
          path: ['registrationId'],
          equals: validatedData.registrationId
        },
        status: 'completed'
      }
    })
    
    // Process refund based on payment method
    let refundStatus = 'pending'
    let refundReference = null
    
    if (originalPayment) {
      if (originalPayment.paymentMethod === 'stripe') {
        // TODO: Integrate with Stripe for actual refund
        // For now, just mark as pending
        refundStatus = 'pending'
        refundReference = `REFUND-${Date.now()}`
      } else if (originalPayment.paymentMethod === 'cash' || originalPayment.paymentMethod === 'transfer') {
        // Manual refund - mark as processing
        refundStatus = 'processing'
        refundReference = `MANUAL-REFUND-${Date.now()}`
      }
    }
    
    // Create refund record
    const refund = await prisma.refund.create({
      data: {
        clubId: session.clubId,
        paymentId: originalPayment?.id,
        amount: refundAmount,
        currency: tournament.currency,
        reason: validatedData.reason || 'Reembolso de inscripción al torneo',
        status: refundStatus as any,
        refundMethod: originalPayment?.paymentMethod || 'manual',
        refundReference,
        metadata: {
          tournamentId,
          registrationId: validatedData.registrationId,
          tournamentName: tournament.name
        }
      }
    })
    
    // Update registration status
    await prisma.tournamentRegistration.update({
      where: { id: validatedData.registrationId },
      data: {
        paymentStatus: 'refunded',
        confirmed: false,
        notes: `Reembolsado el ${new Date().toLocaleDateString()}. ${validatedData.reason || ''}`
      }
    })
    
    // Create financial transaction
    await prisma.financialTransaction.create({
      data: {
        clubId: session.clubId,
        type: 'expense',
        category: 'refund',
        amount: refundAmount,
        currency: tournament.currency,
        description: `Reembolso de inscripción - ${tournament.name}`,
        date: new Date(),
        reference: refundReference || undefined,
        metadata: {
          tournamentId,
          registrationId: validatedData.registrationId,
          refundId: refund.id
        }
      }
    })
    
    return NextResponse.json({
      success: true,
      refund: {
        id: refund.id,
        amount: refundAmount,
        status: refundStatus,
        reference: refundReference
      },
      message: `Reembolso de ${refundAmount} ${tournament.currency} procesado exitosamente`
    })

  } catch (error) {
    console.error('Error processing refund:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Error al procesar reembolso' },
      { status: 500 }
    )
  }
}