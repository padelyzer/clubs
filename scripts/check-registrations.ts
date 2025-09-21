import { prisma } from '../lib/config/prisma'

async function checkRegistrations() {
  try {
    const registrations = await prisma.tournamentRegistration.findMany({
      select: {
        id: true,
        player1Name: true,
        player2Name: true,
        player1Level: true,
        player2Level: true,
        teamLevel: true,
        teamName: true,
        tournamentId: true
      },
      take: 10
    })

    console.log('\n=== Tournament Registrations ===')
    console.log('Total registrations found:', registrations.length)
    
    registrations.forEach((reg, index) => {
      console.log(`\n${index + 1}. ${reg.player1Name} & ${reg.player2Name || 'N/A'}`)
      console.log(`   Team: ${reg.teamName || 'No team name'}`)
      console.log(`   Player 1 Level: ${reg.player1Level || 'NULL'}`)
      console.log(`   Player 2 Level: ${reg.player2Level || 'NULL'}`)
      console.log(`   Team Level: ${reg.teamLevel || 'NULL'}`)
      console.log(`   Tournament ID: ${reg.tournamentId}`)
    })

    // Check schema info
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'TournamentRegistration' 
      AND column_name IN ('player1Level', 'player2Level', 'teamLevel')
    `
    
    console.log('\n=== Schema Info ===')
    console.log(columns)

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkRegistrations()