import { requireSuperAdmin } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'
import CommunicationsManagement from './components/communications-management'

export const dynamic = 'force-dynamic'

export default async function AdminCommunicationsPage() {
  await requireSuperAdmin()

  // Obtener datos para comunicaciones
  const [clubs, users, templates, stats] = await Promise.all([
    // Clubes activos
    prisma.club.findMany({
      where: { status: 'APPROVED' },
      select: {
        id: true,
        name: true,
        city: true,
        state: true,
        email: true,
        _count: {
          select: {
            users: true
          }
        }
      },
      orderBy: { name: 'asc' }
    }),
    // Estadísticas de usuarios
    Promise.all([
      prisma.user.count({ where: { active: true } }),
      prisma.user.count({ where: { role: 'CLUB_OWNER', active: true } }),
      prisma.user.count({ where: { role: 'CLUB_STAFF', active: true } }),
      prisma.user.count({ where: { role: 'USER', active: true } })
    ]),
    // Templates de WhatsApp disponibles
    [
      {
        id: 'club_announcement',
        name: 'Anuncio a Clubes',
        description: 'Comunicado general para propietarios de clubes',
        variables: ['club_name', 'message']
      },
      {
        id: 'user_notification',
        name: 'Notificación a Usuarios',
        description: 'Mensaje informativo para usuarios finales',
        variables: ['user_name', 'message']
      },
      {
        id: 'system_maintenance',
        name: 'Mantenimiento del Sistema',
        description: 'Notificación de mantenimiento programado',
        variables: ['start_time', 'duration', 'message']
      },
      {
        id: 'new_feature',
        name: 'Nueva Funcionalidad',
        description: 'Anuncio de nuevas características',
        variables: ['feature_name', 'description', 'link']
      }
    ],
    // Estadísticas de comunicaciones (últimos 30 días)
    Promise.all([
      prisma.notification.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      }),
      prisma.notification.count({
        where: {
          status: 'sent',
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      }),
      prisma.notification.count({
        where: {
          status: 'failed',
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      })
    ])
  ])

  const [totalUsers, clubOwners, clubStaff, regularUsers] = users
  const [totalNotifications, sentNotifications, failedNotifications] = stats

  const communicationStats = {
    audiences: {
      totalUsers,
      clubOwners,
      clubStaff,
      regularUsers,
      totalClubs: clubs.length
    },
    notifications: {
      total: totalNotifications,
      sent: sentNotifications,
      failed: failedNotifications,
      successRate: totalNotifications > 0 ? (sentNotifications / totalNotifications * 100) : 0
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Sistema de Comunicación</h1>
      </div>

      <CommunicationsManagement 
        clubs={clubs}
        templates={templates}
        stats={communicationStats}
      />
    </div>
  )
}