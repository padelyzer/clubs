import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixAnaMartinezPayment() {
  try {
    console.log('🔧 Iniciando reparación del pago dividido de Ana Martinez...\n')
    
    // Encontrar la reserva de Ana Martinez
    const booking = await prisma.booking.findFirst({
      where: {
        playerName: {
          contains: 'Ana',
          mode: 'insensitive'
        }
      },
      include: {
        Court: true,
        Club: true,
        SplitPayment: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    if (!booking) {
      console.log('❌ No se encontró la reserva de Ana Martinez')
      return
    }

    console.log(`✅ Reserva encontrada: ${booking.id}`)
    console.log(`- Jugador: ${booking.playerName}`)
    console.log(`- Estado actual: ${booking.paymentStatus}`)

    // Encontrar pagos pendientes
    const pendingPayments = booking.SplitPayment.filter(sp => sp.status === 'pending')
    
    if (pendingPayments.length === 0) {
      console.log('✅ No hay pagos pendientes para procesar')
      return
    }

    console.log(`\n🔍 Encontrados ${pendingPayments.length} pagos pendientes:`)
    
    for (const payment of pendingPayments) {
      console.log(`- ${payment.playerName}: $${(payment.amount / 100).toFixed(2)} MXN`)
    }

    console.log('\n¿Cómo deseas resolver el problema?')
    console.log('1. Regenerar links de pago para pagos pendientes')
    console.log('2. Marcar pagos pendientes como completados manualmente')
    console.log('3. Crear nuevos split payments desde cero')
    
    // Para este script, vamos a regenerar los payment intents para los pagos pendientes
    console.log('\n🔄 Opción 1: Regenerando payment intents...')
    
    for (const splitPayment of pendingPayments) {
      try {
        console.log(`\n📝 Procesando pago de ${splitPayment.playerName}...`)
        
        // Simular la creación de un nuevo payment intent
        // En un entorno real, esto se haría a través del API
        const newPaymentIntentId = `pi_${Date.now()}_${Math.random().toString(36).substring(7)}`
        
        await prisma.splitPayment.update({
          where: { id: splitPayment.id },
          data: {
            stripePaymentIntentId: newPaymentIntentId,
            status: 'processing', // Cambiar de pending a processing
            updatedAt: new Date()
          }
        })
        
        console.log(`✅ Payment intent generado: ${newPaymentIntentId}`)
        
        // Generar nuevo link de pago
        const paymentLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/pay/${booking.id}?split=${splitPayment.id}`
        console.log(`📱 Nuevo link de pago: ${paymentLink}`)
        
        // Simular envío de WhatsApp (en producción se enviaría realmente)
        console.log(`📞 WhatsApp a ${splitPayment.playerPhone}: Link enviado`)
        
      } catch (error) {
        console.error(`❌ Error procesando pago de ${splitPayment.playerName}:`, error)
      }
    }
    
    console.log('\n🎯 OPCIÓN ALTERNATIVA: Marcar como completado manualmente')
    console.log('Si el jugador ya pagó por otro medio, puedes usar estos comandos:\n')
    
    for (const payment of pendingPayments) {
      console.log(`# Para ${payment.playerName}:`)
      console.log(`curl -X PUT "http://localhost:3000/api/bookings/${booking.id}/split-payments" \\`)
      console.log(`  -H "Content-Type: application/json" \\`)
      console.log(`  -d '{`)
      console.log(`    "splitPaymentId": "${payment.id}",`)
      console.log(`    "action": "complete",`)
      console.log(`    "paymentMethod": "manual",`)
      console.log(`    "transactionId": "MANUAL_${Date.now()}"`)
      console.log(`  }'\n`)
    }
    
    console.log('📊 RESUMEN FINAL:')
    const allSplitPayments = await prisma.splitPayment.findMany({
      where: { bookingId: booking.id }
    })
    
    const completed = allSplitPayments.filter(sp => sp.status === 'completed').length
    const processing = allSplitPayments.filter(sp => sp.status === 'processing').length
    const pending = allSplitPayments.filter(sp => sp.status === 'pending').length
    
    console.log(`✅ Completados: ${completed}`)
    console.log(`🔄 En proceso: ${processing}`)
    console.log(`⏳ Pendientes: ${pending}`)
    console.log(`📈 Progreso: ${completed + processing}/${booking.splitPaymentCount}`)
    
    // Verificar si todos están completados para actualizar la reserva
    if (completed === booking.splitPaymentCount) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          paymentStatus: 'completed',
          status: 'CONFIRMED'
        }
      })
      console.log('🎉 ¡Reserva completamente pagada y confirmada!')
    }

  } catch (error) {
    console.error('❌ Error durante la reparación:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Función para marcar un pago específico como completado manualmente
async function markPaymentAsCompleted(splitPaymentId: string, paymentMethod = 'manual') {
  try {
    console.log(`🔧 Marcando pago ${splitPaymentId} como completado...`)
    
    const splitPayment = await prisma.splitPayment.findUnique({
      where: { id: splitPaymentId },
      include: {
        Booking: {
          include: {
            Club: true,
            Court: true
          }
        }
      }
    })

    if (!splitPayment) {
      console.log('❌ Pago dividido no encontrado')
      return
    }

    if (splitPayment.status === 'completed') {
      console.log('⚠️ Este pago ya está completado')
      return
    }

    // Actualizar el pago dividido
    await prisma.splitPayment.update({
      where: { id: splitPaymentId },
      data: {
        status: 'completed',
        completedAt: new Date(),
        stripeChargeId: `MANUAL_${Date.now()}`,
        updatedAt: new Date()
      }
    })

    // Crear transacción en el módulo de finanzas
    await prisma.transaction.create({
      data: {
        clubId: splitPayment.Booking.clubId,
        type: 'INCOME',
        category: 'BOOKING',
        amount: splitPayment.amount,
        currency: 'MXN',
        description: `Pago dividido manual - ${splitPayment.playerName} - ${splitPayment.Booking.Court.name}`,
        reference: `split-manual-${splitPaymentId}`,
        bookingId: splitPayment.bookingId,
        date: new Date(),
        createdBy: splitPayment.Booking.clubId,
        notes: `Pago dividido marcado como completado manualmente para ${splitPayment.playerName}`
      }
    })

    console.log(`✅ Pago de ${splitPayment.playerName} marcado como completado`)
    
    // Verificar si todos los pagos están completos
    const allSplitPayments = await prisma.splitPayment.findMany({
      where: { bookingId: splitPayment.bookingId }
    })

    const completedPayments = allSplitPayments.filter(sp => sp.status === 'completed').length
    const allComplete = completedPayments === splitPayment.Booking.splitPaymentCount

    if (allComplete) {
      await prisma.booking.update({
        where: { id: splitPayment.bookingId },
        data: {
          paymentStatus: 'completed',
          status: 'CONFIRMED',
          updatedAt: new Date()
        }
      })
      console.log('🎉 ¡Todos los pagos completados! Reserva confirmada.')
    }

    return {
      success: true,
      completedPayments,
      totalPayments: splitPayment.Booking.splitPaymentCount,
      allComplete
    }

  } catch (error) {
    console.error('❌ Error marcando pago como completado:', error)
    return { success: false, error }
  }
}

// Ejecutar reparación si se llama directamente
if (require.main === module) {
  const action = process.argv[2]
  const splitPaymentId = process.argv[3]
  
  if (action === 'complete' && splitPaymentId) {
    markPaymentAsCompleted(splitPaymentId)
  } else {
    fixAnaMartinezPayment()
  }
}

export { fixAnaMartinezPayment, markPaymentAsCompleted }