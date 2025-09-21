import { requireSuperAdmin } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'
import { notFound } from 'next/navigation'
import ClubDetails from './components/club-details'

export default async function ClubDetailsPage(props: {
  params: Promise<{ id: string }>
}) {
  const params = await props.params
  await requireSuperAdmin()

  const club = await prisma.club.findUnique({
    where: { id: params.id },
    include: {
      User: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          active: true,
          createdAt: true
        }
      },
      Court: {
        select: {
          id: true,
          name: true,
          type: true,
          indoor: true,
          active: true
        }
      },
      Booking: {
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          Court: { select: { name: true } }
        }
      },
      _count: {
        select: {
          User: true,
          Court: true,
          Booking: true
        }
      }
    }
  })

  if (!club) {
    notFound()
  }

  // Debug: Ver usuarios del club
  console.log('Club ID:', params.id)
  console.log('Club name:', club.name)
  console.log('Club users count:', club.User.length)
  console.log('Club users:', club.User)

  // Obtener métricas del club
  const today = new Date()
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
  const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0)

  const [monthlyStats, lastMonthStats, revenueStats] = await Promise.all([
    Promise.all([
      prisma.booking.count({
        where: {
          clubId: params.id,
          createdAt: { gte: startOfMonth }
        }
      }),
      prisma.booking.aggregate({
        where: {
          clubId: params.id,
          paymentStatus: 'completed',
          createdAt: { gte: startOfMonth }
        },
        _sum: { price: true }
      })
    ]),
    Promise.all([
      prisma.booking.count({
        where: {
          clubId: params.id,
          createdAt: { gte: lastMonth, lte: endOfLastMonth }
        }
      }),
      prisma.booking.aggregate({
        where: {
          clubId: params.id,
          paymentStatus: 'completed',
          createdAt: { gte: lastMonth, lte: endOfLastMonth }
        },
        _sum: { price: true }
      })
    ]),
    prisma.booking.aggregate({
      where: {
        clubId: params.id,
        paymentStatus: 'completed'
      },
      _sum: { price: true }
    })
  ])

  const [monthBookings, monthRevenue] = monthlyStats
  const [lastMonthBookings, lastMonthRevenueAgg] = lastMonthStats

  const stats = {
    bookings: {
      month: monthBookings,
      lastMonth: lastMonthBookings,
      total: club._count.Booking,
      growth: lastMonthBookings > 0 ? ((monthBookings - lastMonthBookings) / lastMonthBookings * 100) : 0
    },
    revenue: {
      month: (monthRevenue._sum.price || 0) / 100,
      lastMonth: (lastMonthRevenueAgg._sum.price || 0) / 100,
      total: (revenueStats._sum.price || 0) / 100,
      growth: lastMonthRevenueAgg._sum.price ? 
        (((monthRevenue._sum.price || 0) - (lastMonthRevenueAgg._sum.price || 0)) / (lastMonthRevenueAgg._sum.price || 1) * 100) : 0
    },
    users: club._count.User,
    courts: club._count.Court
  }

  return (
    <div className="space-y-6">
      <ClubDetails club={{
        ...club,
        website: club.website || undefined,
        description: club.description || undefined,
        stripeAccountId: club.stripeAccountId || undefined,
        approvedAt: club.approvedAt || undefined,
        users: club.User.map(user => ({
          ...user,
          name: user.name || 'Sin nombre',
          role: user.role
        })),
        courts: club.Court,
        bookings: club.Booking
      }} stats={stats} />
    </div>
  )
}