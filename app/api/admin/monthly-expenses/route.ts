import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/config/prisma'

// POST - Process monthly instructor expenses
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { month, year } = body
    
    // Validate month and year
    if (!month || !year || month < 1 || month > 12) {
      return NextResponse.json(
        { success: false, error: 'Mes y año son requeridos (mes: 1-12)' },
        { status: 400 }
      )
    }
    
    // Get all active instructors with monthly payment
    const monthlyInstructors = await prisma.instructor.findMany({
      where: {
        active: true,
        paymentType: 'FIXED',
        fixedSalary: { gt: 0 } // Only instructors with a rate > 0
      },
      include: {
        Club: true
      }
    })
    
    if (monthlyInstructors.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No hay instructores con pago mensual para procesar',
        processedCount: 0
      })
    }
    
    // Create date for the first day of the specified month
    const expenseDate = new Date(year, month - 1, 1)
    const monthName = expenseDate.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })
    
    // Check if expenses for this month already exist
    const existingExpenses = await prisma.transaction.findMany({
      where: {
        category: 'SALARY',
        date: {
          gte: new Date(year, month - 1, 1),
          lt: new Date(year, month, 1)
        }
      }
    })
    
    if (existingExpenses.length > 0) {
      return NextResponse.json(
        { success: false, error: `Ya existen gastos mensuales procesados para ${monthName}` },
        { status: 400 }
      )
    }
    
    // Create transactions for each monthly instructor
    const transactions = []
    
    for (const instructor of monthlyInstructors) {
      const transaction = await prisma.transaction.create({
        data: {
          clubId: instructor.clubId,
          type: 'EXPENSE',
          category: 'SALARY',
          amount: instructor.fixedSalary, // Already in cents
          currency: 'MXN',
          description: `Pago mensual - ${instructor.name} (${monthName})`,
          date: expenseDate,
          status: 'COMPLETED',
          reference: `MONTHLY-${year}-${month.toString().padStart(2, '0')}-${instructor.id}`,
          metadata: {
            instructorId: instructor.id,
            instructorName: instructor.name,
            paymentMonth: month,
            paymentYear: year,
            paymentType: 'FIXED',
            monthlyRate: instructor.fixedSalary,
            processedAt: new Date().toISOString()
          }
        }
      })
      
      transactions.push(transaction)
    }
    
    return NextResponse.json({
      success: true,
      message: `Se procesaron ${transactions.length} gastos mensuales para ${monthName}`,
      processedCount: transactions.length,
      month: monthName,
      transactions: transactions.map(t => ({
        id: t.id,
        instructorName: (t.metadata as any)?.instructorName || 'Desconocido',
        amount: t.amount / 100, // Convert to pesos for display
        description: t.description
      }))
    })
    
  } catch (error) {
    console.error('Error processing monthly expenses:', error)
    return NextResponse.json(
      { success: false, error: 'Error al procesar gastos mensuales' },
      { status: 500 }
    )
  }
}

// GET - Get monthly expenses for a specific month
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const month = parseInt(searchParams.get('month') || '')
    const year = parseInt(searchParams.get('year') || '')
    
    if (!month || !year) {
      return NextResponse.json(
        { success: false, error: 'Parámetros month y year son requeridos' },
        { status: 400 }
      )
    }
    
    // Get existing monthly expenses for the specified month
    const expenses = await prisma.transaction.findMany({
      where: {
        category: 'SALARY',
        date: {
          gte: new Date(year, month - 1, 1),
          lt: new Date(year, month, 1)
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    const monthName = new Date(year, month - 1, 1).toLocaleDateString('es-MX', { 
      month: 'long', 
      year: 'numeric' 
    })
    
    return NextResponse.json({
      success: true,
      month: monthName,
      totalExpenses: expenses.length,
      totalAmount: expenses.reduce((sum, exp) => sum + exp.amount, 0) / 100, // Convert to pesos
      expenses: expenses.map(exp => ({
        id: exp.id,
        instructorName: (exp.metadata as any)?.instructorName || 'Desconocido',
        amount: exp.amount / 100,
        description: exp.description,
        date: exp.date,
        reference: exp.reference
      }))
    })
    
  } catch (error) {
    console.error('Error fetching monthly expenses:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener gastos mensuales' },
      { status: 500 }
    )
  }
}