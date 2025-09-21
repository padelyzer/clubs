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

// GET - Retrieve external invoices
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
    const issuerRfc = searchParams.get('issuerRfc')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {
      clubId: session.clubId
    }

    // Status filter
    if (status) {
      where.status = status
    }

    // Issuer RFC filter
    if (issuerRfc) {
      where.issuerRfc = {
        contains: issuerRfc,
        mode: 'insensitive'
      }
    }

    // Date filtering
    if (startDate && endDate) {
      where.invoiceDate = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    // Get invoices with related transactions
    const [invoices, total, summary] = await Promise.all([
      prisma.externalInvoice.findMany({
        where,
        include: {
          transactions: {
            select: {
              id: true,
              type: true,
              category: true,
              amount: true,
              description: true,
              date: true
            }
          }
        },
        orderBy: {
          invoiceDate: 'desc'
        },
        take: limit,
        skip: offset
      }),
      prisma.externalInvoice.count({ where }),
      // Get summary statistics
      prisma.externalInvoice.aggregate({
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

// POST - Create external invoice reference
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuthAPI()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    const body = await request.json()
    
    const validatedData = createInvoiceSchema.parse(body)
    
    // Check if invoice number already exists
    const existing = await prisma.externalInvoice.findFirst({
      where: {
        clubId: session.clubId,
        invoiceNumber: validatedData.invoiceNumber
      }
    })

    if (existing) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Ya existe una factura con el número ${validatedData.invoiceNumber}` 
        },
        { status: 409 }
      )
    }

    // Create invoice with transaction links
    const invoice = await prisma.$transaction(async (tx) => {
      // Create the invoice
      const newInvoice = await tx.externalInvoice.create({
        data: {
          clubId: session.clubId,
          invoiceNumber: validatedData.invoiceNumber,
          invoiceDate: new Date(validatedData.invoiceDate),
          issuerRfc: validatedData.issuerRfc,
          receiverRfc: validatedData.receiverRfc,
          amount: validatedData.amount,
          tax: validatedData.tax,
          total: validatedData.total,
          currency: validatedData.currency,
          status: 'valid',
          pdfUrl: validatedData.pdfUrl,
          xmlUrl: validatedData.xmlUrl,
          notes: validatedData.notes
        }
      })

      // Link transactions if provided
      if (validatedData.transactionIds && validatedData.transactionIds.length > 0) {
        await tx.transaction.updateMany({
          where: {
            id: { in: validatedData.transactionIds },
            clubId: session.clubId
          },
          data: {
            externalInvoiceId: newInvoice.id
          }
        })
      }

      // Return invoice with transactions
      return await tx.externalInvoice.findUnique({
        where: { id: newInvoice.id },
        include: {
          transactions: true
        }
      })
    })

    return NextResponse.json({ 
      success: true, 
      invoice,
      message: 'Factura registrada exitosamente' 
    })

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

// PUT - Update invoice
export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuthAPI()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    const body = await request.json()
    const { id, ...updateData } = body
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID de factura requerido' },
        { status: 400 }
      )
    }

    const validatedData = updateInvoiceSchema.parse(updateData)
    
    // Check if invoice exists and belongs to club
    const existingInvoice = await prisma.externalInvoice.findFirst({
      where: {
        id,
        clubId: session.clubId
      }
    })

    if (!existingInvoice) {
      return NextResponse.json(
        { success: false, error: 'Factura no encontrada' },
        { status: 404 }
      )
    }

    // Update invoice
    const updatedInvoice = await prisma.$transaction(async (tx) => {
      // Update invoice status and files
      const invoice = await tx.externalInvoice.update({
        where: { id },
        data: {
          status: validatedData.status ?? existingInvoice.status,
          pdfUrl: validatedData.pdfUrl ?? existingInvoice.pdfUrl,
          xmlUrl: validatedData.xmlUrl ?? existingInvoice.xmlUrl,
          notes: validatedData.notes ?? existingInvoice.notes
        }
      })

      // Update transaction links if provided
      if (validatedData.transactionIds !== undefined) {
        // Remove existing links
        await tx.transaction.updateMany({
          where: {
            externalInvoiceId: id
          },
          data: {
            externalInvoiceId: null
          }
        })

        // Add new links
        if (validatedData.transactionIds.length > 0) {
          await tx.transaction.updateMany({
            where: {
              id: { in: validatedData.transactionIds },
              clubId: session.clubId
            },
            data: {
              externalInvoiceId: id
            }
          })
        }
      }

      // Return updated invoice with transactions
      return await tx.externalInvoice.findUnique({
        where: { id },
        include: {
          transactions: true
        }
      })
    })

    return NextResponse.json({
      success: true,
      invoice: updatedInvoice,
      message: 'Factura actualizada exitosamente'
    })

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

// DELETE - Delete invoice
export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAuthAPI()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID de factura requerido' },
        { status: 400 }
      )
    }

    // Check if invoice exists and belongs to club
    const invoice = await prisma.externalInvoice.findFirst({
      where: {
        id,
        clubId: session.clubId
      }
    })

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: 'Factura no encontrada' },
        { status: 404 }
      )
    }

    // Don't delete if it's linked to transactions
    const linkedTransactions = await prisma.transaction.count({
      where: {
        externalInvoiceId: id
      }
    })

    if (linkedTransactions > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `No se puede eliminar la factura porque está vinculada a ${linkedTransactions} transacción(es)` 
        },
        { status: 400 }
      )
    }

    // Delete invoice
    await prisma.externalInvoice.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Factura eliminada exitosamente'
    })

  } catch (error) {
    console.error('Error deleting invoice:', error)
    return NextResponse.json(
      { success: false, error: 'Error al eliminar factura' },
      { status: 500 }
    )
  }
}