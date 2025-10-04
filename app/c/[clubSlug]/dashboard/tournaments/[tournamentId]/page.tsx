/**
 * Módulo Torneos V2 - Versión Multitenant
 * 
 * Interfaz avanzada de gestión de torneos dentro del contexto multitenant
 * Mantiene acceso al clubSlug y clubId para autorización correcta
 */

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
  Settings,
  ArrowLeft
} from 'lucide-react'
import { Modal } from '@/components/design-system/Modal'
import Link from 'next/link'

interface TournamentPageProps {
  params: Promise<{
    clubSlug: string
    tournamentId: string
  }>
}

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

export default function TournamentV2MultitenantPage({ params }: TournamentPageProps) {
  const [paramData, setParamData] = useState<{ clubSlug: string; tournamentId: string } | null>(null)
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

  // Resolver params al montar el componente
  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params
      setParamData(resolved)
    }
    resolveParams()
  }, [params])

  const fetchData = async () => {
    if (!paramData) return
    
    try {
      setLoading(true)
      const { tournamentId } = paramData
      
      // Usar la API que funciona con el contexto del club actual
      const [tournamentRes, conflictsRes] = await Promise.all([
        fetch(`/api/tournaments/${tournamentId}`),
        fetch(`/api/tournaments/${tournamentId}/conflicts`)
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
    if (paramData?.tournamentId) {
      fetchData()
      // Auto-refresh every 30 seconds
      const interval = setInterval(fetchData, 30000)
      return () => clearInterval(interval)
    }
  }, [paramData])

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

  if (!paramData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (loading) {
    return (
      <div 
        style={{ 
          display: 'flex', 
          height: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          background: colors.background.secondary
        }}
      >
        <CardModern variant="glass" padding="lg">
          <div style={{ textAlign: 'center' }}>
            <Loader2 
              size={48} 
              style={{ 
                color: colors.primary[600],
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px'
              }} 
            />
            <p style={{ color: colors.text.primary, fontSize: '16px', fontWeight: 500 }}>
              Cargando torneo...
            </p>
          </div>
        </CardModern>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
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

  return (
    <div style={{ 
      minHeight: '100vh',
      background: colors.background.secondary,
      padding: '32px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <div style={{ 
        marginBottom: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <Link 
            href={`/c/${paramData.clubSlug}/dashboard/tournaments`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              color: colors.primary[600],
              textDecoration: 'none',
              marginBottom: '16px',
              fontSize: '14px',
              fontWeight: 500
            }}
          >
            <ArrowLeft size={16} />
            Volver a Torneos
          </Link>
          
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: 700,
            color: colors.text.primary,
            letterSpacing: '-0.03em',
            marginBottom: '8px'
          }}>
            {data.tournament?.name || 'Torneo'} - V2 🏆
          </h1>
          <p style={{ 
            fontSize: '14px',
            color: colors.text.secondary
          }}>
            Módulo avanzado con interfaz mejorada y funcionalidades completas
          </p>
        </div>

        <button
          onClick={exportToCSV}
          style={{
            padding: '10px 20px',
            borderRadius: '12px',
            background: `linear-gradient(135deg, ${colors.primary[600]}, ${colors.accent[300]})`,
            color: 'white',
            border: 'none',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Download size={18} />
          Exportar CSV
        </button>
      </div>

      {/* Statistics */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        <CardModern variant="glass" padding="lg">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: `linear-gradient(135deg, ${colors.primary[600]}, ${colors.accent[300]})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Calendar size={24} color="white" />
            </div>
            <div>
              <p style={{ 
                fontSize: '13px',
                color: colors.text.tertiary,
                marginBottom: '4px'
              }}>
                Total Partidos
              </p>
              <p style={{ 
                fontSize: '24px',
                fontWeight: 700,
                color: colors.text.primary
              }}>
                {data.stats.totalMatches}
              </p>
            </div>
          </div>
        </CardModern>

        <CardModern variant="glass" padding="lg">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: `linear-gradient(135deg, ${colors.warning[600]}, ${colors.warning[400]})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <PlayCircle size={24} color="white" />
            </div>
            <div>
              <p style={{ 
                fontSize: '13px',
                color: colors.text.tertiary,
                marginBottom: '4px'
              }}>
                En Juego
              </p>
              <p style={{ 
                fontSize: '24px',
                fontWeight: 700,
                color: colors.text.primary
              }}>
                {data.stats.inProgressMatches}
              </p>
            </div>
          </div>
        </CardModern>

        <CardModern variant="glass" padding="lg">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: `linear-gradient(135deg, ${colors.success[600]}, ${colors.success[400]})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CheckCircle size={24} color="white" />
            </div>
            <div>
              <p style={{ 
                fontSize: '13px',
                color: colors.text.tertiary,
                marginBottom: '4px'
              }}>
                Completados
              </p>
              <p style={{ 
                fontSize: '24px',
                fontWeight: 700,
                color: colors.text.primary
              }}>
                {data.stats.completedMatches}
              </p>
            </div>
          </div>
        </CardModern>

        <CardModern variant="glass" padding="lg">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: `linear-gradient(135deg, ${colors.danger[600]}, ${colors.danger[400]})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AlertCircle size={24} color="white" />
            </div>
            <div>
              <p style={{ 
                fontSize: '13px',
                color: colors.text.tertiary,
                marginBottom: '4px'
              }}>
                Conflictos
              </p>
              <p style={{ 
                fontSize: '24px',
                fontWeight: 700,
                color: colors.text.primary
              }}>
                {data.stats.conflictsCount}
              </p>
            </div>
          </div>
        </CardModern>
      </div>

      {/* Conflicts Alert */}
      {data.conflicts.length > 0 && (
        <CardModern 
          variant="glass" 
          padding="lg" 
          style={{ 
            marginBottom: '32px',
            border: `2px solid ${colors.danger[300]}`,
            background: `linear-gradient(135deg, ${colors.danger[50]}, ${colors.danger[100]})`
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <AlertCircle size={24} style={{ color: colors.danger[600] }} />
            <div style={{ flex: 1 }}>
              <h3 style={{ 
                fontSize: '16px',
                fontWeight: 600,
                color: colors.danger[900],
                marginBottom: '4px'
              }}>
                Conflictos Pendientes
              </h3>
              <p style={{ 
                fontSize: '14px',
                color: colors.danger[700]
              }}>
                Hay {data.conflicts.length} conflicto(s) que requieren atención del organizador
              </p>
            </div>
            <button 
              onClick={() => setShowConflictModal(true)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                background: colors.danger[600],
                color: 'white',
                border: 'none',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              Ver Conflictos
            </button>
          </div>
        </CardModern>
      )}

      {/* Filters */}
      <CardModern variant="glass" padding="lg" style={{ marginBottom: '32px' }}>
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '16px', 
          alignItems: 'center' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Search size={16} style={{ color: colors.text.tertiary }} />
            <input
              type="text"
              placeholder="Buscar equipos o cancha..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '8px 12px',
                border: `1px solid ${colors.border.default}`,
                borderRadius: '8px',
                fontSize: '14px',
                minWidth: '200px'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={16} style={{ color: colors.text.tertiary }} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                border: `1px solid ${colors.border.default}`,
                borderRadius: '8px',
                fontSize: '14px'
              }}
            >
              <option value="all">Todos los estados</option>
              <option value="SCHEDULED">Programados</option>
              <option value="IN_PROGRESS">En Juego</option>
              <option value="COMPLETED">Completados</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={16} style={{ color: colors.text.tertiary }} />
            <select
              value={courtFilter}
              onChange={(e) => setCourFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                border: `1px solid ${colors.border.default}`,
                borderRadius: '8px',
                fontSize: '14px'
              }}
            >
              <option value="all">Todas las canchas</option>
              {Array.from(new Set(data.matches.map(m => m.courtNumber))).map(court => (
                <option key={court} value={court.toString()}>Cancha {court}</option>
              ))}
            </select>
          </div>

          <div style={{ 
            marginLeft: 'auto', 
            fontSize: '14px',
            color: colors.text.secondary
          }}>
            {filteredMatches.length} de {data.matches.length} partidos
          </div>
        </div>
      </CardModern>

      {/* Matches Table */}
      <CardModern variant="glass" padding="lg">
        <CardModernHeader style={{ marginBottom: '24px' }}>
          <CardModernTitle>Partidos del Torneo</CardModernTitle>
        </CardModernHeader>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${colors.border.light}` }}>
                <th style={{ 
                  padding: '16px 12px', 
                  textAlign: 'left', 
                  fontSize: '12px',
                  fontWeight: 600,
                  color: colors.text.tertiary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Estado
                </th>
                <th style={{ 
                  padding: '16px 12px', 
                  textAlign: 'left', 
                  fontSize: '12px',
                  fontWeight: 600,
                  color: colors.text.tertiary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Equipos
                </th>
                <th style={{ 
                  padding: '16px 12px', 
                  textAlign: 'left', 
                  fontSize: '12px',
                  fontWeight: 600,
                  color: colors.text.tertiary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Cancha
                </th>
                <th style={{ 
                  padding: '16px 12px', 
                  textAlign: 'left', 
                  fontSize: '12px',
                  fontWeight: 600,
                  color: colors.text.tertiary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Fecha/Hora
                </th>
                <th style={{ 
                  padding: '16px 12px', 
                  textAlign: 'left', 
                  fontSize: '12px',
                  fontWeight: 600,
                  color: colors.text.tertiary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Resultado
                </th>
                <th style={{ 
                  padding: '16px 12px', 
                  textAlign: 'left', 
                  fontSize: '12px',
                  fontWeight: 600,
                  color: colors.text.tertiary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedMatches.map((match) => (
                <tr 
                  key={match.id} 
                  style={{ 
                    borderBottom: `1px solid ${colors.border.light}`,
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.background.muted
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <td style={{ padding: '16px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {getStatusIcon(match.status)}
                      <span className={getStatusBadge(match.status)}>
                        {match.status === 'SCHEDULED' ? 'Programado' :
                         match.status === 'IN_PROGRESS' ? 'En Juego' :
                         match.status === 'COMPLETED' ? 'Completado' : match.status}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 12px' }}>
                    <div>
                      <div style={{ 
                        fontWeight: 600, 
                        color: colors.text.primary,
                        marginBottom: '4px'
                      }}>
                        {match.team1Name}
                      </div>
                      <div style={{ 
                        fontSize: '12px',
                        color: colors.text.tertiary,
                        marginBottom: '4px'
                      }}>
                        vs
                      </div>
                      <div style={{ 
                        fontWeight: 600, 
                        color: colors.text.primary
                      }}>
                        {match.team2Name}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin size={16} style={{ color: colors.text.tertiary }} />
                      <span style={{ fontWeight: 500 }}>Cancha {match.courtNumber}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 12px' }}>
                    <div>
                      <div style={{ 
                        fontWeight: 500,
                        color: colors.text.primary,
                        marginBottom: '2px'
                      }}>
                        {formatDateTime(match.scheduledAt)}
                      </div>
                      {match.round && (
                        <div style={{ 
                          fontSize: '12px',
                          color: colors.text.tertiary
                        }}>
                          {match.round}
                        </div>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '16px 12px' }}>
                    {match.status === 'COMPLETED' && match.team1Score !== undefined ? (
                      <div style={{ fontWeight: 600 }}>
                        {match.team1Score} - {match.team2Score}
                      </div>
                    ) : (
                      <span style={{ color: colors.text.tertiary }}>-</span>
                    )}
                  </td>
                  <td style={{ padding: '16px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={() => setSelectedMatch(match)}
                        style={{
                          padding: '8px',
                          border: 'none',
                          borderRadius: '6px',
                          background: 'transparent',
                          color: colors.text.tertiary,
                          cursor: 'pointer',
                          transition: 'color 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = colors.primary[600]
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = colors.text.tertiary
                        }}
                        title="Ver detalles"
                      >
                        <Eye size={16} />
                      </button>
                      {match.qrCode && (
                        <button
                          onClick={() => {
                            setSelectedQRCode(match.qrCode!)
                            setShowQRModal(true)
                          }}
                          style={{
                            padding: '8px',
                            border: 'none',
                            borderRadius: '6px',
                            background: 'transparent',
                            color: colors.text.tertiary,
                            cursor: 'pointer',
                            transition: 'color 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = colors.success[600]
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = colors.text.tertiary
                          }}
                          title="Ver QR"
                        >
                          <QrCode size={16} />
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
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginTop: '24px',
            paddingTop: '24px',
            borderTop: `1px solid ${colors.border.light}`
          }}>
            <div style={{ 
              fontSize: '14px',
              color: colors.text.secondary
            }}>
              Mostrando {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredMatches.length)} de {filteredMatches.length} partidos
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '8px',
                  border: 'none',
                  borderRadius: '6px',
                  background: 'transparent',
                  color: currentPage === 1 ? colors.text.disabled : colors.text.tertiary,
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                <ChevronLeft size={16} />
              </button>
              <span style={{ 
                fontSize: '14px',
                color: colors.text.secondary,
                margin: '0 8px'
              }}>
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                style={{
                  padding: '8px',
                  border: 'none',
                  borderRadius: '6px',
                  background: 'transparent',
                  color: currentPage === totalPages ? colors.text.disabled : colors.text.tertiary,
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </CardModern>

      {/* Match Details Modal */}
      {selectedMatch && (
        <Modal
          isOpen={!!selectedMatch}
          onClose={() => setSelectedMatch(null)}
          title="Detalles del Partido"
        >
          <div style={{ padding: '24px' }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '24px',
              marginBottom: '24px'
            }}>
              <div>
                <h3 style={{ 
                  fontSize: '16px',
                  fontWeight: 600,
                  color: colors.text.primary,
                  marginBottom: '8px'
                }}>
                  Equipo 1
                </h3>
                <p style={{ 
                  fontSize: '18px',
                  fontWeight: 700,
                  color: colors.text.primary,
                  marginBottom: '8px'
                }}>
                  {selectedMatch.team1Name}
                </p>
                {selectedMatch.team1Player1 && (
                  <div style={{ 
                    fontSize: '14px',
                    color: colors.text.secondary
                  }}>
                    <p>{selectedMatch.team1Player1}</p>
                    {selectedMatch.team1Player2 && <p>{selectedMatch.team1Player2}</p>}
                  </div>
                )}
              </div>
              <div>
                <h3 style={{ 
                  fontSize: '16px',
                  fontWeight: 600,
                  color: colors.text.primary,
                  marginBottom: '8px'
                }}>
                  Equipo 2
                </h3>
                <p style={{ 
                  fontSize: '18px',
                  fontWeight: 700,
                  color: colors.text.primary,
                  marginBottom: '8px'
                }}>
                  {selectedMatch.team2Name}
                </p>
                {selectedMatch.team2Player1 && (
                  <div style={{ 
                    fontSize: '14px',
                    color: colors.text.secondary
                  }}>
                    <p>{selectedMatch.team2Player1}</p>
                    {selectedMatch.team2Player2 && <p>{selectedMatch.team2Player2}</p>}
                  </div>
                )}
              </div>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '24px',
              marginBottom: '24px'
            }}>
              <div>
                <h4 style={{ 
                  fontSize: '14px',
                  fontWeight: 600,
                  color: colors.text.secondary,
                  marginBottom: '4px'
                }}>
                  Cancha
                </h4>
                <p>Cancha {selectedMatch.courtNumber}</p>
              </div>
              <div>
                <h4 style={{ 
                  fontSize: '14px',
                  fontWeight: 600,
                  color: colors.text.secondary,
                  marginBottom: '4px'
                }}>
                  Estado
                </h4>
                <span className={getStatusBadge(selectedMatch.status)}>
                  {selectedMatch.status === 'SCHEDULED' ? 'Programado' :
                   selectedMatch.status === 'IN_PROGRESS' ? 'En Juego' :
                   selectedMatch.status === 'COMPLETED' ? 'Completado' : selectedMatch.status}
                </span>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ 
                fontSize: '14px',
                fontWeight: 600,
                color: colors.text.secondary,
                marginBottom: '4px'
              }}>
                Fecha Programada
              </h4>
              <p>{formatDateTime(selectedMatch.scheduledAt)}</p>
            </div>

            {selectedMatch.status === 'COMPLETED' && selectedMatch.team1Score !== undefined && (
              <div>
                <h4 style={{ 
                  fontSize: '14px',
                  fontWeight: 600,
                  color: colors.text.secondary,
                  marginBottom: '8px'
                }}>
                  Resultado Final
                </h4>
                <div style={{ 
                  fontSize: '32px',
                  fontWeight: 700,
                  textAlign: 'center',
                  padding: '16px 0',
                  color: colors.text.primary
                }}>
                  {selectedMatch.team1Score} - {selectedMatch.team2Score}
                </div>
                {selectedMatch.winner && (
                  <p style={{ 
                    textAlign: 'center',
                    color: colors.success[600],
                    fontWeight: 600
                  }}>
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
          <div style={{ textAlign: 'center', padding: '24px' }}>
            <div style={{ 
              background: 'white',
              padding: '24px',
              borderRadius: '12px',
              border: `2px solid ${colors.border.default}`,
              display: 'inline-block',
              marginBottom: '16px'
            }}>
              <div style={{ 
                fontSize: '48px',
                fontFamily: 'monospace',
                background: colors.background.muted,
                padding: '32px',
                borderRadius: '8px',
                color: colors.text.primary
              }}>
                QR: {selectedQRCode}
              </div>
            </div>
            <p style={{ 
              fontSize: '14px',
              color: colors.text.secondary
            }}>
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
          <div style={{ padding: '24px' }}>
            {data.conflicts.map((conflict, index) => (
              <div 
                key={index} 
                style={{ 
                  border: `1px solid ${colors.border.default}`,
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '16px'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  marginBottom: '16px'
                }}>
                  <h4 style={{ 
                    fontSize: '16px',
                    fontWeight: 600,
                    color: colors.text.primary
                  }}>
                    {conflict.team1Name} vs {conflict.team2Name}
                  </h4>
                  <span style={{ 
                    fontSize: '14px',
                    color: colors.text.secondary
                  }}>
                    Cancha {conflict.courtNumber}
                  </span>
                </div>
                
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: '16px',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    background: `linear-gradient(135deg, ${colors.primary[50]}, ${colors.primary[100]})`,
                    padding: '12px',
                    borderRadius: '8px'
                  }}>
                    <h5 style={{ 
                      fontSize: '14px',
                      fontWeight: 600,
                      color: colors.primary[900],
                      marginBottom: '8px'
                    }}>
                      Resultado Equipo 1
                    </h5>
                    {conflict.team1Result ? (
                      <div>
                        <p>Sets: {conflict.team1Result.totalSets}</p>
                        <p>Ganador: {conflict.team1Result.winner}</p>
                      </div>
                    ) : (
                      <p style={{ color: colors.text.tertiary }}>No reportado</p>
                    )}
                  </div>
                  
                  <div style={{
                    background: `linear-gradient(135deg, ${colors.danger[50]}, ${colors.danger[100]})`,
                    padding: '12px',
                    borderRadius: '8px'
                  }}>
                    <h5 style={{ 
                      fontSize: '14px',
                      fontWeight: 600,
                      color: colors.danger[900],
                      marginBottom: '8px'
                    }}>
                      Resultado Equipo 2
                    </h5>
                    {conflict.team2Result ? (
                      <div>
                        <p>Sets: {conflict.team2Result.totalSets}</p>
                        <p>Ganador: {conflict.team2Result.winner}</p>
                      </div>
                    ) : (
                      <p style={{ color: colors.text.tertiary }}>No reportado</p>
                    )}
                  </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button style={{
                    padding: '8px 16px',
                    background: colors.primary[600],
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}>
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