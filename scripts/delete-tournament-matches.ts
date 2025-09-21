import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    // Get the latest tournament
    const tournament = await prisma.tournament.findFirst({
      orderBy: { createdAt: 'desc' }
    })
    
    if (!tournament) {
      console.log('No tournament found.')
      return
    }

    console.log(`Tournament: ${tournament.name}`)
    
    // Count matches before deletion
    const matchCount = await prisma.tournamentMatch.count({
      where: { tournamentId: tournament.id }
    })
    
    console.log(`Found ${matchCount} matches to delete`)
    
    if (matchCount > 0) {
      // Delete all matches for this tournament
      const deleted = await prisma.tournamentMatch.deleteMany({
        where: { tournamentId: tournament.id }
      })
      
      console.log(`✅ Successfully deleted ${deleted.count} matches from tournament "${tournament.name}"`)
    } else {
      console.log('No matches to delete')
    }

  } catch (error) {
    console.error('Error deleting matches:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()