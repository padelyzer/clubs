import { prisma } from '../lib/config/prisma'

async function testBookingAPI() {
  console.log('🔍 Testing booking API for date 2025-09-23...')
  
  // Simulate what the frontend API call would return
  const date = '2025-09-23'
  const [year, month, day] = date.split('-').map(Number)
  const bookingDate = new Date(year, month - 1, day) // month is 0-indexed
  
  // Set timezone boundaries
  const startOfDay = new Date(bookingDate)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(bookingDate)
  endOfDay.setHours(23, 59, 59, 999)
  
  console.log('Date range:', {
    date,
    startOfDay: startOfDay.toISOString(),
    endOfDay: endOfDay.toISOString()
  })
  
  // Check all clubs for this date range
  const clubs = await prisma.club.findMany({
    select: { id: true, name: true }
  })
  
  for (const club of clubs) {
    console.log(`\n📋 Checking club: ${club.name} (${club.id})`)
    
    // Get booking groups for this date
    const bookingGroups = await prisma.bookingGroup.findMany({
      where: {
        clubId: club.id,
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
        }
      }
    })
    
    // Get individual bookings for this date  
    const individualBookings = await prisma.booking.findMany({
      where: {
        clubId: club.id,
        date: {
          gte: startOfDay,
          lt: endOfDay
        },
        status: { not: 'CANCELLED' },
        bookingGroupId: null
      },
      include: {
        Court: true
      }
    })
    
    console.log(`   Individual bookings: ${individualBookings.length}`)
    individualBookings.forEach((booking, i) => {
      console.log(`   ${i + 1}. ${booking.id} - ${booking.playerName} - ${booking.Court?.name}`)
      console.log(`      Status: ${booking.status}, Payment: ${booking.paymentStatus}, Checked: ${booking.checkedIn}`)
    })
    
    console.log(`   Group bookings: ${bookingGroups.length}`)
    bookingGroups.forEach((group, i) => {
      console.log(`   ${i + 1}. ${group.id} - ${group.playerName}`)
      console.log(`      Status: ${group.status}, Courts: ${group.bookings.map(b => b.Court?.name).join(', ')}`)
    })
    
    // Total bookings (what frontend would see)
    const totalBookings = individualBookings.length + bookingGroups.length
    console.log(`   Total bookings for frontend: ${totalBookings}`)
    
    // Check if any booking has the specific ID
    const hasTargetId = [...individualBookings, ...bookingGroups].some(
      b => b.id === '50563039-1de9-416d-9fe8-696c0af1b6a2'
    )
    console.log(`   Contains target ID: ${hasTargetId}`)
  }
  
  // Also check if there are any bookings at all with that exact ID regardless of date
  console.log('\n🔎 Global search for target ID...')
  const globalBooking = await prisma.booking.findUnique({
    where: { id: '50563039-1de9-416d-9fe8-696c0af1b6a2' },
    select: {
      id: true,
      playerName: true,
      clubId: true,
      date: true,
      status: true,
      checkedIn: true
    }
  })
  
  const globalGroup = await prisma.bookingGroup.findUnique({
    where: { id: '50563039-1de9-416d-9fe8-696c0af1b6a2' },
    select: {
      id: true,
      playerName: true,
      clubId: true,
      date: true,
      status: true
    }
  })
  
  console.log('Global booking search:', globalBooking || 'NOT FOUND')
  console.log('Global group search:', globalGroup || 'NOT FOUND')
  
  await prisma.$disconnect()
}

testBookingAPI().catch(console.error)