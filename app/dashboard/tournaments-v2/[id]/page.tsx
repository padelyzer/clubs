'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { CardModern, CardModernHeader, CardModernTitle, CardModernDescription, CardModernContent } from '@/components/design-system/CardModern'
import { colors } from '@/lib/design-system/colors'
import { 
  Trophy, 
  Users, 
  Calendar, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  PlayCircle,
  Search,
  Filter,
  QrCode,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MapPin,
  Bell,
  Settings
} from 'lucide-react'
import { Modal } from '@/components/design-system/Modal'

interface TournamentData {
  tournament: {
    id: string
    name: string
    description?: string
    startDate: string
    endDate: string
    status: string
    type: string
    maxParticipants: number
    registrationDeadline: string
    format: string
    surfaceType: string
    entryFee: number
    prizePool: number
  }
  matches: Match[]
  stats: {
    totalMatches: number
    scheduledMatches: number
    inProgressMatches: number
    completedMatches: number
    conflictsCount: number
  }
  conflicts: Conflict[]
  pendingConfirmation: PendingMatch[]
}

interface Match {
  id: string
  team1Name: string
  team2Name: string
  team1Player1?: string
  team1Player2?: string
  team2Player1?: string
  team2Player2?: string
  courtNumber: number
  scheduledAt: string
  actualStartTime?: string
  actualEndTime?: string
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED'
  team1Sets?: any[]
  team2Sets?: any[]
  team1Score?: number
  team2Score?: number
  winner?: string
  round?: string
  resultsConfirmed?: boolean
  qrCode?: string
}

interface Conflict {
  matchId: string
  team1Name: string
  team2Name: string
  courtNumber: number
  scheduledAt: string
  team1Result?: {
    sets: any[]
    totalSets: number
    winner: string
    submittedAt: string
  }
  team2Result?: {
    sets: any[]
    totalSets: number
    winner: string
    submittedAt: string
  }
  conflictedAt: string
}

interface PendingMatch {
  matchId: string
  team1Name: string
  team2Name: string
  courtNumber: number
  scheduledAt: string
  reportedBy: string
  submittedAt: string
  waitingTime: number
}

export default function TournamentDetailPage() {
  const params = useParams()
  const tournamentId = params?.id as string

  const [data, setData] = useState<TournamentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [courtFilter, setCourFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [showQRModal, setShowQRModal] = useState(false)
  const [selectedQRCode, setSelectedQRCode] = useState<string>('')
  const [showConflictModal, setShowConflictModal] = useState(false)
  const [selectedConflict, setSelectedConflict] = useState<Conflict | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [tournamentRes, conflictsRes] = await Promise.all([
        fetch(`/api/tournaments-v2/${tournamentId}`),
        fetch(`/api/tournaments-v2/${tournamentId}/conflicts`)
      ])

      if (tournamentRes.ok) {
        const tournamentData = await tournamentRes.json()
        console.log('Tournament data received:', tournamentData)
        
        // Try to get conflicts data, but don't fail if it's not available
        let conflictsData = { data: { conflicts: [], pendingConfirmation: [] } }
        if (conflictsRes.ok) {
          conflictsData = await conflictsRes.json()
        }
        
        // Handle different response structures
        const responseData = tournamentData.data || tournamentData
        
        setData({
          tournament: responseData.tournament || responseData,
          matches: responseData.matches || [],
          stats: responseData.stats || {
            totalMatches: 0,
            scheduledMatches: 0,
            inProgressMatches: 0,
            completedMatches: 0,
            conflictsCount: 0
          },
          conflicts: conflictsData.data?.conflicts || [],
          pendingConfirmation: conflictsData.data?.pendingConfirmation || []
        })
      } else {
        console.error('Error al cargar el torneo')
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (tournamentId) {
      fetchData()
      // Auto-refresh every 30 seconds
      const interval = setInterval(fetchData, 30000)
      return () => clearInterval(interval)
    }
  }, [tournamentId])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'IN_PROGRESS':
        return <PlayCircle className="h-4 w-4 text-orange-500" />
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium"
    switch (status) {
      case 'SCHEDULED':
        return `${baseClasses} bg-blue-100 text-blue-800`
      case 'IN_PROGRESS':
        return `${baseClasses} bg-orange-100 text-orange-800`
      case 'COMPLETED':
        return `${baseClasses} bg-green-100 text-green-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredMatches = data?.matches?.filter(match => {
    const matchesSearch = searchTerm === '' || 
      match.team1Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.team2Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.courtNumber.toString().includes(searchTerm)

    const matchesStatus = statusFilter === 'all' || match.status === statusFilter
    const matchesCourt = courtFilter === 'all' || match.courtNumber.toString() === courtFilter

    return matchesSearch && matchesStatus && matchesCourt
  }) || []

  const totalPages = Math.ceil(filteredMatches.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedMatches = filteredMatches.slice(startIndex, startIndex + itemsPerPage)

  const exportToCSV = () => {
    if (!data?.matches) return

    const csvContent = [
      'Equipo 1,Equipo 2,Cancha,Fecha/Hora,Estado,Resultado',
      ...data.matches.map(match => [
        match.team1Name,
        match.team2Name,
        `Cancha ${match.courtNumber}`,
        formatDateTime(match.scheduledAt),
        match.status,
        match.status === 'COMPLETED' 
          ? `${match.team1Score || 0} - ${match.team2Score || 0}`
          : '-'
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `torneo-${data.tournament?.name || 'torneos'}-partidos.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-600">Error al cargar el torneo</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{data.tournament?.name || 'Torneo'}</h1>
          <p className="text-gray-600 mt-1">{data.tournament?.description || ''}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <Download className="h-4 w-4" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <CardModern>
          <CardModernContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Partidos</p>
                <p className="text-xl font-semibold">{data.stats.totalMatches}</p>
              </div>
            </div>
          </CardModernContent>
        </CardModern>

        <CardModern>
          <CardModernContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <PlayCircle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">En Juego</p>
                <p className="text-xl font-semibold">{data.stats.inProgressMatches}</p>
              </div>
            </div>
          </CardModernContent>
        </CardModern>

        <CardModern>
          <CardModernContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completados</p>
                <p className="text-xl font-semibold">{data.stats.completedMatches}</p>
              </div>
            </div>
          </CardModernContent>
        </CardModern>

        <CardModern>
          <CardModernContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Conflictos</p>
                <p className="text-xl font-semibold">{data.stats.conflictsCount}</p>
              </div>
            </div>
          </CardModernContent>
        </CardModern>
      </div>

      {/* Conflicts Alert */}
      {data.conflicts.length > 0 && (
        <CardModern className="border-red-200 bg-red-50">
          <CardModernContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <h3 className="font-medium text-red-900">Conflictos Pendientes</h3>
                <p className="text-sm text-red-700">
                  Hay {data.conflicts.length} conflicto(s) que requieren atención del organizador
                </p>
              </div>
              <button 
                onClick={() => setShowConflictModal(true)}
                className="ml-auto px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                Ver Conflictos
              </button>
            </div>
          </CardModernContent>
        </CardModern>
      )}

      {/* Filters */}
      <CardModern>
        <CardModernContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Buscar equipos o cancha..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos los estados</option>
                <option value="SCHEDULED">Programados</option>
                <option value="IN_PROGRESS">En Juego</option>
                <option value="COMPLETED">Completados</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <select
                value={courtFilter}
                onChange={(e) => setCourFilter(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todas las canchas</option>
                {Array.from(new Set(data.matches.map(m => m.courtNumber))).map(court => (
                  <option key={court} value={court.toString()}>Cancha {court}</option>
                ))}
              </select>
            </div>

            <div className="ml-auto text-sm text-gray-600">
              {filteredMatches.length} de {data.matches.length} partidos
            </div>
          </div>
        </CardModernContent>
      </CardModern>

      {/* Matches Table */}
      <CardModern>
        <CardModernHeader>
          <CardModernTitle>Partidos del Torneo</CardModernTitle>
        </CardModernHeader>
        <CardModernContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Equipos
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cancha
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha/Hora
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resultado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedMatches.map((match) => (
                  <tr key={match.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(match.status)}
                        <span className={getStatusBadge(match.status)}>
                          {match.status === 'SCHEDULED' ? 'Programado' :
                           match.status === 'IN_PROGRESS' ? 'En Juego' :
                           match.status === 'COMPLETED' ? 'Completado' : match.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        <div className="font-medium text-gray-900">{match.team1Name}</div>
                        <div className="text-sm text-gray-600">vs</div>
                        <div className="font-medium text-gray-900">{match.team2Name}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">Cancha {match.courtNumber}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm">
                        <div className="font-medium">{formatDateTime(match.scheduledAt)}</div>
                        {match.round && (
                          <div className="text-gray-500">{match.round}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {match.status === 'COMPLETED' && match.team1Score !== undefined ? (
                        <div className="font-medium">
                          {match.team1Score} - {match.team2Score}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedMatch(match)}
                          className="p-1 text-gray-500 hover:text-blue-600"
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {match.qrCode && (
                          <button
                            onClick={() => {
                              setSelectedQRCode(match.qrCode!)
                              setShowQRModal(true)
                            }}
                            className="p-1 text-gray-500 hover:text-green-600"
                            title="Ver QR"
                          >
                            <QrCode className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <div className="text-sm text-gray-600">
                Mostrando {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredMatches.length)} de {filteredMatches.length} partidos
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm text-gray-600">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </CardModernContent>
      </CardModern>

      {/* Match Details Modal */}
      {selectedMatch && (
        <Modal
          isOpen={!!selectedMatch}
          onClose={() => setSelectedMatch(null)}
          title="Detalles del Partido"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Equipo 1</h3>
                <p className="text-lg font-semibold">{selectedMatch.team1Name}</p>
                {selectedMatch.team1Player1 && (
                  <div className="text-sm text-gray-600 mt-1">
                    <p>{selectedMatch.team1Player1}</p>
                    {selectedMatch.team1Player2 && <p>{selectedMatch.team1Player2}</p>}
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Equipo 2</h3>
                <p className="text-lg font-semibold">{selectedMatch.team2Name}</p>
                {selectedMatch.team2Player1 && (
                  <div className="text-sm text-gray-600 mt-1">
                    <p>{selectedMatch.team2Player1}</p>
                    {selectedMatch.team2Player2 && <p>{selectedMatch.team2Player2}</p>}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-700">Cancha</h4>
                <p>Cancha {selectedMatch.courtNumber}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-700">Estado</h4>
                <span className={getStatusBadge(selectedMatch.status)}>
                  {selectedMatch.status === 'SCHEDULED' ? 'Programado' :
                   selectedMatch.status === 'IN_PROGRESS' ? 'En Juego' :
                   selectedMatch.status === 'COMPLETED' ? 'Completado' : selectedMatch.status}
                </span>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-700">Fecha Programada</h4>
              <p>{formatDateTime(selectedMatch.scheduledAt)}</p>
            </div>

            {selectedMatch.status === 'COMPLETED' && selectedMatch.team1Score !== undefined && (
              <div>
                <h4 className="font-medium text-gray-700">Resultado Final</h4>
                <div className="text-2xl font-bold text-center py-4">
                  {selectedMatch.team1Score} - {selectedMatch.team2Score}
                </div>
                {selectedMatch.winner && (
                  <p className="text-center text-green-600 font-medium">
                    Ganador: {selectedMatch.winner}
                  </p>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* QR Code Modal */}
      {showQRModal && selectedQRCode && (
        <Modal
          isOpen={showQRModal}
          onClose={() => {
            setShowQRModal(false)
            setSelectedQRCode('')
          }}
          title="Código QR del Partido"
        >
          <div className="text-center">
            <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
              <div className="text-6xl font-mono bg-gray-100 p-8 rounded">
                QR: {selectedQRCode}
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              Los jugadores pueden escanear este código para reportar resultados
            </p>
          </div>
        </Modal>
      )}

      {/* Conflicts Modal */}
      {showConflictModal && (
        <Modal
          isOpen={showConflictModal}
          onClose={() => setShowConflictModal(false)}
          title="Conflictos Pendientes"
        >
          <div className="space-y-4">
            {data.conflicts.map((conflict, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">
                    {conflict.team1Name} vs {conflict.team2Name}
                  </h4>
                  <span className="text-sm text-gray-500">
                    Cancha {conflict.courtNumber}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div className="bg-blue-50 p-3 rounded">
                    <h5 className="font-medium text-blue-900 mb-1">Resultado Equipo 1</h5>
                    {conflict.team1Result ? (
                      <div>
                        <p>Sets: {conflict.team1Result.totalSets}</p>
                        <p>Ganador: {conflict.team1Result.winner}</p>
                      </div>
                    ) : (
                      <p className="text-gray-500">No reportado</p>
                    )}
                  </div>
                  
                  <div className="bg-red-50 p-3 rounded">
                    <h5 className="font-medium text-red-900 mb-1">Resultado Equipo 2</h5>
                    {conflict.team2Result ? (
                      <div>
                        <p>Sets: {conflict.team2Result.totalSets}</p>
                        <p>Ganador: {conflict.team2Result.winner}</p>
                      </div>
                    ) : (
                      <p className="text-gray-500">No reportado</p>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                    Resolver Conflicto
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  )
}