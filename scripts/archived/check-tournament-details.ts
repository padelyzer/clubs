import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    const tournamentId = 'cmeu7utp20001r4udsbqvqa3s'
    
    // Get tournament
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        registrations: true
      }
    })
    
    if (!tournament) {
      console.log('Tournament not found')
      return
    }
    
    console.log('=== TOURNAMENT ===')
    console.log(`Name: ${tournament.name}`)
    console.log(`ID: ${tournament.id}`)
    console.log(`Registration Fee: $${tournament.registrationFee / 100}`)
    console.log(`Currency: ${tournament.currency}`)
    
    console.log('\n=== REGISTRATIONS ===')
    console.log(`Total: ${tournament.registrations.length}`)
    
    tournament.registrations.forEach((reg, index) => {
      console.log(`\n${index + 1}. ${reg.player1Name} & ${reg.player2Name}`)
      console.log(`   ID: ${reg.id}`)
      console.log(`   Payment Status: ${reg.paymentStatus}`)
      console.log(`   Payment Method: ${reg.paymentMethod || 'NULL'}`)
      console.log(`   Payment Reference: ${reg.paymentReference || 'NULL'}`)
      console.log(`   Payment Date: ${reg.paymentDate || 'NULL'}`)
      console.log(`   Paid Amount: $${reg.paidAmount / 100}`)
      console.log(`   Confirmed: ${reg.confirmed}`)
    })
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()