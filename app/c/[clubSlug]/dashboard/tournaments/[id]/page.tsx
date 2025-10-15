'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { colors } from '@/lib/design-system/colors'

// Extracted Components
import { LoadingState } from './components/LoadingState'
import { ErrorState } from './components/ErrorState'
import { TournamentHeader } from './components/TournamentHeader'
import { TournamentSidebar } from './sidebar/TournamentSidebar'
import { OverviewView } from './overview/OverviewView'
import { CaptureView } from './capture/CaptureView'
import { RegistrationsView } from './registrations/RegistrationsView'
import { TVView } from './tv/TVView'

// Types
import type { ViewType, TournamentData } from './types/tournament'

// Color configuration
const colorConfig = {
  primary: {
    600: '#059669',
    700: '#047857',
    100: '#d1fae5',
    50: '#ecfdf5'
  },
  accent: {
    300: '#A4DF4E',
    400: '#93d13d',
    600: '#16A34A',
    700: '#15803d',
    100: '#dcfce7',
    50: '#f0fdf4'
  },
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    tertiary: '#9CA3AF'
  },
  border: {
    light: '#E5E7EB',
    default: '#D1D5DB'
  },
  neutral: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    900: '#111827'
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    400: '#FBBF24',
    600: '#F59E0B'
  },
  background: {
    primary: '#FFFFFF',
    secondary: '#F9FAFB'
  }
}

export default function TournamentV2Page() {
  const params = useParams()
  const router = useRouter()
  const tournamentId = params.id as string

  // View state
  const [activeView, setActiveView] = useState<ViewType>('overview')

  // Sidebar state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [categoriesExpanded, setCategoriesExpanded] = useState(true)
  const [masculineExpanded, setMasculineExpanded] = useState(true)
  const [feminineExpanded, setFeminineExpanded] = useState(true)
  const [mixedExpanded, setMixedExpanded] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Tournament data state
  const [loading, setLoading] = useState(true)
  const [tournamentData, setTournamentData] = useState<TournamentData | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Registrations state
  const [registrations, setRegistrations] = useState<any[]>([])
  const [loadingRegistrations, setLoadingRegistrations] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddTeamModal, setShowAddTeamModal] = useState(false)
  const [showEditTeamModal, setShowEditTeamModal] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<any>(null)

  // Capture view state
  const [captureCategoryFilter, setCaptureCategoryFilter] = useState<string>('all')
  const [captureStatusFilter, setCaptureStatusFilter] = useState<'pending' | 'all' | 'completed'>('pending')
  const [selectedMatches, setSelectedMatches] = useState<Set<string>>(new Set())

  // Fetch tournament data with polling
  useEffect(() => {
    fetchTournamentData()
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

  const handleEditTeam = (team: any) => {
    setSelectedTeam(team)
    setShowEditTeamModal(true)
  }

  const handleBack = () => {
    router.push('/dashboard')
  }

  // Loading state
  if (loading) {
    return <LoadingState />
  }

  // Error state
  if (error || !tournamentData) {
    return <ErrorState error={error || 'No se pudo cargar el torneo'} onRetry={fetchTournamentData} />
  }

  // Main render
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <TournamentSidebar
        tournamentData={tournamentData}
        activeView={activeView}
        setActiveView={setActiveView}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        categoriesExpanded={categoriesExpanded}
        setCategoriesExpanded={setCategoriesExpanded}
        masculineExpanded={masculineExpanded}
        setMasculineExpanded={setMasculineExpanded}
        feminineExpanded={feminineExpanded}
        setFeminineExpanded={setFeminineExpanded}
        mixedExpanded={mixedExpanded}
        setMixedExpanded={setMixedExpanded}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        onFetchRegistrations={fetchRegistrations}
      />

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '32px'
        }}
      >
        {/* Header */}
        <TournamentHeader
          name={tournamentData.tournament.name}
          clubName={tournamentData.tournament.club.name}
          onBack={handleBack}
        />

        {/* Views */}
        {activeView === 'overview' && (
          <OverviewView tournamentData={tournamentData} colors={colorConfig} />
        )}

        {activeView === 'capture' && (
          <CaptureView
            tournamentData={tournamentData}
            colors={colorConfig}
            captureCategoryFilter={captureCategoryFilter}
            setCaptureCategoryFilter={setCaptureCategoryFilter}
            captureStatusFilter={captureStatusFilter}
            setCaptureStatusFilter={setCaptureStatusFilter}
            selectedMatches={selectedMatches}
            setSelectedMatches={setSelectedMatches}
          />
        )}

        {activeView === 'registrations' && (
          <RegistrationsView
            registrations={registrations}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            loadingRegistrations={loadingRegistrations}
            onRefresh={fetchRegistrations}
            onAddTeam={() => setShowAddTeamModal(true)}
            onEditTeam={handleEditTeam}
            colors={colorConfig}
          />
        )}

        {activeView === 'tv' && <TVView tournamentData={tournamentData} colors={colorConfig} />}

        {activeView === 'schedule' && (
          <div style={{ marginTop: '24px' }}>
            <div style={{ padding: '20px', background: 'white', borderRadius: '12px' }}>
              <h2>Schedule View</h2>
              <p>This view is temporarily disabled while fixing syntax errors.</p>
            </div>
          </div>
        )}

        {activeView === 'kanban' && (
          <div style={{ marginTop: '24px' }}>
            <div style={{ padding: '20px', background: 'white', borderRadius: '12px' }}>
              <h2>Kanban View</h2>
              <p>This view is temporarily disabled while fixing syntax errors.</p>
            </div>
          </div>
        )}
      </div>

      {/* CSS for animations */}
      <style jsx global>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .sidebar-item:hover .sidebar-tooltip {
          opacity: 1;
        }
      `}</style>
    </div>
  )
}
