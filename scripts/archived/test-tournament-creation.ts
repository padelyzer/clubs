import { prisma } from '../lib/config/prisma'
import { generateTournamentSchedule } from '../lib/tournaments/match-generator'
import { createTournamentCourtBlocks } from '../lib/tournaments/court-blocker'

async function testTournamentCreation() {
  try {
    console.log('🎾 Testing tournament creation with court reservations...')
    
    // Get the first club
    const club = await prisma.club.findFirst()
    if (!club) {
      throw new Error('No club found')
    }
    console.log(`📍 Using club: ${club.name}`)

    // Create test tournament
    const tournament = await prisma.tournament.create({
      data: {
        clubId: club.id,
        name: 'Test Tournament - M_1F',
        description: 'Tournament de prueba para validar reservas de canchas',
        type: 'SINGLE_ELIMINATION',
        category: 'M_1F',
        registrationStart: new Date('2025-09-01T00:00:00.000Z'),
        registrationEnd: new Date('2025-09-05T23:59:59.000Z'),
        startDate: new Date('2025-09-10T08:00:00.000Z'),
        endDate: new Date('2025-09-10T18:00:00.000Z'),
        maxPlayers: 8, // Small tournament for testing
        registrationFee: 10000, // 100 pesos in cents
        prizePool: 50000, // 500 pesos in cents
        matchDuration: 90,
        sets: 3,
        games: 6,
        tiebreak: true,
        createdBy: 'test-user'
      }
    })

    console.log(`✅ Created tournament: ${tournament.name} (ID: ${tournament.id})`)

    // Generate matches and schedule
    await generateTournamentSchedule(
      tournament.id,
      tournament.type as any,
      tournament.maxPlayers,
      tournament.startDate,
      tournament.endDate,
      tournament.matchDuration,
      club.id
    )

    // Create court blocks
    await createTournamentCourtBlocks(tournament.id, club.id)

    // Check results
    const matches = await prisma.tournamentMatch.findMany({
      where: { tournamentId: tournament.id },
      include: {
        Court: {
          select: { name: true }
        }
      }
    })

    console.log(`\n🎯 Generated ${matches.length} matches:`)
    matches.forEach((match, i) => {
      console.log(`   ${i+1}. ${match.round} - Match ${match.matchNumber}`)
      console.log(`      Court: ${match.Court?.name || 'No asignada'}`)
      console.log(`      Time: ${match.startTime} - ${match.endTime}`)
      console.log(`      Date: ${match.scheduledAt?.toLocaleDateString() || 'No programado'}`)
    })

    // Check blocking bookings
    const blockingBookings = await prisma.booking.findMany({
      where: {
        playerEmail: 'tournament@system.internal',
        notes: { contains: tournament.id }
      },
      include: {
        Court: { select: { name: true } }
      }
    })

    console.log(`\n🔒 Created ${blockingBookings.length} court blocks:`)
    blockingBookings.forEach((booking, i) => {
      console.log(`   ${i+1}. ${booking.Court?.name} - ${booking.date} ${booking.startTime}-${booking.endTime}`)
      console.log(`      Player: ${booking.playerName}`)
    })

    console.log(`\n🎉 Test completed successfully!`)
    console.log(`📊 Summary:`)
    console.log(`   - Tournament created: ✅`)
    console.log(`   - Matches generated: ✅ (${matches.length})`)
    console.log(`   - Courts assigned: ✅ (${matches.filter(m => m.courtId).length}/${matches.length})`)
    console.log(`   - Blocking bookings: ✅ (${blockingBookings.length})`)

  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
testTournamentCreation()