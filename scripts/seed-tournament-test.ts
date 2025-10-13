/**
 * Script para poblar un torneo con datos de prueba completos
 * Incluye: inscripciones, bracket, partidos programados, y algunos resultados
 */

import { prisma } from '../lib/config/prisma'
import { v4 as uuidv4 } from 'uuid'

async function seedTournamentTest() {
  console.log('🏆 Poblando torneo con datos de prueba...\n')

  // Usar el torneo activo demo
  const tournamentId = 'tournament_active_1759786489416'

  // Verificar que existe
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId }
  })

  if (!tournament) {
    console.error('❌ Torneo no encontrado')
    return
  }

  console.log(`✅ Torneo encontrado: ${tournament.name}`)

  // Limpiar datos existentes
  console.log('🧹 Limpiando datos existentes...')
  await prisma.tournamentMatchResult.deleteMany({
    where: {
      TournamentMatch: {
        tournamentId
      }
    }
  })
  await prisma.tournamentMatch.deleteMany({ where: { tournamentId } })
  await prisma.tournamentRoundCourt.deleteMany({
    where: {
      TournamentRound: {
        tournamentId
      }
    }
  })
  await prisma.tournamentRound.deleteMany({ where: { tournamentId } })
  await prisma.tournamentRegistration.deleteMany({ where: { tournamentId } })

  // Obtener o crear canchas del club
  let courts = await prisma.court.findMany({
    where: { clubId: tournament.clubId, active: true },
    take: 3
  })

  // Si no hay canchas, crear algunas
  if (courts.length === 0) {
    console.log('🏗️  No hay canchas, creando 3 canchas de prueba...')
    const courtNames = ['Cancha 1', 'Cancha 2', 'Cancha 3']
    for (let i = 0; i < courtNames.length; i++) {
      const court = await prisma.court.create({
        data: {
          id: uuidv4(),
          clubId: tournament.clubId,
          name: courtNames[i],
          type: 'PADEL',
          indoor: false,
          active: true,
          order: i + 1,
          updatedAt: new Date()
        }
      })
      courts.push(court)
    }
    console.log(`  ✓ ${courts.length} canchas creadas`)
  }

  console.log(`\n📊 Creando inscripciones (8 equipos)...`)

  // Crear 8 equipos para un bracket de 8
  const teams = [
    { name: 'Los Campeones', p1: 'Juan Pérez', p2: 'María García', category: 'A', modality: 'M', level: 'Avanzado' },
    { name: 'Rompepelota', p1: 'Carlos López', p2: 'Ana Martínez', category: 'A', modality: 'M', level: 'Avanzado' },
    { name: 'Smash Team', p1: 'Pedro Sánchez', p2: 'Laura Rodríguez', category: 'A', modality: 'M', level: 'Intermedio' },
    { name: 'Ace Masters', p1: 'Diego Fernández', p2: 'Sofía Hernández', category: 'A', modality: 'M', level: 'Avanzado' },
    { name: 'Net Ninjas', p1: 'Luis Torres', p2: 'Carmen Díaz', category: 'A', modality: 'M', level: 'Intermedio' },
    { name: 'Power Padel', p1: 'Miguel Ruiz', p2: 'Isabel Moreno', category: 'A', modality: 'M', level: 'Avanzado' },
    { name: 'Court Kings', p1: 'Javier Gil', p2: 'Patricia Navarro', category: 'A', modality: 'M', level: 'Intermedio' },
    { name: 'Spin Doctors', p1: 'Roberto Ortiz', p2: 'Elena Castro', category: 'A', modality: 'M', level: 'Avanzado' },
  ]

  const registrations = []
  for (const team of teams) {
    const reg = await prisma.tournamentRegistration.create({
      data: {
        id: uuidv4(),
        tournamentId,
        teamName: team.name,
        player1Id: uuidv4(),
        player1Name: team.p1,
        player1Email: `${team.p1.toLowerCase().replace(' ', '.')}@test.com`,
        player1Phone: `+52${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
        player1Level: team.level,
        player2Id: uuidv4(),
        player2Name: team.p2,
        player2Email: `${team.p2.toLowerCase().replace(' ', '.')}@test.com`,
        player2Phone: `+52${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
        player2Level: team.level,
        teamLevel: team.level,
        modality: team.modality,
        category: team.category,
        paymentStatus: 'paid',
        confirmed: true,
        checkedIn: true,
        checkedInAt: new Date(),
        updatedAt: new Date()
      }
    })
    registrations.push(reg)
    console.log(`  ✓ ${team.name}`)
  }

  console.log(`\n🎯 Creando estructura de rondas...`)

  // Crear rondas
  const round1 = await prisma.tournamentRound.create({
    data: {
      id: uuidv4(),
      tournamentId,
      name: 'Cuartos de Final',
      stage: 'quarterfinals',
      stageLabel: 'Cuartos de Final',
      modality: 'M',
      category: 'A',
      status: 'completed',
      matchesCount: 4,
      completedMatches: 4,
      startDate: new Date(),
      updatedAt: new Date()
    }
  })

  const round2 = await prisma.tournamentRound.create({
    data: {
      id: uuidv4(),
      tournamentId,
      name: 'Semifinal',
      stage: 'semifinals',
      stageLabel: 'Semifinal',
      modality: 'M',
      category: 'A',
      status: 'in_progress',
      matchesCount: 2,
      completedMatches: 1,
      startDate: new Date(),
      updatedAt: new Date()
    }
  })

  const finalRound = await prisma.tournamentRound.create({
    data: {
      id: uuidv4(),
      tournamentId,
      name: 'Final',
      stage: 'final',
      stageLabel: 'Final',
      modality: 'M',
      category: 'A',
      status: 'pending',
      matchesCount: 1,
      completedMatches: 0,
      updatedAt: new Date()
    }
  })

  // Asignar canchas a las rondas
  for (let i = 0; i < courts.length && i < 2; i++) {
    await prisma.tournamentRoundCourt.create({
      data: {
        id: uuidv4(),
        roundId: round1.id,
        courtId: courts[i].id,
        courtName: courts[i].name,
        order: i
      }
    })
  }

  console.log(`  ✓ Cuartos de Final`)
  console.log(`  ✓ Semifinal`)
  console.log(`  ✓ Final`)

  console.log(`\n⚽ Creando partidos de Cuartos de Final (completados)...`)

  // Cuartos de Final - 4 partidos completados
  const quarterMatches = []
  for (let i = 0; i < 4; i++) {
    const team1 = registrations[i * 2]
    const team2 = registrations[i * 2 + 1]
    const court = courts[i % courts.length]
    const scheduledTime = new Date()
    scheduledTime.setHours(10 + i * 2, 0, 0, 0)

    const match = await prisma.tournamentMatch.create({
      data: {
        id: uuidv4(),
        tournamentId,
        roundId: round1.id,
        round: 'Cuartos de Final',
        matchNumber: i + 1,
        team1Name: team1.teamName,
        team1Player1: team1.player1Name,
        team1Player2: team1.player2Name,
        team2Name: team2.teamName,
        team2Player1: team2.player1Name,
        team2Player2: team2.player2Name,
        courtId: court.id,
        courtNumber: court.name,
        scheduledAt: scheduledTime,
        startTime: scheduledTime.toTimeString().slice(0, 5),
        endTime: new Date(scheduledTime.getTime() + 90 * 60000).toTimeString().slice(0, 5),
        team1Sets: JSON.stringify([6, 4, 7]),
        team2Sets: JSON.stringify([4, 6, 5]),
        team1Score: 2,
        team2Score: 1,
        winner: team1.teamName,
        status: 'COMPLETED',
        resultsConfirmed: true,
        actualStartTime: scheduledTime,
        actualEndTime: new Date(scheduledTime.getTime() + 85 * 60000),
        updatedAt: new Date()
      }
    })
    quarterMatches.push(match)
    console.log(`  ✓ Partido ${i + 1}: ${team1.teamName} vs ${team2.teamName} - Ganador: ${team1.teamName}`)
  }

  console.log(`\n🎾 Creando partidos de Semifinal...`)

  // Semifinal - 2 partidos (1 completado, 1 en progreso)
  const semiMatches = []
  for (let i = 0; i < 2; i++) {
    const team1 = registrations[i * 4]
    const team2 = registrations[i * 4 + 2]
    const court = courts[i % courts.length]
    const scheduledTime = new Date()
    scheduledTime.setHours(16 + i * 2, 0, 0, 0)

    const isCompleted = i === 0
    const match = await prisma.tournamentMatch.create({
      data: {
        id: uuidv4(),
        tournamentId,
        roundId: round2.id,
        round: 'Semifinal',
        matchNumber: i + 1,
        team1Name: team1.teamName,
        team1Player1: team1.player1Name,
        team1Player2: team1.player2Name,
        team2Name: team2.teamName,
        team2Player1: team2.player1Name,
        team2Player2: team2.player2Name,
        courtId: court.id,
        courtNumber: court.name,
        scheduledAt: scheduledTime,
        startTime: scheduledTime.toTimeString().slice(0, 5),
        endTime: new Date(scheduledTime.getTime() + 90 * 60000).toTimeString().slice(0, 5),
        ...(isCompleted && {
          team1Sets: JSON.stringify([6, 7]),
          team2Sets: JSON.stringify([4, 5]),
          team1Score: 2,
          team2Score: 0,
          winner: team1.teamName,
          status: 'COMPLETED',
          resultsConfirmed: true,
          actualStartTime: scheduledTime,
          actualEndTime: new Date(scheduledTime.getTime() + 75 * 60000)
        }),
        ...(!isCompleted && {
          status: 'IN_PROGRESS',
          actualStartTime: scheduledTime
        }),
        updatedAt: new Date()
      }
    })
    semiMatches.push(match)
    console.log(`  ✓ Partido ${i + 1}: ${team1.teamName} vs ${team2.teamName} - ${isCompleted ? `Ganador: ${team1.teamName}` : 'En progreso'}`)
  }

  console.log(`\n🏆 Creando Final (programada)...`)

  // Final - programada pero sin jugar
  const finalTime = new Date()
  finalTime.setHours(20, 0, 0, 0)
  const finalMatch = await prisma.tournamentMatch.create({
    data: {
      id: uuidv4(),
      tournamentId,
      roundId: finalRound.id,
      round: 'Final',
      matchNumber: 1,
      team1Name: registrations[0].teamName, // Ganador semi 1
      team1Player1: registrations[0].player1Name,
      team1Player2: registrations[0].player2Name,
      team2Name: 'TBD', // Pendiente de semi 2
      courtId: courts[0].id,
      courtNumber: courts[0].name,
      scheduledAt: finalTime,
      startTime: finalTime.toTimeString().slice(0, 5),
      endTime: new Date(finalTime.getTime() + 90 * 60000).toTimeString().slice(0, 5),
      status: 'SCHEDULED',
      updatedAt: new Date()
    }
  })
  console.log(`  ✓ Final programada: ${registrations[0].teamName} vs TBD`)

  // Actualizar estado del torneo
  await prisma.tournament.update({
    where: { id: tournamentId },
    data: {
      status: 'ACTIVE',
      updatedAt: new Date()
    }
  })

  console.log(`\n✨ ¡Datos de prueba creados exitosamente!`)
  console.log(`\n📊 Resumen:`)
  console.log(`   - 8 equipos inscritos y confirmados`)
  console.log(`   - Cuartos de Final: 4 partidos completados`)
  console.log(`   - Semifinal: 1 partido completado, 1 en progreso`)
  console.log(`   - Final: Programada para hoy a las 20:00`)
  console.log(`\n🌐 Accede al torneo en:`)
  console.log(`   http://localhost:3000/dashboard/tournaments/${tournamentId}`)
}

seedTournamentTest()
  .then(async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
  .catch(async (e) => {
    console.error('❌ Error:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
