import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Fixing team names in matches...')
  
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
    }
  })
  
  console.log(`📊 Found ${matches.length} matches to check`)
  
  let updatedCount = 0
  
  for (const match of matches) {
    let needsUpdate = false
    let updates: any = {}
    
    // Fix team names that have incorrect format
    if (match.team1Name?.includes('FOpen')) {
      updates.team1Name = match.team1Name.replace('FOpen', 'MOpen')
      needsUpdate = true
    }
    if (match.team2Name?.includes('FOpen')) {
      updates.team2Name = match.team2Name.replace('FOpen', 'MOpen')
      needsUpdate = true
    }
    
    // Also check for feminine categories
    if (match.round?.includes('Femenino')) {
      if (match.team1Name?.includes('MOpen')) {
        updates.team1Name = match.team1Name.replace('MOpen', 'FOpen')
        needsUpdate = true
      }
      if (match.team2Name?.includes('MOpen')) {
        updates.team2Name = match.team2Name.replace('MOpen', 'FOpen')
        needsUpdate = true
      }
      
      // Fix other feminine categories
      const femCategories = ['1F', '2F', '3F', '4F', '5F', '6F']
      femCategories.forEach(cat => {
        if (match.team1Name?.includes(`M${cat}`)) {
          updates.team1Name = match.team1Name.replace(`M${cat}`, `F${cat}`)
          needsUpdate = true
        }
        if (match.team2Name?.includes(`M${cat}`)) {
          updates.team2Name = match.team2Name.replace(`M${cat}`, `F${cat}`)
          needsUpdate = true
        }
      })
    }
    
    if (needsUpdate) {
      await prisma.tournamentMatch.update({
        where: { id: match.id },
        data: updates
      })
      updatedCount++
    }
  }
  
  console.log(`✅ Updated ${updatedCount} matches`)
  
  // Show sample of corrected matches
  const sampleMatches = await prisma.tournamentMatch.findMany({
    where: {
      tournamentId: tournament.id,
      round: {
        contains: 'Open'
      }
    },
    take: 12
  })
  
  console.log('\n📋 Sample of corrected matches:')
  sampleMatches.forEach(match => {
    console.log(`  ${match.team1Name} vs ${match.team2Name}`)
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