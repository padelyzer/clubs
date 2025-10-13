import { requireSuperAdmin } from '@/lib/auth/actions'
import LogsManagement from './components/logs-management'

export const dynamic = 'force-dynamic'

export default async function AdminLogsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams
  await requireSuperAdmin()

  const level = (searchParams.level as string) || 'all'
  const category = (searchParams.category as string) || 'all'
  const search = (searchParams.search as string) || ''
  const dateFrom = (searchParams.dateFrom as string) || ''
  const dateTo = (searchParams.dateTo as string) || ''
  const page = parseInt((searchParams.page as string) || '1')
  const limit = 50

  // En una implementación real, estos logs vendrían de una base de datos
  // Por ahora simulamos logs del sistema
  const generateLogs = () => {
    const categories = ['AUTH', 'BOOKING', 'PAYMENT', 'ADMIN', 'SYSTEM', 'ERROR']
    const levels = ['INFO', 'WARNING', 'ERROR', 'CRITICAL']
    const actions = [
      'USER_LOGIN', 'USER_LOGOUT', 'CLUB_APPROVED', 'CLUB_REJECTED', 'BOOKING_CREATED',
      'BOOKING_CANCELLED', 'PAYMENT_COMPLETED', 'PAYMENT_FAILED', 'ADMIN_LOGIN',
      'SYSTEM_ERROR', 'DATABASE_ERROR', 'API_ERROR', 'CONFIG_CHANGED'
    ]
    
    const logs = []
    for (let i = 0; i < 200; i++) {
      const randomCategory = categories[Math.floor(Math.random() * categories.length)]
      const randomLevel = levels[Math.floor(Math.random() * levels.length)]
      const randomAction = actions[Math.floor(Math.random() * actions.length)]
      const randomDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      
      logs.push({
        id: `log_${i + 1}`,
        timestamp: randomDate,
        level: randomLevel,
        category: randomCategory,
        action: randomAction,
        message: `${randomAction.toLowerCase().replace(/_/g, ' ')} - Log entry ${i + 1}`,
        userId: `user_${Math.floor(Math.random() * 100)}`,
        userEmail: `user${Math.floor(Math.random() * 100)}@example.com`,
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0 (compatible; Admin Panel)',
        metadata: {
          resource: randomCategory === 'BOOKING' ? 'booking_123' : 
                   randomCategory === 'ADMIN' ? 'club_456' : 'system',
          details: `Additional context for ${randomAction}`
        }
      })
    }
    
    return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  let allLogs = generateLogs()

  // Aplicar filtros
  if (level !== 'all') {
    allLogs = allLogs.filter(log => log.level === level.toUpperCase())
  }
  
  if (category !== 'all') {
    allLogs = allLogs.filter(log => log.category === category.toUpperCase())
  }
  
  if (search) {
    allLogs = allLogs.filter(log => 
      log.message.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.userEmail.toLowerCase().includes(search.toLowerCase())
    )
  }
  
  if (dateFrom) {
    allLogs = allLogs.filter(log => log.timestamp >= new Date(dateFrom))
  }
  
  if (dateTo) {
    allLogs = allLogs.filter(log => log.timestamp <= new Date(dateTo))
  }

  // Paginación
  const totalLogs = allLogs.length
  const startIndex = (page - 1) * limit
  const paginatedLogs = allLogs.slice(startIndex, startIndex + limit)
  const totalPages = Math.ceil(totalLogs / limit)

  // Estadísticas
  const stats = {
    total: allLogs.length,
    byLevel: {
      info: allLogs.filter(log => log.level === 'INFO').length,
      warning: allLogs.filter(log => log.level === 'WARNING').length,
      error: allLogs.filter(log => log.level === 'ERROR').length,
      critical: allLogs.filter(log => log.level === 'CRITICAL').length
    },
    byCategory: {
      auth: allLogs.filter(log => log.category === 'AUTH').length,
      booking: allLogs.filter(log => log.category === 'BOOKING').length,
      payment: allLogs.filter(log => log.category === 'PAYMENT').length,
      admin: allLogs.filter(log => log.category === 'ADMIN').length,
      system: allLogs.filter(log => log.category === 'SYSTEM').length,
      error: allLogs.filter(log => log.category === 'ERROR').length
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Logs y Auditoría</h1>
      </div>

      <LogsManagement 
        logs={paginatedLogs}
        stats={stats}
        currentPage={page}
        totalPages={totalPages}
        filters={{
          level,
          category,
          search,
          dateFrom,
          dateTo
        }}
      />
    </div>
  )
}