/**
 * useTournamentData Hook
 * Extracted from page.tsx (lines 180-201)
 * Handles tournament data fetching with 30-second polling
 */

import { useState, useEffect } from 'react'
import type { TournamentData } from '../types/tournament'

export function useTournamentData(tournamentId: string) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<TournamentData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchTournamentData = async () => {
    try {
      const response = await fetch(`/api/tournaments-v2/${tournamentId}`)
      if (!response.ok) {
        throw new Error('Error al cargar el torneo')
      }
      const tournamentData = await response.json()
      setData(tournamentData)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  // Cargar datos del torneo con polling cada 30 segundos
  useEffect(() => {
    fetchTournamentData()
    const interval = setInterval(fetchTournamentData, 30000)
    return () => clearInterval(interval)
  }, [tournamentId])

  return {
    loading,
    data,
    error,
    refresh: fetchTournamentData
  }
}
