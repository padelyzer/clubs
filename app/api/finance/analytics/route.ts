import { NextRequest, NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'
import { startOfMonth, endOfMonth, startOfYear, endOfYear, format, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'

// GET - Get profitability analytics
export async function GET(request: NextRequest) {
  try {
    console.log('Finance analytics API called')
    const session = await requireAuthAPI()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    console.log('Session obtained:', session.clubId)
    const { searchParams } = new URL(request.url)
    
    const analysisType = searchParams.get('type') || 'overview' // overview, court, class, customer, trend
    const period = searchParams.get('period') || 'month' // month, year, custom
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    
    // Determine date range
    let dateStart: Date
    let dateEnd: Date
    
    if (startDate && endDate) {
      dateStart = new Date(startDate)
      dateEnd = new Date(endDate)
    } else if (period === 'year') {
      dateStart = startOfYear(new Date())
      dateEnd = endOfYear(new Date())
    } else {
      dateStart = startOfMonth(new Date())
      dateEnd = endOfMonth(new Date())
    }

    let analytics: any = {}

    switch (analysisType) {
      case 'overview':
        analytics = await getOverviewAnalytics(session.clubId, dateStart, dateEnd)
        break
      case 'court':
        analytics = await getCourtProfitability(session.clubId, dateStart, dateEnd)
        break
      case 'class':
        analytics = await getClassProfitability(session.clubId, dateStart, dateEnd)
        break
      case 'customer':
        analytics = await getCustomerAnalytics(session.clubId, dateStart, dateEnd)
        break
      case 'trend':
        analytics = await getTrendAnalysis(session.clubId, dateStart, dateEnd)
        break
      default:
        analytics = await getOverviewAnalytics(session.clubId, dateStart, dateEnd)
    }

    return NextResponse.json({
      success: true,
      analytics,
      period: {
        start: dateStart,
        end: dateEnd,
        label: `${format(dateStart, 'dd MMM', { locale: es })} - ${format(dateEnd, 'dd MMM yyyy', { locale: es })}`
      }
    })

  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener análisis' },
      { status: 500 }
    )
  }
}

// Overview Analytics
async function getOverviewAnalytics(clubId: string, startDate: Date, endDate: Date) {
  console.log('Getting overview analytics for club:', clubId, 'from', startDate, 'to', endDate)
  const [revenue, expenses, bookings, classes, customers] = await Promise.all([
    // Total revenue
    prisma.transaction.aggregate({
      where: {
        clubId,
        type: 'INCOME',
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      _sum: { amount: true },
      _count: true
    }),
    // Total expenses
    prisma.transaction.aggregate({
      where: {
        clubId,
        type: 'EXPENSE',
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      _sum: { amount: true },
      _count: true
    }),
    // Bookings metrics
    prisma.booking.aggregate({
      where: {
        clubId,
        date: {
          gte: startDate,
          lte: endDate
        },
        status: { notIn: ['CANCELLED'] }
      },
      _sum: { price: true },
      _count: true
    }),
    // Classes metrics
    prisma.class.aggregate({
      where: {
        clubId,
        date: {
          gte: startDate,
          lte: endDate
        },
        status: { notIn: ['CANCELLED'] }
      },
      _sum: { 
        price: true
      },
      _count: true
    }),
    // Active customers - Contar jugadores únicos de reservas
    prisma.booking.groupBy({
      by: ['playerName'],
      where: {
        clubId,
        date: {
          gte: startDate,
          lte: endDate
        },
        status: { notIn: ['CANCELLED'] }
      }
    }).then(result => result.length)
  ])

  const totalRevenue = revenue._sum.amount || 0
  const totalExpenses = expenses._sum.amount || 0
  const netProfit = totalRevenue - totalExpenses
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue * 100) : 0
  
  console.log('Revenue data:', revenue)
  console.log('Total revenue calculated:', totalRevenue)

  // Revenue breakdown by source
  const revenueByCategory = await prisma.transaction.groupBy({
    by: ['category'],
    where: {
      clubId,
      type: 'INCOME',
      date: {
        gte: startDate,
        lte: endDate
      }
    },
    _sum: { amount: true },
    _count: true
  })

  // Expense breakdown by category
  const expensesByCategory = await prisma.transaction.groupBy({
    by: ['category'],
    where: {
      clubId,
      type: 'EXPENSE',
      date: {
        gte: startDate,
        lte: endDate
      }
    },
    _sum: { amount: true },
    _count: true
  })

  return {
    summary: {
      revenue: totalRevenue,
      expenses: totalExpenses,
      netProfit,
      profitMargin: profitMargin.toFixed(2),
      revenuePerTransaction: revenue._count > 0 ? totalRevenue / revenue._count : 0,
      expensePerTransaction: expenses._count > 0 ? totalExpenses / expenses._count : 0
    },
    operations: {
      totalBookings: bookings._count,
      bookingRevenue: bookings._sum.price || 0,
      averageBookingValue: bookings._count > 0 ? (bookings._sum.price || 0) / bookings._count : 0,
      totalClasses: classes._count,
      classRevenue: classes._sum.price || 0,
      totalStudents: classes._count * 6, // Assuming average 6 students per class
      averageClassSize: 6,
      activeCustomers: customers
    },
    revenueBreakdown: revenueByCategory.map(item => ({
      category: item.category,
      amount: item._sum.amount || 0,
      count: item._count,
      percentage: totalRevenue > 0 ? ((item._sum.amount || 0) / totalRevenue * 100).toFixed(2) : '0'
    })),
    expenseBreakdown: expensesByCategory.map(item => ({
      category: item.category,
      amount: item._sum.amount || 0,
      count: item._count,
      percentage: totalExpenses > 0 ? ((item._sum.amount || 0) / totalExpenses * 100).toFixed(2) : '0'
    })),
    kpis: {
      revenuePerCustomer: customers > 0 ? totalRevenue / customers : 0,
      customerAcquisitionCost: customers > 0 && totalExpenses > 0 ? 
        (expensesByCategory.find(e => e.category === 'MARKETING')?._sum.amount || 0) / customers : 0,
      occupancyRate: 0 // Would need court availability data to calculate
    }
  }
}

// Court Profitability Analysis
async function getCourtProfitability(clubId: string, startDate: Date, endDate: Date) {
  // Get all courts
  const courts = await prisma.court.findMany({
    where: {
      clubId,
      active: true
    }
  })

  // Get revenue and bookings per court
  const courtAnalytics = await Promise.all(
    courts.map(async (court) => {
      const bookings = await prisma.booking.aggregate({
        where: {
          courtId: court.id,
          date: {
            gte: startDate,
            lte: endDate
          },
          status: { notIn: ['CANCELLED'] }
        },
        _sum: { price: true },
        _count: true
      })

      const classes = await prisma.class.aggregate({
        where: {
          courtId: court.id,
          date: {
            gte: startDate,
            lte: endDate
          },
          status: { notIn: ['CANCELLED'] }
        },
        _sum: { 
          price: true
        },
        _count: true
      })

      const totalRevenue = (bookings._sum.price || 0) + (classes._sum.price || 0)
      const totalEvents = bookings._count + classes._count

      // Calculate available hours (rough estimate)
      const daysInPeriod = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      const availableHours = daysInPeriod * 12 // Assuming 12 hours per day availability
      const bookedHours = (bookings._count * 1.5) + (classes._count * 2) // Assuming 1.5 hours per booking, 2 hours per class
      const utilizationRate = availableHours > 0 ? (bookedHours / availableHours * 100) : 0

      return {
        courtId: court.id,
        courtName: court.name,
        courtType: court.type || 'Standard',
        bookings: {
          count: bookings._count,
          revenue: bookings._sum.price || 0
        },
        classes: {
          count: classes._count,
          revenue: classes._sum.price || 0,
          totalStudents: classes._count * 6 // Estimate
        },
        totalRevenue,
        totalEvents,
        averageRevenuePerEvent: totalEvents > 0 ? totalRevenue / totalEvents : 0,
        utilizationRate: utilizationRate.toFixed(2),
        revenuePerHour: bookedHours > 0 ? totalRevenue / bookedHours : 0
      }
    })
  )

  // Sort by total revenue
  courtAnalytics.sort((a, b) => b.totalRevenue - a.totalRevenue)

  const totalRevenue = courtAnalytics.reduce((sum, court) => sum + court.totalRevenue, 0)

  return {
    courts: courtAnalytics.map(court => ({
      ...court,
      revenueShare: totalRevenue > 0 ? ((court.totalRevenue / totalRevenue) * 100).toFixed(2) : '0'
    })),
    summary: {
      totalCourts: courts.length,
      totalRevenue,
      averageRevenuePerCourt: courts.length > 0 ? totalRevenue / courts.length : 0,
      topPerformer: courtAnalytics[0]?.courtName || 'N/A',
      bottomPerformer: courtAnalytics[courtAnalytics.length - 1]?.courtName || 'N/A'
    }
  }
}

// Class Profitability Analysis
async function getClassProfitability(clubId: string, startDate: Date, endDate: Date) {
  // Get all classes with instructor info
  const classes = await prisma.class.findMany({
    where: {
      clubId,
      date: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      Court: {
        select: { name: true }
      }
    }
  })

  // Group by instructor
  const instructorAnalytics: Record<string, any> = {}

  classes.forEach(cls => {
    const instructorId = cls.instructorId
    const instructorName = cls.instructorName || 'Sin instructor'
    
    if (!instructorAnalytics[instructorId]) {
      instructorAnalytics[instructorId] = {
        instructorId,
        instructorName,
        totalClasses: 0,
        totalStudents: 0,
        totalRevenue: 0,
        totalCost: 0,
        categories: {}
      }
    }

    instructorAnalytics[instructorId].totalClasses++
    instructorAnalytics[instructorId].totalStudents += cls.enrolledCount
    
    // Calculate revenue from class price and enrolled students
    const classRevenue = cls.price * cls.enrolledCount
    
    instructorAnalytics[instructorId].totalRevenue += classRevenue

    // Track by category/type
    if (!instructorAnalytics[instructorId].categories[cls.type]) {
      instructorAnalytics[instructorId].categories[cls.type] = {
        count: 0,
        students: 0,
        revenue: 0
      }
    }
    
    instructorAnalytics[instructorId].categories[cls.type].count++
    instructorAnalytics[instructorId].categories[cls.type].students += cls.enrolledCount
    instructorAnalytics[instructorId].categories[cls.type].revenue += classRevenue
  })

  // Note: instructorPayroll table doesn't exist, using estimate
  const instructorPayroll = { _sum: { netAmount: 0 }, _count: 0 }

  // Calculate profitability metrics
  const instructorResults = Object.values(instructorAnalytics).map(instructor => {
    const averageStudentsPerClass = instructor.totalClasses > 0 ? 
      instructor.totalStudents / instructor.totalClasses : 0
    const revenuePerStudent = instructor.totalStudents > 0 ?
      instructor.totalRevenue / instructor.totalStudents : 0
    const revenuePerClass = instructor.totalClasses > 0 ?
      instructor.totalRevenue / instructor.totalClasses : 0
    
    // Estimate cost (simplified - would need actual payroll data per instructor)
    const estimatedCost = instructor.totalClasses * 25000 // Assuming $250 MXN per class
    const profit = instructor.totalRevenue - estimatedCost
    const profitMargin = instructor.totalRevenue > 0 ?
      (profit / instructor.totalRevenue * 100) : 0

    return {
      ...instructor,
      averageStudentsPerClass: averageStudentsPerClass.toFixed(1),
      revenuePerStudent,
      revenuePerClass,
      estimatedCost,
      profit,
      profitMargin: profitMargin.toFixed(2)
    }
  })

  // Sort by revenue
  instructorResults.sort((a, b) => b.totalRevenue - a.totalRevenue)

  const totalRevenue = instructorResults.reduce((sum, i) => sum + i.totalRevenue, 0)
  const totalCost = instructorResults.reduce((sum, i) => sum + i.estimatedCost, 0)
  const totalProfit = totalRevenue - totalCost

  return {
    instructors: instructorResults,
    summary: {
      totalClasses: classes.length,
      totalInstructors: instructorResults.length,
      totalRevenue,
      totalCost,
      totalProfit,
      averageProfitMargin: totalRevenue > 0 ? 
        ((totalProfit / totalRevenue) * 100).toFixed(2) : '0',
      topPerformer: instructorResults[0]?.instructorName || 'N/A'
    }
  }
}

// Customer Analytics
async function getCustomerAnalytics(clubId: string, startDate: Date, endDate: Date) {
  // Get bookings with customer info for the period
  const bookings = await prisma.booking.findMany({
    where: {
      clubId,
      date: {
        gte: startDate,
        lte: endDate
      },
      status: { notIn: ['CANCELLED'] }
    },
    select: {
      playerName: true,
      playerEmail: true,
      price: true,
      date: true
    }
  })

  // Group by customer
  const customerMap = new Map()
  bookings.forEach(booking => {
    const key = booking.playerEmail || booking.playerName
    if (!customerMap.has(key)) {
      customerMap.set(key, {
        name: booking.playerName,
        email: booking.playerEmail,
        totalBookings: 0,
        totalSpent: 0,
        lastBooking: booking.date
      })
    }
    const customer = customerMap.get(key)
    customer.totalBookings += 1
    customer.totalSpent += booking.price
    if (booking.date > customer.lastBooking) {
      customer.lastBooking = booking.date
    }
  })

  const customers = Array.from(customerMap.values())

  return {
    totalCustomers: customers.length,
    topCustomers: customers
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10)
      .map(c => ({
        name: c.name,
        email: c.email,
        bookings: c.totalBookings,
        revenue: c.totalSpent,
        avgBookingValue: c.totalSpent / c.totalBookings,
        lastBooking: c.lastBooking,
        segment: c.totalSpent > 300000 ? 'VIP' : c.totalSpent > 150000 ? 'Premium' : 'Regular'
      })),
    segments: {
      vip: customers.filter(c => c.totalSpent > 300000).length,
      premium: customers.filter(c => c.totalSpent > 150000 && c.totalSpent <= 300000).length,
      regular: customers.filter(c => c.totalSpent <= 150000).length
    },
    metrics: {
      avgBookingsPerCustomer: customers.reduce((sum, c) => sum + c.totalBookings, 0) / customers.length || 0,
      avgRevenuePerCustomer: customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length || 0
    }
  }
}

// Trend Analysis
async function getTrendAnalysis(clubId: string, startDate: Date, endDate: Date) {
  const monthlyData = []
  
  // Generate monthly data points
  let currentDate = new Date(startDate)
  while (currentDate <= endDate) {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    
    const [income, expenses, bookings, newCustomers] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          clubId,
          type: 'INCOME',
          date: {
            gte: monthStart,
            lte: monthEnd
          }
        },
        _sum: { amount: true }
      }),
      prisma.transaction.aggregate({
        where: {
          clubId,
          type: 'EXPENSE',
          date: {
            gte: monthStart,
            lte: monthEnd
          }
        },
        _sum: { amount: true }
      }),
      prisma.booking.count({
        where: {
          clubId,
          date: {
            gte: monthStart,
            lte: monthEnd
          },
          status: { notIn: ['CANCELLED'] }
        }
      }),
      // Count new customers from unique booking players in this month
      prisma.booking.groupBy({
        by: ['playerName'],
        where: {
          clubId,
          createdAt: {
            gte: monthStart,
            lte: monthEnd
          }
        }
      }).then(result => result.length)
    ])

    monthlyData.push({
      month: format(monthStart, 'MMM yyyy', { locale: es }),
      revenue: income._sum.amount || 0,
      expenses: expenses._sum.amount || 0,
      profit: (income._sum.amount || 0) - (expenses._sum.amount || 0),
      bookings,
      newCustomers
    })

    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
  }

  // Calculate growth rates
  const growthRates = monthlyData.map((month, index) => {
    if (index === 0) return { ...month, revenueGrowth: 0, bookingGrowth: 0 }
    
    const prevMonth = monthlyData[index - 1]
    const revenueGrowth = prevMonth.revenue > 0 ?
      ((month.revenue - prevMonth.revenue) / prevMonth.revenue * 100) : 0
    const bookingGrowth = prevMonth.bookings > 0 ?
      ((month.bookings - prevMonth.bookings) / prevMonth.bookings * 100) : 0
    
    return {
      ...month,
      revenueGrowth: revenueGrowth.toFixed(2),
      bookingGrowth: bookingGrowth.toFixed(2)
    }
  })

  // Calculate averages and projections
  const avgMonthlyRevenue = monthlyData.reduce((sum, m) => sum + m.revenue, 0) / monthlyData.length
  const avgMonthlyExpenses = monthlyData.reduce((sum, m) => sum + m.expenses, 0) / monthlyData.length
  const avgMonthlyProfit = monthlyData.reduce((sum, m) => sum + m.profit, 0) / monthlyData.length

  return {
    monthlyTrend: growthRates,
    summary: {
      averageMonthlyRevenue: avgMonthlyRevenue,
      averageMonthlyExpenses: avgMonthlyExpenses,
      averageMonthlyProfit: avgMonthlyProfit,
      totalPeriodRevenue: monthlyData.reduce((sum, m) => sum + m.revenue, 0),
      totalPeriodExpenses: monthlyData.reduce((sum, m) => sum + m.expenses, 0),
      totalPeriodProfit: monthlyData.reduce((sum, m) => sum + m.profit, 0)
    },
    forecast: {
      nextMonthRevenue: avgMonthlyRevenue * 1.05, // Simple 5% growth projection
      nextMonthExpenses: avgMonthlyExpenses,
      nextMonthProfit: (avgMonthlyRevenue * 1.05) - avgMonthlyExpenses
    }
  }
}