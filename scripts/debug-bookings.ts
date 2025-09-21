import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function debugBookings() {
  try {
    console.log('🔍 Debugging booking API issues...')
    console.log('=' .repeat(60))

    // Get first booking to check structure
    const firstBooking = await prisma.booking.findFirst({
      orderBy: { date: 'asc' }
    })

    if (firstBooking) {
      console.log('📊 PRIMER BOOKING:')
      console.log(`  ID: ${firstBooking.id}`)
      console.log(`  Club ID: ${firstBooking.clubId}`)
      console.log(`  Court ID: ${firstBooking.courtId}`)
      console.log(`  Date: ${firstBooking.date}`)
      console.log(`  Start Time: ${firstBooking.startTime}`)
      console.log(`  Player: ${firstBooking.playerName}`)
      console.log(`  Status: ${firstBooking.status}`)
    }

    // Check club IDs
    const clubs = await prisma.club.findMany()
    console.log('\n🏢 CLUBS DISPONIBLES:')
    clubs.forEach(club => {
      console.log(`  - ${club.id}: ${club.name}`)
    })

    // Check booking statuses
    const statusCounts = await prisma.booking.groupBy({
      by: ['status'],
      _count: true
    })

    console.log('\n📈 BOOKING STATUS COUNTS:')
    statusCounts.forEach(status => {
      console.log(`  - ${status.status}: ${status._count} bookings`)
    })

    // Check bookings for 2025-08-01 specifically
    const targetDate = new Date('2025-08-01')
    const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate())
    const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1)

    console.log('\n🔍 BÚSQUEDA PARA 2025-08-01:')
    console.log(`  Start of day: ${startOfDay}`)
    console.log(`  End of day: ${endOfDay}`)

    const bookingsForDate = await prisma.booking.findMany({
      where: {
        date: {
          gte: startOfDay,
          lt: endOfDay
        }
      }
    })

    console.log(`  Bookings encontrados: ${bookingsForDate.length}`)
    bookingsForDate.forEach(booking => {
      console.log(`    - ${booking.playerName} at ${booking.startTime} (status: ${booking.status})`)
    })

    console.log('=' .repeat(60))

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugBookings()
