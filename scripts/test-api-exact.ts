import { prisma } from '../lib/config/prisma'
import { getDayBoundariesInTimezone } from '../lib/utils/timezone'

async function testAPIResponse() {
  console.log('🔍 Simulando exactamente lo que devuelve la API de reservas...')
  
  const date = '2025-09-23'
  const clubId = 'club-demo-001'
  const timezone = 'America/Mexico_City'
  
  // Exact same logic as the API
  const { start: startOfDay, end: endOfDay } = getDayBoundariesInTimezone(date, timezone)
  
  console.log('📅 Rango de fechas:')
  console.log(`   Fecha: ${date}`)
  console.log(`   Start: ${startOfDay.toISOString()}`)
  console.log(`   End: ${endOfDay.toISOString()}`)
  
  // Get booking groups first (for the selected date)
  const bookingGroups = await prisma.bookingGroup.findMany({
    where: {
      clubId: clubId,
      date: {
        gte: startOfDay,
        lt: endOfDay
      },
      status: { not: 'CANCELLED' }
    },
    include: {
      bookings: {
        include: {
          Court: true
        }
      },
      splitPayments: {
        include: {
          _count: {
            select: {
              Notification: true
            }
          }
        }
      },
      _count: {
        select: {
          splitPayments: true,
          payments: true,
          bookings: true
        }
      }
    },
    orderBy: [
      { date: 'asc' },
      { startTime: 'asc' }
    ]
  })

  // Get individual bookings (excluding those that are part of a group)
  const individualBookings = await prisma.booking.findMany({
    where: {
      clubId: clubId,
      date: {
        gte: startOfDay,
        lt: endOfDay
      },
      status: { not: 'CANCELLED' },
      bookingGroupId: null // Only individual bookings
    },
    include: {
      Court: true,
      SplitPayment: {
        include: {
          _count: {
            select: {
              Notification: true
            }
          }
        }
      },
      _count: {
        select: {
          SplitPayment: true,
          Payment: true
        }
      }
    },
    orderBy: [
      { date: 'asc' },
      { startTime: 'asc' }
    ]
  })

  console.log('\n📋 RESULTADO FINAL DE LA API:')
  console.log(`Total reservas individuales: ${individualBookings.length}`)
  console.log(`Total grupos: ${bookingGroups.length}`)
  console.log(`Total que vería frontend: ${individualBookings.length + bookingGroups.length}`)
  
  console.log('\n📝 Reservas individuales:')
  individualBookings.forEach((booking, i) => {
    console.log(`${i + 1}. ${booking.playerName} - ${booking.Court?.name}`)
    console.log(`   ID: ${booking.id}`)
    console.log(`   Horario: ${booking.startTime} - ${booking.endTime}`)
    console.log(`   Status: ${booking.status}`)
    console.log(`   Payment Status: ${booking.paymentStatus}`)
    console.log(`   BookingGroup ID: ${booking.bookingGroupId}`)
    console.log('')
  })
  
  console.log('\n📝 Grupos de reservas:')
  bookingGroups.forEach((group, i) => {
    console.log(`${i + 1}. [GRUPO] ${group.playerName}`)
    console.log(`   ID: ${group.id}`)
    console.log(`   Horario: ${group.startTime} - ${group.endTime}`)
    console.log(`   Status: ${group.status}`)
    console.log(`   Canchas: ${group.bookings.map(b => b.Court?.name).join(', ')}`)
    console.log(`   Bookings en grupo: ${group.bookings.length}`)
    console.log('')
  })

  await prisma.$disconnect()
}

testAPIResponse().catch(console.error)