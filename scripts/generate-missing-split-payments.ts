import { prisma } from '../lib/config/prisma'

async function generateMissingSplitPayments() {
  try {
    console.log('🔍 Generando pagos divididos faltantes...\n')
    
    // Buscar la reserva "Pago dividido"
    const booking = await prisma.booking.findFirst({
      where: {
        playerName: { contains: 'Pago dividido', mode: 'insensitive' }
      },
      include: {
        splitPayments: true
      }
    })
    
    if (!booking) {
      console.log('❌ No se encontró la reserva')
      return
    }
    
    console.log(`📋 Reserva encontrada: ${booking.playerName}`)
    console.log(`   Split Payment Habilitado: ${booking.splitPaymentEnabled}`)
    console.log(`   Split Payment Count: ${booking.splitPaymentCount}`)
    console.log(`   Pagos existentes: ${booking.splitPayments.length}`)
    
    if (!booking.splitPaymentEnabled) {
      console.log('❌ La reserva no tiene pagos divididos habilitados')
      return
    }
    
    if (booking.splitPayments.length > 0) {
      console.log('✅ Ya tiene pagos divididos creados')
      return
    }
    
    const splitCount = booking.splitPaymentCount || 4
    const amountPerPlayer = Math.floor(booking.price / splitCount)
    
    console.log(`\n💳 Creando ${splitCount} pagos de $${amountPerPlayer / 100} MXN cada uno...\n`)
    
    // Crear los split payments
    const players = [
      { name: 'Pago dividido', email: 'pago1@example.com', phone: '555-0001' },
      { name: 'Jugador 2', email: 'jugador2@example.com', phone: '555-0002' },
      { name: 'Jugador 3', email: 'jugador3@example.com', phone: '555-0003' },
      { name: 'Jugador 4', email: 'jugador4@example.com', phone: '555-0004' }
    ]
    
    for (let i = 0; i < splitCount; i++) {
      const player = players[i] || {
        name: `Jugador ${i + 1}`,
        email: `jugador${i + 1}@example.com`,
        phone: `555-000${i + 1}`
      }
      
      const splitPayment = await prisma.splitPayment.create({
        data: {
          bookingId: booking.id,
          playerName: player.name,
          playerEmail: player.email,
          playerPhone: player.phone,
          amount: amountPerPlayer,
          status: 'pending', // Todos empiezan como pendientes
          completedAt: null
        }
      })
      
      console.log(`   ${i + 1}. ${player.name}: $${amountPerPlayer / 100} MXN - ⏳ Pendiente`)
    }
    
    // Actualizar el estado de la reserva
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        paymentStatus: 'pending', // Todos los pagos están pendientes
        status: 'CONFIRMED'
      }
    })
    
    console.log('\n✅ Pagos divididos creados exitosamente!')
    console.log('📊 Estado: Todos los pagos pendientes (0/4)')
    console.log('🎯 Ahora puedes usar el modal de check-in para gestionar los pagos restantes')
    
    await prisma.$disconnect()
    
  } catch (error) {
    console.error('Error:', error)
  }
}

generateMissingSplitPayments()