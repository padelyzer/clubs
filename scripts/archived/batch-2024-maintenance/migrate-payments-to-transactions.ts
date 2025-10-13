#!/usr/bin/env tsx
/**
 * Script para migrar pagos existentes al módulo de finanzas
 * Crea transacciones para todos los pagos completados que no tienen transacción asociada
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Iniciando migración de pagos a transacciones...')
  
  try {
    // Obtener todos los pagos completados
    const completedPayments = await prisma.payment.findMany({
      where: {
        status: 'completed',
      },
      include: {
        Booking: {
          include: {
            Court: true,
            Club: true
          }
        }
      }
    })
    
    console.log(`📊 Encontrados ${completedPayments.length} pagos completados`)
    
    // Verificar cuáles ya tienen transacciones
    const existingTransactions = await prisma.transaction.findMany({
      where: {
        bookingId: {
          in: completedPayments.map(p => p.bookingId)
        }
      }
    })
    
    const bookingsWithTransactions = new Set(existingTransactions.map(t => t.bookingId))
    
    // Filtrar pagos que no tienen transacción
    const paymentsWithoutTransaction = completedPayments.filter(
      p => !bookingsWithTransactions.has(p.bookingId)
    )
    
    console.log(`💰 ${paymentsWithoutTransaction.length} pagos necesitan transacción`)
    
    let created = 0
    let errors = 0
    
    // Crear transacciones para cada pago sin transacción
    for (const payment of paymentsWithoutTransaction) {
      try {
        const paymentMethod = payment.method === 'STRIPE' ? 'Stripe' :
                            payment.method === 'CASH' ? 'efectivo' :
                            payment.method === 'TERMINAL' ? 'terminal' :
                            payment.method === 'SPEI' ? 'transferencia' : 'otro'
        
        await prisma.transaction.create({
          data: {
            clubId: payment.Booking.clubId,
            type: 'INCOME',
            category: 'BOOKING',
            amount: payment.amount,
            currency: payment.currency || 'MXN',
            description: `Pago de reserva - ${payment.Booking.playerName} - ${payment.Booking.Court.name}`,
            reference: payment.stripePaymentIntentId || payment.stripeChargeId || `payment-${payment.id}`,
            bookingId: payment.bookingId,
            date: payment.completedAt || payment.createdAt,
            createdBy: payment.Booking.clubId,
            notes: `Pago procesado vía ${paymentMethod}. Fecha reserva: ${payment.Booking.date.toLocaleDateString('es-MX')} Hora: ${payment.Booking.startTime}. [Migrado automáticamente]`
          }
        })
        
        created++
        console.log(`✅ Transacción creada para reserva de ${payment.Booking.playerName}`)
      } catch (error) {
        errors++
        console.error(`❌ Error creando transacción para pago ${payment.id}:`, error)
      }
    }
    
    // También buscar pagos divididos completados
    const completedSplitPayments = await prisma.splitPayment.findMany({
      where: {
        status: 'completed',
      },
      include: {
        Booking: {
          include: {
            Court: true,
            Club: true
          }
        }
      }
    })
    
    console.log(`\n📊 Encontrados ${completedSplitPayments.length} pagos divididos completados`)
    
    // Verificar cuáles ya tienen transacciones
    const existingSplitTransactions = await prisma.transaction.findMany({
      where: {
        reference: {
          in: completedSplitPayments.map(sp => `split-${sp.id}`)
        }
      }
    })
    
    const splitRefsWithTransactions = new Set(existingSplitTransactions.map(t => t.reference))
    
    // Filtrar pagos divididos que no tienen transacción
    const splitPaymentsWithoutTransaction = completedSplitPayments.filter(
      sp => !splitRefsWithTransactions.has(`split-${sp.id}`)
    )
    
    console.log(`💰 ${splitPaymentsWithoutTransaction.length} pagos divididos necesitan transacción`)
    
    let splitCreated = 0
    let splitErrors = 0
    
    for (const splitPayment of splitPaymentsWithoutTransaction) {
      try {
        await prisma.transaction.create({
          data: {
            clubId: splitPayment.Booking.clubId,
            type: 'INCOME',
            category: 'BOOKING',
            amount: splitPayment.amount,
            currency: 'MXN',
            description: `Pago dividido - ${splitPayment.playerName} - ${splitPayment.Booking.Court.name}`,
            reference: `split-${splitPayment.id}`,
            bookingId: splitPayment.bookingId,
            date: splitPayment.completedAt || splitPayment.createdAt,
            createdBy: splitPayment.Booking.clubId,
            notes: `Pago dividido (${splitPayment.playerName}) para reserva del ${splitPayment.Booking.date.toLocaleDateString('es-MX')} a las ${splitPayment.Booking.startTime}. [Migrado automáticamente]`
          }
        })
        
        splitCreated++
        console.log(`✅ Transacción creada para pago dividido de ${splitPayment.playerName}`)
      } catch (error) {
        splitErrors++
        console.error(`❌ Error creando transacción para pago dividido ${splitPayment.id}:`, error)
      }
    }
    
    console.log('\n📈 Resumen de migración:')
    console.log(`   Pagos regulares: ${created} creados, ${errors} errores`)
    console.log(`   Pagos divididos: ${splitCreated} creados, ${splitErrors} errores`)
    console.log(`   Total transacciones creadas: ${created + splitCreated}`)
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .then(() => {
    console.log('✨ Migración completada exitosamente')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error)
    process.exit(1)
  })