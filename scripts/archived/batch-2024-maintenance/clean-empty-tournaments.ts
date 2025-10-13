import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    // Delete tournaments with no registrations
    const emptyTournaments = await prisma.tournament.findMany({
      where: {
        TournamentRegistration: {
          none: {}
        }
      },
      select: {
        id: true,
        name: true
      }
    })

    console.log(`Found ${emptyTournaments.length} empty tournaments to delete`)

    for (const tournament of emptyTournaments) {
      await prisma.tournament.delete({
        where: { id: tournament.id }
      })
      console.log(`✅ Deleted empty tournament: ${tournament.name} (${tournament.id})`)
    }

    // Show remaining tournaments
    const remaining = await prisma.tournament.findMany({
      include: {
        _count: {
          select: {
            TournamentRegistration: true,
            TournamentMatch: true
          }
        }
      }
    })

    console.log('\n=== Remaining Tournaments ===')
    remaining.forEach(t => {
      console.log(`📋 ${t.name}`)
      console.log(`   ID: ${t.id}`)
      console.log(`   Registrations: ${t._count.TournamentRegistration}`)
      console.log(`   Matches: ${t._count.TournamentMatch}`)
    })

  } catch (error) {
    console.error('Error cleaning tournaments:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()