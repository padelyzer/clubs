import { prisma } from '../lib/config/prisma'
import { v4 as uuidv4 } from 'uuid'

async function seedTournamentComplete() {
  console.log('🎾 Creando datos completos para el torneo...\n')

  const tournamentId = 'tournament_active_1759786489416'

  // Verificar que el torneo existe
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId }
  })

  if (!tournament) {
    console.log('❌ Torneo no encontrado')
    return
  }

  console.log(`✅ Torneo encontrado: ${tournament.name}`)
  console.log(`   Club: ${tournament.clubId}\n`)

  // Obtener canchas del club
  let courts = await prisma.court.findMany({
    where: { clubId: tournament.clubId },
    orderBy: { order: 'asc' }
  })

  console.log(`🏟️  Canchas disponibles: ${courts.length}`)

  // Crear equipos (16 equipos para torneo de eliminación simple)
  console.log('\n👥 Creando equipos...')

  const teams = [
    { name: 'Los Invencibles', player1: 'Carlos Rodríguez', player2: 'Ana Martínez', level: 4.5 },
    { name: 'Smash Masters', player1: 'Diego López', player2: 'Laura García', level: 4.0 },
    { name: 'Ace Hunters', player1: 'Miguel Sánchez', player2: 'Sofia Torres', level: 4.2 },
    { name: 'Net Warriors', player1: 'Roberto Fernández', player2: 'Carmen Ruiz', level: 3.8 },
    { name: 'Drop Shot Kings', player1: 'Javier Morales', player2: 'Elena Navarro', level: 4.3 },
    { name: 'Volley Legends', player1: 'Fernando Cruz', player2: 'Patricia Jiménez', level: 3.9 },
    { name: 'Court Crushers', player1: 'Andrés Vargas', player2: 'Lucía Medina', level: 4.1 },
    { name: 'Spin Doctors', player1: 'Pablo Herrera', player2: 'Isabel Castillo', level: 4.4 },
    { name: 'Power Players', player1: 'Luis Ramírez', player2: 'Marta Ortiz', level: 3.7 },
    { name: 'Baseline Bandits', player1: 'Jorge Delgado', player2: 'Rosa Vega', level: 4.0 },
    { name: 'Smash Bros', player1: 'Antonio Silva', player2: 'Beatriz Romero', level: 3.6 },
    { name: 'Rally Royals', player1: 'Manuel Santos', player2: 'Clara Molina', level: 4.2 },
    { name: 'Lob Masters', player1: 'Ricardo Paz', player2: 'Diana Castro', level: 3.8 },
    { name: 'Serve Aces', player1: 'Sergio Ramos', player2: 'Natalia Flores', level: 4.1 },
    { name: 'Net Ninjas', player1: 'Gabriel Muñoz', player2: 'Alicia Pérez', level: 3.9 },
    { name: 'Court Kings', player1: 'Oscar Mendoza', player2: 'Valentina Reyes', level: 4.3 }
  ]

  // Limpiar registros anteriores
  await prisma.tournamentRegistration.deleteMany({
    where: { tournamentId }
  })

  // Crear registros de equipos
  const registrations = []
  for (const team of teams) {
    const registration = await prisma.tournamentRegistration.create({
      data: {
        id: uuidv4(),
        tournamentId,
        teamName: team.name,
        player1Id: uuidv4(),
        player1Name: team.player1,
        player1Phone: '555-0000',
        player2Id: uuidv4(),
        player2Name: team.player2,
        player2Phone: '555-0001',
        category: 'M_OPEN',
        modality: 'M',
        teamLevel: team.level.toString(),
        paymentStatus: 'PAID',
        paidAmount: 50000,
        confirmed: true,
        checkedIn: true,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Últimos 7 días
        updatedAt: new Date()
      }
    })
    registrations.push(registration)
    console.log(`   ✅ ${team.name} - ${team.player1} / ${team.player2}`)
  }

  // Crear estructura del torneo (Eliminación Simple de 16 equipos)
  console.log('\n🏆 Creando estructura del torneo...')

  // Limpiar partidos y rondas anteriores
  await prisma.tournamentMatch.deleteMany({ where: { tournamentId } })
  await prisma.tournamentRound.deleteMany({ where: { tournamentId } })

  // Crear rondas
  const rounds = [
    { name: 'Octavos de Final', stage: 'ROUND_16', matchesCount: 8 },
    { name: 'Cuartos de Final', stage: 'QUARTER_FINALS', matchesCount: 4 },
    { name: 'Semifinales', stage: 'SEMI_FINALS', matchesCount: 2 },
    { name: 'Final', stage: 'FINALS', matchesCount: 1 }
  ]

  const createdRounds = []
  for (const round of rounds) {
    const roundData = await prisma.tournamentRound.create({
      data: {
        id: uuidv4(),
        tournamentId,
        name: round.name,
        stage: round.stage,
        stageLabel: round.name,
        modality: 'M',
        category: 'M_OPEN',
        status: 'PENDING',
        matchesCount: round.matchesCount,
        completedMatches: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
    createdRounds.push(roundData)
    console.log(`   ✅ ${round.name} - ${round.matchesCount} partidos`)
  }

  // Crear partidos para cada ronda
  console.log('\n⚡ Generando partidos...')

  const baseDate = new Date(tournament.startDate)
  let matchNumber = 1

  // Función para generar resultado realista
  function generateResult(team1Level: number, team2Level: number) {
    const levelDiff = team1Level - team2Level
    const team1Advantage = 0.5 + (levelDiff * 0.1) // 10% por cada punto de nivel
    const team1Wins = Math.random() < team1Advantage

    // Generar sets (mejor de 3)
    const sets = []
    let team1SetsWon = 0
    let team2SetsWon = 0

    for (let i = 0; i < 3; i++) {
      if (team1SetsWon === 2 || team2SetsWon === 2) break

      const setWinner = Math.random() < team1Advantage
      const winnerGames = 6
      const loserGames = Math.floor(Math.random() * 5) // 0-4

      sets.push({
        team1Games: setWinner ? winnerGames : loserGames,
        team2Games: setWinner ? loserGames : winnerGames
      })

      if (setWinner) team1SetsWon++
      else team2SetsWon++
    }

    return {
      team1Sets: sets.map(s => s.team1Games),
      team2Sets: sets.map(s => s.team2Games),
      team1Score: team1SetsWon,
      team2Score: team2SetsWon,
      winner: team1Wins ? 'TEAM1' : 'TEAM2'
    }
  }

  // OCTAVOS DE FINAL (8 partidos)
  console.log('\n   📍 Octavos de Final...')
  const octavosMatches = []
  for (let i = 0; i < 8; i++) {
    const team1 = registrations[i * 2]
    const team2 = registrations[i * 2 + 1]
    const court = courts[i % courts.length]
    const scheduledTime = new Date(baseDate.getTime() + i * 90 * 60 * 1000) // Cada 90 min

    const result = generateResult(team1.teamLevel || 4.0, team2.teamLevel || 4.0)

    const match = await prisma.tournamentMatch.create({
      data: {
        id: uuidv4(),
        tournamentId,
        roundId: createdRounds[0].id,
        round: createdRounds[0].name,
        matchNumber: matchNumber++,
        team1Name: team1.teamName,
        team1Player1: team1.player1Name,
        team1Player2: team1.player2Name || undefined,
        team2Name: team2.teamName,
        team2Player1: team2.player1Name,
        team2Player2: team2.player2Name || undefined,
        courtId: court.id,
        courtNumber: court.order.toString(),
        scheduledAt: scheduledTime,
        actualStartTime: scheduledTime,
        actualEndTime: new Date(scheduledTime.getTime() + 75 * 60 * 1000),
        status: 'COMPLETED',
        team1Sets: result.team1Sets,
        team2Sets: result.team2Sets,
        team1Score: result.team1Score,
        team2Score: result.team2Score,
        winner: result.winner,
        resultsConfirmed: true,
        qrCode: `QR-${uuidv4().substring(0, 8)}`,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
    octavosMatches.push({ match, team1, team2, winner: result.winner })
    console.log(`      ${team1.teamName} vs ${team2.teamName} → ${result.team1Score}-${result.team2Score}`)
  }

  // Actualizar ronda de octavos
  await prisma.tournamentRound.update({
    where: { id: createdRounds[0].id },
    data: { status: 'COMPLETED', completedMatches: 8 }
  })

  // CUARTOS DE FINAL (4 partidos)
  console.log('\n   📍 Cuartos de Final...')
  const cuartosMatches = []
  for (let i = 0; i < 4; i++) {
    const prevMatch1 = octavosMatches[i * 2]
    const prevMatch2 = octavosMatches[i * 2 + 1]

    const team1 = prevMatch1.winner === 'TEAM1' ? prevMatch1.team1 : prevMatch1.team2
    const team2 = prevMatch2.winner === 'TEAM1' ? prevMatch2.team1 : prevMatch2.team2

    const court = courts[i % courts.length]
    const scheduledTime = new Date(baseDate.getTime() + (8 + i) * 90 * 60 * 1000)

    const result = generateResult(team1.teamLevel || 4.0, team2.teamLevel || 4.0)

    const match = await prisma.tournamentMatch.create({
      data: {
        id: uuidv4(),
        tournamentId,
        roundId: createdRounds[1].id,
        round: createdRounds[1].name,
        matchNumber: matchNumber++,
        team1Name: team1.teamName,
        team1Player1: team1.player1Name,
        team1Player2: team1.player2Name || undefined,
        team2Name: team2.teamName,
        team2Player1: team2.player1Name,
        team2Player2: team2.player2Name || undefined,
        courtId: court.id,
        courtNumber: court.order.toString(),
        scheduledAt: scheduledTime,
        actualStartTime: scheduledTime,
        actualEndTime: new Date(scheduledTime.getTime() + 75 * 60 * 1000),
        status: 'COMPLETED',
        team1Sets: result.team1Sets,
        team2Sets: result.team2Sets,
        team1Score: result.team1Score,
        team2Score: result.team2Score,
        winner: result.winner,
        resultsConfirmed: true,
        qrCode: `QR-${uuidv4().substring(0, 8)}`,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
    cuartosMatches.push({ match, team1, team2, winner: result.winner })
    console.log(`      ${team1.teamName} vs ${team2.teamName} → ${result.team1Score}-${result.team2Score}`)
  }

  // Actualizar ronda de cuartos
  await prisma.tournamentRound.update({
    where: { id: createdRounds[1].id },
    data: { status: 'COMPLETED', completedMatches: 4 }
  })

  // SEMIFINALES (2 partidos)
  console.log('\n   📍 Semifinales...')
  const semifinalesMatches = []
  for (let i = 0; i < 2; i++) {
    const prevMatch1 = cuartosMatches[i * 2]
    const prevMatch2 = cuartosMatches[i * 2 + 1]

    const team1 = prevMatch1.winner === 'TEAM1' ? prevMatch1.team1 : prevMatch1.team2
    const team2 = prevMatch2.winner === 'TEAM1' ? prevMatch2.team1 : prevMatch2.team2

    const court = courts[i % courts.length]
    const scheduledTime = new Date(baseDate.getTime() + (12 + i) * 90 * 60 * 1000)

    const result = generateResult(team1.teamLevel || 4.0, team2.teamLevel || 4.0)

    const match = await prisma.tournamentMatch.create({
      data: {
        id: uuidv4(),
        tournamentId,
        roundId: createdRounds[2].id,
        round: createdRounds[2].name,
        matchNumber: matchNumber++,
        team1Name: team1.teamName,
        team1Player1: team1.player1Name,
        team1Player2: team1.player2Name || undefined,
        team2Name: team2.teamName,
        team2Player1: team2.player1Name,
        team2Player2: team2.player2Name || undefined,
        courtId: court.id,
        courtNumber: court.order.toString(),
        scheduledAt: scheduledTime,
        actualStartTime: scheduledTime,
        actualEndTime: new Date(scheduledTime.getTime() + 75 * 60 * 1000),
        status: 'COMPLETED',
        team1Sets: result.team1Sets,
        team2Sets: result.team2Sets,
        team1Score: result.team1Score,
        team2Score: result.team2Score,
        winner: result.winner,
        resultsConfirmed: true,
        qrCode: `QR-${uuidv4().substring(0, 8)}`,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
    semifinalesMatches.push({ match, team1, team2, winner: result.winner })
    console.log(`      ${team1.teamName} vs ${team2.teamName} → ${result.team1Score}-${result.team2Score}`)
  }

  // Actualizar ronda de semifinales
  await prisma.tournamentRound.update({
    where: { id: createdRounds[2].id },
    data: { status: 'COMPLETED', completedMatches: 2 }
  })

  // FINAL (1 partido)
  console.log('\n   📍 Final...')
  const prevMatch1 = semifinalesMatches[0]
  const prevMatch2 = semifinalesMatches[1]

  const finalTeam1 = prevMatch1.winner === 'TEAM1' ? prevMatch1.team1 : prevMatch1.team2
  const finalTeam2 = prevMatch2.winner === 'TEAM1' ? prevMatch2.team1 : prevMatch2.team2

  const court = courts[0]
  const scheduledTime = new Date(baseDate.getTime() + 14 * 90 * 60 * 1000)

  // La final aún está en progreso
  await prisma.tournamentMatch.create({
    data: {
      id: uuidv4(),
      tournamentId,
      roundId: createdRounds[3].id,
      round: createdRounds[3].name,
      matchNumber: matchNumber++,
      team1Name: finalTeam1.teamName,
      team1Player1: finalTeam1.player1Name,
      team1Player2: finalTeam1.player2Name || undefined,
      team2Name: finalTeam2.teamName,
      team2Player1: finalTeam2.player1Name,
      team2Player2: finalTeam2.player2Name || undefined,
      courtId: court.id,
      courtNumber: court.order.toString(),
      scheduledAt: scheduledTime,
      actualStartTime: scheduledTime,
      status: 'IN_PROGRESS',
      team1Sets: [6],
      team2Sets: [4],
      team1Score: 1,
      team2Score: 0,
      qrCode: `QR-${uuidv4().substring(0, 8)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  })
  console.log(`      🔴 EN VIVO: ${finalTeam1.teamName} vs ${finalTeam2.teamName} (1-0 en sets)`)

  // Actualizar ronda de final
  await prisma.tournamentRound.update({
    where: { id: createdRounds[3].id },
    data: { status: 'IN_PROGRESS', completedMatches: 0 }
  })

  console.log('\n✅ Datos del torneo creados exitosamente!')
  console.log('\n📊 Resumen:')
  console.log(`   - Equipos registrados: ${registrations.length}`)
  console.log(`   - Octavos: 8 partidos completados`)
  console.log(`   - Cuartos: 4 partidos completados`)
  console.log(`   - Semifinales: 2 partidos completados`)
  console.log(`   - Final: 1 partido en progreso`)
  console.log(`   - Total: 15 partidos`)
  console.log(`\n🏆 Finalistas:`)
  console.log(`   1. ${finalTeam1.teamName}`)
  console.log(`   2. ${finalTeam2.teamName}`)
}

seedTournamentComplete()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
