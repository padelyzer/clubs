import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    // Check tournaments
    const tournaments = await prisma.tournament.findMany({
      include: {
        _count: {
          select: {
            registrations: true,
            matches: true
          }
        }
      }
    })
    
    console.log('\n=== TOURNAMENTS ===')
    if (tournaments.length === 0) {
      console.log('No tournaments found')
    } else {
      tournaments.forEach(t => {
        console.log(`\n📋 ${t.name}`)
        console.log(`   ID: ${t.id}`)
        console.log(`   Status: ${t.status}`)
        console.log(`   Registrations: ${t._count.registrations}`)
        console.log(`   Matches: ${t._count.matches}`)
        console.log(`   Fee: $${t.registrationFee / 100} ${t.currency}`)
      })
    }
    
    // If we have a tournament, check its registrations
    if (tournaments[0]) {
      const registrations = await prisma.tournamentRegistration.findMany({
        where: { tournamentId: tournaments[0].id },
        take: 5
      })
      
      console.log('\n=== FIRST 5 REGISTRATIONS ===')
      registrations.forEach(r => {
        console.log(`\n👥 ${r.player1Name} & ${r.player2Name || 'N/A'}`)
        console.log(`   Payment Status: ${r.paymentStatus}`)
        console.log(`   Payment Method: ${r.paymentMethod || 'N/A'}`)
        console.log(`   Payment Ref: ${r.paymentReference || 'N/A'}`)
        console.log(`   Paid Amount: $${r.paidAmount / 100}`)
        console.log(`   Confirmed: ${r.confirmed}`)
        console.log(`   Checked In: ${r.checkedIn}`)
      })
    }
    
  } catch (error) {
    console.error('Error checking data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()