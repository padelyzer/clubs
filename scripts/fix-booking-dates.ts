import { prisma } from '../lib/config/prisma'

async function fixBookingDates() {
  try {
    // Obtener todas las reservas
    const bookings = await prisma.booking.findMany()
    
    console.log(`Encontradas ${bookings.length} reservas para actualizar`)
    
    // Actualizar las fechas al año 2025
    for (const booking of bookings) {
      const oldDate = new Date(booking.date)
      const newDate = new Date(oldDate)
      
      // Si la fecha es de 2024, cambiarla a 2025
      if (oldDate.getFullYear() === 2024) {
        newDate.setFullYear(2025)
        
        await prisma.booking.update({
          where: { id: booking.id },
          data: { date: newDate }
        })
        
        console.log(`Actualizada reserva ${booking.id}: ${booking.playerName}`)
        console.log(`  Fecha anterior: ${oldDate.toISOString().split('T')[0]}`)
        console.log(`  Fecha nueva: ${newDate.toISOString().split('T')[0]}`)
      }
    }
    
    console.log('\n¡Fechas actualizadas correctamente!')
    
    // Verificar las reservas actualizadas
    const updatedBookings = await prisma.booking.findMany({
      orderBy: { date: 'asc' },
      select: {
        id: true,
        playerName: true,
        date: true,
        startTime: true
      }
    })
    
    console.log('\n=== Reservas con fechas actualizadas ===')
    updatedBookings.forEach(booking => {
      console.log(`${booking.playerName}: ${booking.date.toISOString().split('T')[0]} ${booking.startTime}`)
    })
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixBookingDates()