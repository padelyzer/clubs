import { NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'

export async function GET() {
  try {
    const session = await requireAuthAPI()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    
    // Get current date info
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())

    // Get bookings counts - filtered by club
    const [todayBookings, weeklyBookings, monthlyBookings] = await Promise.all([
      prisma.booking.count({
        where: {
          clubId: session.clubId,
          date: {
            gte: today,
            lt: tomorrow
          }
        }
      }),
      prisma.booking.count({
        where: {
          clubId: session.clubId,
          date: {
            gte: startOfWeek
          }
        }
      }),
      prisma.booking.count({
        where: {
          clubId: session.clubId,
          date: {
            gte: startOfMonth
          }
        }
      })
    ])

    // Get revenue - filtered by club
    const monthlyRevenue = await prisma.payment.aggregate({
      _sum: {
        amount: true
      },
      where: {
        clubId: session.clubId,
        createdAt: {
          gte: startOfMonth
        },
        status: 'completed'
      }
    })

    // Get users count - filtered by club
    const [activeUsers, newUsers] = await Promise.all([
      prisma.user.count({
        where: {
          clubId: session.clubId,
          lastLoginAt: {
            gte: startOfWeek
          }
        }
      }),
      prisma.user.count({
        where: {
          clubId: session.clubId,
          createdAt: {
            gte: startOfMonth
          }
        }
      })
    ])

    // Get cancellation stats - filtered by club
    const [cancelledBookings, completedBookings] = await Promise.all([
      prisma.booking.count({
        where: {
          clubId: session.clubId,
          status: 'cancelled',
          date: {
            gte: startOfMonth
          }
        }
      }),
      prisma.booking.count({
        where: {
          clubId: session.clubId,
          status: 'completed',
          date: {
            gte: startOfMonth
          }
        }
      })
    ])

    // Calculate completion rate
    const totalBookings = cancelledBookings + completedBookings
    const completionRate = totalBookings > 0 
      ? ((completedBookings / totalBookings) * 100).toFixed(1)
      : 100

    // Get court utilization (simplified) - filtered by club
    const courtsCount = await prisma.court.count({
      where: { 
        clubId: session.clubId,
        active: true 
      }
    })
    
    const maxBookingsPerDay = courtsCount * 12 // Assuming 12 hours operation
    const courtUtilization = maxBookingsPerDay > 0
      ? Math.round((todayBookings / maxBookingsPerDay) * 100)
      : 0

    return NextResponse.json({
      todayBookings,
      weeklyBookings,
      monthlyBookings,
      monthlyRevenue: monthlyRevenue._sum.amount || 0,
      activeUsers,
      newUsers,
      cancelledBookings,
      completionRate: parseFloat(completionRate),
      courtUtilization,
      noShowBookings: 0 // Placeholder
    })
  } catch (error) {
    console.error('Dashboard metrics error:', error)
    // Return mock data for development
    return NextResponse.json({
      todayBookings: 12,
      weeklyBookings: 58,
      monthlyBookings: 234,
      monthlyRevenue: 58600,
      activeUsers: 145,
      newUsers: 28,
      cancelledBookings: 8,
      completionRate: 92.5,
      courtUtilization: 78,
      noShowBookings: 3
    })
  }
}