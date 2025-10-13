import { NextRequest, NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'
import { z } from 'zod'

// Validation schemas
const createInvoiceSchema = z.object({
  invoiceNumber: z.string().min(1).max(100),
  invoiceDate: z.string(),
  issuerRfc: z.string().optional(),
  receiverRfc: z.string().optional(),
  amount: z.number().min(0),
  tax: z.number().min(0).default(0),
  total: z.number().min(0),
  currency: z.string().default('MXN'),
  pdfUrl: z.string().optional(),
  xmlUrl: z.string().optional(),
  notes: z.string().optional(),
  transactionIds: z.array(z.string()).optional() // Link to transactions
})

const updateInvoiceSchema = z.object({
  status: z.enum(['valid', 'cancelled']).optional(),
  pdfUrl: z.string().optional(),
  xmlUrl: z.string().optional(),
  notes: z.string().optional(),
  transactionIds: z.array(z.string()).optional()
})

// GET - Retrieve invoices (using SubscriptionInvoice model)
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuthAPI()

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    const { searchParams } = new URL(request.url)

    const status = searchParams.get('status')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {
      clubId: session.clubId
    }

    // Status filter
    if (status) {
      where.status = status
    }

    // Date filtering
    if (startDate && endDate) {
      where.dueDate = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    // Get invoices
    const [invoices, total, summary] = await Promise.all([
      prisma.subscriptionInvoice.findMany({
        where,
        orderBy: {
          dueDate: 'desc'
        },
        take: limit,
        skip: offset
      }),
      prisma.subscriptionInvoice.count({ where }),
      // Get summary statistics
      prisma.subscriptionInvoice.aggregate({
        where,
        _sum: {
          amount: true,
          tax: true,
          total: true
        },
        _count: true
      })
    ])

    return NextResponse.json({
      success: true,
      invoices,
      summary: {
        count: summary._count,
        totalAmount: summary._sum.amount || 0,
        totalTax: summary._sum.tax || 0,
        grandTotal: summary._sum.total || 0
      },
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })

  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener facturas' },
      { status: 500 }
    )
  }
}

// POST - Create invoice (disabled - ExternalInvoice model not available)
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuthAPI()

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'External invoice creation is not currently available. Please use the subscription invoice system.'
      },
      { status: 501 }
    )

  } catch (error) {
    console.error('Error creating invoice:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Error al crear factura' },
      { status: 500 }
    )
  }
}

// PUT - Update invoice (disabled - ExternalInvoice model not available)
export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuthAPI()

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'External invoice updates are not currently available. Please use the subscription invoice system.'
      },
      { status: 501 }
    )

  } catch (error) {
    console.error('Error updating invoice:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Error al actualizar factura' },
      { status: 500 }
    )
  }
}

// DELETE - Delete invoice (disabled - ExternalInvoice model not available)
export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAuthAPI()

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'External invoice deletion is not currently available. Please use the subscription invoice system.'
      },
      { status: 501 }
    )

  } catch (error) {
    console.error('Error deleting invoice:', error)
    return NextResponse.json(
      { success: false, error: 'Error al eliminar factura' },
      { status: 500 }
    )
  }
}