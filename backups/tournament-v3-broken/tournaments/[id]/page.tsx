'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SimpleTournamentPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id: tournamentId } = use(params)
  const [tournament, setTournament] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTournamentData()
  }, [tournamentId])

  async function fetchTournamentData() {
    try {
      setLoading(true)
      const response = await fetch(`/api/tournaments/${tournamentId}`)

      if (!response.ok) {
        throw new Error('Error al cargar los datos del torneo')
      }

      const data = await response.json()
      console.log('📊 Data received:', data)

      if (!data.success) {
        throw new Error(data.error || 'Error al procesar los datos')
      }

      setTournament(data.tournament)
      setError(null)

    } catch (err) {
      console.error('Error fetching tournament data:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Cargando torneo...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    )
  }

  if (!tournament) return null

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <button onClick={() => router.push('/dashboard/tournaments')} style={{ marginBottom: '20px' }}>
        ← Volver a torneos
      </button>

      <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>{tournament.name}</h1>

      <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
        {/* Información Básica */}
        <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
          <h3>Información</h3>
          <p><strong>Estado:</strong> {tournament.status}</p>
          <p><strong>Tipo:</strong> {tournament.type}</p>
          <p><strong>Equipos:</strong> {tournament._count?.TournamentRegistration || 0} / {tournament.maxPlayers}</p>
          <p><strong>Partidos:</strong> {tournament._count?.TournamentMatch || 0}</p>
        </div>

        {/* Estadísticas */}
        {tournament.stats && (
          <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
            <h3>Estadísticas</h3>
            <p><strong>Equipos:</strong> {tournament.stats.totalTeams}</p>
            <p><strong>Partidos Totales:</strong> {tournament.stats.totalMatches}</p>
            <p><strong>Completados:</strong> {tournament.stats.completedMatches}</p>
            <p><strong>Pendientes:</strong> {tournament.stats.pendingMatches}</p>
            <p><strong>En Progreso:</strong> {tournament.stats.inProgressMatches}</p>
          </div>
        )}

        {/* Club */}
        {tournament.club && (
          <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
            <h3>Club</h3>
            <p><strong>Nombre:</strong> {tournament.club.name}</p>
          </div>
        )}
      </div>

      {/* Rondas */}
      {tournament.rounds && tournament.rounds.length > 0 && (
        <div style={{ marginTop: '40px' }}>
          <h2>Rondas</h2>
          <div style={{ display: 'grid', gap: '10px' }}>
            {tournament.rounds.map((round: any) => (
              <div key={round.id} style={{ padding: '15px', background: '#f9f9f9', borderRadius: '8px' }}>
                <strong>{round.name || round.stage}</strong>
                <span style={{ marginLeft: '10px', color: '#666' }}>
                  {round.status} - {round.completedMatches || 0}/{round.matchesCount || 0} partidos
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Equipos Inscritos */}
      {tournament.registrations && tournament.registrations.length > 0 && (
        <div style={{ marginTop: '40px' }}>
          <h2>Equipos Inscritos ({tournament.registrations.length})</h2>
          <div style={{ display: 'grid', gap: '10px' }}>
            {tournament.registrations.map((reg: any) => (
              <div key={reg.id} style={{ padding: '15px', background: '#f9f9f9', borderRadius: '8px' }}>
                <strong>{reg.teamName}</strong>
                <p style={{ margin: '5px 0', color: '#666' }}>
                  {reg.player1Name} / {reg.player2Name}
                </p>
                <span style={{ fontSize: '12px', color: '#999' }}>
                  {reg.teamLevel} - {reg.paymentStatus}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Partidos */}
      {tournament.matches && tournament.matches.length > 0 && (
        <div style={{ marginTop: '40px' }}>
          <h2>Partidos ({tournament.matches.length})</h2>
          <div style={{ display: 'grid', gap: '10px' }}>
            {tournament.matches.slice(0, 10).map((match: any) => (
              <div key={match.id} style={{ padding: '15px', background: '#f9f9f9', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{match.team1Name || 'TBD'}</strong> vs <strong>{match.team2Name || 'TBD'}</strong>
                  </div>
                  <div>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      background: match.status === 'COMPLETED' ? '#4caf50' : '#ff9800',
                      color: 'white',
                      fontSize: '12px'
                    }}>
                      {match.status}
                    </span>
                  </div>
                </div>
                {match.status === 'COMPLETED' && (
                  <p style={{ margin: '5px 0', color: '#666' }}>
                    Resultado: {match.team1Score} - {match.team2Score}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
