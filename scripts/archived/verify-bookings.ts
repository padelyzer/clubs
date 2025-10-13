import { prisma } from '../lib/config/prisma'

async function verifyBookings() {
  try {
    console.log('🔍 Verificando todas las reservas...\n')
    
    // Buscar TODAS las reservas
    const bookings = await prisma.booking.findMany({
      include: {
        Court: true,
        SplitPayment: true
      },
      orderBy: {
        date: 'desc'
      }
    })
    
    console.log(`📚 Total de reservas: ${bookings.length}\n`)
    
    bookings.forEach((booking, index) => {
      const date = new Date(booking.date)
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      
      console.log(`${index + 1}. ${booking.playerName}`)
      console.log(`   ID: ${booking.id}`)
      console.log(`   Fecha: ${dateStr}`)
      console.log(`   Fecha completa: ${date.toISOString()}`)
      console.log(`   Horario: ${booking.startTime} - ${booking.endTime}`)
      console.log(`   Cancha: ${booking.Court.name}`)
      console.log(`   Precio: $${booking.price / 100} MXN`)
      console.log(`   Estado: ${booking.status}`)
      console.log(`   Estado de Pago: ${booking.paymentStatus}`)
      console.log(`   Split Payment: ${booking.splitPaymentEnabled ? 'Sí' : 'No'}`)

      if (booking.splitPaymentEnabled && booking.SplitPayment.length > 0) {
        const completed = booking.SplitPayment.filter(sp => sp.status === 'completed').length
        console.log(`   Pagos Divididos: ${completed}/${booking.SplitPayment.length} completados`)
        booking.SplitPayment.forEach((sp, i) => {
          console.log(`      ${i + 1}. ${sp.playerName}: $${sp.amount / 100} - ${sp.status}`)
        })
      }
      console.log('')
    })
    
    // Mostrar fecha actual del sistema
    const now = new Date()
    console.log('═'.repeat(80))
    console.log('\n📅 Fecha actual del sistema:')
    console.log(`   ${now.toISOString()}`)
    console.log(`   ${now.toLocaleDateString('es-MX')} ${now.toLocaleTimeString('es-MX')}`)
    
    await prisma.$disconnect()
    
  } catch (error) {
    console.error('Error:', error)
  }
}

verifyBookings()