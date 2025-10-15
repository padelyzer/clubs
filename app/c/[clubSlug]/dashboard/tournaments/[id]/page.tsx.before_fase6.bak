'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { CardModern, CardModernHeader, CardModernTitle, CardModernDescription, CardModernContent } from '@/components/design-system/CardModern'
import { colors } from '@/lib/design-system/colors'
import { 
  Trophy, 
  Users, 
  Calendar, 
  Grid3x3, 
  Columns3, 
  Camera, 
  Tv2, 
  Settings,
  ChevronRight,
  Filter,
  Search,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  PlayCircle,
  DollarSign,
  TrendingUp,
  Award,
  Target,
  Bell,
  Loader2,
  ChevronDown,
  Edit,
  Trash2,
  Eye,
  Save
} from 'lucide-react'
import { Modal } from '@/components/design-system/Modal'

interface TournamentData {
  tournament: {
    id: string
    name: string
    description?: string
    status: string
    startDate: string
    endDate: string
    club: {
      id: string
      name: string
      logo?: string
    }
  }
  stats: {
    totalTeams: number
    totalMatches: number
    completedMatches: number
    pendingMatches: number
    inProgressMatches: number
    todayMatches: number
  }
  categories: Array<{
    code: string
    modality: string
    name: string
    teams: number
    totalMatches: number
    completedMatches: number
    status: string
  }>
  matches: {
    inProgress: any[]
    upcoming: any[]
    total: number
  }
  courts: Array<{
    id: string
    name: string
    number: number
    status: string
    currentMatch?: any
    nextMatch?: any
  }>
}

export default function TournamentV2Page() {
  const params = useParams()
  const tournamentId = params.id as string
  
  const [activeView, setActiveView] = useState<'overview' | 'registrations' | 'schedule' | 'kanban' | 'capture' | 'tv'>('overview')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [categoriesExpanded, setCategoriesExpanded] = useState(true)
  const [masculineExpanded, setMasculineExpanded] = useState(true)
  const [feminineExpanded, setFeminineExpanded] = useState(true)
  const [mixedExpanded, setMixedExpanded] = useState(true)
  const [loading, setLoading] = useState(true)
  const [tournamentData, setTournamentData] = useState<TournamentData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [registrations, setRegistrations] = useState<any[]>([])
  const [loadingRegistrations, setLoadingRegistrations] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Estados para modales
  const [showAddTeamModal, setShowAddTeamModal] = useState(false)
  const [showEditTeamModal, setShowEditTeamModal] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<any>(null)
  const [savingTeam, setSavingTeam] = useState(false)
  
  // Estado del formulario
  const [teamForm, setTeamForm] = useState({
    teamName: '',
    player1Name: '',
    player1Email: '',
    player1Phone: '',
    player2Name: '',
    player2Email: '',
    player2Phone: '',
    category: '',
    modality: 'M',
    paymentStatus: 'pending'
  })
  
  // Estados para filtros en vista de Programación
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [scheduleFilter, setScheduleFilter] = useState<'all' | 'pending' | 'completed' | 'in_progress'>('all')
  const [scheduleCategoryFilter, setScheduleCategoryFilter] = useState<string>('all')
  
  // Estados para filtros en vista Kanban
  const [kanbanSelectedDate, setKanbanSelectedDate] = useState<Date>(new Date())
  const [kanbanCategoryFilter, setKanbanCategoryFilter] = useState<string>('all')
  const [kanbanStatusFilter, setKanbanStatusFilter] = useState<string>('all')
  
  // Estados para filtros en vista Captura
  const [captureCategoryFilter, setCaptureCategoryFilter] = useState<string>('all')
  const [captureStatusFilter, setCaptureStatusFilter] = useState<'pending' | 'all' | 'completed'>('pending')
  const [selectedMatches, setSelectedMatches] = useState<Set<string>>(new Set())
  
  // Estado para organización automática
  const [isOrganizing, setIsOrganizing] = useState(false)
  const [organizationResult, setOrganizationResult] = useState<{ success: boolean; message: string } | null>(null)
  
  // Estado para filtro de género en categorías
  const [categoryGenderFilter, setCategoryGenderFilter] = useState<'all' | 'M' | 'F' | 'X'>('all')

  // Colors configuration
  const colors = {
    primary: {
      600: '#059669',
      700: '#047857'
    },
    accent: {
      300: '#A4DF4E',
      600: '#16A34A'
    },
    text: {
      primary: '#111827',
      secondary: '#6B7280',
      tertiary: '#9CA3AF'
    },
    border: {
      light: '#E5E7EB'
    },
    neutral: {
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF'
    },
    warning: {
      400: '#FBBF24',
      600: '#F59E0B'
    },
    background: {
      primary: '#FFFFFF',
      secondary: '#F9FAFB'
    }
  }

  // Cargar datos del torneo
  useEffect(() => {
    fetchTournamentData()
    // Actualizar cada 30 segundos
    const interval = setInterval(fetchTournamentData, 30000)
    return () => clearInterval(interval)
  }, [tournamentId])

  const fetchTournamentData = async () => {
    try {
      const response = await fetch(`/api/tournaments-v2/${tournamentId}`)
      if (!response.ok) {
        throw new Error('Error al cargar el torneo')
      }
      const data = await response.json()
      setTournamentData(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const fetchRegistrations = async () => {
    setLoadingRegistrations(true)
    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/registrations`)
      if (!response.ok) {
        throw new Error('Error al cargar inscripciones')
      }
      const data = await response.json()
      setRegistrations(data.registrations || [])
    } catch (err) {
      console.error('Error fetching registrations:', err)
      setRegistrations([])
    } finally {
      setLoadingRegistrations(false)
    }
  }

  // Función para actualizar resultado de partido
  const updateMatchResult = async (matchId: string, scores: any) => {
    try {
      const response = await fetch(`/api/tournaments-v2/${tournamentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          matchId,
          ...scores,
          status: 'completed'
        })
      })
      
      if (response.ok) {
        // Recargar datos
        fetchTournamentData()
      }
    } catch (error) {
      console.error('Error updating match:', error)
    }
  }

  // Función para manejar el agregar equipo
  const handleSaveTeam = async () => {
    setSavingTeam(true)
    try {
      // TODO: Implementar llamada a API
      const newTeam = {
        id: Date.now().toString(),
        teamName: teamForm.teamName,
        player1Name: teamForm.player1Name,
        player1Email: teamForm.player1Email,
        player1Phone: teamForm.player1Phone,
        player2Name: teamForm.player2Name,
        player2Email: teamForm.player2Email,
        player2Phone: teamForm.player2Phone,
        category: teamForm.category,
        modality: teamForm.modality,
        paymentStatus: teamForm.paymentStatus,
        confirmed: teamForm.paymentStatus === 'completed',
        checkedIn: false
      }
      
      // Agregar temporalmente al estado
      setRegistrations(prev => [...prev, newTeam])
      
      // Cerrar modal y limpiar formulario
      setShowAddTeamModal(false)
      setTeamForm({
        teamName: '',
        player1Name: '',
        player1Email: '',
        player1Phone: '',
        player2Name: '',
        player2Email: '',
        player2Phone: '',
        category: '',
        modality: 'M',
        paymentStatus: 'pending'
      })
    } catch (error) {
      console.error('Error saving team:', error)
    } finally {
      setSavingTeam(false)
    }
  }

  // Función para manejar la edición
  const handleEditTeam = (team: any) => {
    setSelectedTeam(team)
    setTeamForm({
      teamName: team.teamName || '',
      player1Name: team.player1Name || '',
      player1Email: team.player1Email || '',
      player1Phone: team.player1Phone || '',
      player2Name: team.player2Name || '',
      player2Email: team.player2Email || '',
      player2Phone: team.player2Phone || '',
      category: team.category || '',
      modality: team.modality || 'M',
      paymentStatus: team.paymentStatus || 'pending'
    })
    setShowEditTeamModal(true)
  }

  // Función para actualizar equipo
  const handleUpdateTeam = async () => {
    setSavingTeam(true)
    try {
      // TODO: Implementar llamada a API
      const updatedTeam = {
        ...selectedTeam,
        ...teamForm,
        confirmed: teamForm.paymentStatus === 'completed'
      }
      
      // Actualizar temporalmente en el estado
      setRegistrations(prev => 
        prev.map(t => t.id === selectedTeam.id ? updatedTeam : t)
      )
      
      // Cerrar modal y limpiar
      setShowEditTeamModal(false)
      setSelectedTeam(null)
      setTeamForm({
        teamName: '',
        player1Name: '',
        player1Email: '',
        player1Phone: '',
        player2Name: '',
        player2Email: '',
        player2Phone: '',
        category: '',
        modality: 'M',
        paymentStatus: 'pending'
      })
    } catch (error) {
      console.error('Error updating team:', error)
    } finally {
      setSavingTeam(false)
    }
  }

  const getCategoryBadgeStyle = (status: string) => {
    switch (status) {
      case 'active':
        return {
          background: `linear-gradient(135deg, ${colors.primary[600]}20, ${colors.accent[300]}20)`,
          border: `1px solid ${colors.primary[600]}40`,
          color: colors.primary[700]
        }
      case 'pending':
        return {
          background: `linear-gradient(135deg, ${colors.warning[600]}20, ${colors.warning[400]}20)`,
          border: `1px solid ${colors.warning[600]}40`,
          color: colors.warning[700]
        }
      case 'completed':
        return {
          background: `linear-gradient(135deg, ${colors.neutral[400]}20, ${colors.neutral[300]}20)`,
          border: `1px solid ${colors.neutral[400]}40`,
          color: colors.neutral[600]
        }
      default:
        return {}
    }
  }

  const StatCard = ({ icon, label, value, trend, color }: any) => (
    <CardModern variant="gradient" padding="md" interactive>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '16px',
          background: `linear-gradient(135deg, ${color}20, ${color}10)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `1px solid ${color}20`
        }}>
          {React.cloneElement(icon, { 
            size: 24, 
            style: { color } 
          })}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ 
            fontSize: '13px', 
            color: colors.text.secondary,
            marginBottom: '4px',
            fontWeight: 500
          }}>
            {label}
          </p>
          <p style={{ 
            fontSize: '24px', 
            fontWeight: 600,
            color: colors.text.primary,
            letterSpacing: '-0.02em'
          }}>
            {value}
          </p>
        </div>
        {trend && (
          <TrendingUp size={16} style={{ color: colors.accent[600] }} />
        )}
      </div>
    </CardModern>
  )

  // Loading state
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        height: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        background: colors.background.secondary
      }}>
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

  // Error state
  if (error || !tournamentData) {
    return (
      <div style={{ 
        display: 'flex', 
        height: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        background: colors.background.secondary
      }}>
        <CardModern variant="glass" padding="lg">
          <div style={{ textAlign: 'center' }}>
            <AlertCircle 
              size={48} 
              style={{ 
                color: colors.danger[600],
                margin: '0 auto 16px'
              }} 
            />
            <p style={{ color: colors.text.primary, fontSize: '16px', fontWeight: 500 }}>
              {error || 'Error al cargar el torneo'}
            </p>
            <button 
              onClick={() => window.location.reload()}
              style={{
                marginTop: '16px',
                padding: '8px 16px',
                borderRadius: '8px',
                background: colors.primary[600],
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500
              }}
            >
              Reintentar
            </button>
          </div>
        </CardModern>
      </div>
    )
  }

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh',
      background: colors.background.secondary,
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Sidebar - Diseño actualizado */}
      <aside 
        style={{
          width: sidebarCollapsed ? '80px' : '320px',
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          borderRight: `1px solid ${colors.border.light}`,
          transition: 'all 0.3s ease',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflow: 'hidden'
        }}
      >

        {/* Header Section */}
        <div>
          {/* Logo de Padelyzer */}
          <div style={{ 
            padding: '20px',
            borderBottom: `1px solid ${colors.border.light}`,
            display: 'flex',
            justifyContent: sidebarCollapsed ? 'center' : 'flex-start'
          }}>
            {!sidebarCollapsed ? (
              <img 
                src="/Padelyzer-Logo-Negro.png" 
                alt="Padelyzer"
                style={{ 
                  width: '140px',
                  height: 'auto',
                  display: 'block'
                }}
              />
            ) : (
              <img 
                src="/Padelyzer-Isotipo-Negro.png" 
                alt="P"
                style={{ 
                  width: '36px',
                  height: '36px',
                  display: 'block'
                }}
              />
            )}
          </div>
          
          {/* Módulo de Gestión de Torneo con Toggle Button */}
          <div style={{
            padding: sidebarCollapsed ? '12px' : '16px',
            borderBottom: `1px solid ${colors.border.light}`,
            background: 'linear-gradient(135deg, #047857, #059669)',
            position: 'relative'
          }}>
            {/* Toggle Button integrado en la pestaña verde */}
            {!sidebarCollapsed && (
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '32px',
                  height: '32px',
                  background: 'rgba(255,255,255,0.25)',
                  border: '1px solid rgba(255,255,255,0.4)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  zIndex: 5
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.35)'
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'
                  e.currentTarget.style.border = '1px solid rgba(255,255,255,0.6)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.25)'
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1)'
                  e.currentTarget.style.border = '1px solid rgba(255,255,255,0.4)'
                }}
              >
                <ChevronRight 
                  size={16} 
                  style={{ 
                    color: 'white',
                    transform: 'rotate(180deg)',
                    transition: 'transform 0.3s',
                    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
                  }} 
                />
              </button>
            )}

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              paddingRight: sidebarCollapsed ? '0' : '48px'
            }}>
              <div 
                style={{
                  width: sidebarCollapsed ? '32px' : '36px',
                  height: sidebarCollapsed ? '32px' : '36px',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  cursor: sidebarCollapsed ? 'pointer' : 'default',
                  transition: 'all 0.3s',
                  position: 'relative'
                }}
                onClick={sidebarCollapsed ? () => setSidebarCollapsed(false) : undefined}
                onMouseEnter={sidebarCollapsed ? (e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.3)'
                  e.currentTarget.style.transform = 'scale(1.1)'
                } : undefined}
                onMouseLeave={sidebarCollapsed ? (e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.2)'
                  e.currentTarget.style.transform = 'scale(1)'
                } : undefined}
              >
                <Trophy 
                  size={sidebarCollapsed ? 21 : 18} 
                  color="white" 
                  style={{ 
                    minWidth: sidebarCollapsed ? '21px' : '18px',
                    minHeight: sidebarCollapsed ? '21px' : '18px'
                  }}
                />
                {/* Indicador de expansión cuando está contraído */}
                {sidebarCollapsed && (
                  <div style={{
                    position: 'absolute',
                    bottom: '-2px',
                    right: '-2px',
                    width: '12px',
                    height: '12px',
                    background: 'rgba(255,255,255,0.9)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '8px',
                    color: '#059669'
                  }}>
                    <ChevronRight size={8} />
                  </div>
                )}
              </div>
              {!sidebarCollapsed && (
                <div style={{ overflow: 'hidden', flex: 1 }}>
                  <h3 style={{ 
                    fontSize: '11px', 
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.85)',
                    marginBottom: '2px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Gestión de Torneo
                  </h3>
                  <p style={{ 
                    fontSize: '13px',
                    color: 'white',
                    fontWeight: 600,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    marginBottom: '2px'
                  }}>
                    {tournamentData.tournament.name}
                  </p>
                  <p style={{ 
                    fontSize: '10px',
                    color: 'rgba(255,255,255,0.7)'
                  }}>
                    {new Date(tournamentData.tournament.startDate).toLocaleDateString('es-MX', {
                      day: 'numeric',
                      month: 'short'
                    })} - {new Date(tournamentData.tournament.endDate).toLocaleDateString('es-MX', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div style={{ 
          flex: 1, 
          overflowY: 'auto',
          padding: '24px'
        }}>
          {/* Navigation Section */}
          <div style={{ marginBottom: '24px' }}>
            {!sidebarCollapsed && (
              <h4 style={{
                fontSize: '11px',
                fontWeight: 600,
                color: colors.text.tertiary,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '12px',
                paddingLeft: '4px'
              }}>
                NAVEGACIÓN
              </h4>
            )}
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Vista General */}
              <div
                onClick={() => setActiveView('overview')}
                className="sidebar-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: sidebarCollapsed ? '16px' : '12px 16px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: activeView === 'overview' 
                    ? 'linear-gradient(135deg, #047857, #059669)'
                    : 'transparent',
                  color: activeView === 'overview' ? 'white' : colors.text.secondary,
                  gap: '12px',
                  position: 'relative',
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start'
                }}
                onMouseEnter={(e) => {
                  if (activeView !== 'overview') {
                    e.currentTarget.style.background = colors.neutral[100]
                    e.currentTarget.style.color = colors.text.primary
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeView !== 'overview') {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = colors.text.secondary
                  }
                }}
              >
                <Grid3x3 
                  size={sidebarCollapsed ? 21 : 20} 
                  style={{ 
                    minWidth: sidebarCollapsed ? '21px' : '20px',
                    minHeight: sidebarCollapsed ? '21px' : '20px'
                  }}
                />
                {!sidebarCollapsed && (
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>Vista General</div>
                    <div style={{ 
                      fontSize: '11px', 
                      opacity: 0.8,
                      marginTop: '2px'
                    }}>
                      Resumen del torneo
                    </div>
                  </div>
                )}
                {sidebarCollapsed && (
                  <div className="sidebar-tooltip" style={{
                    position: 'absolute',
                    left: '100%',
                    marginLeft: '12px',
                    padding: '8px 12px',
                    background: colors.neutral[900],
                    color: 'white',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    opacity: 0,
                    pointerEvents: 'none',
                    transition: 'opacity 0.2s',
                    zIndex: 1000,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}>
                    Vista General
                    <div style={{
                      position: 'absolute',
                      left: '-4px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 0,
                      height: 0,
                      borderStyle: 'solid',
                      borderWidth: '4px 4px 4px 0',
                      borderColor: `transparent ${colors.neutral[900]} transparent transparent`
                    }} />
                  </div>
                )}
              </div>

              {/* Inscritos */}
              <div
                onClick={() => {
                  setActiveView('registrations')
                  fetchRegistrations()
                }}
                className="sidebar-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: sidebarCollapsed ? '16px' : '12px 16px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: activeView === 'registrations' 
                    ? 'linear-gradient(135deg, #047857, #059669)'
                    : 'transparent',
                  color: activeView === 'registrations' ? 'white' : colors.text.secondary,
                  gap: '12px',
                  position: 'relative',
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start'
                }}
                onMouseEnter={(e) => {
                  if (activeView !== 'registrations') {
                    e.currentTarget.style.background = colors.neutral[100]
                    e.currentTarget.style.color = colors.text.primary
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeView !== 'registrations') {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = colors.text.secondary
                  }
                }}
              >
                <Users 
                  size={sidebarCollapsed ? 21 : 20} 
                  style={{ 
                    minWidth: sidebarCollapsed ? '21px' : '20px',
                    minHeight: sidebarCollapsed ? '21px' : '20px'
                  }}
                />
                {!sidebarCollapsed && (
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>Inscritos</div>
                    <div style={{ 
                      fontSize: '11px', 
                      opacity: 0.8,
                      marginTop: '2px'
                    }}>
                      Gestionar participantes
                    </div>
                  </div>
                )}
                {sidebarCollapsed && (
                  <div className="sidebar-tooltip" style={{
                    position: 'absolute',
                    left: '100%',
                    marginLeft: '12px',
                    padding: '8px 12px',
                    background: colors.neutral[900],
                    color: 'white',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    opacity: 0,
                    pointerEvents: 'none',
                    transition: 'opacity 0.2s',
                    zIndex: 1000,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}>
                    Inscritos
                    <div style={{
                      position: 'absolute',
                      left: '-4px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 0,
                      height: 0,
                      borderStyle: 'solid',
                      borderWidth: '4px 4px 4px 0',
                      borderColor: `transparent ${colors.neutral[900]} transparent transparent`
                    }} />
                  </div>
                )}
              </div>

              {/* Programación */}
              <div
                onClick={() => setActiveView('schedule')}
                className="sidebar-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: sidebarCollapsed ? '16px' : '12px 16px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: activeView === 'schedule' 
                    ? 'linear-gradient(135deg, #047857, #059669)'
                    : 'transparent',
                  color: activeView === 'schedule' ? 'white' : colors.text.secondary,
                  gap: '12px',
                  position: 'relative',
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start'
                }}
                onMouseEnter={(e) => {
                  if (activeView !== 'schedule') {
                    e.currentTarget.style.background = colors.neutral[100]
                    e.currentTarget.style.color = colors.text.primary
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeView !== 'schedule') {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = colors.text.secondary
                  }
                }}
              >
                <Calendar 
                  size={sidebarCollapsed ? 21 : 20} 
                  style={{ 
                    minWidth: sidebarCollapsed ? '21px' : '20px',
                    minHeight: sidebarCollapsed ? '21px' : '20px'
                  }}
                />
                {!sidebarCollapsed && (
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>Programación</div>
                    <div style={{ 
                      fontSize: '11px', 
                      opacity: 0.8,
                      marginTop: '2px'
                    }}>
                      Calendario de partidos
                    </div>
                  </div>
                )}
                {sidebarCollapsed && (
                  <div className="sidebar-tooltip" style={{
                    position: 'absolute',
                    left: '100%',
                    marginLeft: '12px',
                    padding: '8px 12px',
                    background: colors.neutral[900],
                    color: 'white',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    opacity: 0,
                    pointerEvents: 'none',
                    transition: 'opacity 0.2s',
                    zIndex: 1000,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}>
                    Programación
                    <div style={{
                      position: 'absolute',
                      left: '-4px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 0,
                      height: 0,
                      borderStyle: 'solid',
                      borderWidth: '4px 4px 4px 0',
                      borderColor: `transparent ${colors.neutral[900]} transparent transparent`
                    }} />
                  </div>
                )}
              </div>

              {/* Vista Kanban */}
              <div
                onClick={() => setActiveView('kanban')}
                className="sidebar-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: sidebarCollapsed ? '16px' : '12px 16px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: activeView === 'kanban' 
                    ? 'linear-gradient(135deg, #047857, #059669)'
                    : 'transparent',
                  color: activeView === 'kanban' ? 'white' : colors.text.secondary,
                  gap: '12px',
                  position: 'relative',
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start'
                }}
                onMouseEnter={(e) => {
                  if (activeView !== 'kanban') {
                    e.currentTarget.style.background = colors.neutral[100]
                    e.currentTarget.style.color = colors.text.primary
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeView !== 'kanban') {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = colors.text.secondary
                  }
                }}
              >
                <Columns3 
                  size={sidebarCollapsed ? 21 : 20} 
                  style={{ 
                    minWidth: sidebarCollapsed ? '21px' : '20px',
                    minHeight: sidebarCollapsed ? '21px' : '20px'
                  }}
                />
                {!sidebarCollapsed && (
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600 }}>Vista Kanban</span>
                      <span style={{
                        padding: '2px 6px',
                        borderRadius: '6px',
                        background: activeView === 'kanban' 
                          ? 'rgba(255,255,255,0.2)' 
                          : 'linear-gradient(135deg, #a855f7, #9333ea)',
                        color: 'white',
                        fontSize: '10px',
                        fontWeight: 600
                      }}>PRO</span>
                    </div>
                    <div style={{ 
                      fontSize: '11px', 
                      opacity: 0.8,
                      marginTop: '2px'
                    }}>
                      Estado de canchas
                    </div>
                  </div>
                )}
                {sidebarCollapsed && (
                  <div className="sidebar-tooltip" style={{
                    position: 'absolute',
                    left: '100%',
                    marginLeft: '12px',
                    padding: '8px 12px',
                    background: colors.neutral[900],
                    color: 'white',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    opacity: 0,
                    pointerEvents: 'none',
                    transition: 'opacity 0.2s',
                    zIndex: 1000,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}>
                    Vista Kanban
                    <div style={{
                      position: 'absolute',
                      left: '-4px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 0,
                      height: 0,
                      borderStyle: 'solid',
                      borderWidth: '4px 4px 4px 0',
                      borderColor: `transparent ${colors.neutral[900]} transparent transparent`
                    }} />
                  </div>
                )}
              </div>

              {/* Captura Masiva */}
              <div
                onClick={() => setActiveView('capture')}
                className="sidebar-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: sidebarCollapsed ? '16px' : '12px 16px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: activeView === 'capture' 
                    ? 'linear-gradient(135deg, #047857, #059669)'
                    : 'transparent',
                  color: activeView === 'capture' ? 'white' : colors.text.secondary,
                  gap: '12px',
                  position: 'relative',
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start'
                }}
                onMouseEnter={(e) => {
                  if (activeView !== 'capture') {
                    e.currentTarget.style.background = colors.neutral[100]
                    e.currentTarget.style.color = colors.text.primary
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeView !== 'capture') {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = colors.text.secondary
                  }
                }}
              >
                <Camera 
                  size={sidebarCollapsed ? 21 : 20} 
                  style={{ 
                    minWidth: sidebarCollapsed ? '21px' : '20px',
                    minHeight: sidebarCollapsed ? '21px' : '20px'
                  }}
                />
                {!sidebarCollapsed && (
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>Captura Masiva</div>
                    <div style={{ 
                      fontSize: '11px', 
                      opacity: 0.8,
                      marginTop: '2px'
                    }}>
                      Registrar resultados
                    </div>
                  </div>
                )}
                {sidebarCollapsed && (
                  <div className="sidebar-tooltip" style={{
                    position: 'absolute',
                    left: '100%',
                    marginLeft: '12px',
                    padding: '8px 12px',
                    background: colors.neutral[900],
                    color: 'white',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    opacity: 0,
                    pointerEvents: 'none',
                    transition: 'opacity 0.2s',
                    zIndex: 1000,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}>
                    Captura Masiva
                    <div style={{
                      position: 'absolute',
                      left: '-4px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 0,
                      height: 0,
                      borderStyle: 'solid',
                      borderWidth: '4px 4px 4px 0',
                      borderColor: `transparent ${colors.neutral[900]} transparent transparent`
                    }} />
                  </div>
                )}
              </div>

              {/* Modo TV */}
              <div
                onClick={() => setActiveView('tv')}
                className="sidebar-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: sidebarCollapsed ? '16px' : '12px 16px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: activeView === 'tv' 
                    ? 'linear-gradient(135deg, #047857, #059669)'
                    : 'transparent',
                  color: activeView === 'tv' ? 'white' : colors.text.secondary,
                  gap: '12px',
                  position: 'relative',
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start'
                }}
                onMouseEnter={(e) => {
                  if (activeView !== 'tv') {
                    e.currentTarget.style.background = colors.neutral[100]
                    e.currentTarget.style.color = colors.text.primary
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeView !== 'tv') {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = colors.text.secondary
                  }
                }}
              >
                <Tv2 
                  size={sidebarCollapsed ? 21 : 20} 
                  style={{ 
                    minWidth: sidebarCollapsed ? '21px' : '20px',
                    minHeight: sidebarCollapsed ? '21px' : '20px'
                  }}
                />
                {!sidebarCollapsed && (
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>Modo TV</div>
                    <div style={{ 
                      fontSize: '11px', 
                      opacity: 0.8,
                      marginTop: '2px'
                    }}>
                      Pantalla pública
                    </div>
                  </div>
                )}
                {sidebarCollapsed && (
                  <div className="sidebar-tooltip" style={{
                    position: 'absolute',
                    left: '100%',
                    marginLeft: '12px',
                    padding: '8px 12px',
                    background: colors.neutral[900],
                    color: 'white',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    opacity: 0,
                    pointerEvents: 'none',
                    transition: 'opacity 0.2s',
                    zIndex: 1000,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}>
                    Modo TV
                    <div style={{
                      position: 'absolute',
                      left: '-4px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 0,
                      height: 0,
                      borderStyle: 'solid',
                      borderWidth: '4px 4px 4px 0',
                      borderColor: `transparent ${colors.neutral[900]} transparent transparent`
                    }} />
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* Categorías Section */}
          <div style={{ marginTop: '24px' }}>
            {!sidebarCollapsed && (
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  padding: '8px 12px',
                  marginBottom: '12px',
                  borderRadius: '6px',
                  transition: 'background 0.2s'
                }}
                onClick={() => setCategoriesExpanded(!categoriesExpanded)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.neutral[100]
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                <span style={{ 
                  fontSize: '11px', 
                  fontWeight: 600, 
                  color: colors.text.tertiary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  CATEGORÍAS
                </span>
                <ChevronDown 
                  size={14} 
                  style={{ 
                    color: colors.text.tertiary,
                    transform: categoriesExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                    transition: 'transform 0.2s'
                  }} 
                />
              </div>
            )}
            
            {categoriesExpanded && !sidebarCollapsed && (
            <div style={{ 
              marginTop: '-8px',
              animation: 'slideDown 0.2s ease-out'
            }}>
              {/* Submenú Masculino */}
              {(() => {
                const masculineCategories = tournamentData.categories.filter(cat => cat.modality === 'masculine')
                if (masculineCategories.length === 0) return null
                
                return (
                  <div style={{ marginBottom: '8px' }}>
                    <div 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        padding: '6px 12px',
                        marginBottom: '4px',
                        borderRadius: '6px',
                        background: masculineExpanded ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
                        transition: 'all 0.2s',
                      }}
                      onClick={() => setMasculineExpanded(!masculineExpanded)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = masculineExpanded 
                          ? 'rgba(59, 130, 246, 0.08)' 
                          : colors.neutral[100]
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = masculineExpanded 
                          ? 'rgba(59, 130, 246, 0.05)' 
                          : 'transparent'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '16px' }}>♂️</span>
                        <span style={{ 
                          fontSize: '12px', 
                          fontWeight: 600, 
                          color: colors.text.secondary
                        }}>
                          Masculino
                        </span>
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: '10px',
                          background: 'rgba(59, 130, 246, 0.1)',
                          color: 'rgb(59, 130, 246)',
                          fontSize: '10px',
                          fontWeight: 600
                        }}>
                          {masculineCategories.length}
                        </span>
                      </div>
                      <ChevronDown 
                        size={12} 
                        style={{ 
                          color: colors.text.tertiary,
                          transform: masculineExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                          transition: 'transform 0.2s'
                        }} 
                      />
                    </div>
                    {masculineExpanded && (
                      <div style={{ paddingLeft: '20px', animation: 'slideDown 0.2s ease-out' }}>
                        {masculineCategories.map((cat, idx) => (
                          <div
                            key={`m-${idx}`}
                            onClick={() => setSelectedCategory(`${cat.code}-${cat.modality}`)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '8px 12px',
                              marginBottom: '4px',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              background: selectedCategory === `${cat.code}-${cat.modality}`
                                ? 'rgba(59, 130, 246, 0.1)'
                                : 'transparent',
                              color: selectedCategory === `${cat.code}-${cat.modality}`
                                ? 'rgb(59, 130, 246)'
                                : colors.text.secondary
                            }}
                            onMouseEnter={(e) => {
                              if (selectedCategory !== `${cat.code}-${cat.modality}`) {
                                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.05)'
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (selectedCategory !== `${cat.code}-${cat.modality}`) {
                                e.currentTarget.style.background = 'transparent'
                              }
                            }}
                          >
                            <span style={{ fontSize: '12px', fontWeight: 500 }}>{cat.code}</span>
                            <span style={{
                              padding: '2px 6px',
                              borderRadius: '10px',
                              background: selectedCategory === `${cat.code}-${cat.modality}` 
                                ? 'rgb(59, 130, 246)' 
                                : 'rgba(59, 130, 246, 0.1)',
                              color: selectedCategory === `${cat.code}-${cat.modality}` 
                                ? 'white' 
                                : 'rgb(59, 130, 246)',
                              fontSize: '10px',
                              fontWeight: 600
                            }}>
                              {cat.teams}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })()}

              {/* Submenú Femenino */}
              {(() => {
                const feminineCategories = tournamentData.categories.filter(cat => cat.modality === 'feminine')
                if (feminineCategories.length === 0) return null
                
                return (
                  <div style={{ marginBottom: '8px' }}>
                    <div 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        padding: '6px 12px',
                        marginBottom: '4px',
                        borderRadius: '6px',
                        background: feminineExpanded ? 'rgba(236, 72, 153, 0.05)' : 'transparent',
                        transition: 'all 0.2s',
                      }}
                      onClick={() => setFeminineExpanded(!feminineExpanded)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = feminineExpanded 
                          ? 'rgba(236, 72, 153, 0.08)' 
                          : colors.neutral[100]
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = feminineExpanded 
                          ? 'rgba(236, 72, 153, 0.05)' 
                          : 'transparent'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '16px' }}>♀️</span>
                        <span style={{ 
                          fontSize: '12px', 
                          fontWeight: 600, 
                          color: colors.text.secondary
                        }}>
                          Femenino
                        </span>
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: '10px',
                          background: 'rgba(236, 72, 153, 0.1)',
                          color: 'rgb(236, 72, 153)',
                          fontSize: '10px',
                          fontWeight: 600
                        }}>
                          {feminineCategories.length}
                        </span>
                      </div>
                      <ChevronDown 
                        size={12} 
                        style={{ 
                          color: colors.text.tertiary,
                          transform: feminineExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                          transition: 'transform 0.2s'
                        }} 
                      />
                    </div>
                    {feminineExpanded && (
                      <div style={{ paddingLeft: '20px', animation: 'slideDown 0.2s ease-out' }}>
                        {feminineCategories.map((cat, idx) => (
                          <div
                            key={`f-${idx}`}
                            onClick={() => setSelectedCategory(`${cat.code}-${cat.modality}`)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '8px 12px',
                              marginBottom: '4px',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              background: selectedCategory === `${cat.code}-${cat.modality}`
                                ? 'rgba(236, 72, 153, 0.1)'
                                : 'transparent',
                              color: selectedCategory === `${cat.code}-${cat.modality}`
                                ? 'rgb(236, 72, 153)'
                                : colors.text.secondary
                            }}
                            onMouseEnter={(e) => {
                              if (selectedCategory !== `${cat.code}-${cat.modality}`) {
                                e.currentTarget.style.background = 'rgba(236, 72, 153, 0.05)'
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (selectedCategory !== `${cat.code}-${cat.modality}`) {
                                e.currentTarget.style.background = 'transparent'
                              }
                            }}
                          >
                            <span style={{ fontSize: '12px', fontWeight: 500 }}>{cat.code}</span>
                            <span style={{
                              padding: '2px 6px',
                              borderRadius: '10px',
                              background: selectedCategory === `${cat.code}-${cat.modality}` 
                                ? 'rgb(236, 72, 153)' 
                                : 'rgba(236, 72, 153, 0.1)',
                              color: selectedCategory === `${cat.code}-${cat.modality}` 
                                ? 'white' 
                                : 'rgb(236, 72, 153)',
                              fontSize: '10px',
                              fontWeight: 600
                            }}>
                              {cat.teams}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })()}

              {/* Submenú Mixto */}
              {(() => {
                const mixedCategories = tournamentData.categories.filter(cat => cat.modality === 'mixed')
                if (mixedCategories.length === 0) return null
                
                return (
                  <div style={{ marginBottom: '8px' }}>
                    <div 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        padding: '6px 12px',
                        marginBottom: '4px',
                        borderRadius: '6px',
                        background: mixedExpanded ? 'rgba(168, 85, 247, 0.05)' : 'transparent',
                        transition: 'all 0.2s',
                      }}
                      onClick={() => setMixedExpanded(!mixedExpanded)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = mixedExpanded 
                          ? 'rgba(168, 85, 247, 0.08)' 
                          : colors.neutral[100]
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = mixedExpanded 
                          ? 'rgba(168, 85, 247, 0.05)' 
                          : 'transparent'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '16px' }}>⚥</span>
                        <span style={{ 
                          fontSize: '12px', 
                          fontWeight: 600, 
                          color: colors.text.secondary
                        }}>
                          Mixto
                        </span>
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: '10px',
                          background: 'rgba(168, 85, 247, 0.1)',
                          color: 'rgb(168, 85, 247)',
                          fontSize: '10px',
                          fontWeight: 600
                        }}>
                          {mixedCategories.length}
                        </span>
                      </div>
                      <ChevronDown 
                        size={12} 
                        style={{ 
                          color: colors.text.tertiary,
                          transform: mixedExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                          transition: 'transform 0.2s'
                        }} 
                      />
                    </div>
                    {mixedExpanded && (
                      <div style={{ paddingLeft: '20px', animation: 'slideDown 0.2s ease-out' }}>
                        {mixedCategories.map((cat, idx) => (
                          <div
                            key={`x-${idx}`}
                            onClick={() => setSelectedCategory(`${cat.code}-${cat.modality}`)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '8px 12px',
                              marginBottom: '4px',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              background: selectedCategory === `${cat.code}-${cat.modality}`
                                ? 'rgba(168, 85, 247, 0.1)'
                                : 'transparent',
                              color: selectedCategory === `${cat.code}-${cat.modality}`
                                ? 'rgb(168, 85, 247)'
                                : colors.text.secondary
                            }}
                            onMouseEnter={(e) => {
                              if (selectedCategory !== `${cat.code}-${cat.modality}`) {
                                e.currentTarget.style.background = 'rgba(168, 85, 247, 0.05)'
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (selectedCategory !== `${cat.code}-${cat.modality}`) {
                                e.currentTarget.style.background = 'transparent'
                              }
                            }}
                          >
                            <span style={{ fontSize: '12px', fontWeight: 500 }}>{cat.code}</span>
                            <span style={{
                              padding: '2px 6px',
                              borderRadius: '10px',
                              background: selectedCategory === `${cat.code}-${cat.modality}` 
                                ? 'rgb(168, 85, 247)' 
                                : 'rgba(168, 85, 247, 0.1)',
                              color: selectedCategory === `${cat.code}-${cat.modality}` 
                                ? 'white' 
                                : 'rgb(168, 85, 247)',
                              fontSize: '10px',
                              fontWeight: 600
                            }}>
                              {cat.teams}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })()}
            </div>
          )}
          {sidebarCollapsed && (
            <div style={{ 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              padding: '8px 0'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: colors.neutral[100],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 600,
                color: colors.text.secondary
              }}>
                {tournamentData.categories.length}
              </div>
            </div>
          )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ 
          padding: '16px',
          borderTop: `1px solid ${colors.border.light}`,
          marginTop: 'auto'
        }}>
          <div
            className="sidebar-item"
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: sidebarCollapsed ? '12px' : '12px 16px',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              color: colors.text.secondary,
              gap: '12px',
              position: 'relative',
              justifyContent: sidebarCollapsed ? 'center' : 'flex-start'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.neutral[100]
              e.currentTarget.style.color = colors.text.primary
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = colors.text.secondary
            }}
          >
            <Settings 
              size={sidebarCollapsed ? 21 : 20} 
              style={{ 
                minWidth: sidebarCollapsed ? '21px' : '20px',
                minHeight: sidebarCollapsed ? '21px' : '20px'
              }}
            />
            {!sidebarCollapsed && (
              <span style={{ fontSize: '14px', fontWeight: 500 }}>Configuración</span>
            )}
            {sidebarCollapsed && (
              <div className="sidebar-tooltip" style={{
                position: 'absolute',
                left: '100%',
                marginLeft: '12px',
                padding: '8px 12px',
                background: colors.neutral[900],
                color: 'white',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                opacity: 0,
                pointerEvents: 'none',
                transition: 'opacity 0.2s',
                zIndex: 1000,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}>
                Configuración
                <div style={{
                  position: 'absolute',
                  left: '-4px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 0,
                  height: 0,
                  borderStyle: 'solid',
                  borderWidth: '4px 4px 4px 0',
                  borderColor: `transparent ${colors.neutral[900]} transparent transparent`
                }} />
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{ 
        flex: 1, 
        overflow: 'auto',
        padding: '32px'
      }}>
        {/* Header */}
        <div style={{ 
          marginBottom: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h1 style={{ 
              fontSize: '32px', 
              fontWeight: 700,
              color: colors.text.primary,
              letterSpacing: '-0.03em',
              marginBottom: '8px'
            }}>
              {tournamentData.tournament.name}
            </h1>
            <p style={{ 
              fontSize: '14px',
              color: colors.text.secondary
            }}>
              {tournamentData.tournament.club.name} • Gestiona todas las operaciones del torneo
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={() => window.location.href = '/dashboard'}
              style={{
                padding: '10px 20px',
                borderRadius: '12px',
                background: '#10b981',
                color: '#1f2937',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#059669'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#10b981'
              }}
            >
              ← Volver a Club
            </button>
          </div>
        </div>

        {/* Vista General */}
        {activeView === 'overview' && (
          <>
            {/* Panel de Estado Principal - Diseño moderno y minimalista */}
            <CardModern variant="glass" padding="none" style={{ 
              marginBottom: '32px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
              border: `1px solid ${colors.border.light}`,
              overflow: 'hidden'
            }}>
              {/* Header con información básica */}
              <div style={{
                padding: '24px 32px',
                borderBottom: `1px solid ${colors.border.light}`,
                background: 'white'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <h2 style={{ 
                      fontSize: '20px', 
                      fontWeight: 600,
                      color: colors.text.primary,
                      marginBottom: '4px'
                    }}>
                      Estado del Torneo
                    </h2>
                    <p style={{ 
                      fontSize: '13px',
                      color: colors.text.secondary
                    }}>
                      {new Date().toLocaleDateString('es-MX', { 
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      background: colors.neutral[100],
                      fontSize: '13px',
                      fontWeight: 500,
                      color: colors.text.secondary
                    }}>
                      {tournamentData.tournament.status === 'active' ? '🟢 Activo' : 
                       tournamentData.tournament.status === 'pending' ? '🟡 Pendiente' : 
                       '🔴 Finalizado'}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Barra de Progreso Principal */}
              <div style={{
                padding: '28px 32px',
                background: 'linear-gradient(180deg, #FAFAFA, #FFFFFF)'
              }}>
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    marginBottom: '16px'
                  }}>
                    <div>
                      <span style={{ 
                        fontSize: '14px', 
                        fontWeight: 500,
                        color: colors.text.secondary,
                        marginRight: '12px'
                      }}>
                        Progreso General
                      </span>
                      <span style={{ 
                        fontSize: '32px', 
                        fontWeight: 700,
                        color: colors.primary[700]
                      }}>
                        {tournamentData.stats.totalMatches > 0 
                          ? Math.round((tournamentData.stats.completedMatches / tournamentData.stats.totalMatches) * 100)
                          : 0}%
                      </span>
                    </div>
                    <div style={{
                      textAlign: 'right'
                    }}>
                      <p style={{
                        fontSize: '13px',
                        color: colors.text.secondary,
                        marginBottom: '4px'
                      }}>
                        {tournamentData.stats.completedMatches} de {tournamentData.stats.totalMatches} partidos
                      </p>
                      <p style={{
                        fontSize: '12px',
                        color: colors.text.tertiary
                      }}>
                        Tiempo estimado: {Math.round((tournamentData.stats.totalMatches - tournamentData.stats.completedMatches) * 1.5)} horas
                      </p>
                    </div>
                  </div>
                  
                  {/* Barra de progreso mejorada */}
                  <div style={{
                    position: 'relative',
                    height: '12px',
                    background: colors.neutral[200],
                    borderRadius: '100px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      height: '100%',
                      width: tournamentData.stats.totalMatches > 0 
                        ? `${(tournamentData.stats.completedMatches / tournamentData.stats.totalMatches) * 100}%`
                        : '0%',
                      background: `linear-gradient(90deg, ${colors.primary[600]}, ${colors.accent[400]})`,
                      borderRadius: '100px',
                      transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                      {/* Efecto de brillo animado */}
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '100%',
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                        animation: 'shimmer 2s infinite'
                      }} />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Métricas con iconos */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                borderTop: `1px solid ${colors.border.light}`,
                background: 'white'
              }}>
                <div style={{
                  padding: '24px',
                  borderRight: `1px solid ${colors.border.light}`,
                  textAlign: 'center'
                }}>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: `linear-gradient(135deg, ${colors.primary[100]}, ${colors.primary[50]})`,
                    marginBottom: '12px'
                  }}>
                    <Users size={24} style={{ color: colors.primary[600] }} />
                  </div>
                  <p style={{ 
                    fontSize: '11px', 
                    color: colors.text.tertiary,
                    marginBottom: '4px',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Equipos
                  </p>
                  <p style={{ 
                    fontSize: '28px', 
                    fontWeight: 700,
                    color: colors.text.primary,
                    lineHeight: 1
                  }}>
                    {tournamentData.stats.totalTeams}
                  </p>
                </div>
                
                <div style={{
                  padding: '24px',
                  borderRight: `1px solid ${colors.border.light}`,
                  textAlign: 'center'
                }}>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: `linear-gradient(135deg, ${colors.accent[100]}, ${colors.accent[50]})`,
                    marginBottom: '12px'
                  }}>
                    <Calendar size={24} style={{ color: colors.accent[600] }} />
                  </div>
                  <p style={{ 
                    fontSize: '11px', 
                    color: colors.text.tertiary,
                    marginBottom: '4px',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Partidos Hoy
                  </p>
                  <p style={{ 
                    fontSize: '28px', 
                    fontWeight: 700,
                    color: colors.text.primary,
                    lineHeight: 1
                  }}>
                    {tournamentData.stats.todayMatches}
                  </p>
                </div>
                
                <div style={{
                  padding: '24px',
                  borderRight: `1px solid ${colors.border.light}`,
                  textAlign: 'center'
                }}>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: `linear-gradient(135deg, ${colors.warning[100]}, ${colors.warning[50]})`,
                    marginBottom: '12px'
                  }}>
                    <PlayCircle size={24} style={{ color: colors.warning[600] }} />
                  </div>
                  <p style={{ 
                    fontSize: '11px', 
                    color: colors.text.tertiary,
                    marginBottom: '4px',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    En Juego
                  </p>
                  <p style={{ 
                    fontSize: '28px', 
                    fontWeight: 700,
                    color: colors.text.primary,
                    lineHeight: 1
                  }}>
                    {tournamentData.stats.inProgressMatches}
                  </p>
                </div>
                
                <div style={{
                  padding: '24px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: colors.neutral[100],
                    marginBottom: '12px'
                  }}>
                    <Clock size={24} style={{ color: colors.text.secondary }} />
                  </div>
                  <p style={{ 
                    fontSize: '11px', 
                    color: colors.text.tertiary,
                    marginBottom: '4px',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Pendientes
                  </p>
                  <p style={{ 
                    fontSize: '28px', 
                    fontWeight: 700,
                    color: colors.text.primary,
                    lineHeight: 1
                  }}>
                    {tournamentData.stats.pendingMatches}
                  </p>
                </div>
              </div>
            </CardModern>

            {/* Grid de información */}
            {/* Removido: Panel de Estado de Canchas y Próximos Partidos */}
            
            {/* Categories Grid */}
            <CardModern variant="glass" padding="lg">
              <CardModernHeader>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: `linear-gradient(135deg, ${colors.primary[600]}15, ${colors.accent[300]}15)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Trophy size={20} style={{ color: colors.primary[600] }} />
                    </div>
                    <div>
                      <CardModernTitle>Categorías del Torneo</CardModernTitle>
                      <CardModernDescription>
                        Vista rápida del estado de cada categoría
                      </CardModernDescription>
                    </div>
                  </div>
                  <button style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: `1px solid ${colors.border.default}`,
                    background: 'white',
                    color: colors.text.secondary,
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    Ver todas
                    <ChevronRight size={16} />
                  </button>
                </div>
              </CardModernHeader>

              <CardModernContent>
                {/* Filtros de género */}
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  marginBottom: '20px',
                  padding: '4px',
                  background: colors.neutral[100],
                  borderRadius: '10px',
                  width: 'fit-content'
                }}>
                  {(['all', 'M', 'F', 'X'] as const).map(gender => (
                    <button
                      key={gender}
                      onClick={() => setCategoryGenderFilter(gender)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        background: categoryGenderFilter === gender ? 'white' : 'transparent',
                        border: 'none',
                        fontSize: '13px',
                        fontWeight: categoryGenderFilter === gender ? 600 : 500,
                        color: categoryGenderFilter === gender ? colors.text.primary : colors.text.secondary,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: categoryGenderFilter === gender ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'
                      }}
                    >
                      {gender === 'all' ? 'Todas' : 
                       gender === 'M' ? 'Masculino' : 
                       gender === 'F' ? 'Femenino' : 'Mixto'}
                    </button>
                  ))}
                </div>
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '16px'
                }}>
                  {tournamentData.categories
                    .filter(cat => {
                      if (categoryGenderFilter === 'all') return true
                      if (categoryGenderFilter === 'M') return cat.modality === 'masculine'
                      if (categoryGenderFilter === 'F') return cat.modality === 'feminine'
                      if (categoryGenderFilter === 'X') return cat.modality === 'mixed'
                      return false
                    })
                    .map((category, idx) => {
                    // Determinar la fase actual basado en partidos completados
                    const progressPercent = category.totalMatches > 0 
                      ? (category.completedMatches / category.totalMatches) * 100 
                      : 0
                    const getCurrentPhase = () => {
                      if (progressPercent === 100) return 'Final Completada'
                      if (progressPercent >= 87.5) return 'Final'
                      if (progressPercent >= 75) return 'Semifinales'
                      if (progressPercent >= 50) return 'Cuartos de Final'
                      if (progressPercent >= 25) return 'Octavos de Final'
                      return 'Fase de Grupos'
                    }
                    
                    // Obtener próximo partido importante de esta categoría
                    const categoryKey = `${category.code}-${category.modality}`
                    const nextImportantMatch = tournamentData.matches.upcoming.find((m: any) => {
                      const matchCategory = m.round?.split('-')[0] || ''
                      const matchModality = m.round?.includes('FEM') ? 'F' : 'M'
                      return `${matchCategory}-${matchModality}` === categoryKey
                    })
                    
                    // Usar el mismo color verde oscuro para todas las categorías
                    const getCategoryGradient = () => {
                      return `linear-gradient(135deg, #064E3B, #065F46)`
                    }
                    
                    // Texto siempre blanco con el fondo oscuro
                    const getTextColor = () => {
                      return 'white'
                    }
                    
                    return (
                      <div
                        key={idx}
                        style={{
                          borderRadius: '16px',
                          background: 'white',
                          border: `1px solid ${colors.border.light}`,
                          cursor: 'pointer',
                          transition: 'all 0.3s',
                          position: 'relative',
                          overflow: 'hidden',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-4px)'
                          e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.08)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)'
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'
                        }}
                        onClick={() => setSelectedCategory(categoryKey)}
                      >
                        {/* Header con gradiente */}
                        <div style={{
                          background: getCategoryGradient(),
                          padding: '16px 20px',
                          color: getTextColor()
                        }}>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '8px'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <h3 style={{ 
                                fontSize: '16px',
                                fontWeight: 700,
                                margin: 0
                              }}>
                                {category.name}
                              </h3>
                              <div style={{
                                background: getTextColor() === 'white' ? 'rgba(255,255,255,0.2)' : 'rgba(6,78,59,0.15)',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: 600,
                                color: getTextColor()
                              }}>
                                {category.modality === 'M' ? 'MASCULINO' : 'FEMENINO'}
                              </div>
                            </div>
                            <div style={{
                              fontSize: '18px',
                              fontWeight: 700
                            }}>
                              {Math.round(progressPercent)}%
                            </div>
                          </div>
                          
                          {/* Barra de progreso */}
                          <div style={{
                            height: '6px',
                            background: getTextColor() === 'white' ? 'rgba(255,255,255,0.3)' : 'rgba(6,78,59,0.2)',
                            borderRadius: '100px',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              height: '100%',
                              width: `${progressPercent}%`,
                              background: getTextColor() === 'white' ? 'white' : '#064E3B',
                              borderRadius: '100px',
                              transition: 'width 1s ease',
                              boxShadow: getTextColor() === 'white' ? '0 0 10px rgba(255,255,255,0.5)' : 'none'
                            }} />
                          </div>
                        </div>
                        
                        {/* Contenido */}
                        <div style={{ padding: '16px 20px' }}>
                          {/* Fase actual */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '16px'
                          }}>
                            <div style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              background: category.status === 'active' ? colors.accent[600] : colors.neutral[400],
                              animation: category.status === 'active' ? 'pulse 2s infinite' : 'none'
                            }} />
                            <span style={{
                              fontSize: '13px',
                              fontWeight: 600,
                              color: colors.text.primary
                            }}>
                              {getCurrentPhase()}
                            </span>
                          </div>
                          
                            {/* Mini visualización de bracket simplificada */}
                          <div style={{
                            display: 'flex',
                            gap: '3px',
                            marginBottom: '16px'
                          }}>
                            {[...Array(8)].map((_, i) => (
                              <div
                                key={i}
                                style={{
                                  flex: 1,
                                  height: '3px',
                                  background: i < Math.floor(progressPercent / 12.5) ? 
                                    colors.accent[600] : colors.neutral[200],
                                  borderRadius: '2px',
                                  transition: 'all 0.3s'
                                }}
                              />
                            ))}
                          </div>
                          
                          {/* Estadísticas */}
                          <div style={{ 
                            display: 'flex',
                            justifyContent: 'space-between',
                            paddingTop: '12px',
                            borderTop: `1px solid ${colors.border.light}`
                          }}>
                            <div style={{ textAlign: 'center' }}>
                              <p style={{ 
                                fontSize: '16px',
                                fontWeight: 600,
                                color: colors.text.primary,
                                margin: 0
                              }}>
                                {category.teams}
                              </p>
                              <p style={{ 
                                fontSize: '11px',
                                color: colors.text.tertiary,
                                marginTop: '2px'
                              }}>
                                Equipos
                              </p>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                              <p style={{ 
                                fontSize: '16px',
                                fontWeight: 600,
                                color: colors.text.primary,
                                margin: 0
                              }}>
                                {category.completedMatches}
                              </p>
                              <p style={{ 
                                fontSize: '11px',
                                color: colors.text.tertiary,
                                marginTop: '2px'
                              }}>
                                Jugados
                              </p>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                              <p style={{ 
                                fontSize: '16px',
                                fontWeight: 600,
                                color: colors.warning[600],
                                margin: 0
                              }}>
                                {category.totalMatches - category.completedMatches}
                              </p>
                              <p style={{ 
                                fontSize: '11px',
                                color: colors.text.tertiary,
                                marginTop: '2px'
                              }}>
                                Restantes
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Indicador de acción */}
                        <div style={{
                          position: 'absolute',
                          bottom: '16px',
                          right: '16px',
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: colors.neutral[100],
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <ChevronRight size={14} style={{ color: colors.text.tertiary }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardModernContent>
            </CardModern>

          </>
        )}

        {/* Vista Kanban de Canchas */}
        {/* Vista Kanban de Canchas */}
        {activeView === 'kanban' && (
          <div style={{ marginTop: '24px' }}>
            <div style={{ padding: '20px', background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              <h2>Kanban View</h2>
              <p>This view is temporarily disabled while fixing syntax errors.</p>
            </div>
          </div>
        )}

        {/* Vista de Programación */}
        {/* Vista de Programación */}
        {activeView === 'schedule' && (
          <div style={{ marginTop: '24px' }}>
            <div style={{ padding: '20px', background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              <h2>Schedule View</h2>
              <p>This view is temporarily disabled while fixing syntax errors.</p>
            </div>
          </div>
        )}

        {/* Vista de Captura Masiva */}
        {activeView === 'capture' && (
          <div style={{ marginTop: '24px' }}>
            <CardModern variant="glass" padding="lg">
              <CardModernHeader>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: `linear-gradient(135deg, ${colors.primary[600]}15, ${colors.accent[300]}15)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Camera size={20} style={{ color: colors.primary[600] }} />
                    </div>
                    <div>
                      <CardModernTitle>Captura Masiva de Resultados</CardModernTitle>
                      <CardModernDescription>
                        Registra múltiples resultados de forma rápida y eficiente
                      </CardModernDescription>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => {
                        // Obtener todos los partidos filtrados actuales
                        const allMatches = [...tournamentData.matches.upcoming, ...tournamentData.matches.inProgress]
                        const filteredMatches = allMatches.filter((m: any) => {
                          if (captureCategoryFilter !== 'all') {
                            const matchCategory = m.round?.split('-')[0] || ''
                            const matchModality = m.round?.includes('FEM') ? 'F' : 'M'
                            const categoryKey = `${matchCategory}-${matchModality}`
                            if (categoryKey !== captureCategoryFilter) return false
                          }
                          if (captureStatusFilter === 'pending' && m.status !== 'pending') {
                            return false
                          } else if (captureStatusFilter === 'completed' && m.status !== 'completed') {
                            return false
                          }
                          return true
                        })
                        
                        // Toggle selección: si todos están seleccionados, deseleccionar todo; si no, seleccionar todo
                        const allSelected = filteredMatches.every((m: any) => selectedMatches.has(m.id))
                        if (allSelected) {
                          setSelectedMatches(new Set()) // Deseleccionar todo
                        } else {
                          setSelectedMatches(new Set(filteredMatches.map((m: any) => m.id))) // Seleccionar todo
                        }
                      }}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        border: `1px solid ${colors.border.default}`,
                        background: 'white',
                        color: colors.text.secondary,
                        fontSize: '13px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <CheckCircle size={16} />
                      {selectedMatches.size > 0 ? 'Deseleccionar todos' : 'Seleccionar todos'}
                    </button>
                    <button style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      background: `linear-gradient(135deg, ${colors.accent[600]}, ${colors.accent[300]})`,
                      color: 'white',
                      border: 'none',
                      fontSize: '13px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <Camera size={16} />
                      Guardar seleccionados
                    </button>
                  </div>
                </div>
              </CardModernHeader>

              <CardModernContent>
                {/* Filtros */}
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  marginBottom: '20px',
                  padding: '16px',
                  background: 'rgba(255, 255, 255, 0.5)',
                  borderRadius: '12px',
                  border: `1px solid ${colors.border.light}`
                }}>
                  <select 
                    value={captureCategoryFilter}
                    onChange={(e) => setCaptureCategoryFilter(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: `1px solid ${colors.border.default}`,
                      background: 'white',
                      fontSize: '13px',
                      color: colors.text.primary,
                      cursor: 'pointer'
                    }}
                  >
                    <option value="all">Todas las categorías</option>
                    {tournamentData.categories.map((cat: any) => (
                      <option key={`${cat.code}-${cat.modality}`} value={`${cat.code}-${cat.modality}`}>
                        {cat.name} {cat.modality === 'M' ? 'Masculino' : 'Femenino'}
                      </option>
                    ))}
                  </select>
                  <select 
                    value={captureStatusFilter}
                    onChange={(e) => setCaptureStatusFilter(e.target.value as any)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: `1px solid ${colors.border.default}`,
                      background: 'white',
                      fontSize: '13px',
                      color: colors.text.primary,
                      cursor: 'pointer'
                    }}
                  >
                    <option value="pending">Solo pendientes</option>
                    <option value="all">Todos los partidos</option>
                    <option value="completed">Completados</option>
                  </select>
                  <span style={{
                    marginLeft: 'auto',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: `linear-gradient(135deg, ${colors.primary[600]}10, ${colors.accent[300]}10)`,
                    border: `1px solid ${colors.primary[600]}30`,
                    fontSize: '13px',
                    color: colors.primary[700],
                    fontWeight: 500
                  }}>
                    {selectedMatches.size} seleccionados
                  </span>
                </div>

                {/* Lista de partidos pendientes para capturar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {(() => {
                    // Filtrar partidos según los filtros seleccionados
                    const allMatches = [...tournamentData.matches.upcoming, ...tournamentData.matches.inProgress]
                    const filteredMatches = allMatches.filter((m: any) => {
                      // Aplicar filtro de categoría
                      if (captureCategoryFilter !== 'all') {
                        const matchCategory = m.round?.split('-')[0] || ''
                        const matchModality = m.round?.includes('FEM') ? 'F' : 'M'
                        const categoryKey = `${matchCategory}-${matchModality}`
                        if (categoryKey !== captureCategoryFilter) return false
                      }
                      
                      // Aplicar filtro de estado
                      if (captureStatusFilter === 'pending' && m.status !== 'pending') {
                        return false
                      } else if (captureStatusFilter === 'completed' && m.status !== 'completed') {
                        return false
                      }
                      // 'all' muestra todos
                      
                      return true
                    })
                    
                    if (filteredMatches.length === 0) {
                      return (
                        <div style={{
                          padding: '32px',
                          textAlign: 'center',
                          color: colors.text.tertiary,
                          borderRadius: '12px',
                          background: 'white',
                          border: `1px solid ${colors.border.light}`
                        }}>
                          No hay partidos que coincidan con los filtros seleccionados
                        </div>
                      )
                    }
                    
                    return filteredMatches.slice(0, 10).map((match: any) => (
                    <div key={match.id} style={{
                      padding: '16px',
                      borderRadius: '12px',
                      background: match.status === 'completed' ? 'rgba(102, 231, 170, 0.05)' : 'white',
                      border: `1px solid ${match.status === 'completed' ? colors.accent[600] + '30' : colors.border.light}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px'
                    }}>
                      <input
                        type="checkbox"
                        checked={selectedMatches.has(match.id)}
                        onChange={(e) => {
                          const newSelected = new Set(selectedMatches)
                          if (e.target.checked) {
                            newSelected.add(match.id)
                          } else {
                            newSelected.delete(match.id)
                          }
                          setSelectedMatches(newSelected)
                        }}
                        style={{
                          width: '20px',
                          height: '20px',
                          cursor: 'pointer'
                        }}
                      />
                      
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          display: 'grid',
                          gridTemplateColumns: '2fr 100px 100px 100px 2fr',
                          gap: '16px',
                          alignItems: 'center'
                        }}>
                          <div>
                            <p style={{ 
                              fontSize: '14px',
                              fontWeight: 500,
                              color: colors.text.primary
                            }}>
                              {match.team1Name}
                            </p>
                            <p style={{ 
                              fontSize: '12px',
                              color: colors.text.secondary
                            }}>
                              {match.round}
                            </p>
                          </div>
                          
                          <input
                            type="text"
                            placeholder="Set 1"
                            defaultValue={match.team1Score?.split('-')[0]}
                            style={{
                              padding: '8px',
                              borderRadius: '6px',
                              border: `1px solid ${colors.border.default}`,
                              textAlign: 'center',
                              fontSize: '14px',
                              fontWeight: 500
                            }}
                          />
                          
                          <input
                            type="text"
                            placeholder="Set 2"
                            defaultValue={match.team1Score?.split('-')[1]}
                            style={{
                              padding: '8px',
                              borderRadius: '6px',
                              border: `1px solid ${colors.border.default}`,
                              textAlign: 'center',
                              fontSize: '14px',
                              fontWeight: 500
                            }}
                          />
                          
                          <input
                            type="text"
                            placeholder="Set 3"
                            style={{
                              padding: '8px',
                              borderRadius: '6px',
                              border: `1px solid ${colors.border.default}`,
                              textAlign: 'center',
                              fontSize: '14px',
                              fontWeight: 500
                            }}
                          />
                          
                          <div style={{ textAlign: 'right' }}>
                            <p style={{ 
                              fontSize: '14px',
                              fontWeight: 500,
                              color: colors.text.primary
                            }}>
                              {match.team2Name}
                            </p>
                            <p style={{ 
                              fontSize: '12px',
                              color: colors.text.secondary
                            }}>
                              Cancha {match.courtNumber || '?'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        background: match.status === 'completed' 
                          ? `linear-gradient(135deg, ${colors.accent[600]}20, ${colors.accent[300]}20)`
                          : colors.neutral[100],
                        border: `1px solid ${match.status === 'completed' ? colors.accent[600] + '40' : colors.border.light}`,
                        minWidth: '120px',
                        textAlign: 'center'
                      }}>
                        {match.status === 'completed' ? (
                          <span style={{ 
                            fontSize: '12px',
                            color: colors.accent[700],
                            fontWeight: 500
                          }}>
                            ✓ Completado
                          </span>
                        ) : (
                          <span style={{ 
                            fontSize: '12px',
                            color: colors.text.secondary
                          }}>
                            Pendiente
                          </span>
                        )}
                      </div>
                    </div>
                    ))
                  })()}
                </div>
              </CardModernContent>
            </CardModern>
          </div>
        )}

        {/* Vista de Inscritos - Estilo Verde Oscuro */}
        {activeView === 'registrations' && (
          <div style={{ marginTop: '24px' }}>
            {/* Header con estilo verde oscuro */}
            <div style={{
              background: 'linear-gradient(135deg, #047857, #059669)',
              borderRadius: '16px 16px 0 0',
              padding: '24px',
              color: 'white'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Users size={24} color="white" />
                  </div>
                  <div>
                    <h2 style={{ 
                      fontSize: '24px', 
                      fontWeight: 700,
                      margin: '0 0 4px 0',
                      color: 'white'
                    }}>
                      Equipos Inscritos
                    </h2>
                    <p style={{ 
                      fontSize: '14px',
                      margin: 0,
                      color: 'rgba(255,255,255,0.8)'
                    }}>
                      Gestión de inscripciones y participantes del torneo
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    onClick={fetchRegistrations}
                    disabled={loadingRegistrations}
                    style={{
                      padding: '12px',
                      borderRadius: '12px',
                      border: '1px solid rgba(255,255,255,0.3)',
                      background: 'rgba(255,255,255,0.15)',
                      color: 'white',
                      cursor: loadingRegistrations ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s',
                      width: '44px',
                      height: '44px'
                    }}
                    onMouseEnter={(e) => {
                      if (!loadingRegistrations) {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.25)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.15)'
                    }}
                  >
                    {loadingRegistrations ? (
                      <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                    ) : (
                      <TrendingUp size={20} />
                    )}
                  </button>
                  <button 
                  onClick={() => setShowAddTeamModal(true)}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.2)',
                    border: '1px solid rgba(255,255,255,0.4)',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                    width: '44px',
                    height: '44px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.3)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.2)'
                  }}>
                    <Plus size={20} />
                  </button>
                </div>
              </div>

              {/* Barra de búsqueda */}
              <div style={{
                position: 'relative',
                marginBottom: '20px'
              }}>
                <Search 
                  size={20} 
                  style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'rgba(255,255,255,0.6)'
                  }}
                />
                <input
                  type="text"
                  placeholder="Buscar equipos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '16px 16px 16px 48px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    fontSize: '16px',
                    outline: 'none',
                    backdropFilter: 'blur(8px)'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.15)'
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
                  }}
                />
              </div>

              {/* Estadísticas */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: '16px'
              }}>
                <div style={{ 
                  textAlign: 'center',
                  padding: '16px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(8px)'
                }}>
                  <p style={{ fontSize: '28px', fontWeight: 700, color: 'white', margin: '0 0 4px 0' }}>
                    {registrations.length}
                  </p>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', margin: 0 }}>
                    Total Inscritos
                  </p>
                </div>
                <div style={{ 
                  textAlign: 'center',
                  padding: '16px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(8px)'
                }}>
                  <p style={{ fontSize: '28px', fontWeight: 700, color: 'white', margin: '0 0 4px 0' }}>
                    {registrations.filter(r => r.confirmed).length}
                  </p>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', margin: 0 }}>
                    Confirmados
                  </p>
                </div>
                <div style={{ 
                  textAlign: 'center',
                  padding: '16px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(8px)'
                }}>
                  <p style={{ fontSize: '28px', fontWeight: 700, color: 'white', margin: '0 0 4px 0' }}>
                    {registrations.filter(r => r.paymentStatus === 'pending').length}
                  </p>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', margin: 0 }}>
                    Pago Pendiente
                  </p>
                </div>
                <div style={{ 
                  textAlign: 'center',
                  padding: '16px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(8px)'
                }}>
                  <p style={{ fontSize: '28px', fontWeight: 700, color: 'white', margin: '0 0 4px 0' }}>
                    {registrations.filter(r => r.checkedIn).length}
                  </p>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', margin: 0 }}>
                    Check-in
                  </p>
                </div>
              </div>
            </div>

            {/* Contenido con fondo blanco */}
            <div style={{
              background: 'white',
              borderRadius: '0 0 16px 16px',
              padding: '24px'
            }}>

                {/* Tabla de inscritos */}
                {loadingRegistrations ? (
                  <div style={{ 
                    padding: '48px',
                    textAlign: 'center',
                    color: colors.text.tertiary
                  }}>
                    <Loader2 size={32} style={{ 
                      color: colors.primary[600],
                      animation: 'spin 1s linear infinite',
                      margin: '0 auto 16px'
                    }} />
                    <p>Cargando inscripciones...</p>
                  </div>
                ) : registrations.length === 0 ? (
                  <div style={{
                    padding: '48px',
                    textAlign: 'center',
                    color: colors.text.tertiary,
                    borderRadius: '12px',
                    background: 'white',
                    border: `1px solid ${colors.border.light}`
                  }}>
                    <Users size={48} style={{ 
                      color: colors.neutral[400],
                      margin: '0 auto 16px'
                    }} />
                    <h3 style={{ 
                      fontSize: '18px',
                      fontWeight: 600,
                      color: colors.text.primary,
                      marginBottom: '8px'
                    }}>
                      No hay equipos inscritos
                    </h3>
                    <p style={{ 
                      fontSize: '14px',
                      color: colors.text.secondary
                    }}>
                      Agrega el primer equipo para comenzar
                    </p>
                  </div>
                ) : (() => {
                  // Filtrar equipos basado en el término de búsqueda
                  const filteredRegistrations = registrations.filter(reg => 
                    reg.teamName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    reg.player1Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    reg.player2Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    reg.category?.toLowerCase().includes(searchTerm.toLowerCase())
                  )

                  return filteredRegistrations.length === 0 ? (
                    <div style={{
                      padding: '48px',
                      textAlign: 'center',
                      color: colors.text.tertiary,
                      borderRadius: '12px',
                      background: colors.neutral[50],
                      border: `1px solid ${colors.border.light}`
                    }}>
                      <Search size={48} style={{ 
                        color: colors.neutral[400],
                        margin: '0 auto 16px'
                      }} />
                      <h3 style={{ 
                        fontSize: '18px',
                        fontWeight: 600,
                        color: colors.text.primary,
                        marginBottom: '8px'
                      }}>
                        No se encontraron resultados
                      </h3>
                      <p style={{ 
                        fontSize: '14px',
                        color: colors.text.secondary
                      }}>
                        Prueba con un término de búsqueda diferente
                      </p>
                    </div>
                  ) : (
                    <div style={{
                      display: 'grid',
                      gap: '16px'
                    }}>
                      {/* Tarjetas de equipos estilo moderno */}
                      {filteredRegistrations.map((reg, idx) => (
                        <div key={reg.id} style={{
                          background: 'white',
                          borderRadius: '16px',
                          padding: '20px',
                          border: '1px solid #e5e7eb',
                          transition: 'all 0.3s',
                          cursor: 'pointer',
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)'
                          e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.1)'
                          e.currentTarget.style.borderColor = '#059669'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)'
                          e.currentTarget.style.boxShadow = 'none'
                          e.currentTarget.style.borderColor = '#e5e7eb'
                        }}>
                          {/* Franja verde lateral */}
                          <div style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: '4px',
                            background: 'linear-gradient(180deg, #047857, #059669)',
                            borderRadius: '16px 0 0 16px'
                          }} />

                          {/* Contenido de la tarjeta */}
                          <div style={{
                            display: 'flex',
                            gap: '20px',
                            alignItems: 'center',
                            width: '100%'
                          }}>
                            {/* Número del equipo */}
                            <div style={{
                              width: '48px',
                              height: '48px',
                              borderRadius: '12px',
                              background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '20px',
                              color: '#059669',
                              flexShrink: 0
                            }}>
                              {idx + 1}
                            </div>

                            {/* Información del equipo */}
                            <div style={{ flex: 1 }}>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                marginBottom: '8px'
                              }}>
                                <h3 style={{
                                  fontSize: '18px',
                                  fontWeight: 700,
                                  color: '#1f2937',
                                  margin: 0
                                }}>
                                  {reg.teamName || `Equipo ${idx + 1}`}
                                </h3>
                                <span style={{
                                  padding: '4px 10px',
                                  borderRadius: '20px',
                                  background: 'linear-gradient(135deg, #047857, #059669)',
                                  color: 'white',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px'
                                }}>
                                  {reg.category || 'OPEN'} {reg.modality || 'M'}
                                </span>
                              </div>

                              {/* Jugadores */}
                              <div style={{
                                display: 'flex',
                                gap: '20px',
                                alignItems: 'center'
                              }}>
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px'
                                }}>
                                  <Users size={16} color="#6b7280" />
                                  <span style={{
                                    fontSize: '14px',
                                    color: '#4b5563'
                                  }}>
                                    {reg.player1Name}
                                  </span>
                                </div>
                                {reg.player2Name && (
                                  <>
                                    <span style={{ color: '#d1d5db' }}>•</span>
                                    <div style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '8px'
                                    }}>
                                      <Users size={16} color="#6b7280" />
                                      <span style={{
                                        fontSize: '14px',
                                        color: '#4b5563'
                                      }}>
                                        {reg.player2Name}
                                      </span>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Estado y acciones */}
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '16px'
                            }}>
                              {/* Estado de pago */}
                              <div style={{
                                padding: '8px 16px',
                                borderRadius: '10px',
                                background: reg.paymentStatus === 'completed' 
                                  ? '#dcfce7'
                                  : reg.paymentStatus === 'pending'
                                  ? '#fef3c7'
                                  : '#fee2e2',
                                fontSize: '13px',
                                fontWeight: 600,
                                color: reg.paymentStatus === 'completed' 
                                  ? '#15803d'
                                  : reg.paymentStatus === 'pending'
                                  ? '#a16207'
                                  : '#dc2626',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}>
                                {reg.paymentStatus === 'completed' ? (
                                  <>
                                    <CheckCircle size={14} />
                                    Pagado
                                  </>
                                ) : reg.paymentStatus === 'pending' ? (
                                  <>
                                    <Clock size={14} />
                                    Pendiente
                                  </>
                                ) : (
                                  <>
                                    <XCircle size={14} />
                                    Cancelado
                                  </>
                                )}
                              </div>

                              {/* Acciones */}
                              <div style={{
                                display: 'flex',
                                gap: '8px'
                              }}>
                                <button 
                                  title="Ver detalles"
                                  style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '10px',
                                    background: 'white',
                                    border: '1px solid #e5e7eb',
                                    color: '#059669',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#f0fdf4'
                                    e.currentTarget.style.borderColor = '#059669'
                                    e.currentTarget.style.transform = 'scale(1.05)'
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'white'
                                    e.currentTarget.style.borderColor = '#e5e7eb'
                                    e.currentTarget.style.transform = 'scale(1)'
                                  }}
                                >
                                  <Eye size={18} />
                                </button>
                                <button 
                                  title="Editar equipo"
                                  onClick={() => handleEditTeam(reg)}
                                  style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '10px',
                                    background: 'white',
                                    border: '1px solid #e5e7eb',
                                    color: '#0ea5e9',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#f0f9ff'
                                    e.currentTarget.style.borderColor = '#0ea5e9'
                                    e.currentTarget.style.transform = 'scale(1.05)'
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'white'
                                    e.currentTarget.style.borderColor = '#e5e7eb'
                                    e.currentTarget.style.transform = 'scale(1)'
                                  }}
                                >
                                  <Edit size={18} />
                                </button>
                                <button 
                                  title="Eliminar equipo"
                                  style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '10px',
                                    background: 'white',
                                    border: '1px solid #e5e7eb',
                                    color: '#ef4444',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#fef2f2'
                                    e.currentTarget.style.borderColor = '#ef4444'
                                    e.currentTarget.style.transform = 'scale(1.05)'
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'white'
                                    e.currentTarget.style.borderColor = '#e5e7eb'
                                    e.currentTarget.style.transform = 'scale(1)'
                                  }}
                                  onClick={() => {
                                    if (confirm('¿Estás seguro de eliminar este equipo?')) {
                                      console.log('Eliminar equipo:', reg.id)
                                    }
                                  }}
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                })()}
            </div>

            {/* Modal para agregar equipo */}
            <Modal
            open={showAddTeamModal}
            onClose={() => setShowAddTeamModal(false)}
            title="Agregar Nuevo Equipo"
            size="lg"
            footer={
              <>
                <button
                  onClick={() => setShowAddTeamModal(false)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    background: 'white',
                    color: '#374151',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f9fafb'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white'
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveTeam}
                  disabled={savingTeam}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    background: savingTeam ? '#9ca3af' : '#047857',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: savingTeam ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    if (!savingTeam) {
                      e.currentTarget.style.background = '#059669'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!savingTeam) {
                      e.currentTarget.style.background = '#047857'
                    }
                  }}
                >
                  {savingTeam && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
                  {savingTeam ? 'Guardando...' : 'Guardar Equipo'}
                </button>
              </>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500, color: '#374151' }}>
                  Nombre del Equipo
                </label>
                <input
                  type="text"
                  value={teamForm.teamName}
                  onChange={(e) => setTeamForm({...teamForm, teamName: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#047857'
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(4, 120, 87, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                  placeholder="Ej: Los Campeones"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500, color: '#374151' }}>
                    Jugador 1 - Nombre
                  </label>
                  <input
                    type="text"
                    value={teamForm.player1Name}
                    onChange={(e) => setTeamForm({...teamForm, player1Name: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#047857'
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(4, 120, 87, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                    placeholder="Nombre completo"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500, color: '#374151' }}>
                    Jugador 1 - Email
                  </label>
                  <input
                    type="email"
                    value={teamForm.player1Email}
                    onChange={(e) => setTeamForm({...teamForm, player1Email: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#047857'
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(4, 120, 87, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                    placeholder="email@ejemplo.com"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500, color: '#374151' }}>
                    Jugador 2 - Nombre
                  </label>
                  <input
                    type="text"
                    value={teamForm.player2Name}
                    onChange={(e) => setTeamForm({...teamForm, player2Name: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#047857'
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(4, 120, 87, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                    placeholder="Nombre completo"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500, color: '#374151' }}>
                    Jugador 2 - Email
                  </label>
                  <input
                    type="email"
                    value={teamForm.player2Email}
                    onChange={(e) => setTeamForm({...teamForm, player2Email: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#047857'
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(4, 120, 87, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                    placeholder="email@ejemplo.com"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500, color: '#374151' }}>
                    Categoría
                  </label>
                  <select
                    value={teamForm.category}
                    onChange={(e) => setTeamForm({...teamForm, category: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                      background: 'white'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#047857'
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(4, 120, 87, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <option value="">Seleccionar categoría</option>
                    <option value="1M">Primera Masculino</option>
                    <option value="2M">Segunda Masculino</option>
                    <option value="3M">Tercera Masculino</option>
                    <option value="4M">Cuarta Masculino</option>
                    <option value="5M">Quinta Masculino</option>
                    <option value="1F">Primera Femenino</option>
                    <option value="2F">Segunda Femenino</option>
                    <option value="3F">Tercera Femenino</option>
                    <option value="MX">Mixto</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500, color: '#374151' }}>
                    Estado de Pago
                  </label>
                  <select
                    value={teamForm.paymentStatus}
                    onChange={(e) => setTeamForm({...teamForm, paymentStatus: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                      background: 'white'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#047857'
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(4, 120, 87, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <option value="pending">Pendiente</option>
                    <option value="completed">Pagado</option>
                  </select>
                </div>
              </div>
            </div>
          </Modal>

          {/* Modal para editar equipo */}
          <Modal
            open={showEditTeamModal}
            onClose={() => setShowEditTeamModal(false)}
            title="Editar Equipo"
            size="lg"
            footer={
              <>
                <button
                  onClick={() => setShowEditTeamModal(false)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    background: 'white',
                    color: '#374151',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f9fafb'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white'
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpdateTeam}
                  disabled={savingTeam}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    background: savingTeam ? '#9ca3af' : '#047857',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: savingTeam ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    if (!savingTeam) {
                      e.currentTarget.style.background = '#059669'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!savingTeam) {
                      e.currentTarget.style.background = '#047857'
                    }
                  }}
                >
                  {savingTeam && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
                  {savingTeam ? 'Actualizando...' : 'Actualizar Equipo'}
                </button>
              </>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500, color: '#374151' }}>
                  Nombre del Equipo
                </label>
                <input
                  type="text"
                  value={teamForm.teamName}
                  onChange={(e) => setTeamForm({...teamForm, teamName: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#047857'
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(4, 120, 87, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                  placeholder="Ej: Los Campeones"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500, color: '#374151' }}>
                    Jugador 1 - Nombre
                  </label>
                  <input
                    type="text"
                    value={teamForm.player1Name}
                    onChange={(e) => setTeamForm({...teamForm, player1Name: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#047857'
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(4, 120, 87, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                    placeholder="Nombre completo"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500, color: '#374151' }}>
                    Jugador 1 - Email
                  </label>
                  <input
                    type="email"
                    value={teamForm.player1Email}
                    onChange={(e) => setTeamForm({...teamForm, player1Email: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#047857'
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(4, 120, 87, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                    placeholder="email@ejemplo.com"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500, color: '#374151' }}>
                    Jugador 2 - Nombre
                  </label>
                  <input
                    type="text"
                    value={teamForm.player2Name}
                    onChange={(e) => setTeamForm({...teamForm, player2Name: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#047857'
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(4, 120, 87, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                    placeholder="Nombre completo"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500, color: '#374151' }}>
                    Jugador 2 - Email
                  </label>
                  <input
                    type="email"
                    value={teamForm.player2Email}
                    onChange={(e) => setTeamForm({...teamForm, player2Email: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#047857'
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(4, 120, 87, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                    placeholder="email@ejemplo.com"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500, color: '#374151' }}>
                    Categoría
                  </label>
                  <select
                    value={teamForm.category}
                    onChange={(e) => setTeamForm({...teamForm, category: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                      background: 'white'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#047857'
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(4, 120, 87, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <option value="">Seleccionar categoría</option>
                    <option value="1M">Primera Masculino</option>
                    <option value="2M">Segunda Masculino</option>
                    <option value="3M">Tercera Masculino</option>
                    <option value="4M">Cuarta Masculino</option>
                    <option value="5M">Quinta Masculino</option>
                    <option value="1F">Primera Femenino</option>
                    <option value="2F">Segunda Femenino</option>
                    <option value="3F">Tercera Femenino</option>
                    <option value="MX">Mixto</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500, color: '#374151' }}>
                    Estado de Pago
                  </label>
                  <select
                    value={teamForm.paymentStatus}
                    onChange={(e) => setTeamForm({...teamForm, paymentStatus: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                      background: 'white'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#047857'
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(4, 120, 87, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <option value="pending">Pendiente</option>
                    <option value="completed">Pagado</option>
                  </select>
                </div>
              </div>
            </div>
          </Modal>
          </div>
        )}

        {/* Modo TV */}
        {activeView === 'tv' && (
          <div style={{ marginTop: '24px' }}>
            <CardModern variant="glow" padding="lg">
              <CardModernHeader>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: `linear-gradient(135deg, ${colors.primary[600]}15, ${colors.accent[300]}15)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Tv2 size={20} style={{ color: colors.primary[600] }} />
                    </div>
                    <div>
                      <CardModernTitle>Modo TV - Visualización Pública</CardModernTitle>
                      <CardModernDescription>
                        Vista optimizada para pantallas grandes en el club
                      </CardModernDescription>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      if (document.documentElement.requestFullscreen) {
                        document.documentElement.requestFullscreen()
                      }
                    }}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      background: `linear-gradient(135deg, ${colors.primary[600]}, ${colors.accent[300]})`,
                      color: 'white',
                      border: 'none',
                      fontSize: '13px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Tv2 size={16} />
                    Pantalla completa
                  </button>
                </div>
              </CardModernHeader>

              <CardModernContent>
                {/* Partidos en juego */}
                {tournamentData.matches.inProgress.length > 0 && (
                  <div style={{
                    padding: '24px',
                    borderRadius: '16px',
                    background: `linear-gradient(135deg, ${colors.accent[600]}10, ${colors.accent[300]}10)`,
                    border: `1px solid ${colors.accent[600]}30`,
                    marginBottom: '24px'
                  }}>
                    <h3 style={{ 
                      fontSize: '20px',
                      fontWeight: 600,
                      color: colors.text.primary,
                      marginBottom: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: colors.accent[600],
                        animation: 'pulse 2s infinite'
                      }} />
                      EN JUEGO AHORA
                    </h3>
                    
                    <div style={{ 
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                      gap: '20px'
                    }}>
                      {tournamentData.matches.inProgress.map(match => (
                        <div key={match.id} style={{
                          padding: '20px',
                          borderRadius: '12px',
                          background: 'white',
                          border: `1px solid ${colors.border.light}`
                        }}>
                          <div style={{ 
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '16px'
                          }}>
                            <span style={{
                              fontSize: '14px',
                              padding: '6px 12px',
                              borderRadius: '8px',
                              background: `linear-gradient(135deg, ${colors.primary[600]}, ${colors.accent[300]})`,
                              color: 'white',
                              fontWeight: 500
                            }}>
                              CANCHA {match.courtNumber}
                            </span>
                            <span style={{
                              fontSize: '14px',
                              color: colors.text.secondary
                            }}>
                              {match.startTime ? 
                                `${Math.floor((Date.now() - new Date(match.startTime).getTime()) / 60000)} minutos` :
                                'En juego'}
                            </span>
                          </div>
                          
                          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                            <p style={{ 
                              fontSize: '18px',
                              fontWeight: 600,
                              color: colors.text.primary,
                              marginBottom: '8px'
                            }}>
                              {match.team1Name}
                            </p>
                            <div style={{
                              fontSize: '32px',
                              fontWeight: 700,
                              color: colors.primary[600],
                              margin: '12px 0'
                            }}>
                              {match.team1Score || '0-0'} | {match.team2Score || '0-0'}
                            </div>
                            <p style={{ 
                              fontSize: '18px',
                              fontWeight: 600,
                              color: colors.text.primary
                            }}>
                              {match.team2Name}
                            </p>
                          </div>
                          
                          <div style={{
                            padding: '8px',
                            borderRadius: '8px',
                            background: colors.neutral[50],
                            textAlign: 'center',
                            fontSize: '12px',
                            color: colors.text.secondary
                          }}>
                            {match.round}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Próximos partidos */}
                <div style={{
                  padding: '20px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${colors.border.light}`
                }}>
                  <h4 style={{ 
                    fontSize: '18px',
                    fontWeight: 600,
                    color: colors.text.primary,
                    marginBottom: '16px'
                  }}>
                    PRÓXIMOS PARTIDOS
                  </h4>
                  
                  <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '12px'
                  }}>
                    {tournamentData.matches.upcoming.slice(0, 6).map(next => (
                      <div key={next.id} style={{
                        padding: '12px',
                        borderRadius: '8px',
                        background: 'white',
                        border: `1px solid ${colors.border.light}`
                      }}>
                        <div style={{ 
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '8px'
                        }}>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 500,
                            color: colors.warning[600]
                          }}>
                            {next.scheduledAt ? 
                              new Date(next.scheduledAt).toLocaleTimeString('es-MX', {
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : 'Por definir'}
                          </span>
                          <span style={{
                            fontSize: '11px',
                            color: colors.text.secondary
                          }}>
                            Cancha {next.courtNumber || '?'}
                          </span>
                        </div>
                        <p style={{ 
                          fontSize: '13px',
                          fontWeight: 500,
                          color: colors.text.primary,
                          marginBottom: '4px'
                        }}>
                          {next.team1Name} vs {next.team2Name}
                        </p>
                        <p style={{ 
                          fontSize: '11px',
                          color: colors.text.secondary
                        }}>
                          {next.round}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardModernContent>
            </CardModern>
          </div>
        )}
      </div>
    </div>
  )
}