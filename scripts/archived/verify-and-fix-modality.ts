import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Verificando y corrigiendo modalidades...')
  
  const tournament = await prisma.tournament.findFirst({
    where: {
      name: 'Torneo Demo Pequeño 2025'
    }
  })
  
  if (!tournament) {
    console.error('❌ Tournament not found')
    return
  }
  
  // First, let's check what's happening with masculine OPEN matches
  const masculineOpenRound = await prisma.tournamentRound.findFirst({
    where: {
      tournamentId: tournament.id,
      modality: 'masculine',
      category: 'OPEN'
    }
  })
  
  if (!masculineOpenRound) {
    console.error('❌ No masculine OPEN round found')
    return
  }
  
  console.log(`\n📋 Round info:`)
  console.log(`  ID: ${masculineOpenRound.id}`)
  console.log(`  Name: ${masculineOpenRound.name}`)
  console.log(`  Modality: ${masculineOpenRound.modality}`)
  console.log(`  Category: ${masculineOpenRound.category}`)
  
  // Get matches for this round
  const matches = await prisma.tournamentMatch.findMany({
    where: {
      tournamentId: tournament.id,
      roundId: masculineOpenRound.id
    }
  })
  
  console.log(`\n❌ Current incorrect matches (showing feminine names in masculine category):`)
  matches.slice(0, 6).forEach(match => {
    console.log(`  ${match.team1Name} vs ${match.team2Name}`)
  })
  
  // Get the correct masculine registrations
  const masculineRegistrations = await prisma.tournamentRegistration.findMany({
    where: {
      tournamentId: tournament.id,
      modality: 'masculine',
      category: 'OPEN'
    },
    orderBy: { id: 'asc' }
  })
  
  console.log(`\n✅ Correct masculine teams that should be playing:`)
  masculineRegistrations.forEach((reg, idx) => {
    console.log(`  ${idx + 1}. ${reg.teamName}: ${reg.player1Name} & ${reg.player2Name}`)
  })
  
  // Now fix the matches with correct team assignments
  console.log('\n🔧 Fixing match assignments...')
  
  // Group A: Teams 1-4
  const groupATeams = masculineRegistrations.slice(0, 4)
  // Group B: Teams 5-8
  const groupBTeams = masculineRegistrations.slice(4, 8)
  
  let matchIndex = 0
  
  // Generate Group A matches (round-robin for 4 teams = 6 matches)
  for (let i = 0; i < groupATeams.length; i++) {
    for (let j = i + 1; j < groupATeams.length; j++) {
      if (matchIndex < matches.length) {
        await prisma.tournamentMatch.update({
          where: { id: matches[matchIndex].id },
          data: {
            team1Name: groupATeams[i].teamName,
            team1Player1: groupATeams[i].player1Name,
            team1Player2: groupATeams[i].player2Name,
            team2Name: groupATeams[j].teamName,
            team2Player1: groupATeams[j].player1Name,
            team2Player2: groupATeams[j].player2Name,
            round: 'Grupo A - Masculino - Open (Todos los niveles)',
            updatedAt: new Date()
          }
        })
        matchIndex++
      }
    }
  }
  
  // Generate Group B matches (round-robin for 4 teams = 6 matches)
  for (let i = 0; i < groupBTeams.length; i++) {
    for (let j = i + 1; j < groupBTeams.length; j++) {
      if (matchIndex < matches.length) {
        await prisma.tournamentMatch.update({
          where: { id: matches[matchIndex].id },
          data: {
            team1Name: groupBTeams[i].teamName,
            team1Player1: groupBTeams[i].player1Name,
            team1Player2: groupBTeams[i].player2Name,
            team2Name: groupBTeams[j].teamName,
            team2Player1: groupBTeams[j].player1Name,
            team2Player2: groupBTeams[j].player2Name,
            round: 'Grupo B - Masculino - Open (Todos los niveles)',
            updatedAt: new Date()
          }
        })
        matchIndex++
      }
    }
  }
  
  console.log(`✅ Fixed ${matchIndex} matches`)
  
  // Verify the fix
  const fixedMatches = await prisma.tournamentMatch.findMany({
    where: {
      tournamentId: tournament.id,
      roundId: masculineOpenRound.id
    },
    take: 12
  })
  
  console.log('\n✅ Corrected masculine OPEN matches:')
  console.log('\nGrupo A:')
  fixedMatches.slice(0, 6).forEach((match, idx) => {
    console.log(`  P${idx + 1}: ${match.team1Name} vs ${match.team2Name}`)
  })
  console.log('\nGrupo B:')
  fixedMatches.slice(6, 12).forEach((match, idx) => {
    console.log(`  P${idx + 7}: ${match.team1Name} vs ${match.team2Name}`)
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