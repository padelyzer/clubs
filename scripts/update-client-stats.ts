import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateClientStats() {
  try {
    console.log('📊 ACTUALIZANDO ESTADÍSTICAS DE CLIENTES')
    console.log('='.repeat(60))
    
    // Get all players
    const players = await prisma.player.findMany()
    console.log(`\nTotal de clientes a procesar: ${players.length}`)
    
    let updatedCount = 0
    let totalBookingsFound = 0
    let totalAmountProcessed = 0
    
    for (const player of players) {
      // Find all bookings that match this player
      const bookings = await prisma.booking.findMany({
        where: {
          OR: [
            { playerName: player.name },
            { playerEmail: player.email },
            { playerPhone: player.phone }
          ],
          status: { not: 'CANCELLED' } // Don't count cancelled bookings
        }
      })
      
      if (bookings.length > 0) {
        // Calculate totals
        const totalSpent = bookings.reduce((sum, booking) => sum + booking.price, 0)
        const lastBooking = bookings.sort((a, b) => b.date.getTime() - a.date.getTime())[0]
        
        // Update player stats
        await prisma.player.update({
          where: { id: player.id },
          data: {
            totalBookings: bookings.length,
            totalSpent: totalSpent,
            lastBookingAt: lastBooking.date
          }
        })
        
        console.log(`\n✅ ${player.name}:`)
        console.log(`   - Reservas encontradas: ${bookings.length}`)
        console.log(`   - Total gastado: $${totalSpent / 100} MXN`)
        console.log(`   - Última reserva: ${lastBooking.date.toISOString().split('T')[0]}`)
        
        updatedCount++
        totalBookingsFound += bookings.length
        totalAmountProcessed += totalSpent
      } else {
        // Reset stats for players without bookings
        await prisma.player.update({
          where: { id: player.id },
          data: {
            totalBookings: 0,
            totalSpent: 0,
            lastBookingAt: null
          }
        })
        
        console.log(`\n⚪ ${player.name}: Sin reservas`)
      }
    }
    
    console.log('\n' + '='.repeat(60))
    console.log('📈 RESUMEN DE ACTUALIZACIÓN:')
    console.log(`   Clientes actualizados: ${updatedCount}/${players.length}`)
    console.log(`   Total de reservas procesadas: ${totalBookingsFound}`)
    console.log(`   Monto total procesado: $${totalAmountProcessed / 100} MXN`)
    
    // Verify the update by checking a few players
    console.log('\n🔍 VERIFICACIÓN DE ACTUALIZACIÓN:')
    const verifyPlayers = await prisma.player.findMany({
      take: 5,
      where: {
        totalBookings: { gt: 0 }
      },
      orderBy: {
        totalSpent: 'desc'
      }
    })
    
    console.log('\nTop 5 clientes por gasto total:')
    verifyPlayers.forEach(player => {
      console.log(`   ${player.name}: ${player.totalBookings} reservas, $${player.totalSpent / 100} MXN`)
    })
    
    console.log('\n✅ Actualización completada exitosamente!')
    console.log('💡 Los campos totalSpent y totalBookings ahora reflejan las reservas reales.')
    
  } catch (error) {
    console.error('❌ Error actualizando estadísticas:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the update
updateClientStats()