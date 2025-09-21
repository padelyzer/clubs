import { prisma } from '../lib/config/prisma'

async function findAllPayments() {
  try {
    console.log('🔍 Buscando TODOS los pagos y reservas...\n')
    
    // 1. Todas las reservas de hoy
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const bookingsToday = await prisma.booking.findMany({
      where: {
        createdAt: {
          gte: today
        }
      },
      include: {
        court: { select: { name: true } },
        payments: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    console.log(`📅 Reservas creadas hoy (${today.toLocaleDateString('es-MX')}):\n`)
    console.log('═'.repeat(80))
    
    bookingsToday.forEach(booking => {
      console.log(`\n📌 ${booking.playerName} - ${booking.court.name}`)
      console.log(`   ID: ${booking.id}`)
      console.log(`   Horario: ${booking.startTime} - ${booking.endTime}`)
      console.log(`   Precio: $${(booking.price / 100).toFixed(2)}`)
      console.log(`   Estado pago: ${booking.paymentStatus}`)
      console.log(`   Tipo pago: ${booking.paymentType}`)
      console.log(`   Check-in: ${booking.checkedIn ? '✅' : '❌'}`)
      
      if (booking.payments.length > 0) {
        console.log(`   💳 Pagos:`)
        booking.payments.forEach(p => {
          console.log(`      - ${p.method} | $${(p.amount / 100).toFixed(2)} | ${p.status}`)
          if (p.stripeChargeId) {
            console.log(`        Ref: ${p.stripeChargeId}`)
          }
        })
      }
    })
    
    // 2. Todos los pagos de los últimos 2 días
    const twoDaysAgo = new Date()
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
    
    console.log('\n' + '═'.repeat(80))
    console.log('\n💳 TODOS los pagos (últimos 2 días):\n')
    
    const allPayments = await prisma.payment.findMany({
      where: {
        createdAt: {
          gte: twoDaysAgo
        }
      },
      include: {
        booking: {
          select: {
            playerName: true,
            court: { select: { name: true } }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    allPayments.forEach(payment => {
      console.log(`\n💰 ${payment.booking?.playerName || 'Sin nombre'} - ${payment.booking?.court.name || 'Sin cancha'}`)
      console.log(`   ID Pago: ${payment.id}`)
      console.log(`   Método: ${payment.method}`)
      console.log(`   Monto: $${(payment.amount / 100).toFixed(2)}`)
      console.log(`   Estado: ${payment.status}`)
      console.log(`   Creado: ${payment.createdAt.toLocaleString('es-MX')}`)
      console.log(`   Completado: ${payment.completedAt?.toLocaleString('es-MX') || 'N/A'}`)
      if (payment.stripeChargeId) {
        console.log(`   Referencia: ${payment.stripeChargeId}`)
      }
    })
    
    // 3. Buscar específicamente transacciones con referencia TERMINAL
    console.log('\n' + '═'.repeat(80))
    console.log('\n📊 Transacciones con referencia TERMINAL:\n')
    
    const terminalTransactions = await prisma.transaction.findMany({
      where: {
        OR: [
          { reference: { contains: 'TERMINAL' } },
          { reference: { contains: 'terminal' } },
          { notes: { contains: 'terminal' } }
        ]
      }
    })
    
    if (terminalTransactions.length > 0) {
      terminalTransactions.forEach(t => {
        console.log(`\n   ID: ${t.id}`)
        console.log(`   Referencia: ${t.reference}`)
        console.log(`   Descripción: ${t.description}`)
        console.log(`   Monto: $${(t.amount / 100).toFixed(2)}`)
        console.log(`   Notas: ${t.notes}`)
      })
    } else {
      console.log('   ❌ No se encontraron transacciones con referencia TERMINAL')
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

findAllPayments()