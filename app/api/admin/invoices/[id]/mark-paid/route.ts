import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Verify super admin access
    await requireSuperAdmin()

    const invoiceId = id

    if (!invoiceId) {
      return NextResponse.json(
        { error: 'ID de factura requerido' },
        { status: 400 }
      )
    }

    // Get invoice to verify it exists and is in correct status
    const invoice = await prisma.subscriptionInvoice.findUnique({
      where: { id: invoiceId },
      include: {
        club: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        subscription: {
          select: {
            id: true,
            status: true,
            plan: {
              select: {
                displayName: true
              }
            }
          }
        }
      }
    })

    if (!invoice) {
      return NextResponse.json(
        { error: 'Factura no encontrada' },
        { status: 404 }
      )
    }

    if (invoice.status === 'PAID') {
      return NextResponse.json(
        { error: 'La factura ya está marcada como pagada' },
        { status: 400 }
      )
    }

    if (invoice.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'No se puede marcar como pagada una factura cancelada' },
        { status: 400 }
      )
    }

    // Update invoice status to paid
    const updatedInvoice = await prisma.subscriptionInvoice.update({
      where: { id: invoiceId },
      data: {
        status: 'PAID',
        paidAt: new Date()
      },
      include: {
        club: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        subscription: {
          select: {
            id: true,
            status: true,
            plan: {
              select: {
                displayName: true
              }
            }
          }
        }
      }
    })

    // If the subscription is past due and this payment brings it current, 
    // we might want to update the subscription status
    if (invoice.subscription.status === 'PAST_DUE') {
      await prisma.clubSubscription.update({
        where: { id: invoice.subscription.id },
        data: {
          status: 'ACTIVE'
        }
      })
    }

    console.log(`Invoice ${invoice.invoiceNumber} marked as paid for ${invoice.club.name}`)

    // In a real implementation, you might also:
    // 1. Send confirmation email to the club
    // 2. Update accounting records
    // 3. Trigger webhook notifications
    // 4. Create payment record for tracking

    return NextResponse.json({
      success: true,
      message: `Factura ${invoice.invoiceNumber} marcada como pagada exitosamente`,
      invoice: {
        id: updatedInvoice.id,
        invoiceNumber: updatedInvoice.invoiceNumber,
        status: updatedInvoice.status,
        paidAt: updatedInvoice.paidAt,
        total: updatedInvoice.total,
        clubName: updatedInvoice.club.name,
        clubEmail: updatedInvoice.club.email
      }
    })

  } catch (error) {
    console.error('Error marking invoice as paid:', error)
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'No tienes permisos para realizar esta acción' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Error interno del servidor al marcar la factura como pagada' },
      { status: 500 }
    )
  }
}