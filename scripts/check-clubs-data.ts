import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Obtener todos los clubs
  const clubs = await prisma.club.findMany({
    include: {
      _count: {
        select: {
          courts: true,
          users: true,
          bookings: true,
          players: true,
          tournaments: true,
          transactions: true
        }
      }
    }
  })
  
  console.log('🏢 CLUBS EN EL SISTEMA:')
  console.log('=' .repeat(80))
  
  clubs.forEach(club => {
    console.log(`\n📍 ${club.name}`)
    console.log(`   ID: ${club.id}`)
    console.log(`   Email: ${club.email || 'No especificado'}`)
    console.log(`   Teléfono: ${club.phone || 'No especificado'}`)
    console.log(`   Dirección: ${club.address || 'No especificada'}`)
    console.log(`   
   📊 Estadísticas:`)
    console.log(`   - Canchas: ${club._count.courts}`)
    console.log(`   - Usuarios: ${club._count.users}`)
    console.log(`   - Reservas: ${club._count.bookings}`)
    console.log(`   - Jugadores: ${club._count.players}`)
    console.log(`   - Torneos: ${club._count.tournaments}`)
    console.log(`   - Transacciones: ${club._count.transactions}`)
  })
  
  // Resumen total
  const totalBookings = await prisma.booking.count()
  const totalPlayers = await prisma.player.count()
  const totalTournaments = await prisma.tournament.count()
  const totalTransactions = await prisma.transaction.count()
  const totalCourts = await prisma.court.count()
  
  console.log('\n' + '=' .repeat(80))
  console.log('📊 RESUMEN TOTAL DEL SISTEMA:')
  console.log(`   Total Clubs: ${clubs.length}`)
  console.log(`   Total Canchas: ${totalCourts}`)
  console.log(`   Total Reservas: ${totalBookings}`)
  console.log(`   Total Jugadores: ${totalPlayers}`)
  console.log(`   Total Torneos: ${totalTournaments}`)
  console.log(`   Total Transacciones: ${totalTransactions}`)
  
  // Verificar distribución de reservas por club
  console.log('\n📈 DISTRIBUCIÓN DE RESERVAS POR CLUB:')
  for (const club of clubs) {
    const percentage = ((club._count.bookings / totalBookings) * 100).toFixed(1)
    console.log(`   ${club.name}: ${club._count.bookings} reservas (${percentage}%)`)
  }
  
  await prisma.$disconnect()
}

main()
