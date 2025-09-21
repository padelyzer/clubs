'use client'

import Link from 'next/link'
import { Building2, Calendar, AlertCircle, ExternalLink } from 'lucide-react'

interface Club {
  id: string
  name: string
  email: string
  city: string
  state: string
  status: string
  createdAt: Date
  _count: {
    users: number
    courts: number
    bookings: number
  }
}

interface Booking {
  id: string
  playerName: string
  date: Date
  startTime: string
  status: string
  paymentStatus: string
  price: number
  club?: { name: string }
  court?: { name: string }
}

interface RecentActivityProps {
  recentClubs: Club[]
  recentBookings: Booking[]
  pendingClubs: number
}

export default function RecentActivity({ recentClubs, recentBookings, pendingClubs }: RecentActivityProps) {
  return (
    <div className="space-y-6">
      {/* Alertas */}
      {pendingClubs > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <div>
              <h4 className="font-medium text-yellow-800">Acción Requerida</h4>
              <p className="text-sm text-yellow-700">
                Tienes {pendingClubs} clubes pendientes de aprobación
              </p>
            </div>
            <Link href="/admin/clubs?status=pending" className="btn btn-sm btn-warning">
              Revisar
            </Link>
          </div>
        </div>
      )}

      {/* Clubes Recientes */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold">Clubes Recientes</h3>
          </div>
          <Link href="/admin/clubs" className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1">
            Ver todos
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
        
        <div className="space-y-3">
          {recentClubs.map((club) => (
            <div key={club.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="font-medium">{club.name}</div>
                <div className="text-sm text-gray-500">
                  {club.city}, {club.state} • {club._count.courts} canchas
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  club.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                  club.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {club.status}
                </span>
                <Link href={`/admin/clubs/${club.id}`} className="text-blue-600 hover:text-blue-800">
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reservas Recientes */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold">Reservas Recientes</h3>
          </div>
          <Link href="/admin/bookings" className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1">
            Ver todas
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
        
        <div className="space-y-3">
          {recentBookings.map((booking) => (
            <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="font-medium">{booking.playerName}</div>
                <div className="text-sm text-gray-500">
                  {booking.club?.name || 'Sin club'} • {booking.court?.name || 'Sin cancha'} • {booking.startTime}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  booking.paymentStatus === 'completed' ? 'bg-green-100 text-green-700' :
                  booking.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  ${(booking.price / 100).toFixed(0)}
                </span>
                <Link href={`/admin/bookings/${booking.id}`} className="text-blue-600 hover:text-blue-800">
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}