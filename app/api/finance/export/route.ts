import { NextRequest, NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

// Helper function to convert data to CSV
function convertToCSV(data: any[], headers: string[]): string {
  const csvHeaders = headers.join(',')
  const csvRows = data.map(row => {
    return headers.map(header => {
      const keys = header.split('.')
      let value = row
      for (const key of keys) {
        value = value?.[key]
      }
      // Handle special formatting
      if (value === null || value === undefined) return ''
      if (typeof value === 'number' && (
        header.includes('amount') ||
        header.includes('price') ||
        header.includes('Income') ||
        header.includes('Expenses') ||
        header.includes('Refunds')
      )) {
        return (value / 100).toFixed(2) // Convert cents to currency
      }
      if (value instanceof Date) {
        return format(value, 'dd/MM/yyyy')
      }
      // Escape commas and quotes in strings
      if (typeof value === 'string') {
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          return `"${value.replace(/"/g, '""')}"`
        }
      }
      return value
    }).join(',')
  }).join('\n')
  
  return `${csvHeaders}\n${csvRows}`
}

// GET - Export financial data
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
    
    const type = searchParams.get('type') || 'transactions' // transactions, expenses, payroll, budgets
    const format = searchParams.get('format') || 'csv' // csv, json
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const category = searchParams.get('category')
    
    // Build date filter
    const dateFilter: any = {}
    if (startDate && endDate) {
      dateFilter.gte = new Date(startDate)
      dateFilter.lte = new Date(endDate)
    }

    let data: any[] = []
    let headers: string[] = []
    let filename = ''

    switch (type) {
      case 'transactions':
        // Export transactions
        const transactions = await prisma.transaction.findMany({
          where: {
            clubId: session.clubId,
            ...(dateFilter.gte && { date: dateFilter }),
            ...(category && { category: category as any })
          },
          include: {
            Booking: {
              select: {
                playerName: true,
                Court: {
                  select: {
                    name: true
                  }
                }
              }
            },
            Player: {
              select: {
                name: true
              }
            }
          },
          orderBy: {
            date: 'desc'
          }
        })

        headers = [
          'date',
          'type',
          'category',
          'amount',
          'description',
          'reference',
          'player.name',
          'booking.playerName',
          'booking.court.name',
          'notes'
        ]

        data = transactions
        filename = `transacciones_${format === 'csv' ? 'export' : 'data'}_${Date.now()}.${format}`
        break

      case 'expenses':
        // Expenses are tracked as transactions with type EXPENSE
        const expensesOnly = await prisma.transaction.findMany({
          where: {
            clubId: session.clubId,
            type: 'EXPENSE',
            ...(dateFilter.gte && { date: dateFilter })
          },
          orderBy: {
            date: 'desc'
          }
        })

        headers = [
          'date',
          'category',
          'description',
          'amount',
          'reference',
          'notes'
        ]

        data = expensesOnly
        filename = `gastos_${format === 'csv' ? 'export' : 'data'}_${Date.now()}.${format}`
        break

      case 'payroll':
        // Payroll transactions
        const payrollTransactions = await prisma.transaction.findMany({
          where: {
            clubId: session.clubId,
            category: 'SALARY',
            ...(dateFilter.gte && { date: dateFilter })
          },
          orderBy: {
            date: 'desc'
          }
        })

        headers = [
          'date',
          'description',
          'amount',
          'reference',
          'notes'
        ]

        data = payrollTransactions
        filename = `nomina_${format === 'csv' ? 'export' : 'data'}_${Date.now()}.${format}`
        break

      case 'budgets':
        // Budget summary from transactions
        const budgetTransactions = await prisma.transaction.findMany({
          where: {
            clubId: session.clubId,
            ...(dateFilter.gte && { date: dateFilter })
          },
          orderBy: {
            date: 'desc'
          }
        })

        data = budgetTransactions.map(t => ({
          date: t.date,
          type: t.type,
          category: t.category,
          amount: t.amount,
          description: t.description,
          reference: t.reference || '',
          notes: t.notes || ''
        }))

        headers = [
          'date',
          'type',
          'category',
          'amount',
          'description',
          'reference',
          'notes'
        ]

        filename = `presupuestos_${format === 'csv' ? 'export' : 'data'}_${Date.now()}.${format}`
        break

      case 'summary':
        // Export financial summary
        const [income, expenses2, refunds] = await Promise.all([
          prisma.transaction.aggregate({
            where: {
              clubId: session.clubId,
              type: 'INCOME',
              ...(dateFilter.gte && { date: dateFilter })
            },
            _sum: { amount: true },
            _count: true
          }),
          prisma.transaction.aggregate({
            where: {
              clubId: session.clubId,
              type: 'EXPENSE',
              ...(dateFilter.gte && { date: dateFilter })
            },
            _sum: { amount: true },
            _count: true
          }),
          prisma.transaction.aggregate({
            where: {
              clubId: session.clubId,
              type: 'REFUND',
              ...(dateFilter.gte && { date: dateFilter })
            },
            _sum: { amount: true },
            _count: true
          })
        ])

        data = [{
          period: startDate && endDate ? `${startDate} a ${endDate}` : 'Todo el periodo',
          totalIncome: income._sum.amount || 0,
          incomeCount: income._count,
          totalExpenses: expenses2._sum.amount || 0,
          expenseCount: expenses2._count,
          totalRefunds: refunds._sum.amount || 0,
          refundCount: refunds._count,
          netIncome: (income._sum.amount || 0) - (expenses2._sum.amount || 0) - (refunds._sum.amount || 0),
          profitMargin: income._sum.amount ? 
            (((income._sum.amount || 0) - (expenses2._sum.amount || 0) - (refunds._sum.amount || 0)) / income._sum.amount * 100).toFixed(2) : 
            '0'
        }]

        headers = [
          'period',
          'totalIncome',
          'incomeCount',
          'totalExpenses',
          'expenseCount',
          'totalRefunds',
          'refundCount',
          'netIncome',
          'profitMargin'
        ]

        filename = `resumen_financiero_${Date.now()}.${format}`
        break

      case 'complete_pl':
        // Export complete P&L: Summary + Income transactions + Expense transactions
        const [summaryIncome, summaryExpenses, summaryRefunds] = await Promise.all([
          prisma.transaction.aggregate({
            where: {
              clubId: session.clubId,
              type: 'INCOME',
              ...(dateFilter.gte && { date: dateFilter })
            },
            _sum: { amount: true },
            _count: true
          }),
          prisma.transaction.aggregate({
            where: {
              clubId: session.clubId,
              type: 'EXPENSE',
              ...(dateFilter.gte && { date: dateFilter })
            },
            _sum: { amount: true },
            _count: true
          }),
          prisma.transaction.aggregate({
            where: {
              clubId: session.clubId,
              type: 'REFUND',
              ...(dateFilter.gte && { date: dateFilter })
            },
            _sum: { amount: true },
            _count: true
          })
        ])

        // Get detailed transactions
        const incomeTransactions = await prisma.transaction.findMany({
          where: {
            clubId: session.clubId,
            type: 'INCOME',
            ...(dateFilter.gte && { date: dateFilter })
          },
          include: {
            Booking: {
              select: {
                playerName: true,
                Court: { select: { name: true } }
              }
            },
            Player: { select: { name: true } }
          },
          orderBy: { date: 'desc' }
        })

        const expenseTransactions = await prisma.transaction.findMany({
          where: {
            clubId: session.clubId,
            type: 'EXPENSE',
            ...(dateFilter.gte && { date: dateFilter })
          },
          include: {
            Booking: {
              select: {
                playerName: true,
                Court: { select: { name: true } }
              }
            },
            Player: { select: { name: true } }
          },
          orderBy: { date: 'desc' }
        })

        // Build complete dataset
        const summaryData = {
          section: 'RESUMEN',
          period: startDate && endDate ? `${startDate} a ${endDate}` : 'Todo el periodo',
          type: 'SUMMARY',
          category: 'TOTAL',
          description: 'Estado de Resultados',
          totalIncome: summaryIncome._sum.amount || 0,
          incomeCount: summaryIncome._count,
          totalExpenses: summaryExpenses._sum.amount || 0,
          expenseCount: summaryExpenses._count,
          totalRefunds: summaryRefunds._sum.amount || 0,
          refundCount: summaryRefunds._count,
          netIncome: (summaryIncome._sum.amount || 0) - (summaryExpenses._sum.amount || 0) - (summaryRefunds._sum.amount || 0),
          profitMargin: summaryIncome._sum.amount ?
            (((summaryIncome._sum.amount || 0) - (summaryExpenses._sum.amount || 0) - (summaryRefunds._sum.amount || 0)) / summaryIncome._sum.amount * 100).toFixed(2) :
            '0',
          date: '',
          reference: '',
          player: '',
          court: '',
          notes: ''
        }

        // Format income transactions
        const formattedIncomes = incomeTransactions.map(t => ({
          section: 'INGRESOS',
          period: '',
          type: t.type,
          category: t.category,
          description: t.description,
          totalIncome: t.amount,
          incomeCount: '',
          totalExpenses: '',
          expenseCount: '',
          totalRefunds: '',
          refundCount: '',
          netIncome: '',
          profitMargin: '',
          date: t.date,
          reference: t.reference || '',
          player: ('Player' in t && t.Player) ? t.Player.name : (('Booking' in t && t.Booking) ? t.Booking.playerName : ''),
          court: ('Booking' in t && t.Booking && 'Court' in t.Booking) ? t.Booking.Court.name : '',
          notes: t.notes || ''
        }))

        // Format expense transactions
        const formattedExpenses = expenseTransactions.map(t => ({
          section: 'GASTOS',
          period: '',
          type: t.type,
          category: t.category,
          description: t.description,
          totalIncome: '',
          incomeCount: '',
          totalExpenses: t.amount,
          expenseCount: '',
          totalRefunds: '',
          refundCount: '',
          netIncome: '',
          profitMargin: '',
          date: t.date,
          reference: t.reference || '',
          player: ('Player' in t && t.Player) ? t.Player.name : (('Booking' in t && t.Booking) ? t.Booking.playerName : ''),
          court: ('Booking' in t && t.Booking && 'Court' in t.Booking) ? t.Booking.Court.name : '',
          notes: t.notes || ''
        }))

        // Combine all data
        data = [
          summaryData,
          ...formattedIncomes,
          ...formattedExpenses
        ]

        headers = [
          'section',
          'period',
          'type',
          'category',
          'description',
          'totalIncome',
          'incomeCount',
          'totalExpenses',
          'expenseCount',
          'totalRefunds',
          'refundCount',
          'netIncome',
          'profitMargin',
          'date',
          'reference',
          'player',
          'court',
          'notes'
        ]

        filename = `Estado-Resultados-Completo_${Date.now()}.${format}`
        break

      default:
        return NextResponse.json(
          { success: false, error: 'Tipo de exportación no válido' },
          { status: 400 }
        )
    }

    // Return data based on format
    if (format === 'csv') {
      const csv = convertToCSV(data, headers)
      
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'no-cache'
        }
      })
    } else if (format === 'json') {
      return new NextResponse(JSON.stringify({
        success: true,
        data,
        metadata: {
          type,
          count: data.length,
          exportDate: new Date(),
          clubId: session.clubId,
          dateRange: dateFilter.gte ? {
            start: dateFilter.gte,
            end: dateFilter.lte
          } : null
        }
      }, null, 2), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'no-cache'
        }
      })
    } else {
      // Return as regular JSON response for API consumption
      return NextResponse.json({
        success: true,
        data,
        metadata: {
          type,
          count: data.length,
          exportDate: new Date()
        }
      })
    }

  } catch (error) {
    console.error('Error exporting data:', error)
    return NextResponse.json(
      { success: false, error: 'Error al exportar datos' },
      { status: 500 }
    )
  }
}

// POST - Generate Excel file (using JSON data)
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
    
    const { type, data, headers, filename } = body
    
    // For Excel generation, we'll return the structured data
    // The frontend will need to use a library like SheetJS to create the actual Excel file
    
    return NextResponse.json({
      success: true,
      exportData: {
        headers,
        data,
        metadata: {
          type,
          filename: filename || `export_${Date.now()}.xlsx`,
          generatedAt: new Date(),
          clubId: session.clubId,
          recordCount: data.length
        }
      },
      message: 'Datos preparados para exportación a Excel'
    })

  } catch (error) {
    console.error('Error preparing Excel export:', error)
    return NextResponse.json(
      { success: false, error: 'Error al preparar exportación' },
      { status: 500 }
    )
  }
}