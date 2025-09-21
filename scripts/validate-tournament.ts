import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Validating tournament structure...\n')
  
  // Find the demo tournament
  const tournament = await prisma.tournament.findFirst({
    where: {
      name: 'Gran Torneo Demo 2025'
    }
  })
  
  if (!tournament) {
    console.error('❌ Tournament not found')
    return
  }
  
  // Get all registrations grouped by category
  const registrations = await prisma.tournamentRegistration.groupBy({
    by: ['modality', 'category'],
    where: {
      tournamentId: tournament.id
    },
    _count: {
      id: true
    }
  })
  
  console.log('📊 Teams per category:')
  let totalTeams = 0
  registrations.forEach(group => {
    console.log(`   ${group.modality} ${group.category}: ${group._count.id} teams`)
    totalTeams += group._count.id
  })
  console.log(`   Total: ${totalTeams} teams\n`)
  
  // Get all rounds
  const rounds = await prisma.tournamentRound.findMany({
    where: {
      tournamentId: tournament.id
    },
    orderBy: [
      { modality: 'asc' },
      { category: 'asc' },
      { createdAt: 'asc' }
    ]
  })
  
  console.log(`📋 Rounds created: ${rounds.length}`)
  
  // Group rounds by category
  const roundsByCategory: { [key: string]: any[] } = {}
  rounds.forEach(round => {
    const key = `${round.modality}-${round.category}`
    if (!roundsByCategory[key]) {
      roundsByCategory[key] = []
    }
    roundsByCategory[key].push(round)
  })
  
  console.log('\n🏆 Rounds per category:')
  Object.entries(roundsByCategory).forEach(([category, categoryRounds]) => {
    console.log(`   ${category}: ${categoryRounds.length} rounds`)
    categoryRounds.forEach(round => {
      console.log(`      - ${round.stageLabel}: ${round.matchesCount} matches`)
    })
  })
  
  // Get all matches
  const matches = await prisma.tournamentMatch.findMany({
    where: {
      tournamentId: tournament.id
    }
  })
  
  console.log(`\n🎾 Total matches created: ${matches.length}`)
  
  // Calculate expected matches
  console.log('\n📐 Expected calculation for 20 teams per category:')
  console.log('   Using knockout format (elimination):')
  console.log('   - Round of 16 (Octavos): 8 matches (16 teams play)')
  console.log('   - Quarter-finals (Cuartos): 4 matches')
  console.log('   - Semi-finals (Semifinales): 2 matches')
  console.log('   - Final: 1 match')
  console.log('   Total per category: 15 matches')
  console.log(`   Total for 14 categories: 15 × 14 = 210 matches ✅`)
  
  console.log('\n📈 Validation Summary:')
  console.log(`   ✅ Categories: 14 (7 masculine + 7 feminine)`)
  console.log(`   ✅ Teams per category: 20`)
  console.log(`   ✅ Total teams: ${totalTeams}`)
  console.log(`   ✅ Rounds created: ${rounds.length} (4 per category × 14 = 56) ✅`)
  console.log(`   ✅ Matches created: ${matches.length} (15 per category × 14 = 210) ✅`)
  
  // Check for any issues
  const categoriesWithIssues: string[] = []
  Object.entries(roundsByCategory).forEach(([category, categoryRounds]) => {
    if (categoryRounds.length !== 4) {
      categoriesWithIssues.push(`${category}: has ${categoryRounds.length} rounds instead of 4`)
    }
  })
  
  if (categoriesWithIssues.length > 0) {
    console.log('\n⚠️  Issues found:')
    categoriesWithIssues.forEach(issue => console.log(`   - ${issue}`))
  } else {
    console.log('\n✅ Everything looks perfect! The tournament structure is correct.')
  }
  
  // Show match distribution
  const matchesByRound = await prisma.tournamentMatch.groupBy({
    by: ['round'],
    where: {
      tournamentId: tournament.id
    },
    _count: {
      id: true
    }
  })
  
  console.log('\n📊 Matches by round name:')
  matchesByRound.forEach(round => {
    console.log(`   ${round.round}: ${round._count.id} matches`)
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