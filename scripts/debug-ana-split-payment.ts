import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function debugAnaSplitPayment() {
  try {
    console.log('🔍 Iniciando diagnóstico del pago dividido de Ana Martinez...\n')
    
    // Encontrar la reserva de Ana Martinez
    const booking = await prisma.booking.findFirst({
      where: {
        playerName: {
          contains: 'Ana',
          mode: 'insensitive'
        }
      },
      include: {
        court: true,
        club: true,
        splitPayments: {
          orderBy: { createdAt: 'asc' }
        },
        transactions: true,
        notifications: true,
        payments: true
      }
    })

    if (!booking) {
      console.log('❌ No se encontró la reserva de Ana Martinez')
      return
    }

    console.log('✅ Reserva encontrada:')
    console.log(`- ID: ${booking.id}`)
    console.log(`- Jugador: ${booking.playerName}`)
    console.log(`- Estado de Pago: ${booking.paymentStatus}`)
    console.log(`- Pago Dividido: ${booking.splitPaymentEnabled}`)
    console.log(`- Número de Pagos: ${booking.splitPaymentCount}`)

    if (!booking.splitPaymentEnabled) {
      console.log('❌ Esta reserva no tiene pagos divididos habilitados')
      return
    }

    console.log('\n--- ANÁLISIS DE PAGOS DIVIDIDOS ---')
    
    for (let i = 0; i < booking.splitPayments.length; i++) {
      const splitPayment = booking.splitPayments[i]
      console.log(`\n${i + 1}. ${splitPayment.playerName}`)
      console.log(`   - ID: ${splitPayment.id}`)
      console.log(`   - Estado: ${splitPayment.status}`)
      console.log(`   - Monto: $${(splitPayment.amount / 100).toFixed(2)} MXN`)
      console.log(`   - Stripe Payment Intent ID: ${splitPayment.stripePaymentIntentId || 'No asignado'}`)
      console.log(`   - Stripe Charge ID: ${splitPayment.stripeChargeId || 'No asignado'}`)
      console.log(`   - Creado: ${splitPayment.createdAt.toLocaleString()}`)
      if (splitPayment.completedAt) {
        console.log(`   - Completado: ${splitPayment.completedAt.toLocaleString()}`)
      }

      // Si está pending, investigar por qué
      if (splitPayment.status === 'pending') {
        console.log(`   ⚠️ PROBLEMA: Este pago está pendiente`)
        
        // Verificar si se generó un payment intent
        if (!splitPayment.stripePaymentIntentId) {
          console.log(`   🔍 CAUSA: No se ha generado un Stripe Payment Intent`)
          console.log(`   💡 SOLUCIÓN: Regenerar el link de pago`)
        } else {
          console.log(`   🔍 INVESTIGACIÓN: Payment Intent generado pero no completado`)
          
          // Intentar obtener información del club para verificar configuración de Stripe
          const club = booking.club
          console.log(`   - Club ID: ${club.id}`)
          console.log(`   - Stripe Account ID: ${club.stripeAccountId || 'No configurado'}`)
          console.log(`   - Onboarding Completado: ${club.stripeOnboardingCompleted}`)
          
          // Verificar configuración del payment provider
          const paymentProvider = await prisma.paymentProvider.findFirst({
            where: {
              clubId: club.id,
              providerId: 'stripe',
              enabled: true
            }
          })
          
          if (!paymentProvider) {
            console.log(`   ❌ PROBLEMA: No hay configuración de Stripe para este club`)
          } else {
            console.log(`   ✅ Configuración de Stripe encontrada`)
            const config = paymentProvider.config as any
            console.log(`   - Public Key disponible: ${!!config.publicKey}`)
            console.log(`   - Secret Key disponible: ${!!config.secretKey}`)
          }
        }
      } else if (splitPayment.status === 'completed') {
        console.log(`   ✅ COMPLETADO: Este pago fue procesado correctamente`)
      }
    }

    // Generar reporte de diagnóstico
    console.log('\n--- DIAGNÓSTICO FINAL ---')
    
    const completedPayments = booking.splitPayments.filter(sp => sp.status === 'completed')
    const pendingPayments = booking.splitPayments.filter(sp => sp.status === 'pending')
    const failedPayments = booking.splitPayments.filter(sp => sp.status === 'failed')
    
    console.log(`✅ Pagos completados: ${completedPayments.length}`)
    console.log(`⏳ Pagos pendientes: ${pendingPayments.length}`)
    console.log(`❌ Pagos fallidos: ${failedPayments.length}`)
    console.log(`📈 Progreso: ${completedPayments.length}/${booking.splitPaymentCount}`)
    
    if (pendingPayments.length > 0) {
      console.log('\n🚨 PROBLEMA IDENTIFICADO:')
      console.log('- Hay pagos pendientes que no se han completado')
      
      console.log('\n🔧 ACCIONES RECOMENDADAS:')
      
      for (const pending of pendingPayments) {
        console.log(`\nPara ${pending.playerName} (ID: ${pending.id}):`)
        
        if (!pending.stripePaymentIntentId) {
          console.log('1. ❗ Regenerar payment intent')
          console.log('2. ❗ Enviar nuevo link de pago via WhatsApp')
          console.log('3. ❗ Verificar que el teléfono del jugador sea correcto')
        } else {
          console.log('1. ❗ Verificar si el payment intent expiró en Stripe')
          console.log('2. ❗ Regenerar nuevo payment intent si es necesario')  
          console.log('3. ❗ Enviar nuevo link de pago')
        }
        
        // Generar nuevo link de pago
        const newPaymentLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/pay/${booking.id}?split=${pending.id}`
        console.log(`📱 Link de pago: ${newPaymentLink}`)
      }
      
      console.log('\n🛠️ COMANDOS PARA RESOLVER:')
      console.log('1. Regenerar links de pago:')
      console.log(`   curl -X POST "${process.env.NEXTAUTH_URL}/api/bookings/${booking.id}/split-payments"`)
      
      console.log('\n2. Marcar pago como completado manualmente (si se pagó por otro medio):')
      for (const pending of pendingPayments) {
        console.log(`   curl -X PUT "${process.env.NEXTAUTH_URL}/api/bookings/${booking.id}/split-payments" \\`)
        console.log(`     -H "Content-Type: application/json" \\`)
        console.log(`     -d '{"splitPaymentId": "${pending.id}", "action": "complete", "paymentMethod": "manual", "transactionId": "MANUAL_${Date.now()}"}'`)
      }
    }

    // Verificar notificaciones enviadas
    console.log('\n--- NOTIFICACIONES ENVIADAS ---')
    if (booking.notifications.length > 0) {
      booking.notifications.forEach((notification, index) => {
        console.log(`${index + 1}. ${notification.type} - ${notification.template}`)
        console.log(`   - Destinatario: ${notification.recipient}`)
        console.log(`   - Estado: ${notification.status}`)
        console.log(`   - Fecha: ${notification.createdAt.toLocaleString()}`)
        if (notification.errorMessage) {
          console.log(`   - Error: ${notification.errorMessage}`)
        }
      })
    } else {
      console.log('⚠️ No se han enviado notificaciones para esta reserva')
    }

  } catch (error) {
    console.error('❌ Error durante el diagnóstico:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Función auxiliar para regenerar pagos pendientes
async function regeneratePendingPayments(bookingId: string) {
  try {
    console.log('🔄 Regenerando pagos pendientes...')
    
    const response = await fetch(`http://localhost:3000/api/bookings/${bookingId}/split-payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // En producción, necesitarías agregar headers de autenticación
      }
    })

    const result = await response.json()
    console.log('Resultado:', result)
    
  } catch (error) {
    console.error('Error regenerando pagos:', error)
  }
}

// Ejecutar diagnóstico
if (require.main === module) {
  debugAnaSplitPayment()
}

export { debugAnaSplitPayment, regeneratePendingPayments }