import { NextRequest, NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const paramData = await params
    
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

    const { id: tournamentId } = paramData
    const { date, scheduleConfigs, courts } = await req.json()

    let totalScheduledMatches = 0
    const scheduledMatchesDetails: any[] = []

    // Algoritmo de programación automática
    for (const config of scheduleConfigs) {
      const { category, modality, startTime, duration, interval, matches } = config
      
      // Crear fecha base para este día
      const baseDateTime = new Date(`${date}T${startTime}:00`)
      let currentTime = new Date(baseDateTime)
      
      // Distribuir canchas disponibles entre los partidos de esta categoría
      const availableCourts = courts.filter((court: any) => court.status !== 'maintenance')
      let courtIndex = 0

      for (let i = 0; i < matches.length; i++) {
        const match = matches[i]
        const courtToAssign = availableCourts[courtIndex % availableCourts.length]
        
        if (courtToAssign) {
          // Calcular tiempo de inicio para este partido
          const matchStartTime = new Date(currentTime)
          
          // Actualizar el partido en la base de datos
          await prisma.tournamentMatch.update({
            where: { id: match.id },
            data: {
              scheduledAt: matchStartTime,
              courtId: courtToAssign.id,
              status: 'SCHEDULED'
            }
          })

          scheduledMatchesDetails.push({
            matchId: match.id,
            team1: match.team1Name,
            team2: match.team2Name,
            court: courtToAssign.name,
            scheduledAt: matchStartTime.toISOString(),
            category: `${category} ${modality === 'M' ? 'Masculino' : modality === 'F' ? 'Femenino' : 'Mixto'}`
          })

          totalScheduledMatches++
        }

        // Avanzar al siguiente slot de tiempo
        if ((i + 1) % availableCourts.length === 0) {
          // Cuando se asignaron todas las canchas, avanzar al siguiente bloque de tiempo
          currentTime = new Date(currentTime.getTime() + duration * 60000 + interval * 60000)
        }
        
        // Rotar a la siguiente cancha
        courtIndex++
      }
    }

    return NextResponse.json({
      success: true,
      scheduledMatches: totalScheduledMatches,
      details: scheduledMatchesDetails,
      message: `Se programaron automáticamente ${totalScheduledMatches} partidos`
    })

  } catch (error) {
    console.error('Error in auto-schedule:', error)
    return NextResponse.json(
      { error: 'Error al procesar la programación automática' },
      { status: 500 }
    )
  }
}