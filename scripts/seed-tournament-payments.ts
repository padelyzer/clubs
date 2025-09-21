import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    // Get the first tournament
    const tournament = await prisma.tournament.findFirst()
    
    if (!tournament) {
      console.log('No tournament found. Please create a tournament first.')
      return
    }

    console.log(`Found tournament: ${tournament.name}`)

    // Update all registrations to have payment data
    const registrations = await prisma.tournamentRegistration.findMany({
      where: { tournamentId: tournament.id }
    })

    console.log(`Found ${registrations.length} registrations`)

    // Update each registration with payment data
    for (const reg of registrations) {
      const paymentMethods = ['cash', 'card', 'transfer']
      const randomMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)]
      
      const updated = await prisma.tournamentRegistration.update({
        where: { id: reg.id },
        data: {
          paymentStatus: 'completed',
          paidAmount: tournament.registrationFee,
          paymentMethod: randomMethod,
          paymentReference: `REF-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          paymentDate: new Date(),
          confirmed: true
        }
      })
      
      console.log(`✅ Updated registration ${reg.player1Name} & ${reg.player2Name || 'N/A'} - Payment: ${randomMethod}`)
    }

    console.log('\n✅ All registrations updated with payment data!')
    
    // Show summary
    const summary = await prisma.tournamentRegistration.groupBy({
      by: ['paymentMethod'],
      where: { tournamentId: tournament.id },
      _count: true
    })
    
    console.log('\nPayment Summary:')
    summary.forEach(s => {
      console.log(`  ${s.paymentMethod}: ${s._count} payments`)
    })

  } catch (error) {
    console.error('Error seeding tournament payments:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()