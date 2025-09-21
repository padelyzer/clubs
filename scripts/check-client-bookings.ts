import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkClientBookings() {
  try {
    console.log('🔍 VERIFICACIÓN DE CLIENTES Y RESERVAS:')
    console.log('='.repeat(60))
    
    // Get all players
    const players = await prisma.player.findMany({
      take: 5
    })
    
    console.log('\n📋 CLIENTES EN EL SISTEMA:')
    for (const player of players) {
      console.log(`\n👤 Cliente: ${player.name}`)
      console.log(`   ID: ${player.id}`)
      console.log(`   Email: ${player.email || 'Sin email'}`)
      console.log(`   Teléfono: ${player.phone}`)
      console.log(`   Total gastado (campo): $${player.totalSpent / 100} MXN`)
      console.log(`   Total reservas (campo): ${player.totalBookings}`)
      
      // Try to find bookings that match by name, email or phone
      const bookingsByName = await prisma.booking.findMany({
        where: {
          OR: [
            { playerName: player.name },
            { playerEmail: player.email },
            { playerPhone: player.phone }
          ]
        },
        take: 5,
        orderBy: { date: 'desc' }
      })
      
      if (bookingsByName.length > 0) {
        console.log(`   ✅ Reservas encontradas por coincidencia: ${bookingsByName.length}`)
        bookingsByName.forEach(booking => {
          const dateStr = booking.date.toISOString().split('T')[0]
          console.log(`      - ${dateStr} | ${booking.startTime} | $${booking.price / 100} MXN | ${booking.playerName}`)
        })
      } else {
        console.log('   ❌ No se encontraron reservas que coincidan')
      }
    }
    
    // Check overall statistics
    console.log('\n📊 ESTADÍSTICAS GENERALES:')
    const totalPlayers = await prisma.player.count()
    const totalBookings = await prisma.booking.count()
    
    console.log(`   Total Clientes: ${totalPlayers}`)
    console.log(`   Total Reservas: ${totalBookings}`)
    
    // Check unique player names in bookings
    const bookingPlayerNames = await prisma.booking.findMany({
      select: {
        playerName: true,
        playerEmail: true,
        playerPhone: true
      },
      distinct: ['playerName']
    })
    
    console.log(`   Nombres únicos en reservas: ${bookingPlayerNames.length}`)
    
    // Sample some bookings to see player info
    console.log('\n🎾 MUESTRA DE RESERVAS RECIENTES:')
    const recentBookings = await prisma.booking.findMany({
      take: 5,
      orderBy: { date: 'desc' },
      include: {
        court: true
      }
    })
    
    recentBookings.forEach(booking => {
      console.log(`\n   Reserva ID: ${booking.id}`)
      console.log(`   Cliente: ${booking.playerName}`)
      console.log(`   Email: ${booking.playerEmail || 'Sin email'}`)
      console.log(`   Teléfono: ${booking.playerPhone}`)
      console.log(`   Cancha: ${booking.court?.name || 'Sin cancha'}`)
      console.log(`   Fecha: ${booking.date.toISOString().split('T')[0]} ${booking.startTime}`)
      console.log(`   Precio: $${booking.price / 100} MXN`)
    })
    
    // Check if there's a match between player names and booking names
    console.log('\n⚠️  VERIFICACIÓN DE COINCIDENCIAS:')
    
    const playersWithMatchingBookings = await Promise.all(
      players.map(async (player) => {
        const count = await prisma.booking.count({
          where: {
            OR: [
              { playerName: { contains: player.name } },
              { playerEmail: player.email },
              { playerPhone: player.phone }
            ]
          }
        })
        return { player, bookingCount: count }
      })
    )
    
    playersWithMatchingBookings.forEach(({ player, bookingCount }) => {
      if (bookingCount > 0) {
        console.log(`   ✅ ${player.name}: ${bookingCount} reservas encontradas`)
      } else {
        console.log(`   ❌ ${player.name}: Sin reservas`)
      }
    })
    
    console.log('\n💡 NOTA IMPORTANTE:')
    console.log('   El modelo Booking NO tiene una relación directa con Player.')
    console.log('   Las reservas se vinculan por nombre, email o teléfono.')
    console.log('   Esto puede causar que las reservas no aparezcan en la vista de clientes.')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkClientBookings()