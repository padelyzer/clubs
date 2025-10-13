import { NextRequest, NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'
import { z } from 'zod'
import { nanoid } from 'nanoid'

// Validation schemas
const budgetCategorySchema = z.object({
  category: z.enum([
    'BOOKING', 'CLASS', 'TOURNAMENT', 'MEMBERSHIP', 'EQUIPMENT',
    'MAINTENANCE', 'SALARY', 'UTILITIES', 'RENT', 'MARKETING', 'OTHER'
  ]),
  budgetAmount: z.number().min(0),
  notes: z.string().optional()
})

const createBudgetSchema = z.object({
  period: z.string().regex(/^(\d{4}-\d{2}|\d{4}-Q[1-4]|\d{4})$/), // YYYY-MM or YYYY-Q1 or YYYY
  totalBudget: z.number().min(0),
  categories: z.array(budgetCategorySchema),
  notes: z.string().optional()
})

const updateBudgetSchema = z.object({
  totalBudget: z.number().min(0).optional(),
  categories: z.array(budgetCategorySchema).optional(),
  notes: z.string().optional()
})

// GET - Retrieve budgets with comparison to actual expenses
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
    
    const period = searchParams.get('period')
    const year = searchParams.get('year')
    const withComparison = searchParams.get('withComparison') === 'true'

    const where: any = {
      clubId: session.clubId
    }

    // Period filter
    if (period) {
      where.period = period
    } else if (year) {
      where.period = {
        startsWith: year
      }
    }

    // Get budgets with categories
    const budgets = await prisma.budget.findMany({
      where,
      include: {
        BudgetCategory: true
      },
      orderBy: {
        period: 'desc'
      }
    })

    // If comparison requested, get actual expenses for each budget period
    if (withComparison && budgets.length > 0) {
      const budgetsWithComparison = await Promise.all(
        budgets.map(async (budget) => {
          // Parse period to determine date range
          let startDate: Date
          let endDate: Date
          
          if (budget.period.includes('-Q')) {
            // Quarterly budget
            const [yearStr, quarter] = budget.period.split('-Q')
            const yearNum = parseInt(yearStr)
            const quarterNum = parseInt(quarter)
            const quarterStart = (quarterNum - 1) * 3
            startDate = new Date(yearNum, quarterStart, 1)
            endDate = new Date(yearNum, quarterStart + 3, 0)
          } else if (budget.period.includes('-')) {
            // Monthly budget
            const [yearStr, monthStr] = budget.period.split('-')
            const yearNum = parseInt(yearStr)
            const monthNum = parseInt(monthStr) - 1
            startDate = new Date(yearNum, monthNum, 1)
            endDate = new Date(yearNum, monthNum + 1, 0)
          } else {
            // Yearly budget
            const yearNum = parseInt(budget.period)
            startDate = new Date(yearNum, 0, 1)
            endDate = new Date(yearNum, 11, 31)
          }

          // Get actual expenses for the period
          const actualExpenses = await prisma.transaction.groupBy({
            by: ['category'],
            where: {
              clubId: session.clubId,
              type: 'EXPENSE',
              date: {
                gte: startDate,
                lte: endDate
              }
            },
            _sum: {
              amount: true
            }
          })

          // Get actual income for the period
          const actualIncome = await prisma.transaction.aggregate({
            where: {
              clubId: session.clubId,
              type: 'INCOME',
              date: {
                gte: startDate,
                lte: endDate
              }
            },
            _sum: {
              amount: true
            }
          })

          // Map actual expenses to categories
          const categoryComparison = budget.BudgetCategory.map(cat => {
            const actual = actualExpenses.find(exp => exp.category === cat.category)
            const actualAmount = actual?._sum.amount || 0
            const variance = cat.budgetAmount - actualAmount
            const variancePercent = cat.budgetAmount > 0 
              ? ((variance / cat.budgetAmount) * 100).toFixed(2)
              : '0'
            
            return {
              ...cat,
              actualAmount,
              variance,
              variancePercent: parseFloat(variancePercent),
              status: actualAmount > cat.budgetAmount ? 'over' : 
                      actualAmount >= cat.budgetAmount * 0.9 ? 'warning' : 'ok'
            }
          })

          const totalActualExpense = actualExpenses.reduce((sum, exp) => sum + (exp._sum.amount || 0), 0)
          const totalVariance = budget.totalBudget - totalActualExpense
          const totalVariancePercent = budget.totalBudget > 0
            ? ((totalVariance / budget.totalBudget) * 100).toFixed(2)
            : '0'

          return {
            ...budget,
            categories: categoryComparison,
            comparison: {
              totalActualExpense,
              totalActualIncome: actualIncome._sum.amount || 0,
              totalVariance,
              totalVariancePercent: parseFloat(totalVariancePercent),
              status: totalActualExpense > budget.totalBudget ? 'over' : 
                     totalActualExpense >= budget.totalBudget * 0.9 ? 'warning' : 'ok',
              dateRange: {
                start: startDate,
                end: endDate
              }
            }
          }
        })
      )

      return NextResponse.json({
        success: true,
        budgets: budgetsWithComparison
      })
    }

    return NextResponse.json({
      success: true,
      budgets
    })

  } catch (error) {
    console.error('Error fetching budgets:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener presupuestos' },
      { status: 500 }
    )
  }
}

// POST - Create new budget
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
    
    const validatedData = createBudgetSchema.parse(body)
    
    // Check if budget already exists for this period
    const existing = await prisma.budget.findFirst({
      where: {
        clubId: session.clubId,
        period: validatedData.period
      }
    })

    if (existing) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Ya existe un presupuesto para el periodo ${validatedData.period}` 
        },
        { status: 409 }
      )
    }

    // Create budget with categories
    const budget = await prisma.budget.create({
      data: {
        id: nanoid(),
        clubId: session.clubId,
        period: validatedData.period,
        totalBudget: validatedData.totalBudget,
        notes: validatedData.notes,
        updatedAt: new Date(),
        BudgetCategory: {
          create: validatedData.categories.map(cat => ({
            id: nanoid(),
            category: cat.category,
            budgetAmount: cat.budgetAmount,
            notes: cat.notes,
            createdAt: new Date(),
            updatedAt: new Date()
          }))
        }
      },
      include: {
        BudgetCategory: true
      }
    })

    return NextResponse.json({ 
      success: true, 
      budget,
      message: 'Presupuesto creado exitosamente' 
    })

  } catch (error) {
    console.error('Error creating budget:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Error al crear presupuesto' },
      { status: 500 }
    )
  }
}

// PUT - Update budget
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
        { success: false, error: 'ID de presupuesto requerido' },
        { status: 400 }
      )
    }

    const validatedData = updateBudgetSchema.parse(updateData)
    
    // Check if budget exists and belongs to club
    const existingBudget = await prisma.budget.findFirst({
      where: {
        id,
        clubId: session.clubId
      }
    })

    if (!existingBudget) {
      return NextResponse.json(
        { success: false, error: 'Presupuesto no encontrado' },
        { status: 404 }
      )
    }

    // Update budget
    const updatedBudget = await prisma.$transaction(async (tx) => {
      // Update main budget
      const budget = await tx.budget.update({
        where: { id },
        data: {
          totalBudget: validatedData.totalBudget ?? existingBudget.totalBudget,
          notes: validatedData.notes ?? existingBudget.notes
        }
      })

      // Update categories if provided
      if (validatedData.categories) {
        // Delete existing categories
        await tx.budgetCategory.deleteMany({
          where: { budgetId: id }
        })

        // Create new categories
        await tx.budgetCategory.createMany({
          data: validatedData.categories.map(cat => ({
            id: nanoid(),
            budgetId: id,
            category: cat.category,
            budgetAmount: cat.budgetAmount,
            notes: cat.notes,
            createdAt: new Date(),
            updatedAt: new Date()
          }))
        })
      }

      // Return updated budget with categories
      return await tx.budget.findUnique({
        where: { id },
        include: {
          BudgetCategory: true
        }
      })
    })

    return NextResponse.json({
      success: true,
      budget: updatedBudget,
      message: 'Presupuesto actualizado exitosamente'
    })

  } catch (error) {
    console.error('Error updating budget:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Error al actualizar presupuesto' },
      { status: 500 }
    )
  }
}

// DELETE - Delete budget
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
        { success: false, error: 'ID de presupuesto requerido' },
        { status: 400 }
      )
    }

    // Check if budget exists and belongs to club
    const budget = await prisma.budget.findFirst({
      where: {
        id,
        clubId: session.clubId
      }
    })

    if (!budget) {
      return NextResponse.json(
        { success: false, error: 'Presupuesto no encontrado' },
        { status: 404 }
      )
    }

    // Delete budget (categories will be cascade deleted)
    await prisma.budget.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Presupuesto eliminado exitosamente'
    })

  } catch (error) {
    console.error('Error deleting budget:', error)
    return NextResponse.json(
      { success: false, error: 'Error al eliminar presupuesto' },
      { status: 500 }
    )
  }
}