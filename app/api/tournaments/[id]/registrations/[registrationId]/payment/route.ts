import { NextRequest, NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'
import { z } from 'zod'

const paymentUpdateSchema = z.object({
  paymentStatus: z.enum(['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded']),
  paidAmount: z.number().min(0),
  paymentMethod: z.enum(['cash', 'card', 'transfer']).optional(),
  paymentReference: z.string().optional(),
  paymentDate: z.string().optional()
})

// POST - Update payment for a registration
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string, registrationId: string }> }
) {
  try {
    const session = await requireAuthAPI()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    if (!session?.clubId) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { id: tournamentId, registrationId } = await params
    const body = await request.json()
    
    // Validate input
    const validatedData = paymentUpdateSchema.parse(body)

    // Check tournament belongs to club
    const tournament = await prisma.tournament.findFirst({
      where: {
        id: tournamentId,
        clubId: session.user.clubId
      }
    })

    if (!tournament) {
      return NextResponse.json(
        { success: false, error: 'Torneo no encontrado' },
        { status: 404 }
      )
    }

    // Update registration payment
    const registration = await prisma.tournamentRegistration.update({
      where: { id: registrationId },
      data: {
        paymentStatus: validatedData.paymentStatus,
        paidAmount: validatedData.paidAmount,
        paymentMethod: validatedData.paymentMethod,
        paymentReference: validatedData.paymentReference,
        paymentDate: validatedData.paymentDate ? new Date(validatedData.paymentDate) : new Date(),
        confirmed: validatedData.paymentStatus === 'completed'
      }
    })

    return NextResponse.json({
      success: true,
      registration
    })

  } catch (error) {
    console.error('Error updating payment:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Error al actualizar pago' },
      { status: 500 }
    )
  }
}