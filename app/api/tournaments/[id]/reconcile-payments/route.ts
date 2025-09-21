import { NextRequest, NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'

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
    
    // Get all registrations with payment status
    const registrations = await prisma.tournamentRegistration.findMany({
      where: {
        tournamentId,
        paymentStatus: { not: 'completed' }
      }
    })
    
    // Get all payments for the tournament
    const payments = await prisma.payment.findMany({
      where: {
        tournamentId,
        status: 'completed'
      }
    })
    
    // Create a map of payments by registration ID
    const paymentMap = new Map()
    for (const payment of payments) {
      if (payment.metadata && typeof payment.metadata === 'object' && 'registrationId' in payment.metadata) {
        paymentMap.set((payment.metadata as any).registrationId, payment)
      }
    }
    
    // Reconcile payments
    let reconciled = 0
    for (const registration of registrations) {
      const payment = paymentMap.get(registration.id)
      
      if (payment) {
        // Update registration payment status
        await prisma.tournamentRegistration.update({
          where: { id: registration.id },
          data: {
            paymentStatus: 'completed',
            paidAmount: payment.amount,
            paymentDate: payment.createdAt,
            paymentMethod: payment.paymentMethod,
            confirmed: true
          }
        })
        reconciled++
      } else if (registration.paymentReference) {
        // Check if payment reference matches any external payment
        const externalPayment = await prisma.payment.findFirst({
          where: {
            reference: registration.paymentReference,
            tournamentId,
            status: 'completed'
          }
        })
        
        if (externalPayment) {
          await prisma.tournamentRegistration.update({
            where: { id: registration.id },
            data: {
              paymentStatus: 'completed',
              paidAmount: externalPayment.amount,
              paymentDate: externalPayment.createdAt,
              paymentMethod: externalPayment.paymentMethod,
              confirmed: true
            }
          })
          reconciled++
        }
      }
    }
    
    // Check for orphaned payments (payments without registrations)
    const orphanedPayments = []
    for (const payment of payments) {
      const metadata = payment.metadata as any
      if (!metadata?.registrationId || !registrations.find(r => r.id === metadata.registrationId)) {
        orphanedPayments.push({
          id: payment.id,
          amount: payment.amount,
          date: payment.createdAt,
          method: payment.paymentMethod,
          reference: payment.reference
        })
      }
    }
    
    return NextResponse.json({
      success: true,
      reconciled,
      orphanedPayments,
      message: `${reconciled} pagos conciliados exitosamente${orphanedPayments.length > 0 ? `. ${orphanedPayments.length} pagos huérfanos encontrados.` : ''}`
    })

  } catch (error) {
    console.error('Error reconciling payments:', error)
    return NextResponse.json(
      { success: false, error: 'Error al conciliar pagos' },
      { status: 500 }
    )
  }
}