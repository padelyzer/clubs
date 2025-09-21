import { prisma } from '../lib/config/prisma'

async function checkBookings() {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        playerName: true,
        createdAt: true,
        price: true,
        paymentStatus: true,
        date: true,
        startTime: true,
        court: {
          select: { name: true }
        }
      }
    })

    console.log('=== Últimas reservas en la base de datos ===')
    console.log(`Total encontradas: ${bookings.length}`)
    console.log('')
    
    bookings.forEach((booking, index) => {
      console.log(`${index + 1}. Reserva ID: ${booking.id}`)
      console.log(`   Jugador: ${booking.playerName}`)
      console.log(`   Fecha: ${booking.date.toISOString().split('T')[0]} ${booking.startTime}`)
      console.log(`   Cancha: ${booking.court.name}`)
      console.log(`   Precio: $${booking.price / 100} MXN`)
      console.log(`   Estado pago: ${booking.paymentStatus}`)
      console.log(`   Creada: ${booking.createdAt.toLocaleString()}`)
      console.log('')
    })

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkBookings()