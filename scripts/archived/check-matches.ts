import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Checking tournament matches...')
  
  // Find the small tournament
  const tournament = await prisma.tournament.findFirst({
    where: {
      name: 'Torneo Demo Pequeño 2025'
    }
  })
  
  if (!tournament) {
    console.error('❌ Tournament not found')
    return
  }
  
  // Get all rounds for masculine OPEN category
  const rounds = await prisma.tournamentRound.findMany({
    where: {
      tournamentId: tournament.id,
      modality: 'masculine',
      category: 'OPEN'
    }
  })
  
  console.log(`\n📊 Rounds for Masculine OPEN: ${rounds.length}`)
  rounds.forEach(round => {
    console.log(`  - ${round.name} (${round.stage}): ${round.matchesCount} matches`)
  })
  
  // Get all matches for the tournament
  const matches = await prisma.tournamentMatch.findMany({
    where: {
      tournamentId: tournament.id,
      roundId: {
        in: rounds.map(r => r.id)
      }
    }
  })
  
  console.log(`\n📊 Matches for Masculine OPEN:`)
  console.log(`Total matches: ${matches.length}`)
  
  // Show match details
  console.log(`\nMatch details:`)
  matches.forEach(match => {
    console.log(`  P${match.matchNumber}: ${match.team1Name || 'Equipo 1'} vs ${match.team2Name || 'Equipo 2'} - ${match.status}`)
  })
  
  // Check registrations for this category
  const registrations = await prisma.tournamentRegistration.findMany({
    where: {
      tournamentId: tournament.id,
      modality: 'masculine',
      category: 'OPEN'
    }
  })
  
  console.log(`\n👥 Registered teams for Masculine OPEN: ${registrations.length}`)
  registrations.forEach((reg, index) => {
    console.log(`  ${index + 1}. ${reg.teamName} (${reg.player1Name} & ${reg.player2Name})`)
  })
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })