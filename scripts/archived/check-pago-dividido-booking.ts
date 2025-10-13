import { prisma } from '../lib/config/prisma'

async function checkPagoDivididoBooking() {
  try {
    console.log('🔍 Buscando reserva "Pago Dividido"...\n')
    
    // Buscar por nombre "Pago Dividido"
    const bookings = await prisma.booking.findMany({
      where: {
        OR: [
          { playerName: { contains: 'Pago Dividido', mode: 'insensitive' } },
          { playerName: { contains: 'pago dividido', mode: 'insensitive' } },
          { playerName: { contains: 'Pago', mode: 'insensitive' } }
        ]
      },
      include: {
        Court: true,
        SplitPayment: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    console.log(`📚 Reservas encontradas: ${bookings.length}\n`)
    
    if (bookings.length === 0) {
      console.log('❌ No se encontró ninguna reserva con "Pago Dividido"\n')
      
      // Buscar las últimas 5 reservas creadas
      const recentBookings = await prisma.booking.findMany({
        include: {
          Court: true,
          SplitPayment: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 5
      })
      
      console.log('📋 Últimas 5 reservas creadas:')
      recentBookings.forEach((b, i) => {
        const date = new Date(b.date)
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
        
        console.log(`   ${i + 1}. ${b.playerName}`)
        console.log(`      Fecha: ${dateStr} ${b.startTime}`)
        console.log(`      Cancha: ${b.Court.name}`)
        console.log(`      Split Payment: ${b.splitPaymentEnabled ? 'Sí' : 'No'}`)
        console.log(`      Estado: ${b.status}`)
        console.log(`      Creado: ${b.createdAt.toISOString()}`)
        console.log('')
      })
    } else {
      bookings.forEach((booking, index) => {
        const date = new Date(booking.date)
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
        
        console.log(`${index + 1}. Reserva encontrada:`)
        console.log(`   ID: ${booking.id}`)
        console.log(`   Jugador: ${booking.playerName}`)
        console.log(`   Fecha: ${dateStr} (${booking.date.toISOString()})`)
        console.log(`   Horario: ${booking.startTime} - ${booking.endTime}`)
        console.log(`   Cancha: ${booking.Court.name}`)
        console.log(`   Precio: $${booking.price / 100} MXN`)
        console.log(`   Estado: ${booking.status}`)
        console.log(`   Estado de Pago: ${booking.paymentStatus}`)
        console.log(`   Split Payment Habilitado: ${booking.splitPaymentEnabled}`)
        console.log(`   Split Payment Count: ${booking.splitPaymentCount}`)
        console.log(`   Creado: ${booking.createdAt.toISOString()}`)
        
        if (booking.SplitPayment.length > 0) {
          console.log(`\n   💳 Pagos Divididos (${booking.SplitPayment.length}):`)
          booking.SplitPayment.forEach((sp, i) => {
            console.log(`      ${i + 1}. ${sp.playerName}: $${sp.amount / 100} - ${sp.status}`)
          })
        } else if (booking.splitPaymentEnabled) {
          console.log(`\n   ⚠️  Split Payment habilitado pero sin pagos creados`)
        }
        console.log('\n' + '─'.repeat(80) + '\n')
      })
    }
    
    // Verificar reservas para el 21 de agosto específicamente
    const august21Bookings = await prisma.booking.findMany({
      where: {
        date: {
          gte: new Date('2025-08-21T00:00:00Z'),
          lt: new Date('2025-08-22T00:00:00Z')
        }
      },
      include: {
        Court: true
      }
    })
    
    console.log(`📅 Reservas para el 21 de agosto: ${august21Bookings.length}`)
    august21Bookings.forEach((b, i) => {
      console.log(`   ${i + 1}. ${b.playerName} - ${b.startTime} (${b.Court.name})`)
    })
    
    await prisma.$disconnect()
    
  } catch (error) {
    console.error('Error:', error)
  }
}

checkPagoDivididoBooking()