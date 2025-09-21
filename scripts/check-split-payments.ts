import { prisma } from '../lib/config/prisma'
import { format } from 'date-fns'

async function checkSplitPayments() {
  try {
    console.log('🔍 Verificando pagos divididos de Ana Martinez...\n')
    
    // Buscar la reserva de Ana Martinez
    const booking = await prisma.booking.findFirst({
      where: {
        playerName: {
          contains: 'Ana',
          mode: 'insensitive'
        }
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
    
    if (!booking) {
      console.log('❌ No se encontró reserva de Ana Martinez')
      return
    }
    
    console.log('📋 Reserva encontrada:')
    console.log(`   ID: ${booking.id}`)
    console.log(`   Jugador: ${booking.playerName}`)
    console.log(`   Cancha: ${booking.court.name}`)
    console.log(`   Fecha: ${format(booking.date, 'yyyy-MM-dd')}`)
    console.log(`   Horario: ${booking.startTime} - ${booking.endTime}`)
    console.log(`   Precio Total: $${booking.price}`)
    console.log(`   Estado de Pago: ${booking.paymentStatus}`)
    console.log(`   Pago Dividido: ${booking.splitPayment ? 'Sí' : 'No'}`)
    
    if (booking.splitPayment && booking.splitPayments.length > 0) {
      console.log(`\n💳 Pagos Divididos (${booking.splitPayments.length}/${booking.splitCount || 0}):`)
      console.log('═'.repeat(80))
      
      let totalPaid = 0
      let totalPending = 0
      
      booking.splitPayments.forEach((sp, index) => {
        console.log(`\n   ${index + 1}. ${sp.playerName}`)
        console.log(`      ID: ${sp.id}`)
        console.log(`      Monto: $${sp.amount}`)
        console.log(`      Estado: ${sp.status === 'completed' ? '✅' : sp.status === 'processing' ? '🔄' : '⏳'} ${sp.status}`)
        console.log(`      Email: ${sp.email || 'N/A'}`)
        console.log(`      Teléfono: ${sp.phone || 'N/A'}`)
        
        if (sp.stripePaymentIntentId) {
          console.log(`      Payment Intent: ${sp.stripePaymentIntentId}`)
        } else {
          console.log(`      Payment Intent: ❌ NO GENERADO`)
        }
        
        if (sp.paymentLink) {
          console.log(`      Link de Pago: ${sp.paymentLink}`)
        }
        
        if (sp.paidAt) {
          console.log(`      Pagado: ${format(sp.paidAt, 'yyyy-MM-dd HH:mm')}`)
          totalPaid += sp.amount
        } else {
          totalPending += sp.amount
        }
      })
      
      console.log('\n' + '═'.repeat(80))
      console.log('\n📊 Resumen:')
      console.log(`   Total Pagado: $${totalPaid}`)
      console.log(`   Total Pendiente: $${totalPending}`)
      console.log(`   Progreso: ${booking.splitPayments.filter(sp => sp.status === 'completed').length}/${booking.splitCount || booking.splitPayments.length} pagos completados`)
      
      // Verificar si faltan pagos divididos por crear
      if (booking.splitCount && booking.splitPayments.length < booking.splitCount) {
        console.log(`\n⚠️  ADVERTENCIA: Faltan ${booking.splitCount - booking.splitPayments.length} pagos divididos por crear`)
      }
      
      // Verificar pagos sin Payment Intent
      const paymentsWithoutIntent = booking.splitPayments.filter(sp => 
        sp.status !== 'completed' && !sp.stripePaymentIntentId
      )
      
      if (paymentsWithoutIntent.length > 0) {
        console.log(`\n⚠️  PROBLEMA: ${paymentsWithoutIntent.length} pagos sin Payment Intent generado:`)
        paymentsWithoutIntent.forEach(sp => {
          console.log(`   - ${sp.playerName}: $${sp.amount}`)
        })
      }
    }
    
    await prisma.$disconnect()
    
  } catch (error) {
    console.error('Error:', error)
  }
}

checkSplitPayments()