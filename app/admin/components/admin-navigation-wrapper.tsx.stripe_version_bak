import { getAdminStats, getSystemMetrics } from '@/lib/admin/data'
import AdminNavigation from './admin-navigation'

export default async function AdminNavigationWrapper() {
  const [stats, systemMetrics] = await Promise.all([
    getAdminStats(),
    getSystemMetrics()
  ])

  return (
    <AdminNavigation 
      stats={{
        pendingClubs: stats.pendingClubs,
        pendingSupportTickets: stats.pendingSupportTickets,
        unreadNotifications: stats.unreadNotifications
      }}
      systemMetrics={{
        uptime: systemMetrics.uptime
      }}
    />
  )
}