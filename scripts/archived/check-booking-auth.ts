import { PrismaClient } from '@prisma/client'

// Use production database URL - Supabase production
const PRODUCTION_DATABASE_URL = 'postgresql://postgres.espmqzfvgzuzpbpsgmpw:ClaudeCodeSuper2@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: PRODUCTION_DATABASE_URL
    }
  }
})

async function checkBookingAuth() {
  const bookingId = '9b799d4a-b6b4-499b-a879-f1f686091425'
  console.log(`🔍 Verificando booking ID: ${bookingId}`)
  
  try {
    await prisma.$connect()
    console.log('✅ Conexión exitosa a Supabase')
    
    // Find the booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        Club: true,
        Court: true,
        SplitPayment: true
      }
    })
    
    if (!booking) {
      console.log('❌ Booking no encontrado con ese ID')
      
      // Try to find it in booking groups
      const bookingGroup = await prisma.bookingGroup.findUnique({
        where: { id: bookingId },
        include: {
          Club: true,
          bookings: true,
          splitPayments: true
        }
      })
      
      if (bookingGroup) {
        console.log('\n✅ Es un GRUPO de reservas:')
        console.log(`   Jugador: ${bookingGroup.playerName}`)
        console.log(`   Club: ${bookingGroup.Club.name}`)
        console.log(`   Fecha: ${bookingGroup.date.toISOString()}`)
        console.log(`   Horario: ${bookingGroup.startTime} - ${bookingGroup.endTime}`)
        console.log(`   Precio: $${bookingGroup.price / 100} MXN`)
        console.log(`   Split Payment: ${bookingGroup.splitPaymentEnabled ? 'Sí' : 'No'}`)
        console.log(`   Número de canchas: ${bookingGroup.bookings.length}`)
        
        // Check split payments
        if (bookingGroup.splitPayments.length > 0) {
          console.log('\n💰 Split Payments:')
          bookingGroup.splitPayments.forEach(sp => {
            console.log(`   - ${sp.playerName}: $${sp.amount / 100} MXN (${sp.status})`)
            if (sp.paymentLinkToken) {
              console.log(`     Token: ${sp.paymentLinkToken}`)
            }
          })
        }
        
        console.log('\n🔗 URL esperada del link de pago:')
        console.log(`   https://www.padelyzer.app/pay/group/${bookingId}`)
      } else {
        console.log('❌ No se encontró ni como booking individual ni como grupo')
      }
      
      return
    }
    
    console.log('\n✅ Booking encontrado:')
    console.log(`   Jugador: ${booking.playerName}`)
    console.log(`   Club: ${booking.Club?.name}`)
    console.log(`   Cancha: ${booking.Court?.name}`)
    console.log(`   Fecha: ${booking.date.toISOString()}`)
    console.log(`   Horario: ${booking.startTime} - ${booking.endTime}`)
    console.log(`   Precio: $${booking.price / 100} MXN`)
    console.log(`   Estado de pago: ${booking.paymentStatus}`)
    console.log(`   Split Payment: ${booking.splitPaymentEnabled ? 'Sí' : 'No'}`)
    
    // Check if it's part of a group
    if (booking.bookingGroupId) {
      console.log(`\n⚠️  Esta reserva es parte de un grupo: ${booking.bookingGroupId}`)
      console.log('   Los pagos de grupo se manejan diferente')
    }
    
    // Check split payments
    if (booking.SplitPayment && booking.SplitPayment.length > 0) {
      console.log('\n💰 Split Payments:')
      booking.SplitPayment.forEach(sp => {
        console.log(`   - ${sp.playerName}: $${sp.amount / 100} MXN (${sp.status})`)
        if (sp.paymentLinkToken) {
          console.log(`     Token: ${sp.paymentLinkToken}`)
        }
      })
    }
    
    console.log('\n🔗 URL esperada del link de pago:')
    if (booking.bookingGroupId) {
      console.log(`   https://www.padelyzer.app/pay/group/${booking.bookingGroupId}`)
    } else {
      console.log(`   https://www.padelyzer.app/pay/${bookingId}`)
    }
    
    await prisma.$disconnect()
    
  } catch (error) {
    console.error('❌ Error:', error)
    await prisma.$disconnect()
  }
}

checkBookingAuth().catch(console.error)