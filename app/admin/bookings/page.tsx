import { requireSuperAdmin } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'
import BookingsMonitor from './components/bookings-monitor'

export const dynamic = 'force-dynamic'

export default async function AdminBookingsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams
  await requireSuperAdmin()

  const status = (searchParams.status as string) || 'all'
  const paymentStatus = (searchParams.paymentStatus as string) || 'all'
  const club = (searchParams.club as string) || 'all'
  const search = (searchParams.search as string) || ''
  const dateFrom = (searchParams.dateFrom as string) || ''
  const dateTo = (searchParams.dateTo as string) || ''
  const page = parseInt((searchParams.page as string) || '1')
  const limit = 20

  // Construir filtros
  const where: any = {}
  
  if (status !== 'all') {
    where.status = status.toUpperCase()
  }
  
  if (paymentStatus !== 'all') {
    where.paymentStatus = paymentStatus
  }
  
  if (club !== 'all') {
    where.clubId = club
  }
  
  if (search) {
    where.OR = [
      { playerName: { contains: search, mode: 'insensitive' } },
      { playerEmail: { contains: search, mode: 'insensitive' } },
      { playerPhone: { contains: search } }
    ]
  }
  
  if (dateFrom || dateTo) {
    where.date = {}
    if (dateFrom) {
      where.date.gte = new Date(dateFrom)
    }
    if (dateTo) {
      where.date.lte = new Date(dateTo)
    }
  }

  // Obtener bookings con paginación
  const [bookings, totalBookings, clubs, stats] = await Promise.all([
    prisma.booking.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        club: {
          select: {
            id: true,
            name: true,
            city: true,
            state: true
          }
        },
        court: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      }
    }),
    prisma.booking.count({ where }),
    prisma.club.findMany({
      where: { status: 'APPROVED' },
      select: {
        id: true,
        name: true,
        city: true,
        state: true
      },
      orderBy: { name: 'asc' }
    }),
    Promise.all([
      prisma.booking.count(),
      prisma.booking.count({ where: { status: 'PENDING' } }),
      prisma.booking.count({ where: { status: 'CONFIRMED' } }),
      prisma.booking.count({ where: { status: 'COMPLETED' } }),
      prisma.booking.count({ where: { status: 'CANCELLED' } }),
      prisma.booking.count({ where: { paymentStatus: 'pending' } }),
      prisma.booking.count({ where: { paymentStatus: 'completed' } }),
      prisma.booking.count({ where: { paymentStatus: 'failed' } }),
      prisma.booking.aggregate({
        where: { paymentStatus: 'completed' },
        _sum: { price: true }
      }),
      prisma.booking.count({
        where: {
          date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      prisma.booking.count({
        where: {
          date: {
            gte: new Date(new Date().setDate(new Date().getDate() - 7))
          }
        }
      })
    ])
  ])

  const [
    total,
    pending,
    confirmed,
    completed,
    cancelled,
    paymentPending,
    paymentCompleted,
    paymentFailed,
    totalRevenue,
    todayBookings,
    weekBookings
  ] = stats

  const bookingStats = {
    total,
    today: todayBookings,
    week: weekBookings,
    status: {
      pending,
      confirmed,
      completed,
      cancelled
    },
    payment: {
      pending: paymentPending,
      completed: paymentCompleted,
      failed: paymentFailed
    },
    revenue: (totalRevenue._sum.price || 0) / 100
  }

  const totalPages = Math.ceil(totalBookings / limit)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Monitor de Reservas</h1>
      </div>

      <BookingsMonitor 
        bookings={bookings.map(booking => ({
          ...booking,
          playerEmail: booking.playerEmail || undefined,
          notes: booking.notes || undefined
        }))}
        clubs={clubs}
        stats={bookingStats}
        currentPage={page}
        totalPages={totalPages}
        filters={{
          status,
          paymentStatus,
          club,
          search,
          dateFrom,
          dateTo
        }}
      />
    </div>
  )
}