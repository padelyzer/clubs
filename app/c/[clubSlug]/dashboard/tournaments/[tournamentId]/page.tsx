/**
 * Módulo Torneos V2 - Versión Multitenant
 * 
 * Implementación completa del módulo de torneos V2 dentro del contexto multitenant
 */

'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Trophy, AlertCircle, Loader2 } from 'lucide-react'

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
    status: string
    startDate: string
    endDate: string
    club?: {
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
  matches: any[]
  matchesSummary: {
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

export default function TournamentV2Page({ params }: TournamentPageProps) {
  const [paramData, setParamData] = useState<{ clubSlug: string; tournamentId: string } | null>(null)
  const [data, setData] = useState<TournamentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Resolver params al montar el componente
  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params
      setParamData(resolved)
      console.log('✅ PARAMS RESOLVED:', resolved)
    }
    resolveParams()
  }, [params])

  // Cargar datos del torneo cuando tenemos los parámetros
  useEffect(() => {
    if (paramData?.tournamentId) {
      fetchTournamentData()
    }
  }, [paramData])

  const fetchTournamentData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔄 Fetching tournament data for ID:', paramData?.tournamentId)
      
      const response = await fetch(`/api/tournaments/${paramData?.tournamentId}`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`)
      }
      
      const tournamentData = await response.json()
      console.log('✅ Tournament data received:', tournamentData)
      
      setData(tournamentData)
    } catch (err) {
      console.error('❌ Error loading tournament:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido al cargar el torneo')
    } finally {
      setLoading(false)
    }
  }

  if (!paramData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando parámetros...</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Cargando datos del torneo...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <Link 
              href={`/c/${paramData.clubSlug}/dashboard/tournaments`}
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium mb-6"
            >
              <ArrowLeft size={20} />
              Volver a Lista de Torneos
            </Link>
            
            <div className="text-center py-12">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Error al cargar el torneo</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button 
                onClick={fetchTournamentData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600">No se encontraron datos del torneo</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <Link 
              href={`/c/${paramData.clubSlug}/dashboard/tournaments`}
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
            >
              <ArrowLeft size={20} />
              Volver a Lista de Torneos
            </Link>
            
            <div className="text-sm text-gray-500">
              Módulo V2 • Contexto Multitenant
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Trophy size={32} className="text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{data.tournament.name}</h1>
              {data.tournament.description && (
                <p className="text-gray-600 mt-1">{data.tournament.description}</p>
              )}
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span>Club: {data.tournament.club?.name || 'Sin asignar'}</span>
                <span>•</span>
                <span>ID: {data.tournament.id}</span>
                <span>•</span>
                <span>Estado: {data.tournament.status}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Total Equipos</div>
            <div className="text-2xl font-bold text-blue-600">{data.stats.totalTeams}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Total Partidos</div>
            <div className="text-2xl font-bold text-gray-900">{data.stats.totalMatches}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Completados</div>
            <div className="text-2xl font-bold text-green-600">{data.stats.completedMatches}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">En Progreso</div>
            <div className="text-2xl font-bold text-orange-600">{data.stats.inProgressMatches}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Pendientes</div>
            <div className="text-2xl font-bold text-yellow-600">{data.stats.pendingMatches}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Hoy</div>
            <div className="text-2xl font-bold text-purple-600">{data.stats.todayMatches}</div>
          </div>
        </div>

        {/* Categorías */}
        {data.categories.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Categorías</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.categories.map((category, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{category.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${
                      category.status === 'completed' ? 'bg-green-100 text-green-800' :
                      category.status === 'active' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {category.status === 'completed' ? 'Finalizado' :
                       category.status === 'active' ? 'En progreso' : 'Pendiente'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div>Equipos: {category.teams}</div>
                    <div>Partidos: {category.completedMatches}/{category.totalMatches}</div>
                    <div>Modalidad: {category.modality === 'M' ? 'Masculino' : 'Femenino'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Estado de Canchas */}
        {data.courts.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Estado de Canchas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {data.courts.map((court) => (
                <div key={court.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{court.name}</h3>
                    <span className={`w-3 h-3 rounded-full ${
                      court.status === 'busy' ? 'bg-red-500' :
                      court.status === 'reserved' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}></span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div>Estado: {
                      court.status === 'busy' ? 'Ocupada' :
                      court.status === 'reserved' ? 'Reservada' :
                      'Disponible'
                    }</div>
                    {court.currentMatch && <div>Partido en curso</div>}
                    {court.nextMatch && <div>Próximo partido programado</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Debug Info */}
        <div className="bg-gray-800 text-green-400 p-4 rounded-lg text-sm font-mono">
          <div>URL: /c/{paramData.clubSlug}/dashboard/tournaments/{paramData.tournamentId}</div>
          <div>✅ Módulo V2 multitenant funcionando correctamente</div>
          <div>✅ API de torneos respondiendo: {data.stats.totalMatches} partidos encontrados</div>
        </div>
      </div>
    </div>
  )
}