import { NextRequest, NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'
import { z } from 'zod'
import { addDays, addWeeks, addMonths, setDate } from 'date-fns'
import { nanoid } from 'nanoid'

// Validation schema for creating recurring expense
const createRecurringExpenseSchema = z.object({
  category: z.enum([
    'MAINTENANCE', 'SALARY', 'UTILITIES', 'RENT', 'MARKETING', 'OTHER',
    'EQUIPMENT'
  ]),
  amount: z.number().min(1),
  description: z.string().min(1).max(500),
  vendor: z.string().optional(),
  frequency: z.enum(['WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']),
  dayOfMonth: z.number().min(1).max(31).optional(),
  dayOfWeek: z.number().min(0).max(6).optional(),
  startDate: z.string(),
  endDate: z.string().optional()
})

// GET - Retrieve recurring expenses
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
    
    const isActive = searchParams.get('active') !== 'false'
    
    const recurringExpenses = await prisma.recurringExpense.findMany({
      where: {
        clubId: session.clubId,
        isActive
      },
      orderBy: {
        nextDue: 'asc'
      }
    })
    
    return NextResponse.json({
      success: true,
      recurringExpenses
    })
    
  } catch (error) {
    console.error('Error fetching recurring expenses:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener gastos recurrentes' },
      { status: 500 }
    )
  }
}

// POST - Create new recurring expense
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
    
    console.log('POST /api/finance/recurring-expenses - Received data:', body)
    console.log('Session:', session)
    
    const validatedData = createRecurringExpenseSchema.parse(body)
    
    // Calculate next due date based on frequency
    const startDate = new Date(validatedData.startDate)
    let nextDue = startDate
    
    // For monthly recurring, set to specific day of month
    if (validatedData.frequency === 'MONTHLY' && validatedData.dayOfMonth) {
      nextDue = setDate(startDate, validatedData.dayOfMonth)
      if (nextDue < startDate) {
        nextDue = addMonths(nextDue, 1)
      }
    }
    
    // Create recurring expense
    const recurringExpense = await prisma.recurringExpense.create({
      data: {
        clubId: session.clubId,
        category: validatedData.category,
        amount: validatedData.amount,
        description: validatedData.description,
        vendor: validatedData.vendor,
        frequency: validatedData.frequency,
        dayOfMonth: validatedData.dayOfMonth,
        dayOfWeek: validatedData.dayOfWeek,
        startDate,
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : undefined,
        nextDue,
        isActive: true
      }
    })
    
    console.log('Created recurring expense:', recurringExpense)
    
    // If the start date is today or in the past, create the first expense immediately
    if (startDate <= new Date()) {
      await prisma.transaction.create({
        data: {
          id: nanoid(),
          clubId: session.clubId,
          type: 'EXPENSE',
          category: validatedData.category,
          amount: validatedData.amount,
          currency: 'MXN',
          description: validatedData.description,
          date: new Date(),
          createdBy: session.userId,
          notes: validatedData.vendor ? `Proveedor: ${validatedData.vendor}` : undefined,
          recurringExpenseId: recurringExpense.id,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
      
      // Update lastGenerated and nextDue
      const newNextDue = calculateNextDue(nextDue, validatedData.frequency, validatedData.dayOfMonth)
      await prisma.recurringExpense.update({
        where: { id: recurringExpense.id },
        data: {
          lastGenerated: new Date(),
          nextDue: newNextDue
        }
      })
    }
    
    return NextResponse.json({
      success: true,
      recurringExpense,
      message: 'Gasto recurrente creado exitosamente'
    })
    
  } catch (error) {
    console.error('Error creating recurring expense:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Error al crear gasto recurrente' },
      { status: 500 }
    )
  }
}

// DELETE - Delete or deactivate recurring expense
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
        { success: false, error: 'ID de gasto recurrente requerido' },
        { status: 400 }
      )
    }
    
    // Check if recurring expense exists and belongs to club
    const recurringExpense = await prisma.recurringExpense.findFirst({
      where: {
        id,
        clubId: session.clubId
      }
    })
    
    if (!recurringExpense) {
      return NextResponse.json(
        { success: false, error: 'Gasto recurrente no encontrado' },
        { status: 404 }
      )
    }
    
    // Deactivate instead of delete to maintain history
    await prisma.recurringExpense.update({
      where: { id },
      data: {
        isActive: false,
        endDate: new Date()
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Gasto recurrente desactivado exitosamente'
    })
    
  } catch (error) {
    console.error('Error deleting recurring expense:', error)
    return NextResponse.json(
      { success: false, error: 'Error al eliminar gasto recurrente' },
      { status: 500 }
    )
  }
}

// Helper function to calculate next due date
function calculateNextDue(currentDue: Date, frequency: string, dayOfMonth?: number): Date {
  switch (frequency) {
    case 'WEEKLY':
      return addWeeks(currentDue, 1)
    case 'BIWEEKLY':
      return addWeeks(currentDue, 2)
    case 'MONTHLY':
      const nextMonth = addMonths(currentDue, 1)
      return dayOfMonth ? setDate(nextMonth, dayOfMonth) : nextMonth
    case 'QUARTERLY':
      return addMonths(currentDue, 3)
    case 'YEARLY':
      return addMonths(currentDue, 12)
    default:
      return addMonths(currentDue, 1)
  }
}