import { prisma } from '../lib/config/prisma'

async function checkBookingDates() {
  console.log('📅 Revisando fechas de reservas en Club Demo Padelyzer...')
  
  // Get all bookings in Club Demo Padelyzer
  const bookings = await prisma.booking.findMany({
    where: {
      clubId: 'club-demo-001'
    },
    select: {
      id: true,
      playerName: true,
      date: true,
      startTime: true,
      endTime: true,
      status: true,
      createdAt: true,
      Court: {
        select: { name: true }
      }
    },
    orderBy: {
      date: 'asc'
    }
  })
  
  const bookingGroups = await prisma.bookingGroup.findMany({
    where: {
      clubId: 'club-demo-001'
    },
    select: {
      id: true,
      playerName: true,
      date: true,
      startTime: true,
      endTime: true,
      status: true,
      createdAt: true
    },
    orderBy: {
      date: 'asc'
    }
  })
  
  console.log('\n📋 Individual Bookings:')
  bookings.forEach((booking, i) => {
    console.log(`${i + 1}. ${booking.playerName} - ${booking.Court?.name}`)
    console.log(`   ID: ${booking.id}`)
    console.log(`   Date: ${booking.date.toISOString()}`)
    console.log(`   Local Date: ${booking.date.toLocaleDateString('es-MX')}`)
    console.log(`   Time: ${booking.startTime} - ${booking.endTime}`)
    console.log(`   Status: ${booking.status}`)
    console.log(`   Created: ${booking.createdAt.toISOString()}`)
    console.log('')
  })
  
  console.log('\n📋 Group Bookings:')
  bookingGroups.forEach((group, i) => {
    console.log(`${i + 1}. ${group.playerName} (GROUP)`)
    console.log(`   ID: ${group.id}`)
    console.log(`   Date: ${group.date.toISOString()}`)
    console.log(`   Local Date: ${group.date.toLocaleDateString('es-MX')}`)
    console.log(`   Time: ${group.startTime} - ${group.endTime}`)
    console.log(`   Status: ${group.status}`)
    console.log(`   Created: ${group.createdAt.toISOString()}`)
    console.log('')
  })
  
  // Check what date range the frontend is probably using for "today"
  const today = new Date()
  console.log('🕐 Current Date Info:')
  console.log(`   Server time: ${new Date().toISOString()}`)
  console.log(`   Mexico time: ${new Date().toLocaleDateString('es-MX')}`)
  console.log(`   Date we should query for: 2025-09-23`)
  
  // Test the exact date range that frontend would use
  const testDate = '2025-09-23'
  const [year, month, day] = testDate.split('-').map(Number)
  const bookingDate = new Date(year, month - 1, day)
  
  console.log('\n🔍 Frontend Query Simulation:')
  console.log(`   Test date string: ${testDate}`)
  console.log(`   Parsed date: ${bookingDate.toISOString()}`)
  console.log(`   Start of day: ${new Date(bookingDate.getFullYear(), bookingDate.getMonth(), bookingDate.getDate()).toISOString()}`)
  console.log(`   End of day: ${new Date(bookingDate.getFullYear(), bookingDate.getMonth(), bookingDate.getDate() + 1).toISOString()}`)
  
  await prisma.$disconnect()
}

checkBookingDates().catch(console.error)