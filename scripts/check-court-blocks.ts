import { prisma } from '../lib/config/prisma'

async function checkCourtBlocks() {
  try {
    console.log('🔍 Checking for tournament court blocks...')
    
    const blocks = await prisma.booking.findMany({
      where: {
        playerEmail: 'tournament@system.internal'
      },
      include: {
        court: { select: { name: true } }
      },
      orderBy: { startTime: 'asc' }
    })
    
    console.log(`Found ${blocks.length} tournament blocks:`)
    blocks.forEach((block, i) => {
      console.log(`   ${i+1}. Court: ${block.court?.name} - ${block.date} ${block.startTime}-${block.endTime}`)
      console.log(`      Player: ${block.playerName}`)
      console.log(`      Status: ${block.status} | Type: ${block.type}`)
      console.log(`      Notes: ${block.notes?.substring(0, 50)}...`)
    })

    // Check latest tournament matches
    const recentTournament = await prisma.tournament.findFirst({
      orderBy: { createdAt: 'desc' },
      include: {
        matches: {
          include: {
            court: { select: { name: true } }
          }
        }
      }
    })

    if (recentTournament) {
      console.log(`\n🎾 Latest tournament: ${recentTournament.name}`)
      console.log(`   Matches: ${recentTournament.matches.length}`)
      recentTournament.matches.forEach((match, i) => {
        console.log(`   ${i+1}. ${match.round} - Court: ${match.court?.name} ${match.startTime}-${match.endTime}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkCourtBlocks()