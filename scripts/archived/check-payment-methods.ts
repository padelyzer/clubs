#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Obtener todas las transacciones de tipo BOOKING con sus pagos
  const transactions = await prisma.transaction.findMany({
    where: {
      category: 'BOOKING',
      type: 'INCOME'
    },
    include: {
      Booking: {
        include: {
          Payment: true,
          SplitPayment: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
  
  console.log('Análisis de métodos de pago en transacciones:')
  console.log('================================================\n')
  
  const methodsCount: Record<string, number> = {}
  const withoutPayment: any[] = []
  const withPayment: any[] = []
  
  transactions.forEach(t => {
    const payment = t.Booking?.Payment?.[0]
    
    if (payment) {
      withPayment.push({
        transactionId: t.id,
        description: t.description,
        amount: t.amount / 100,
        paymentMethod: payment.method,
        paymentStatus: payment.status,
        reference: t.reference
      })
      
      methodsCount[payment.method] = (methodsCount[payment.method] || 0) + 1
    } else {
      withoutPayment.push({
        transactionId: t.id,
        bookingId: t.bookingId,
        description: t.description,
        amount: t.amount / 100,
        reference: t.reference,
        notes: t.notes
      })
    }
  })
  
  console.log('📊 Resumen de métodos:')
  Object.entries(methodsCount).forEach(([method, count]) => {
    console.log(`   ${method}: ${count} transacciones`)
  })
  
  console.log('\n❌ Transacciones SIN payment record (aparecen como "Otro"):')
  console.log('===========================================================')
  withoutPayment.forEach(t => {
    console.log(`
ID: ${t.transactionId}
BookingID: ${t.bookingId}
Descripción: ${t.description}
Monto: $${t.amount}
Referencia: ${t.reference}
Notas: ${t.notes}
---`)
  })
  
  console.log('\n✅ Transacciones CON payment record:')
  console.log('=====================================')
  withPayment.forEach(t => {
    console.log(`${t.description} - Método: ${t.paymentMethod} - $${t.amount}`)
  })
  
  // Buscar específicamente la transacción de $150
  const transaction150 = transactions.find(t => t.amount === 15000)
  if (transaction150) {
    console.log('\n🔍 Transacción de $150 encontrada:')
    console.log('===================================')
    console.log('Transaction ID:', transaction150.id)
    console.log('Booking ID:', transaction150.bookingId)
    console.log('Descripción:', transaction150.description)
    console.log('Referencia:', transaction150.reference)
    console.log('Notas:', transaction150.notes)
    
    if (transaction150.Booking) {
      console.log('\nDetalles del booking:')
      console.log('- Player:', transaction150.Booking.playerName)
      console.log('- Payments count:', transaction150.Booking.Payment.length)
      if (transaction150.Booking.Payment[0]) {
        console.log('- Payment method:', transaction150.Booking.Payment[0].method)
        console.log('- Payment status:', transaction150.Booking.Payment[0].status)
      }
      console.log('- Split payments count:', transaction150.Booking.SplitPayment.length)
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())