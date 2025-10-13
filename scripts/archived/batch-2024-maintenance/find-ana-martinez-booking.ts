import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function findAnaMartinezBooking() {
  try {
    console.log('🔍 Buscando reservas de Ana Martinez...')
    
    // Buscar por nombre exacto
    let bookings = await prisma.booking.findMany({
      where: {
        playerName: {
          contains: 'Ana Martinez',
          mode: 'insensitive'
        }
      },
      include: {
        Court: true,
        Club: true,
        SplitPayment: true,
        Transaction: true,
        Notification: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (bookings.length === 0) {
      console.log('No se encontraron reservas con "Ana Martinez" exacto. Buscando variaciones...')
      
      // Buscar variaciones del nombre
      bookings = await prisma.booking.findMany({
        where: {
          OR: [
            { playerName: { contains: 'Ana', mode: 'insensitive' } },
            { playerName: { contains: 'Martinez', mode: 'insensitive' } },
            { playerName: { contains: 'Martínez', mode: 'insensitive' } }
          ]
        },
        include: {
          Court: true,
          Club: true,
          SplitPayment: true,
          Transaction: true,
          Notification: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    }

    if (bookings.length === 0) {
      console.log('❌ No se encontraron reservas con ese nombre')
      
      // Mostrar algunas reservas recientes para referencia
      console.log('\n📋 Últimas 10 reservas en el sistema:')
      const recentBookings = await prisma.booking.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          Court: { select: { name: true } },
          Club: { select: { name: true } }
        }
      })
      
      recentBookings.forEach((booking, index) => {
        console.log(`${index + 1}. ${booking.playerName} - ${booking.Court.name} - ${booking.paymentStatus} - ${new Date(booking.date).toLocaleDateString()}`)
      })
      
      return
    }

    console.log(`✅ Encontradas ${bookings.length} reservas:`)
    
    bookings.forEach((booking, index) => {
      console.log(`\n--- RESERVA ${index + 1} ---`)
      console.log(`ID: ${booking.id}`)
      console.log(`Jugador: ${booking.playerName}`)
      console.log(`Teléfono: ${booking.playerPhone || 'No registrado'}`)
      console.log(`Email: ${booking.playerEmail || 'No registrado'}`)
      console.log(`Club: ${booking.Club.name}`)
      console.log(`Cancha: ${booking.Court.name}`)
      console.log(`Fecha: ${new Date(booking.date).toLocaleDateString()}`)
      console.log(`Horario: ${booking.startTime} - ${booking.endTime}`)
      console.log(`Precio: $${(booking.price / 100).toFixed(2)} MXN`)
      console.log(`Estado de Reserva: ${booking.status}`)
      console.log(`Estado de Pago: ${booking.paymentStatus}`)
      console.log(`Pago Dividido: ${booking.splitPaymentEnabled ? 'SÍ' : 'NO'}`)
      
      if (booking.splitPaymentEnabled) {
        console.log(`Número de Pagos Divididos: ${booking.splitPaymentCount || 'No definido'}`)
        
        if (booking.SplitPayment.length > 0) {
          console.log('\n🔍 PAGOS DIVIDIDOS:')
          booking.SplitPayment.forEach((splitPayment, spIndex) => {
            console.log(`  ${spIndex + 1}. ${splitPayment.playerName}`)
            console.log(`     - ID: ${splitPayment.id}`)
            console.log(`     - Monto: $${(splitPayment.amount / 100).toFixed(2)} MXN`)
            console.log(`     - Estado: ${splitPayment.status}`)
            console.log(`     - Teléfono: ${splitPayment.playerPhone || 'No registrado'}`)
            console.log(`     - Stripe Charge ID: ${splitPayment.stripeChargeId || 'No registrado'}`)
            console.log(`     - Creado: ${splitPayment.createdAt.toLocaleString()}`)
            if (splitPayment.completedAt) {
              console.log(`     - Completado: ${splitPayment.completedAt.toLocaleString()}`)
            }
            console.log('')
          })
          
          // Analizar el problema con los pagos divididos
          const completedPayments = booking.SplitPayment.filter(sp => sp.status === 'completed')
          const pendingPayments = booking.SplitPayment.filter(sp => sp.status === 'pending')
          const failedPayments = booking.SplitPayment.filter(sp => sp.status === 'failed')

          console.log('📊 ANÁLISIS DE PAGOS DIVIDIDOS:')
          console.log(`✅ Completados: ${completedPayments.length}`)
          console.log(`⏳ Pendientes: ${pendingPayments.length}`)
          console.log(`❌ Fallidos: ${failedPayments.length}`)
          console.log(`📈 Progreso: ${completedPayments.length}/${booking.splitPaymentCount || booking.SplitPayment.length}`)
          
          if (completedPayments.length > 0 && pendingPayments.length > 0) {
            console.log('\n🚨 PROBLEMA DETECTADO:')
            console.log('✅ Se procesó el primer pago correctamente')
            console.log('⚠️ Hay pagos pendientes que no se pueden procesar')
            
            console.log('\n🔍 POSIBLES CAUSAS:')
            console.log('1. El link de pago del segundo jugador expiró')
            console.log('2. Error en la generación del payment intent')
            console.log('3. Problema con Stripe Connect')
            console.log('4. Estado inconsistente en la base de datos')
          }
        }
      }
      
      if (booking.Transaction.length > 0) {
        console.log('\n💰 TRANSACCIONES REGISTRADAS:')
        booking.Transaction.forEach((transaction, tIndex) => {
          console.log(`  ${tIndex + 1}. ${transaction.type} - $${(transaction.amount / 100).toFixed(2)} ${transaction.currency}`)
          console.log(`     - Descripción: ${transaction.description}`)
          console.log(`     - Referencia: ${transaction.reference}`)
          console.log(`     - Fecha: ${transaction.date.toLocaleString()}`)
        })
      }
      
      if (booking.Notification.length > 0) {
        console.log('\n📱 NOTIFICACIONES ENVIADAS:')
        booking.Notification.forEach((notification, nIndex) => {
          console.log(`  ${nIndex + 1}. ${notification.type} - ${notification.template}`)
          console.log(`     - Destinatario: ${notification.recipient}`)
          console.log(`     - Estado: ${notification.status}`)
          console.log(`     - Enviado: ${notification.createdAt.toLocaleString()}`)
          if (notification.errorMessage) {
            console.log(`     - Error: ${notification.errorMessage}`)
          }
        })
      }
    })

  } catch (error) {
    console.error('❌ Error buscando la reserva:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  findAnaMartinezBooking()
}

export { findAnaMartinezBooking }