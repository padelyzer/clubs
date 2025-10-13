import { prisma } from './lib/config/prisma'

async function deleteTestClub() {
  try {
    console.log('🔍 Buscando clubs de prueba...')

    const clubs = await prisma.club.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        initialSetupCompleted: true
      }
    })

    console.log('📋 Clubs encontrados:')
    clubs.forEach(club => {
      console.log(`- ${club.name} (${club.slug})`)
      console.log(`  Setup completado: ${club.initialSetupCompleted}`)
      console.log('')
    })

    // Buscar clubs de prueba específicamente
    const testClubs = clubs.filter(club =>
      club.slug?.includes('basic5') ||
      club.slug?.includes('test') ||
      club.name?.toLowerCase().includes('test')
    )

    if (testClubs.length > 0) {
      console.log('🗑️ Eliminando clubs de prueba...')

      for (const club of testClubs) {
        console.log(`Eliminando club: ${club.name} (${club.id})`)

        // Eliminar dependencias primero
        // First get all bookings for this club to delete their payments
        const clubBookings = await prisma.booking.findMany({
          where: { clubId: club.id },
          select: { id: true }
        })

        // Delete payments related to club bookings
        if (clubBookings.length > 0) {
          await prisma.payment.deleteMany({
            where: {
              bookingId: {
                in: clubBookings.map(booking => booking.id)
              }
            }
          })
        }

        await prisma.booking.deleteMany({ where: { clubId: club.id } })
        await prisma.bookingGroup.deleteMany({ where: { clubId: club.id } })
        await prisma.transaction.deleteMany({ where: { clubId: club.id } })
        await prisma.court.deleteMany({ where: { clubId: club.id } })
        await prisma.pricing.deleteMany({ where: { clubId: club.id } })
        await prisma.scheduleRule.deleteMany({ where: { clubId: club.id } })
        await prisma.clubSettings.deleteMany({ where: { clubId: club.id } })
        await prisma.paymentProvider.deleteMany({ where: { clubId: club.id } })
        await prisma.user.deleteMany({ where: { clubId: club.id } })

        // Ahora eliminar el club
        await prisma.club.delete({
          where: { id: club.id }
        })

        console.log(`✅ Club ${club.name} eliminado`)
      }
    } else {
      console.log('ℹ️ No se encontraron clubs de prueba para eliminar')
    }

    console.log('🎉 Proceso completado!')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

deleteTestClub()
