'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Trophy, Clock, Users, MapPin, Calendar, Send, AlertCircle } from 'lucide-react'

interface Match {
  id: string
  round: string
  team1Name: string
  team2Name: string
  team1Player1?: string
  team1Player2?: string
  team2Player1?: string
  team2Player2?: string
  scheduledAt: string
  courtNumber: string
  status: string
}

interface SetResult {
  team1Games: number
  team2Games: number
  tiebreak?: { team1: number; team2: number }
}

export default function CourtResultsPage() {
  const params = useParams()
  const qrCode = params.qrCode as string
  
  const [loading, setLoading] = useState(true)
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null)
  const [courtInfo, setCourtInfo] = useState<any>(null)
  const [submittingTeam, setSubmittingTeam] = useState<'team1' | 'team2' | null>(null)
  const [sets, setSets] = useState<SetResult[]>([
    { team1Games: 0, team2Games: 0 },
    { team1Games: 0, team2Games: 0 },
    { team1Games: 0, team2Games: 0 }
  ])
  const [actualSetsPlayed, setActualSetsPlayed] = useState(2)
  const [duration, setDuration] = useState(60)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCurrentMatch()
  }, [qrCode])

  const fetchCurrentMatch = async () => {
    try {
      const res = await fetch(`/api/tournaments/courts/${qrCode}/current-match`)
      if (!res.ok) throw new Error('Error al obtener partido')
      
      const data = await res.json()
      setCourtInfo(data.court)
      setCurrentMatch(data.match)
    } catch (err) {
      console.error(err)
      setError('No se pudo cargar la información del partido')
    } finally {
      setLoading(false)
    }
  }

  const calculateWinner = () => {
    let team1Sets = 0
    let team2Sets = 0
    
    for (let i = 0; i < actualSetsPlayed; i++) {
      const set = sets[i]
      if (set.team1Games > set.team2Games) {
        team1Sets++
      } else if (set.team2Games > set.team1Games) {
        team2Sets++
      }
    }
    
    return team1Sets > team2Sets ? 'team1' : 'team2'
  }

  const handleSubmit = async () => {
    if (!submittingTeam) {
      setError('Por favor selecciona tu equipo')
      return
    }

    const winner = calculateWinner()
    const setsToSubmit = sets.slice(0, actualSetsPlayed)

    try {
      const res = await fetch(`/api/tournaments/courts/${qrCode}/submit-result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId: currentMatch?.id,
          submittedBy: submittingTeam,
          sets: setsToSubmit,
          winner,
          duration
        })
      })

      if (!res.ok) throw new Error('Error al enviar resultado')
      
      setSubmitted(true)
    } catch (err) {
      console.error(err)
      setError('Error al enviar el resultado')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-md mx-auto mt-20 bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Trophy className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Resultado Enviado!</h1>
          <p className="text-gray-600 mb-4">
            Tu resultado ha sido registrado. Esperando confirmación del equipo rival.
          </p>
          <p className="text-sm text-gray-500">
            Si el otro equipo reporta un resultado diferente, el organizador será notificado.
          </p>
        </div>
      </div>
    )
  }

  if (!currentMatch) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-md mx-auto mt-20 bg-white rounded-xl shadow-lg p-8 text-center">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Cancha {courtInfo?.name || qrCode}
          </h1>
          <p className="text-gray-600">
            No hay partidos en juego en este momento
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="bg-white rounded-t-xl shadow-lg p-4 border-b">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-gray-900">
                Cancha {currentMatch.courtNumber}
              </span>
            </div>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
              EN JUEGO
            </span>
          </div>
          <div className="text-sm text-gray-600">
            {currentMatch.round}
          </div>
        </div>

        {/* Teams */}
        <div className="bg-white shadow-lg p-4">
          <div className="space-y-4">
            {/* Team 1 */}
            <div 
              className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                submittingTeam === 'team1' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSubmittingTeam('team1')}
            >
              <div className="flex items-center gap-2 mb-1">
                <input
                  type="radio"
                  checked={submittingTeam === 'team1'}
                  onChange={() => setSubmittingTeam('team1')}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="font-semibold text-gray-900">
                  {currentMatch.team1Name}
                </span>
              </div>
              {currentMatch.team1Player1 && (
                <div className="text-sm text-gray-600 ml-6">
                  {currentMatch.team1Player1} / {currentMatch.team1Player2}
                </div>
              )}
            </div>

            {/* Team 2 */}
            <div 
              className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                submittingTeam === 'team2' 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSubmittingTeam('team2')}
            >
              <div className="flex items-center gap-2 mb-1">
                <input
                  type="radio"
                  checked={submittingTeam === 'team2'}
                  onChange={() => setSubmittingTeam('team2')}
                  className="w-4 h-4 text-green-600"
                />
                <span className="font-semibold text-gray-900">
                  {currentMatch.team2Name}
                </span>
              </div>
              {currentMatch.team2Player1 && (
                <div className="text-sm text-gray-600 ml-6">
                  {currentMatch.team2Player1} / {currentMatch.team2Player2}
                </div>
              )}
            </div>
          </div>

          {submittingTeam && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                Estás reportando como: <strong>{submittingTeam === 'team1' ? currentMatch.team1Name : currentMatch.team2Name}</strong>
              </p>
            </div>
          )}
        </div>

        {/* Score Input */}
        <div className="bg-white shadow-lg p-4 space-y-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Resultado del Partido
          </h3>

          {/* Sets played selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sets jugados
            </label>
            <select
              value={actualSetsPlayed}
              onChange={(e) => setActualSetsPlayed(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value={2}>2 Sets</option>
              <option value={3}>3 Sets</option>
            </select>
          </div>

          {/* Sets scores */}
          {sets.slice(0, actualSetsPlayed).map((set, idx) => (
            <div key={idx} className="border rounded-lg p-3">
              <div className="text-sm font-medium text-gray-700 mb-2">Set {idx + 1}</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-600">
                    {currentMatch.team1Name}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="7"
                    value={set.team1Games}
                    onChange={(e) => {
                      const newSets = [...sets]
                      newSets[idx].team1Games = Number(e.target.value)
                      setSets(newSets)
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center text-lg font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600">
                    {currentMatch.team2Name}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="7"
                    value={set.team2Games}
                    onChange={(e) => {
                      const newSets = [...sets]
                      newSets[idx].team2Games = Number(e.target.value)
                      setSets(newSets)
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center text-lg font-bold"
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Duración aproximada (minutos)
            </label>
            <input
              type="number"
              min="30"
              max="180"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={!submittingTeam}
            className="w-full py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            style={{
              backgroundColor: !submittingTeam ? '#d1d5db' : '#047857',
              color: 'white',
              cursor: !submittingTeam ? 'not-allowed' : 'pointer'
            }}
            onMouseEnter={(e) => {
              if (submittingTeam) {
                e.currentTarget.style.backgroundColor = '#065f46'
              }
            }}
            onMouseLeave={(e) => {
              if (submittingTeam) {
                e.currentTarget.style.backgroundColor = '#047857'
              }
            }}
          >
            <Send className="w-5 h-5" />
            Enviar Resultado
          </button>

          <p className="text-xs text-gray-500 text-center">
            El equipo rival deberá confirmar este resultado
          </p>
        </div>
      </div>
    </div>
  )
}