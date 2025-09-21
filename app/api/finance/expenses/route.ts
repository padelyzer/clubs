import { NextRequest, NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'
import { z } from 'zod'
import { startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns'

// Validation schemas
const createExpenseSchema = z.object({
  category: z.enum([
    'MAINTENANCE', 'SALARY', 'UTILITIES', 'RENT', 'MARKETING', 'OTHER',
    'BOOKING', 'CLASS', 'TOURNAMENT', 'MEMBERSHIP', 'EQUIPMENT'
  ]),
  subcategory: z.string().optional(),
  description: z.string().min(1).max(500),
  amount: z.number().min(1),
  date: z.string(),
  vendor: z.string().optional(),
  invoiceNumber: z.string().optional(),
  attachmentUrl: z.string().optional(),
  notes: z.string().optional()
})

const updateExpenseSchema = z.object({
  category: z.enum([
    'MAINTENANCE', 'SALARY', 'UTILITIES', 'RENT', 'MARKETING', 'OTHER',
    'BOOKING', 'CLASS', 'TOURNAMENT', 'MEMBERSHIP', 'EQUIPMENT'
  ]).optional(),
  subcategory: z.string().optional(),
  description: z.string().min(1).max(500).optional(),
  amount: z.number().min(1).optional(),
  date: z.string().optional(),
  vendor: z.string().optional(),
  invoiceNumber: z.string().optional(),
  attachmentUrl: z.string().optional(),
  status: z.enum(['pending', 'approved', 'rejected', 'paid']).optional(),
  notes: z.string().optional()
})

// GET - Retrieve expenses with filters
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
    
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const period = searchParams.get('period') // month, year, custom
    const vendor = searchParams.get('vendor')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {
      clubId: session.clubId,
      type: 'EXPENSE' // Only get expense transactions
    }

    // Category filter
    if (category) {
      where.category = category
    }

    // Vendor filter (search in notes or description)
    if (vendor) {
      where.OR = [
        {
          description: {
            contains: vendor,
            mode: 'insensitive'
          }
        },
        {
          notes: {
            contains: vendor,
            mode: 'insensitive'
          }
        }
      ]
    }

    // Date filtering
    const now = new Date()
    if (period === 'month') {
      where.date = {
        gte: startOfMonth(now),
        lte: endOfMonth(now)
      }
    } else if (period === 'year') {
      where.date = {
        gte: startOfYear(now),
        lte: endOfYear(now)
      }
    } else if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    // Get expenses with summary from Transaction table
    const [expenses, total, summary] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: {
          date: 'desc'
        },
        take: limit,
        skip: offset
      }),
      prisma.transaction.count({ where }),
      // Get summary statistics
      prisma.transaction.groupBy({
        by: ['category'],
        where,
        _sum: {
          amount: true
        }
      })
    ])

    // Calculate totals by category
    const categoryTotals: Record<string, number> = {}
    let grandTotal = 0
    
    summary.forEach(item => {
      categoryTotals[item.category] = item._sum.amount || 0
      grandTotal += item._sum.amount || 0
    })

    // Get pending approval count (we don't have status for transactions, so return 0)
    const pendingCount = 0

    return NextResponse.json({
      success: true,
      expenses,
      summary: {
        categoryTotals,
        grandTotal,
        pendingCount
      },
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })

  } catch (error) {
    console.error('Error fetching expenses:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener gastos' },
      { status: 500 }
    )
  }
}

// POST - Create new expense
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
    
    const validatedData = createExpenseSchema.parse(body)
    
    // Create expense record
    const expense = await prisma.expense.create({
      data: {
        clubId: session.clubId,
        category: validatedData.category,
        subcategory: validatedData.subcategory,
        description: validatedData.description,
        amount: validatedData.amount,
        date: new Date(validatedData.date),
        vendor: validatedData.vendor,
        invoiceNumber: validatedData.invoiceNumber,
        attachmentUrl: validatedData.attachmentUrl,
        status: 'pending',
        notes: validatedData.notes,
        createdBy: session.userId
      }
    })

    // Automatically create a transaction if expense is approved
    if (expense.status === 'approved' || expense.status === 'paid') {
      await prisma.transaction.create({
        data: {
          clubId: session.clubId,
          type: 'EXPENSE',
          category: expense.category,
          amount: expense.amount,
          currency: 'MXN',
          description: expense.description,
          reference: expense.id,
          date: expense.date,
          createdBy: session.userId,
          notes: `Gasto: ${expense.vendor ? `Proveedor: ${expense.vendor}` : ''} ${expense.invoiceNumber ? `Factura: ${expense.invoiceNumber}` : ''}`
        }
      })
    }

    return NextResponse.json({ 
      success: true, 
      expense,
      message: 'Gasto registrado exitosamente' 
    })

  } catch (error) {
    console.error('Error creating expense:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Error al crear gasto' },
      { status: 500 }
    )
  }
}

// PUT - Update expense
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
        { success: false, error: 'ID de gasto requerido' },
        { status: 400 }
      )
    }

    const validatedData = updateExpenseSchema.parse(updateData)
    
    // Check if expense exists and belongs to club
    const existingExpense = await prisma.expense.findFirst({
      where: {
        id,
        clubId: session.clubId
      }
    })

    if (!existingExpense) {
      return NextResponse.json(
        { success: false, error: 'Gasto no encontrado' },
        { status: 404 }
      )
    }

    // Update expense
    const updatedExpense = await prisma.expense.update({
      where: { id },
      data: {
        ...validatedData,
        date: validatedData.date ? new Date(validatedData.date) : undefined,
        approvedBy: validatedData.status === 'approved' ? session.userId : existingExpense.approvedBy,
        approvedAt: validatedData.status === 'approved' ? new Date() : existingExpense.approvedAt
      }
    })

    // Handle transaction creation/update based on status change
    if (validatedData.status) {
      const existingTransaction = await prisma.transaction.findFirst({
        where: {
          reference: id,
          category: existingExpense.category
        }
      })

      if ((validatedData.status === 'approved' || validatedData.status === 'paid') && !existingTransaction) {
        // Create transaction when expense is approved
        await prisma.transaction.create({
          data: {
            clubId: session.clubId,
            type: 'EXPENSE',
            category: updatedExpense.category,
            amount: updatedExpense.amount,
            currency: 'MXN',
            description: updatedExpense.description,
            reference: updatedExpense.id,
            date: updatedExpense.date,
            createdBy: session.userId,
            notes: `Gasto aprobado: ${updatedExpense.vendor ? `Proveedor: ${updatedExpense.vendor}` : ''} ${updatedExpense.invoiceNumber ? `Factura: ${updatedExpense.invoiceNumber}` : ''}`
          }
        })
      } else if (validatedData.status === 'rejected' && existingTransaction) {
        // Delete transaction if expense is rejected
        await prisma.transaction.delete({
          where: { id: existingTransaction.id }
        })
      }
    }

    return NextResponse.json({
      success: true,
      expense: updatedExpense,
      message: 'Gasto actualizado exitosamente'
    })

  } catch (error) {
    console.error('Error updating expense:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Error al actualizar gasto' },
      { status: 500 }
    )
  }
}

// DELETE - Delete expense
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
        { success: false, error: 'ID de gasto requerido' },
        { status: 400 }
      )
    }

    // Check if expense exists and belongs to club
    const expense = await prisma.expense.findFirst({
      where: {
        id,
        clubId: session.clubId
      }
    })

    if (!expense) {
      return NextResponse.json(
        { success: false, error: 'Gasto no encontrado' },
        { status: 404 }
      )
    }

    // Don't delete if already approved or paid
    if (expense.status === 'approved' || expense.status === 'paid') {
      return NextResponse.json(
        { success: false, error: 'No se puede eliminar un gasto aprobado o pagado' },
        { status: 400 }
      )
    }

    // Delete expense and related transaction if exists
    await Promise.all([
      prisma.expense.delete({ where: { id } }),
      prisma.transaction.deleteMany({
        where: {
          reference: id,
          category: expense.category
        }
      })
    ])

    return NextResponse.json({
      success: true,
      message: 'Gasto eliminado exitosamente'
    })

  } catch (error) {
    console.error('Error deleting expense:', error)
    return NextResponse.json(
      { success: false, error: 'Error al eliminar gasto' },
      { status: 500 }
    )
  }
}