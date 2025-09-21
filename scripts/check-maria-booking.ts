import { prisma } from '../lib/config/prisma'
import { format } from 'date-fns'

async function checkMariaBooking() {
  try {
    console.log('🔍 Buscando reserva de María González...\n')
    
    // Buscar todas las reservas de María
    const bookings = await prisma.booking.findMany({
      where: {
        playerName: {
          contains: 'María',
          mode: 'insensitive'
        }
      },
      include: {
        court: true,
        splitPayments: true
      },
      orderBy: {
        date: 'desc'
      }
    })
    
    if (bookings.length === 0) {
      console.log('❌ No se encontró ninguna reserva de María González')
      
      // Buscar TODAS las reservas para ver qué hay
      console.log('\n📚 Buscando todas las reservas en el sistema...\n')
      
      const allBookings = await prisma.booking.findMany({
        include: {
          court: true,
          splitPayments: true
        },
        orderBy: {
          date: 'desc'
        },
        take: 10
      })
      
      console.log(`Total de reservas encontradas: ${allBookings.length}\n`)
      
      allBookings.forEach((booking, index) => {
        console.log(`${index + 1}. ${booking.playerName}`)
        console.log(`   Fecha: ${format(booking.date, 'yyyy-MM-dd')} (${format(booking.date, 'EEEE dd/MM/yyyy', { locale: { code: 'es' } })})`)
        console.log(`   Horario: ${booking.startTime} - ${booking.endTime}`)
        console.log(`   Cancha: ${booking.court.name}`)
        console.log(`   Estado de Pago: ${booking.paymentStatus}`)
        console.log(`   Split Payment: ${booking.splitPaymentEnabled ? 'Sí' : 'No'}`)
        if (booking.splitPaymentEnabled && booking.splitPayments.length > 0) {
          console.log(`   Pagos Divididos: ${booking.splitPayments.filter(sp => sp.status === 'completed').length}/${booking.splitPayments.length} completados`)
        }
        console.log('')
      })
      
    } else {
      console.log(`✅ Encontradas ${bookings.length} reserva(s) de María González:\n`)
      
      bookings.forEach((booking, index) => {
        console.log(`${index + 1}. Reserva ID: ${booking.id}`)
        console.log(`   Fecha: ${format(booking.date, 'yyyy-MM-dd')} (${format(booking.date, 'EEEE dd/MM/yyyy', { locale: { code: 'es' } })})`)
        console.log(`   Horario: ${booking.startTime} - ${booking.endTime}`)
        console.log(`   Cancha: ${booking.court.name}`)
        console.log(`   Precio: $${booking.price / 100} MXN`)
        console.log(`   Estado: ${booking.status}`)
        console.log(`   Estado de Pago: ${booking.paymentStatus}`)
        console.log(`   Split Payment Habilitado: ${booking.splitPaymentEnabled}`)
        
        if (booking.splitPayments.length > 0) {
          console.log(`\n   💳 Pagos Divididos (${booking.splitPayments.length}):`)
          booking.splitPayments.forEach((sp, i) => {
            console.log(`      ${i + 1}. ${sp.playerName}: $${sp.amount / 100} - ${sp.status === 'completed' ? '✅' : '⏳'} ${sp.status}`)
          })
        }
        console.log('\n' + '─'.repeat(80) + '\n')
      })
    }
    
    // También buscar reservas para hoy y mañana
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    console.log('\n📅 Fechas de referencia:')
    console.log(`   Hoy: ${format(today, 'yyyy-MM-dd')} (${format(today, 'EEEE dd/MM/yyyy', { locale: { code: 'es' } })})`)
    console.log(`   Mañana: ${format(tomorrow, 'yyyy-MM-dd')} (${format(tomorrow, 'EEEE dd/MM/yyyy', { locale: { code: 'es' } })})`)
    
    await prisma.$disconnect()
    
  } catch (error) {
    console.error('Error:', error)
  }
}

checkMariaBooking()