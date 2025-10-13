import { prisma } from '../lib/config/prisma'

async function fixSplitPaymentStatus() {
  try {
    console.log('🔧 Corrigiendo estado de pagos divididos...\n')
    
    // Buscar la reserva "Pago dividido"
    const booking = await prisma.booking.findFirst({
      where: {
        playerName: { contains: 'Pago dividido', mode: 'insensitive' }
      },
      include: {
        SplitPayment: true
      }
    })
    
    if (!booking) {
      console.log('❌ No se encontró la reserva')
      return
    }
    
    console.log(`📋 Reserva: ${booking.playerName}`)
    console.log(`   Estado actual: ${booking.paymentStatus}`)
    console.log(`   Pagos divididos: ${booking.SplitPayment.length}`)

    // Mostrar estado actual
    booking.SplitPayment.forEach((sp, i) => {
      console.log(`   ${i + 1}. ${sp.playerName}: $${sp.amount / 100} MXN - ${sp.status}`)
    })
    
    // Marcar todos los pagos como pendientes
    console.log('\n🔄 Marcando todos los pagos como pendientes...')
    
    await prisma.splitPayment.updateMany({
      where: {
        bookingId: booking.id
      },
      data: {
        status: 'pending',
        completedAt: null
      }
    })
    
    // Actualizar el estado de la reserva a pending
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        paymentStatus: 'pending', // Todos los pagos están pendientes
        status: 'CONFIRMED'
      }
    })
    
    console.log('\n✅ Corregido exitosamente!')
    console.log('📊 Nuevo estado: Todos los pagos pendientes (0/4)')
    console.log('🎯 Ahora el modal debería mostrar "Pago Dividido 0/4"')
    
    await prisma.$disconnect()
    
  } catch (error) {
    console.error('Error:', error)
  }
}

fixSplitPaymentStatus()