'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Search, 
  Filter, 
  UserPlus, 
  MoreVertical, 
  Edit, 
  Trash2,
  Mail,
  Shield,
  Activity,
  ChevronLeft,
  ChevronRight,
  Users,
  UserCheck,
  UserX
} from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  phone?: string | null
  role: string
  active: boolean
  createdAt: Date
  lastLoginAt?: Date | null
  club?: {
    id: string
    name: string
    status: string
  }
  sessionsCount: number
}

interface Props {
  users: User[]
  clubs: any[]
  stats: {
    total: number
    active: number
    inactive: number
    roles: {
      user: number
      club_owner: number
      super_admin: number
    }
  }
  currentPage: number
  totalPages: number
  currentRole: string
  currentStatus: string
  currentClub: string
  currentSearch: string
}

export default function UsersManagement({
  users,
  clubs,
  stats,
  currentPage,
  totalPages,
  currentRole,
  currentStatus,
  currentClub,
  currentSearch
}: Props) {
  const router = useRouter()
  const [searchInput, setSearchInput] = useState(currentSearch)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchInput) params.set('search', searchInput)
    if (currentRole !== 'all') params.set('role', currentRole)
    if (currentStatus !== 'all') params.set('status', currentStatus)
    if (currentClub !== 'all') params.set('club', currentClub)
    router.push(`/admin/users?${params.toString()}`)
  }

  const handleFilterChange = (type: string, value: string) => {
    const params = new URLSearchParams()
    if (currentSearch) params.set('search', currentSearch)
    if (type === 'role') {
      if (value !== 'all') params.set('role', value)
      if (currentStatus !== 'all') params.set('status', currentStatus)
      if (currentClub !== 'all') params.set('club', currentClub)
    } else if (type === 'status') {
      if (currentRole !== 'all') params.set('role', currentRole)
      if (value !== 'all') params.set('status', value)
      if (currentClub !== 'all') params.set('club', currentClub)
    } else if (type === 'club') {
      if (currentRole !== 'all') params.set('role', currentRole)
      if (currentStatus !== 'all') params.set('status', currentStatus)
      if (value !== 'all') params.set('club', value)
    }
    router.push(`/admin/users?${params.toString()}`)
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams()
    if (currentSearch) params.set('search', currentSearch)
    if (currentRole !== 'all') params.set('role', currentRole)
    if (currentStatus !== 'all') params.set('status', currentStatus)
    if (currentClub !== 'all') params.set('club', currentClub)
    params.set('page', page.toString())
    router.push(`/admin/users?${params.toString()}`)
  }

  const getRoleBadge = (role: string) => {
    const roleStyles = {
      SUPER_ADMIN: 'bg-purple-100 text-purple-800',
      CLUB_OWNER: 'bg-blue-100 text-blue-800',
      CLUB_STAFF: 'bg-indigo-100 text-indigo-800',
      USER: 'bg-green-100 text-green-800'
    }
    const roleLabels = {
      SUPER_ADMIN: 'Super Admin',
      CLUB_OWNER: 'Dueño Club',
      CLUB_STAFF: 'Staff Club',
      USER: 'Usuario'
    }
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${roleStyles[role as keyof typeof roleStyles] || 'bg-gray-100 text-gray-800'}`}>
        {roleLabels[role as keyof typeof roleLabels] || role}
      </span>
    )
  }

  const getStatusBadge = (active: boolean) => {
    return active ? (
      <span className="flex items-center gap-1 text-green-600">
        <Activity className="h-3 w-3" />
        Activo
      </span>
    ) : (
      <span className="flex items-center gap-1 text-gray-500">
        <Activity className="h-3 w-3" />
        Inactivo
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Usuarios</p>
              <p className="text-2xl font-bold">{stats.total.toLocaleString()}</p>
            </div>
            <Users className="h-8 w-8 text-gray-400" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Activos</p>
              <p className="text-2xl font-bold text-green-600">{stats.active.toLocaleString()}</p>
            </div>
            <UserCheck className="h-8 w-8 text-green-400" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Inactivos</p>
              <p className="text-2xl font-bold text-gray-600">{stats.inactive.toLocaleString()}</p>
            </div>
            <UserX className="h-8 w-8 text-gray-400" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Usuarios</p>
              <p className="text-2xl font-bold text-blue-600">{stats.roles.user.toLocaleString()}</p>
            </div>
            <Users className="h-8 w-8 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Dueños Club</p>
              <p className="text-2xl font-bold text-purple-600">{stats.roles.club_owner.toLocaleString()}</p>
            </div>
            <Shield className="h-8 w-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Buscar por nombre, email..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </form>
          
          <select
            value={currentRole}
            onChange={(e) => handleFilterChange('role', e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="all">Todos los roles</option>
            <option value="user">Usuario</option>
            <option value="club_owner">Dueño Club</option>
            <option value="club_staff">Staff Club</option>
            <option value="super_admin">Super Admin</option>
          </select>
          
          <select
            value={currentStatus}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
          
          <select
            value={currentClub}
            onChange={(e) => handleFilterChange('club', e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="all">Todos los clubs</option>
            {clubs.map(club => (
              <option key={club.id} value={club.id}>{club.name}</option>
            ))}
          </select>
          
          <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Nuevo Usuario
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(users.map(u => u.id))
                      } else {
                        setSelectedUsers([])
                      }
                    }}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Club
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sesiones
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registro
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      checked={selectedUsers.includes(user.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers([...selectedUsers, user.id])
                        } else {
                          setSelectedUsers(selectedUsers.filter(id => id !== user.id))
                        }
                      }}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      {user.phone && (
                        <div className="text-xs text-gray-400">{user.phone}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-6 py-4">
                    {user.club ? (
                      <div>
                        <div className="text-sm text-gray-900">{user.club.name}</div>
                        <div className="text-xs text-gray-500 capitalize">{user.club.status}</div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(user.active)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">{user.sessionsCount}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString('es-ES')}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <Mail className="h-4 w-4 text-gray-600" />
                      </button>
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <Edit className="h-4 w-4 text-gray-600" />
                      </button>
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <MoreVertical className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Página {currentPage} de {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = currentPage > 3 ? currentPage - 2 + i : i + 1
                  if (pageNum > totalPages) return null
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 border rounded-lg ${
                        pageNum === currentPage
                          ? 'bg-emerald-600 text-white'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}