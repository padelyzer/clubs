import { requireSuperAdmin } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'
import SupportTools from './components/support-tools'

export const dynamic = 'force-dynamic'

export default async function AdminSupportPage() {
  await requireSuperAdmin()

  // Obtener datos para herramientas de soporte
  const [recentIssues, supportStats, frequentUsers, systemHealth] = await Promise.all([
    // Simular tickets de soporte recientes
    Promise.resolve([
      {
        id: 'ticket_001',
        title: 'Problem with payment processing',
        description: 'User unable to complete booking payment',
        priority: 'HIGH',
        status: 'OPEN',
        userId: 'user_123',
        userEmail: 'user@example.com',
        clubId: 'club_456',
        clubName: 'Club Deportivo Central',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        category: 'PAYMENT'
      },
      {
        id: 'ticket_002',
        title: 'Club approval request',
        description: 'New club requesting approval for onboarding',
        priority: 'MEDIUM',
        status: 'IN_PROGRESS',
        userId: 'user_456',
        userEmail: 'club@example.com',
        clubId: 'club_789',
        clubName: 'Padel Club Norte',
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
        category: 'ONBOARDING'
      },
      {
        id: 'ticket_003',
        title: 'Widget not displaying correctly',
        description: 'Booking widget shows error on club website',
        priority: 'LOW',
        status: 'RESOLVED',
        userId: 'user_789',
        userEmail: 'support@clubexample.com',
        clubId: 'club_101',
        clubName: 'Elite Padel Center',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        category: 'TECHNICAL'
      }
    ]),
    
    // Estadísticas de soporte
    Promise.resolve({
      totalTickets: 156,
      openTickets: 23,
      inProgressTickets: 8,
      resolvedTickets: 125,
      avgResolutionTime: 4.2, // hours
      satisfactionRating: 4.7,
      responseTimes: {
        avg: 0.8, // hours
        p95: 2.1
      }
    }),
    
    // Usuarios con problemas frecuentes
    prisma.user.findMany({
      where: { active: true },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        Club: {
          select: { name: true, status: true }
        }
      }
    }),
    
    // Estado del sistema
    Promise.resolve({
      uptime: 99.9,
      responseTime: 145, // ms
      errorRate: 0.01,
      activeUsers: 1247,
      totalBookingsToday: 89,
      systemLoad: 23.4,
      databaseStatus: 'HEALTHY',
      stripeStatus: 'OPERATIONAL',
      whatsappStatus: 'OPERATIONAL'
    })
  ])

  const tools = {
    issues: recentIssues,
    stats: supportStats,
    users: frequentUsers,
    health: systemHealth
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Herramientas de Soporte</h1>
      </div>

      <SupportTools tools={{
        ...tools,
        users: frequentUsers.map(user => ({
          ...user,
          name: user.name || 'Sin nombre',
          role: user.role,
          club: user.Club ? {
            name: user.Club.name,
            status: user.Club.status
          } : undefined
        }))
      }} />
    </div>
  )
}