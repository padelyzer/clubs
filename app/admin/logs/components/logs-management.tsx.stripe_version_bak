'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  Search, 
  Filter, 
  Download, 
  AlertTriangle, 
  Info, 
  AlertCircle,
  XCircle,
  Eye,
  Calendar,
  User,
  Globe,
  Activity,
  ShieldAlert,
  Database,
  Settings
} from 'lucide-react'

interface LogEntry {
  id: string
  timestamp: Date
  level: string
  category: string
  action: string
  message: string
  userId: string
  userEmail: string
  ipAddress: string
  userAgent: string
  metadata: {
    resource: string
    details: string
  }
}

interface LogStats {
  total: number
  byLevel: {
    info: number
    warning: number
    error: number
    critical: number
  }
  byCategory: {
    auth: number
    booking: number
    payment: number
    admin: number
    system: number
    error: number
  }
}

interface Filters {
  level: string
  category: string
  search: string
  dateFrom: string
  dateTo: string
}

interface LogsManagementProps {
  logs: LogEntry[]
  stats: LogStats
  currentPage: number
  totalPages: number
  filters: Filters
}

export default function LogsManagement({
  logs,
  stats,
  currentPage,
  totalPages,
  filters
}: LogsManagementProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(filters.search)
  const [dateFrom, setDateFrom] = useState(filters.dateFrom)
  const [dateTo, setDateTo] = useState(filters.dateTo)
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams)
    if (search) {
      params.set('search', search)
    } else {
      params.delete('search')
    }
    if (dateFrom) {
      params.set('dateFrom', dateFrom)
    } else {
      params.delete('dateFrom')
    }
    if (dateTo) {
      params.set('dateTo', dateTo)
    } else {
      params.delete('dateTo')
    }
    params.delete('page')
    router.push(`/admin/logs?${params.toString()}`)
  }

  const handleFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value === 'all') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    params.delete('page')
    router.push(`/admin/logs?${params.toString()}`)
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', page.toString())
    router.push(`/admin/logs?${params.toString()}`)
  }

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return <XCircle className="w-4 h-4 text-red-600" />
      case 'ERROR':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'WARNING':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      default:
        return <Info className="w-4 h-4 text-blue-500" />
    }
  }

  const getLevelBadge = (level: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium"
    switch (level) {
      case 'CRITICAL':
        return `${baseClasses} bg-red-100 text-red-700`
      case 'ERROR':
        return `${baseClasses} bg-red-100 text-red-600`
      case 'WARNING':
        return `${baseClasses} bg-yellow-100 text-yellow-700`
      default:
        return `${baseClasses} bg-blue-100 text-blue-700`
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'AUTH':
        return <ShieldAlert className="w-4 h-4 text-green-600" />
      case 'BOOKING':
        return <Calendar className="w-4 h-4 text-blue-600" />
      case 'PAYMENT':
        return <Activity className="w-4 h-4 text-purple-600" />
      case 'ADMIN':
        return <Settings className="w-4 h-4 text-orange-600" />
      case 'SYSTEM':
        return <Database className="w-4 h-4 text-gray-600" />
      default:
        return <AlertCircle className="w-4 h-4 text-red-600" />
    }
  }

  const formatAction = (action: string) => {
    return action.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <div className="p-4 bg-white rounded-lg border">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
        <div className="p-4 bg-blue-50 rounded-lg border">
          <div className="text-2xl font-bold text-blue-600">{stats.byLevel.info}</div>
          <div className="text-sm text-gray-600">Info</div>
        </div>
        <div className="p-4 bg-yellow-50 rounded-lg border">
          <div className="text-2xl font-bold text-yellow-600">{stats.byLevel.warning}</div>
          <div className="text-sm text-gray-600">Warnings</div>
        </div>
        <div className="p-4 bg-red-50 rounded-lg border">
          <div className="text-2xl font-bold text-red-600">{stats.byLevel.error}</div>
          <div className="text-sm text-gray-600">Errors</div>
        </div>
        <div className="p-4 bg-red-100 rounded-lg border">
          <div className="text-2xl font-bold text-red-700">{stats.byLevel.critical}</div>
          <div className="text-sm text-gray-600">Critical</div>
        </div>
        <div className="p-4 bg-green-50 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">{stats.byCategory.auth}</div>
          <div className="text-sm text-gray-600">Auth</div>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg border">
          <div className="text-2xl font-bold text-purple-600">{stats.byCategory.payment}</div>
          <div className="text-sm text-gray-600">Payments</div>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg border">
          <div className="text-2xl font-bold text-gray-600">{stats.byCategory.system}</div>
          <div className="text-sm text-gray-600">System</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar logs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filters.level}
              onChange={(e) => handleFilter('level', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los niveles</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
              <option value="critical">Critical</option>
            </select>
            
            <select
              value={filters.category}
              onChange={(e) => handleFilter('category', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todas las categorías</option>
              <option value="auth">Autenticación</option>
              <option value="booking">Reservas</option>
              <option value="payment">Pagos</option>
              <option value="admin">Admin</option>
              <option value="system">Sistema</option>
              <option value="error">Errores</option>
            </select>
            
            <button className="btn btn-primary">
              <Search className="w-4 h-4" />
              Buscar
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Desde</label>
              <input
                type="datetime-local"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Hasta</label>
              <input
                type="datetime-local"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-end gap-2">
              <button type="submit" className="btn btn-primary flex-1">
                Aplicar Filtros
              </button>
              <button type="button" className="btn btn-success">
                <Download className="w-4 h-4" />
                Exportar
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Timestamp</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Nivel</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Categoría</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Acción</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Usuario</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">IP</th>
                <th className="text-center py-3 px-6 font-medium text-gray-900">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="text-sm">
                      <div className="font-medium">{log.timestamp.toLocaleDateString('es-MX')}</div>
                      <div className="text-gray-500">{log.timestamp.toLocaleTimeString('es-MX')}</div>
                    </div>
                  </td>
                  
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      {getLevelIcon(log.level)}
                      <span className={getLevelBadge(log.level)}>
                        {log.level}
                      </span>
                    </div>
                  </td>
                  
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(log.category)}
                      <span className="text-sm font-medium">{log.category}</span>
                    </div>
                  </td>
                  
                  <td className="py-4 px-6">
                    <div className="text-sm">
                      <div className="font-medium">{formatAction(log.action)}</div>
                      <div className="text-gray-500 truncate max-w-xs" title={log.message}>
                        {log.message}
                      </div>
                    </div>
                  </td>
                  
                  <td className="py-4 px-6">
                    <div className="text-sm">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3 text-gray-400" />
                        <span className="font-medium">{log.userId}</span>
                      </div>
                      <div className="text-gray-500">{log.userEmail}</div>
                    </div>
                  </td>
                  
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1 text-sm">
                      <Globe className="w-3 h-3 text-gray-400" />
                      <span>{log.ipAddress}</span>
                    </div>
                  </td>
                  
                  <td className="py-4 px-6 text-center">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Ver detalles"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Página {currentPage} de {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="btn btn-sm btn-ghost"
              >
                Anterior
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="btn btn-sm btn-ghost"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Detalles del Log</h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">ID</label>
                  <div className="text-sm">{selectedLog.id}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Timestamp</label>
                  <div className="text-sm">{selectedLog.timestamp.toLocaleString('es-MX')}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Nivel</label>
                  <div className="flex items-center gap-2">
                    {getLevelIcon(selectedLog.level)}
                    <span className={getLevelBadge(selectedLog.level)}>
                      {selectedLog.level}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Categoría</label>
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(selectedLog.category)}
                    <span>{selectedLog.category}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Usuario</label>
                  <div className="text-sm">
                    <div>{selectedLog.userId}</div>
                    <div className="text-gray-500">{selectedLog.userEmail}</div>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">IP Address</label>
                  <div className="text-sm">{selectedLog.ipAddress}</div>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Acción</label>
                <div className="text-sm font-medium">{formatAction(selectedLog.action)}</div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Mensaje</label>
                <div className="text-sm p-3 bg-gray-50 rounded">{selectedLog.message}</div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">User Agent</label>
                <div className="text-sm p-3 bg-gray-50 rounded text-xs">{selectedLog.userAgent}</div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Metadata</label>
                <div className="text-sm p-3 bg-gray-50 rounded">
                  <div><strong>Recurso:</strong> {selectedLog.metadata.resource}</div>
                  <div><strong>Detalles:</strong> {selectedLog.metadata.details}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}