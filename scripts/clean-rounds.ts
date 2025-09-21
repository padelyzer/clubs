import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🗑️  Cleaning existing tournament rounds and matches...')
  
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
  
  // Delete all matches for this tournament
  const matchesDeleted = await prisma.tournamentMatch.deleteMany({
    where: {
      tournamentId: tournament.id
    }
  })
  
  console.log(`✅ Deleted ${matchesDeleted.count} matches`)
  
  // Delete all rounds for this tournament
  const roundsDeleted = await prisma.tournamentRound.deleteMany({
    where: {
      tournamentId: tournament.id
    }
  })
  
  console.log(`✅ Deleted ${roundsDeleted.count} rounds`)
  
  console.log('\n🎯 Tournament is ready for new group generation!')
  console.log('   Now you can click "Generar Grupos" again and it will create all necessary rounds')
  
  // Show expected rounds
  const registrations = await prisma.tournamentRegistration.groupBy({
    by: ['modality', 'category'],
    where: {
      tournamentId: tournament.id
    },
    _count: {
      id: true
    }
  })
  
  console.log('\n📊 Expected rounds to be generated:')
  let totalExpectedRounds = 0
  
  registrations.forEach(group => {
    const count = group._count.id
    let rounds = 0
    
    if (count <= 4) {
      rounds = 1 // Liga (todos contra todos)
    } else if (count <= 8) {
      rounds = 3 // Grupos + Semifinales + Final
    } else {
      rounds = 4 // Octavos + Cuartos + Semifinales + Final
    }
    
    console.log(`   - ${group.modality} ${group.category}: ${count} teams → ${rounds} rounds`)
    totalExpectedRounds += rounds
  })
  
  console.log(`\n   Total expected rounds: ${totalExpectedRounds}`)
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })