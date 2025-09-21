import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Reorganizando grupos correctamente...')
  
  const tournament = await prisma.tournament.findFirst({
    where: {
      name: 'Torneo Demo Pequeño 2025'
    }
  })
  
  if (!tournament) {
    console.error('❌ Tournament not found')
    return
  }
  
  // Process each modality and category
  const modalities = ['masculine', 'feminine']
  const categories = ['OPEN', '1F', '2F', '3F', '4F', '5F', '6F']
  
  for (const modality of modalities) {
    for (const category of categories) {
      console.log(`\n📊 Fixing ${modality} ${category}...`)
      
      // Get registrations for this modality/category
      const registrations = await prisma.tournamentRegistration.findMany({
        where: {
          tournamentId: tournament.id,
          modality,
          category
        },
        orderBy: { id: 'asc' }
      })
      
      if (registrations.length !== 8) {
        console.log(`  ⚠️ Skipping - has ${registrations.length} teams instead of 8`)
        continue
      }
      
      // Get the round for this modality/category
      const round = await prisma.tournamentRound.findFirst({
        where: {
          tournamentId: tournament.id,
          modality,
          category
        }
      })
      
      if (!round) {
        console.log(`  ⚠️ No round found`)
        continue
      }
      
      // Get all matches for this round
      const matches = await prisma.tournamentMatch.findMany({
        where: {
          tournamentId: tournament.id,
          roundId: round.id
        },
        orderBy: { matchNumber: 'asc' }
      })
      
      if (matches.length !== 12) {
        console.log(`  ⚠️ Expected 12 matches, found ${matches.length}`)
        continue
      }
      
      // Group A: Teams 0-3 (indices)
      // Group B: Teams 4-7 (indices)
      const groupA = registrations.slice(0, 4)
      const groupB = registrations.slice(4, 8)
      
      let matchIndex = 0
      
      // Generate proper round names
      const modalityLabel = modality === 'masculine' ? 'Masculino' : 'Femenino'
      const categoryLabel = category === 'OPEN' ? 'Open (Todos los niveles)' :
                           category === '1F' ? 'Primera Fuerza (Avanzado)' :
                           category === '2F' ? 'Segunda Fuerza (Intermedio-Alto)' :
                           category === '3F' ? 'Tercera Fuerza (Intermedio)' :
                           category === '4F' ? 'Cuarta Fuerza (Intermedio-Bajo)' :
                           category === '5F' ? 'Quinta Fuerza (Principiante-Intermedio)' :
                           'Sexta Fuerza (Principiante)'
      
      // Group A matches (6 matches for 4 teams round-robin)
      console.log(`  Grupo A:`)
      for (let i = 0; i < groupA.length; i++) {
        for (let j = i + 1; j < groupA.length; j++) {
          if (matchIndex < matches.length) {
            await prisma.tournamentMatch.update({
              where: { id: matches[matchIndex].id },
              data: {
                matchNumber: matchIndex + 1,
                team1Name: groupA[i].teamName,
                team1Player1: groupA[i].player1Name,
                team1Player2: groupA[i].player2Name,
                team2Name: groupA[j].teamName,
                team2Player1: groupA[j].player1Name,
                team2Player2: groupA[j].player2Name,
                round: `Grupo A - ${modalityLabel} - ${categoryLabel}`,
                updatedAt: new Date()
              }
            })
            console.log(`    P${matchIndex + 1}: ${groupA[i].teamName} vs ${groupA[j].teamName}`)
            matchIndex++
          }
        }
      }
      
      // Group B matches (6 matches for 4 teams round-robin)
      console.log(`  Grupo B:`)
      for (let i = 0; i < groupB.length; i++) {
        for (let j = i + 1; j < groupB.length; j++) {
          if (matchIndex < matches.length) {
            await prisma.tournamentMatch.update({
              where: { id: matches[matchIndex].id },
              data: {
                matchNumber: matchIndex + 1,
                team1Name: groupB[i].teamName,
                team1Player1: groupB[i].player1Name,
                team1Player2: groupB[i].player2Name,
                team2Name: groupB[j].teamName,
                team2Player1: groupB[j].player1Name,
                team2Player2: groupB[j].player2Name,
                round: `Grupo B - ${modalityLabel} - ${categoryLabel}`,
                updatedAt: new Date()
              }
            })
            console.log(`    P${matchIndex + 1}: ${groupB[i].teamName} vs ${groupB[j].teamName}`)
            matchIndex++
          }
        }
      }
      
      console.log(`  ✅ Fixed ${matchIndex} matches`)
    }
  }
  
  console.log('\n✅ All groups have been reorganized correctly!')
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })