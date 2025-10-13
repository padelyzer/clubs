import { NextRequest, NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const paramData = await params
    const { id: tournamentId } = paramData
    
    const session = await requireAuthAPI()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    if (!session?.clubId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }


    // Obtener datos del torneo con toda la información necesaria
    // IMPORTANTE: Validar que el torneo pertenezca al club del usuario
    const [tournament, registrations, matches, rounds] = await Promise.all([
      // Información básica del torneo - validar clubId
      prisma.tournament.findFirst({
        where: {
          id: tournamentId,
          clubId: session.clubId // SEGURIDAD: Solo torneos del club del usuario
        }
      }),
      
      // Registros de equipos
      prisma.tournamentRegistration.findMany({
        where: { 
          tournamentId,
          confirmed: true 
        },
        select: {
          id: true,
          teamName: true,
          player1Name: true,
          player2Name: true,
          category: true,
          modality: true,
          teamLevel: true,
          paymentStatus: true,
          checkedIn: true
        }
      }),
      
      // Partidos del torneo
      prisma.tournamentMatch.findMany({
        where: { tournamentId },
        orderBy: [
          { scheduledAt: 'asc' },
          { courtNumber: 'asc' }
        ]
      }),
      
      // Rondas del torneo
      prisma.tournamentRound.findMany({
        where: { tournamentId },
        orderBy: { createdAt: 'asc' }
      })
    ])

    if (!tournament) {
      return NextResponse.json(
        { error: 'Torneo no encontrado' },
        { status: 404 }
      )
    }

    // Obtener información del club
    const club = await prisma.club.findUnique({
      where: { id: tournament.clubId },
      select: {
        id: true,
        name: true,
        logo: true
      }
    })

    // Procesar estadísticas
    const stats = {
      totalTeams: registrations.length,
      totalMatches: matches.length,
      completedMatches: matches.filter(m => m.status === 'completed' || m.status === 'COMPLETED').length,
      pendingMatches: matches.filter(m => m.status === 'pending' || m.status === 'SCHEDULED').length,
      inProgressMatches: matches.filter(m => m.status === 'in_progress' || m.status === 'IN_PROGRESS').length,
      todayMatches: matches.filter(m => {
        if (!m.scheduledAt) return false
        const today = new Date()
        const matchDate = new Date(m.scheduledAt)
        return matchDate.toDateString() === today.toDateString()
      }).length
    }

    // Agrupar equipos por categoría y modalidad
    const categoriesMap = new Map()
    registrations.forEach(reg => {
      const key = `${reg.category}-${reg.modality}`
      if (!categoriesMap.has(key)) {
        categoriesMap.set(key, {
          code: reg.category,
          modality: reg.modality,
          teams: [],
          matches: []
        })
      }
      categoriesMap.get(key).teams.push(reg)
    })

    // Agregar partidos a cada categoría
    matches.forEach(match => {
      const category = match.round?.split('-')[0] || ''
      const modality = match.round?.includes('FEM') ? 'F' : 'M'
      const key = `${category}-${modality}`
      if (categoriesMap.has(key)) {
        categoriesMap.get(key).matches.push(match)
      }
    })

    // Convertir a array y calcular estado
    const categories = Array.from(categoriesMap.values()).map(cat => {
      const categoryMatches = cat.matches
      const completed = categoryMatches.filter((m: any) => m.status === 'completed').length
      const total = categoryMatches.length
      
      let status = 'pending'
      if (completed === total && total > 0) {
        status = 'completed'
      } else if (completed > 0) {
        status = 'active'
      }

      return {
        code: cat.code,
        modality: cat.modality,
        name: getCategoryName(cat.code),
        teams: cat.teams.length,
        totalMatches: total,
        completedMatches: completed,
        status
      }
    })

    // Obtener partidos actuales y próximos
    const now = new Date()
    const upcomingMatches = matches
      .filter(m => (m.status === 'pending' || m.status === 'SCHEDULED') && m.scheduledAt)
      .sort((a, b) => {
        const dateA = new Date(a.scheduledAt!)
        const dateB = new Date(b.scheduledAt!)
        return dateA.getTime() - dateB.getTime()
      })
      .slice(0, 10)

    const inProgressMatches = matches.filter(m => m.status === 'in_progress')

    // Obtener disponibilidad de canchas
    const courts = await prisma.court.findMany({
      where: { clubId: tournament.clubId },
      orderBy: { order: 'asc' }
    })

    const courtsStatus = await Promise.all(courts.map(async court => {
      const currentMatch = matches.find(m => 
        m.courtId === court.id && 
        m.status === 'in_progress'
      )
      
      const nextMatch = matches.find(m => 
        m.courtId === court.id && 
        m.status === 'pending' &&
        m.scheduledAt
      )

      return {
        id: court.id,
        name: court.name,
        number: court.order,
        status: currentMatch ? 'busy' : nextMatch ? 'reserved' : 'available',
        currentMatch,
        nextMatch
      }
    }))

    // Calcular partidos de hoy
    const today = new Date()
    const todayMatches = matches.filter(m => {
      if (!m.scheduledAt) return false
      const matchDate = new Date(m.scheduledAt)
      return matchDate.toDateString() === today.toDateString()
    })

    // Calcular resultados recientes (últimos 5 partidos completados)
    const recentResults = matches
      .filter(m => m.status === 'COMPLETED' && m.team1Name && m.team2Name) // Solo incluir partidos con ambos equipos definidos
      .sort((a, b) => {
        const dateA = a.actualEndTime ? new Date(a.actualEndTime).getTime() : 0
        const dateB = b.actualEndTime ? new Date(b.actualEndTime).getTime() : 0
        return dateB - dateA // Más recientes primero
      })
      .slice(0, 5)
      .map(m => ({
        id: m.id,
        completedAt: m.actualEndTime || m.endTime || new Date(),
        team1: {
          name: m.team1Name || 'TBD',
          score: m.team1Score || 0
        },
        team2: {
          name: m.team2Name || 'TBD',
          score: m.team2Score || 0
        },
        winner: m.winner || null
      }))

    return NextResponse.json({
      success: true,
      tournament: {
        id: tournament.id,
        name: tournament.name,
        description: tournament.description,
        type: tournament.type,
        status: tournament.status,
        startDate: tournament.startDate,
        endDate: tournament.endDate,
        maxPlayers: tournament.maxPlayers,
        registrationFee: tournament.registrationFee,
        prizePool: tournament.prizePool,
        currency: tournament.currency,
        club: club,
        stats,
        categories,
        matches: matches, // Retornar todos los matches como array para compatibilidad
        todayMatches: todayMatches,
        matchesSummary: {
          inProgress: inProgressMatches,
          upcoming: matches.filter(m => (m.status === 'pending' || m.status === 'SCHEDULED') && m.scheduledAt),
          total: matches.length
        },
        courts: courtsStatus,
        rounds,
        registrations,
        recentResults,
        _count: {
          TournamentRegistration: registrations.length,
          TournamentMatch: matches.length
        }
      }
    })

  } catch (error) {
    console.error('Error fetching tournament data:', error)
    return NextResponse.json(
      { error: 'Error al obtener datos del torneo' },
      { status: 500 }
    )
  }
}

// Función auxiliar para obtener el nombre de la categoría
function getCategoryName(code: string): string {
  const categories: Record<string, string> = {
    '1F': 'Primera Fuerza',
    '2F': 'Segunda Fuerza', 
    '3F': 'Tercera Fuerza',
    '4F': 'Cuarta Fuerza',
    '5F': 'Quinta Fuerza',
    '6F': 'Sexta Fuerza',
    'OPEN': 'Open',
    'A': 'Categoría A',
    'B': 'Categoría B',
    'C': 'Categoría C'
  }
  return categories[code] || code
}

// Endpoint para actualizar resultado de partido
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const paramData = await params
    const { id: tournamentId } = paramData
    
    const session = await requireAuthAPI()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    if (!session?.clubId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { matchId, team1Score, team2Score, winner, status } = await req.json()

    const updatedMatch = await prisma.tournamentMatch.update({
      where: { id: matchId },
      data: {
        team1Score,
        team2Score,
        winner,
        status,
        endTime: status === 'completed' ? new Date() : null
      }
    })

    return NextResponse.json({ success: true, match: updatedMatch })

  } catch (error) {
    console.error('Error updating match:', error)
    return NextResponse.json(
      { error: 'Error al actualizar partido' },
      { status: 500 }
    )
  }
}