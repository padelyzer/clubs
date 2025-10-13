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

    console.log(`Working with tournament: ${tournament.name}`)

    // Update some registrations to have pending payments
    const registrations = await prisma.tournamentRegistration.findMany({
      where: { tournamentId: tournament.id },
      take: 4 // Update first 4 registrations
    })

    console.log(`Found ${registrations.length} registrations to update`)

    for (let i = 0; i < registrations.length; i++) {
      const registration = registrations[i]
      let paymentStatus = 'completed'
      let paidAmount = tournament.registrationFee

      // Create variety of payment statuses
      if (i === 0 || i === 1) {
        paymentStatus = 'pending'
        paidAmount = 0
      } else if (i === 2) {
        paymentStatus = 'failed' 
        paidAmount = 0
      }
      // i === 3 stays as completed

      await prisma.tournamentRegistration.update({
        where: { id: registration.id },
        data: {
          paymentStatus,
          paidAmount,
          paymentMethod: paymentStatus === 'completed' ? registration.paymentMethod : null,
          paymentReference: paymentStatus === 'completed' ? registration.paymentReference : null,
          paymentDate: paymentStatus === 'completed' ? registration.paymentDate : null
        }
      })

      console.log(`✅ Updated ${registration.player1Name} & ${registration.player2Name}: ${paymentStatus}`)
    }

    // Get updated stats
    const updatedRegistrations = await prisma.tournamentRegistration.findMany({
      where: { tournamentId: tournament.id }
    })

    const completed = updatedRegistrations.filter(r => r.paymentStatus === 'completed').length
    const pending = updatedRegistrations.filter(r => r.paymentStatus === 'pending').length
    const failed = updatedRegistrations.filter(r => r.paymentStatus === 'failed').length

    console.log('\n=== Payment Summary ===')
    console.log(`Total registrations: ${updatedRegistrations.length}`)
    console.log(`Completed payments: ${completed}`)
    console.log(`Pending payments: ${pending}`)
    console.log(`Failed payments: ${failed}`)

  } catch (error) {
    console.error('Error updating payments:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()