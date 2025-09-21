import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/config/prisma'
import { nanoid } from 'nanoid'
import { addWeeks, addMonths, setDate, isAfter, startOfDay } from 'date-fns'

// Helper function to calculate next due date
function calculateNextDue(currentDue: Date, frequency: string, dayOfMonth?: number | null): Date {
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

// GET - Process all due recurring expenses
export async function GET(request: NextRequest) {
  try {
    const today = startOfDay(new Date())
    
    console.log('Processing recurring expenses for date:', today)
    
    // Find all active recurring expenses that are due
    const dueExpenses = await prisma.recurringExpense.findMany({
      where: {
        isActive: true,
        nextDue: {
          lte: today
        },
        OR: [
          { endDate: null },
          { endDate: { gte: today } }
        ]
      }
    })
    
    console.log(`Found ${dueExpenses.length} recurring expenses to process`)
    
    const results = {
      processed: 0,
      created: [],
      errors: []
    }
    
    for (const recurringExpense of dueExpenses) {
      try {
        // Create the expense transaction
        const transaction = await prisma.transaction.create({
          data: {
            id: nanoid(),
            clubId: recurringExpense.clubId,
            type: 'EXPENSE',
            category: recurringExpense.category,
            amount: recurringExpense.amount,
            currency: 'MXN',
            description: recurringExpense.description,
            date: new Date(),
            createdBy: 'system-recurring',
            notes: recurringExpense.vendor ? `Proveedor: ${recurringExpense.vendor} (Gasto Recurrente)` : 'Gasto Recurrente Automático',
            recurringExpenseId: recurringExpense.id,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        })
        
        // Calculate and update next due date
        const nextDue = calculateNextDue(
          recurringExpense.nextDue, 
          recurringExpense.frequency, 
          recurringExpense.dayOfMonth
        )
        
        // Check if next due date exceeds end date
        const shouldDeactivate = recurringExpense.endDate && isAfter(nextDue, recurringExpense.endDate)
        
        // Update the recurring expense
        await prisma.recurringExpense.update({
          where: { id: recurringExpense.id },
          data: {
            lastGenerated: new Date(),
            nextDue: shouldDeactivate ? recurringExpense.nextDue : nextDue,
            isActive: !shouldDeactivate
          }
        })
        
        results.processed++
        results.created.push({
          id: transaction.id,
          description: recurringExpense.description,
          amount: recurringExpense.amount,
          nextDue: shouldDeactivate ? null : nextDue
        })
        
        console.log(`Processed recurring expense: ${recurringExpense.description}`)
        
      } catch (error) {
        console.error(`Error processing recurring expense ${recurringExpense.id}:`, error)
        results.errors.push({
          id: recurringExpense.id,
          description: recurringExpense.description,
          error: error.message
        })
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Procesados ${results.processed} gastos recurrentes`,
      results
    })
    
  } catch (error) {
    console.error('Error processing recurring expenses:', error)
    return NextResponse.json(
      { success: false, error: 'Error al procesar gastos recurrentes' },
      { status: 500 }
    )
  }
}

// POST - Process recurring expenses for a specific club
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clubId } = body
    
    if (!clubId) {
      return NextResponse.json(
        { success: false, error: 'Club ID requerido' },
        { status: 400 }
      )
    }
    
    const today = startOfDay(new Date())
    
    // Find all active recurring expenses for the club that are due
    const dueExpenses = await prisma.recurringExpense.findMany({
      where: {
        clubId,
        isActive: true,
        nextDue: {
          lte: today
        },
        OR: [
          { endDate: null },
          { endDate: { gte: today } }
        ]
      }
    })
    
    const results = {
      processed: 0,
      created: [],
      errors: []
    }
    
    for (const recurringExpense of dueExpenses) {
      try {
        // Create the expense transaction
        const transaction = await prisma.transaction.create({
          data: {
            id: nanoid(),
            clubId: recurringExpense.clubId,
            type: 'EXPENSE',
            category: recurringExpense.category,
            amount: recurringExpense.amount,
            currency: 'MXN',
            description: recurringExpense.description,
            date: new Date(),
            createdBy: 'system-recurring',
            notes: recurringExpense.vendor ? `Proveedor: ${recurringExpense.vendor} (Gasto Recurrente)` : 'Gasto Recurrente Automático',
            recurringExpenseId: recurringExpense.id,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        })
        
        // Calculate and update next due date
        const nextDue = calculateNextDue(
          recurringExpense.nextDue, 
          recurringExpense.frequency, 
          recurringExpense.dayOfMonth
        )
        
        // Check if next due date exceeds end date
        const shouldDeactivate = recurringExpense.endDate && isAfter(nextDue, recurringExpense.endDate)
        
        // Update the recurring expense
        await prisma.recurringExpense.update({
          where: { id: recurringExpense.id },
          data: {
            lastGenerated: new Date(),
            nextDue: shouldDeactivate ? recurringExpense.nextDue : nextDue,
            isActive: !shouldDeactivate
          }
        })
        
        results.processed++
        results.created.push({
          id: transaction.id,
          description: recurringExpense.description,
          amount: recurringExpense.amount
        })
        
      } catch (error) {
        results.errors.push({
          id: recurringExpense.id,
          description: recurringExpense.description,
          error: error.message
        })
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Procesados ${results.processed} gastos recurrentes para el club`,
      results
    })
    
  } catch (error) {
    console.error('Error processing club recurring expenses:', error)
    return NextResponse.json(
      { success: false, error: 'Error al procesar gastos recurrentes del club' },
      { status: 500 }
    )
  }
}