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
      },
      include: {
        Club: true
      }
    })
    
    if (!tournament) {
      return NextResponse.json(
        { success: false, error: 'Torneo no encontrado' },
        { status: 404 }
      )
    }
    
    // Get all completed payments for the tournament
    const registrations = await prisma.tournamentRegistration.findMany({
      where: {
        tournamentId,
        paymentStatus: 'completed'
      },
      include: {
        player1: true,
        player2: true
      }
    })
    
    if (registrations.length === 0) {
      return NextResponse.json({
        success: true,
        count: 0,
        message: 'No hay pagos completados para generar facturas'
      })
    }
    
    // Generate invoices for each paid registration
    const invoices = []
    
    for (const registration of registrations) {
      // Check if invoice already exists
      const existingInvoice = await prisma.invoice.findFirst({
        where: {
          clubId: session.clubId,
          metadata: {
            path: ['tournamentId'],
            equals: tournamentId
          },
          customerId: registration.player1Id
        }
      })
      
      if (!existingInvoice) {
        const invoiceNumber = `INV-${tournament.name.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`
        
        const invoice = await prisma.invoice.create({
          data: {
            clubId: session.clubId,
            invoiceNumber,
            customerId: registration.player1Id,
            customerName: registration.player1Name,
            customerEmail: registration.player1Email || '',
            customerPhone: registration.player1Phone,
            issueDate: new Date(),
            dueDate: new Date(),
            status: 'paid',
            subtotal: registration.paidAmount || tournament.registrationFee,
            tax: 0,
            total: registration.paidAmount || tournament.registrationFee,
            currency: tournament.currency,
            items: {
              create: {
                description: `Inscripción al torneo ${tournament.name}`,
                quantity: 1,
                unitPrice: registration.paidAmount || tournament.registrationFee,
                total: registration.paidAmount || tournament.registrationFee
              }
            },
            metadata: {
              tournamentId,
              registrationId: registration.id,
              tournamentName: tournament.name
            },
            notes: `Factura generada para la inscripción al torneo ${tournament.name}`
          }
        })
        
        invoices.push(invoice)
      }
    }
    
    // Generate summary invoice for the club (for accounting purposes)
    if (invoices.length > 0) {
      const totalAmount = registrations.reduce((sum, r) => sum + (r.paidAmount || tournament.registrationFee), 0)
      
      const summaryInvoice = await prisma.invoice.create({
        data: {
          clubId: session.clubId,
          invoiceNumber: `SUMM-${tournament.name.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`,
          customerName: tournament.Club.name,
          customerEmail: tournament.Club.email,
          customerPhone: tournament.Club.phone || '',
          issueDate: new Date(),
          dueDate: new Date(),
          status: 'paid',
          subtotal: totalAmount,
          tax: 0,
          total: totalAmount,
          currency: tournament.currency,
          items: {
            create: {
              description: `Resumen de inscripciones - Torneo ${tournament.name}`,
              quantity: registrations.length,
              unitPrice: tournament.registrationFee,
              total: totalAmount
            }
          },
          metadata: {
            tournamentId,
            type: 'summary',
            tournamentName: tournament.name,
            registrationCount: registrations.length
          },
          notes: `Factura resumen del torneo ${tournament.name} - ${registrations.length} inscripciones`
        }
      })
      
      invoices.push(summaryInvoice)
    }
    
    return NextResponse.json({
      success: true,
      count: invoices.length,
      invoices: invoices.map(inv => ({
        id: inv.id,
        number: inv.invoiceNumber,
        customer: inv.customerName,
        amount: inv.total
      })),
      message: `${invoices.length} facturas generadas exitosamente`
    })

  } catch (error) {
    console.error('Error generating invoices:', error)
    return NextResponse.json(
      { success: false, error: 'Error al generar facturas' },
      { status: 500 }
    )
  }
}