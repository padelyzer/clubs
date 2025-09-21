import { prisma } from '../lib/config/prisma'
import { format } from 'date-fns'

async function fixSplitPayments() {
  try {
    console.log('🔍 Analizando reservas con posibles pagos divididos...\n')
    
    // Buscar todas las reservas con pagos divididos
    const bookingsWithSplits = await prisma.booking.findMany({
      where: {
        OR: [
          { splitPaymentEnabled: true },
          { splitPayments: { some: {} } }
        ]
      },
      include: {
        court: true,
        splitPayments: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    console.log(`📚 Reservas con pagos divididos: ${bookingsWithSplits.length}\n`)
    
    for (const booking of bookingsWithSplits) {
      console.log('═'.repeat(80))
      console.log(`\n📋 Reserva: ${booking.playerName}`)
      console.log(`   ID: ${booking.id}`)
      console.log(`   Cancha: ${booking.court.name}`)
      console.log(`   Fecha: ${format(booking.date, 'yyyy-MM-dd')} ${booking.startTime}`)
      console.log(`   Precio Total: $${booking.price / 100} MXN`)
      console.log(`   Estado de Pago: ${booking.paymentStatus}`)
      console.log(`   Split Habilitado: ${booking.splitPaymentEnabled}`)
      console.log(`   Split Count: ${booking.splitPaymentCount}`)
      
      if (booking.splitPayments.length > 0) {
        console.log(`\n💳 Pagos Divididos (${booking.splitPayments.length}):`)
        
        let totalPaid = 0
        let needsIntent = []
        
        for (const sp of booking.splitPayments) {
          const status = sp.status === 'completed' ? '✅' : 
                        sp.status === 'processing' ? '🔄' : '⏳'
          
          console.log(`\n   ${sp.playerName}: ${status} ${sp.status}`)
          console.log(`      Monto: $${sp.amount / 100} MXN`)
          console.log(`      Payment Intent: ${sp.stripePaymentIntentId || '❌ NO GENERADO'}`)
          
          if (sp.status === 'completed') {
            totalPaid += sp.amount
          }
          
          // Si está pendiente y no tiene Payment Intent, marcarlo
          if (sp.status === 'pending' && !sp.stripePaymentIntentId) {
            needsIntent.push(sp)
          }
        }
        
        console.log(`\n   💰 Total Pagado: $${totalPaid / 100} MXN`)
        console.log(`   💳 Total Pendiente: $${(booking.price - totalPaid) / 100} MXN`)
        
        if (needsIntent.length > 0) {
          console.log(`\n   ⚠️  ${needsIntent.length} pagos necesitan Payment Intent:`)
          needsIntent.forEach(sp => {
            console.log(`      - ${sp.playerName} (${sp.id})`)
          })
          
          console.log('\n   🔧 Para regenerar Payment Intents, ejecuta:')
          console.log(`      npx tsx scripts/regenerate-payment-intents.ts ${booking.id}`)
        }
      }
      
      // Verificar inconsistencias
      if (booking.splitPaymentEnabled && booking.splitPayments.length === 0) {
        console.log('\n   ⚠️  PROBLEMA: Split habilitado pero sin pagos creados')
      }
      
      if (booking.splitPaymentCount && booking.splitPayments.length < booking.splitPaymentCount) {
        console.log(`\n   ⚠️  PROBLEMA: Faltan ${booking.splitPaymentCount - booking.splitPayments.length} pagos por crear`)
      }
    }
    
    // Buscar específicamente la reserva de Ana Martinez
    console.log('\n' + '═'.repeat(80))
    console.log('\n🔍 Buscando específicamente reserva de Ana Martinez...\n')
    
    const anaBooking = await prisma.booking.findFirst({
      where: {
        playerName: {
          contains: 'Ana',
          mode: 'insensitive'
        }
      },
      include: {
        splitPayments: true
      }
    })
    
    if (anaBooking) {
      console.log('📌 Reserva de Ana Martinez:')
      console.log(`   ID: ${anaBooking.id}`)
      console.log(`   Split Enabled: ${anaBooking.splitPaymentEnabled}`)
      console.log(`   Split Count: ${anaBooking.splitPaymentCount}`)
      console.log(`   Split Payments: ${anaBooking.splitPayments.length}`)
      
      if (anaBooking.splitPayments.length === 0 && anaBooking.splitPaymentEnabled) {
        console.log('\n   ⚠️  La reserva tiene split habilitado pero no hay pagos divididos creados')
        console.log('   🔧 Esto puede ser el problema principal')
      }
    }
    
    await prisma.$disconnect()
    
  } catch (error) {
    console.error('Error:', error)
  }
}

fixSplitPayments()