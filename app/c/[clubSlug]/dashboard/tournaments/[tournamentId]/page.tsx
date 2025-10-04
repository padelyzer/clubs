import { requireAuth } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Users, Trophy, Clock, MapPin } from 'lucide-react'

interface TournamentPageProps {
  params: Promise<{
    clubSlug: string
    tournamentId: string
  }>
}

export default async function TournamentPage({ params }: TournamentPageProps) {
  const { clubSlug, tournamentId } = await params
  
  // Require authentication
  const session = await requireAuth()
  
  // Get club by slug
  const club = await prisma.club.findUnique({
    where: { slug: clubSlug }
  })
  
  if (!club) {
    notFound()
  }
  
  // Verify user has access to this club (super admin or club member)
  if (session.role !== 'SUPER_ADMIN') {
    // For club staff/owner, verify they belong to this club
    if (!session.clubId || session.clubId !== club.id) {
      notFound()
    }
    
    // Also check they have appropriate role
    if (!['CLUB_OWNER', 'CLUB_STAFF'].includes(session.role)) {
      notFound()
    }
  }
  
  // Get tournament
  const tournament = await prisma.tournament.findUnique({
    where: { 
      id: tournamentId,
      clubId: club.id // Ensure tournament belongs to this club
    },
    include: {
      Club: {
        select: {
          name: true,
          slug: true
        }
      },
      TournamentRegistration: {
        select: {
          id: true,
          teamName: true,
          player1Name: true,
          player2Name: true,
          confirmed: true,
          paymentStatus: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'asc'
        }
      },
      TournamentRound: {
        select: {
          id: true,
          name: true,
          status: true,
          startDate: true,
          endDate: true
        },
        orderBy: {
          createdAt: 'asc'
        }
      }
    }
  })
  
  if (!tournament) {
    notFound()
  }
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800'
      case 'REGISTRATION_OPEN': return 'bg-blue-100 text-blue-800'
      case 'REGISTRATION_CLOSED': return 'bg-yellow-100 text-yellow-800'
      case 'IN_PROGRESS': return 'bg-green-100 text-green-800'
      case 'COMPLETED': return 'bg-purple-100 text-purple-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'Borrador'
      case 'REGISTRATION_OPEN': return 'Inscripciones Abiertas'
      case 'REGISTRATION_CLOSED': return 'Inscripciones Cerradas'
      case 'IN_PROGRESS': return 'En Progreso'
      case 'COMPLETED': return 'Completado'
      case 'CANCELLED': return 'Cancelado'
      default: return status
    }
  }
  
  const confirmedRegistrations = tournament.TournamentRegistration.filter(r => r.confirmed)
  const pendingRegistrations = tournament.TournamentRegistration.filter(r => !r.confirmed)

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link 
          href={`/c/${clubSlug}/dashboard/tournaments`}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Torneos
        </Link>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {tournament.name}
            </h1>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(tournament.status)}`}>
              {getStatusText(tournament.status)}
            </span>
          </div>
          
          <div className="flex gap-3">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Editar Torneo
            </button>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
              Gestionar Partidos
            </button>
          </div>
        </div>
      </div>

      {/* Tournament Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Fecha de Inicio</p>
              <p className="font-semibold">{formatDate(tournament.startDate)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Fecha de Fin</p>
              <p className="font-semibold">{formatDate(tournament.endDate)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Participantes</p>
              <p className="font-semibold">{confirmedRegistrations.length} / {tournament.maxPlayers}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <Trophy className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="text-sm text-gray-600">Tipo</p>
              <p className="font-semibold">
                {tournament.type === 'SINGLE_ELIMINATION' ? 'Eliminación Simple' : tournament.type}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      {tournament.description && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold mb-3">Descripción</h2>
          <p className="text-gray-700">{tournament.description}</p>
        </div>
      )}

      {/* Registrations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Confirmed Registrations */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4 text-green-800">
            Equipos Confirmados ({confirmedRegistrations.length})
          </h2>
          
          {confirmedRegistrations.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No hay equipos confirmados aún</p>
          ) : (
            <div className="space-y-3">
              {confirmedRegistrations.map((registration, index) => (
                <div key={registration.id} className="border border-gray-100 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {registration.teamName || `Equipo ${index + 1}`}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {registration.player1Name} + {registration.player2Name}
                      </p>
                    </div>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                      Confirmado
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Pending Registrations */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4 text-yellow-800">
            Equipos Pendientes ({pendingRegistrations.length})
          </h2>
          
          {pendingRegistrations.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No hay equipos pendientes</p>
          ) : (
            <div className="space-y-3">
              {pendingRegistrations.map((registration, index) => (
                <div key={registration.id} className="border border-gray-100 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {registration.teamName || `Equipo ${index + 1}`}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {registration.player1Name} + {registration.player2Name}
                      </p>
                    </div>
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                      Pendiente
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tournament Rounds */}
      {tournament.TournamentRound.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Rondas del Torneo</h2>
          
          <div className="space-y-3">
            {tournament.TournamentRound.map((round, index) => (
              <div key={round.id} className="border border-gray-100 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{round.name}</h3>
                    <p className="text-sm text-gray-600">
                      {round.startDate && formatDate(round.startDate)} - {round.endDate && formatDate(round.endDate)}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(round.status)}`}>
                    {getStatusText(round.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prize Pool */}
      {tournament.prizePool && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mt-8">
          <h2 className="text-lg font-semibold mb-3">Premio</h2>
          <p className="text-2xl font-bold text-green-600">
            ${tournament.prizePool.toLocaleString()} {tournament.currency}
          </p>
        </div>
      )}
    </div>
  )
}