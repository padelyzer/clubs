import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Checking round names...')
  
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
  
  // Get all matches
  const matches = await prisma.tournamentMatch.findMany({
    where: {
      tournamentId: tournament.id
    },
    take: 20 // Just check first 20
  })
  
  console.log('\n📊 Sample match round names:')
  matches.forEach(match => {
    console.log(`  - Match ${match.matchNumber}: round="${match.round}"`)
  })
  
  // Get all rounds
  const rounds = await prisma.tournamentRound.findMany({
    where: {
      tournamentId: tournament.id
    },
    take: 5
  })
  
  console.log('\n📋 Round details:')
  rounds.forEach(round => {
    console.log(`  - ${round.name}`)
    console.log(`    stage: ${round.stage}`)
    console.log(`    modality: ${round.modality}`)
    console.log(`    category: ${round.category}`)
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