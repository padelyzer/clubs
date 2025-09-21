import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testSplitPayments() {
  console.log('\n💳 ESCENARIO 2: PAGOS DIVIDIDOS')
  console.log('=' .repeat(50))
  
  try {
    // Get club and players
    const club = await prisma.club.findFirst()
    if (!club) throw new Error('No club found')
    
    const players = await prisma.player.findMany({
      where: { clubId: club.id },
      take: 4
    })
    
    if (players.length < 4) {
      throw new Error('Se necesitan al menos 4 jugadores para las pruebas')
    }
    
    // Get court
    const court = await prisma.court.findFirst({
      where: { clubId: club.id }
    })
    
    if (!court) {
      throw new Error('No hay canchas disponibles')
    }
    
    // Test 2.1: Crear reserva con pago dividido habilitado
    console.log('\n2.1 Creando reserva con pago dividido (4 jugadores)...')
    const splitBooking = await prisma.booking.create({
      data: {
        clubId: club.id,
        courtId: court.id,
        date: new Date('2025-08-27'),
        startTime: '16:00',
        endTime: '17:00',
        playerName: players[0].name,
        playerPhone: players[0].phone,
        playerEmail: players[0].email,
        status: 'CONFIRMED',
        paymentStatus: 'pending',
        paymentType: 'ONLINE_SPLIT',
        price: 40000,
        type: 'REGULAR',
        duration: 60,
        totalPlayers: 4,
        splitPaymentEnabled: true,
        splitPaymentCount: 4
      }
    })
    console.log(`  ✅ Reserva con split payment creada: ${splitBooking.id}`)
    console.log(`     - Total: $${splitBooking.price / 100} MXN`)
    console.log(`     - División: ${splitBooking.splitPaymentCount} jugadores`)
    console.log(`     - Por jugador: $${splitBooking.price / splitBooking.splitPaymentCount / 100} MXN`)
    
    // Test 2.2: Crear registros de split payment
    console.log('\n2.2 Creando registros de pagos divididos...')
    const splitPayments = []
    
    for (let i = 0; i < 4; i++) {
      const splitPayment = await prisma.splitPayment.create({
        data: {
          booking: {
            connect: { id: splitBooking.id }
          },
          playerName: players[i].name,
          playerPhone: players[i].phone,
          playerEmail: players[i].email,
          amount: 10000, // $100 MXN cada uno
          status: i === 0 ? 'completed' : 'pending', // Solo el organizador ha pagado
          completedAt: i === 0 ? new Date() : null
        }
      })
      splitPayments.push(splitPayment)
      
      const statusText = splitPayment.status === 'completed' ? '✅ Pagado' : '⏳ Pendiente'
      console.log(`     - ${splitPayment.playerName}: ${statusText} ($${splitPayment.amount / 100} MXN)`)
    }
    
    // Test 2.3: Simular pago de otro jugador
    console.log('\n2.3 Procesando pago del segundo jugador...')
    const secondPayment = await prisma.splitPayment.update({
      where: { id: splitPayments[1].id },
      data: {
        status: 'completed',
        completedAt: new Date()
      }
    })
    console.log(`  ✅ ${secondPayment.playerName} ha pagado $${secondPayment.amount / 100} MXN`)
    
    // Test 2.4: Verificar estado de pagos
    console.log('\n2.4 Verificando estado de pagos divididos...')
    const allSplitPayments = await prisma.splitPayment.findMany({
      where: { booking: { id: splitBooking.id } }
    })
    
    const paidCount = allSplitPayments.filter(p => p.status === 'completed').length
    const totalPaid = allSplitPayments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0)
    
    console.log(`  📊 Estado de pagos:`)
    console.log(`     - Jugadores pagados: ${paidCount}/${allSplitPayments.length}`)
    console.log(`     - Monto recaudado: $${totalPaid / 100} MXN`)
    console.log(`     - Monto pendiente: $${(splitBooking.price - totalPaid) / 100} MXN`)
    
    // Test 2.5: Actualizar estado de reserva cuando todos pagan
    console.log('\n2.5 Completando todos los pagos...')
    
    // Pagar los restantes
    for (let i = 2; i < 4; i++) {
      await prisma.splitPayment.update({
        where: { id: splitPayments[i].id },
        data: {
          status: 'completed',
          completedAt: new Date()
        }
      })
    }
    
    // Actualizar reserva a pagada
    const updatedBooking = await prisma.booking.update({
      where: { id: splitBooking.id },
      data: {
        paymentStatus: 'completed'
      }
    })
    
    console.log(`  ✅ Todos los jugadores han pagado`)
    console.log(`  ✅ Estado de reserva actualizado: ${updatedBooking.paymentStatus}`)
    
    // Test 2.6: Crear reserva con pago parcial
    console.log('\n2.6 Creando reserva con división parcial (2 de 4 pagan)...')
    const partialSplitBooking = await prisma.booking.create({
      data: {
        clubId: club.id,
        courtId: court.id,
        date: new Date('2025-08-27'),
        startTime: '18:00',
        endTime: '19:00',
        playerName: players[1].name,
        playerPhone: players[1].phone,
        playerEmail: players[1].email,
        status: 'CONFIRMED',
        paymentStatus: 'pending',
        paymentType: 'ONLINE_SPLIT',
        price: 40000,
        type: 'REGULAR',
        duration: 60,
        totalPlayers: 4,
        splitPaymentEnabled: true,
        splitPaymentCount: 2 // Solo 2 pagan, no los 4
      }
    })
    
    // Crear solo 2 registros de split payment
    await prisma.splitPayment.create({
      data: {
        booking: {
          connect: { id: partialSplitBooking.id }
        },
        playerName: players[1].name,
        playerPhone: players[1].phone,
        amount: 20000, // $200 MXN cada uno (mitad del total)
        status: 'completed',
        completedAt: new Date()
      }
    })
    
    await prisma.splitPayment.create({
      data: {
        booking: {
          connect: { id: partialSplitBooking.id }
        },
        playerName: players[2].name,
        playerPhone: players[2].phone,
        amount: 20000,
        status: 'pending',
        completedAt: null
      }
    })
    
    console.log(`  ✅ Reserva con split parcial creada`)
    console.log(`     - Total: $${partialSplitBooking.price / 100} MXN`)
    console.log(`     - Pagadores: 2 de 4 jugadores`)
    console.log(`     - Por pagador: $${partialSplitBooking.price / partialSplitBooking.splitPaymentCount / 100} MXN`)
    
    console.log('\n✅ PRUEBAS DE PAGOS DIVIDIDOS COMPLETADAS')
    
  } catch (error) {
    console.error('❌ Error en pruebas:', error)
    throw error
  }
}

testSplitPayments()
  .catch(console.error)
  .finally(() => prisma.$disconnect())