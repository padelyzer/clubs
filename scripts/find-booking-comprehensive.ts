import { prisma } from '../lib/config/prisma'

async function findBookingComprehensive() {
  const bookingId = '50563039-1de9-416d-9fe8-696c0af1b6a2'
  
  console.log('🔍 Comprehensive search for booking:', bookingId)
  
  // Search ALL bookings regardless of club
  console.log('\n1. Searching ALL regular bookings...')
  const allBookings = await prisma.booking.findMany({
    where: {
      id: bookingId
    },
    select: {
      id: true,
      playerName: true,
      clubId: true,
      status: true,
      paymentStatus: true,
      checkedIn: true,
      checkedInAt: true,
      createdAt: true,
      Court: {
        select: { name: true }
      }
    }
  })
  
  console.log('All bookings found:', allBookings.length)
  allBookings.forEach(booking => {
    console.log('   Booking:', {
      id: booking.id,
      player: booking.playerName,
      clubId: booking.clubId,
      court: booking.Court?.name,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      checkedIn: booking.checkedIn,
      checkedInAt: booking.checkedInAt,
      createdAt: booking.createdAt
    })
  })
  
  // Search ALL booking groups regardless of club  
  console.log('\n2. Searching ALL booking groups...')
  const allBookingGroups = await prisma.bookingGroup.findMany({
    where: {
      id: bookingId
    },
    select: {
      id: true,
      playerName: true,
      clubId: true,
      status: true,
      createdAt: true,
      updatedAt: true
    }
  })
  
  console.log('All booking groups found:', allBookingGroups.length)
  allBookingGroups.forEach(group => {
    console.log('   BookingGroup:', {
      id: group.id,
      player: group.playerName,
      clubId: group.clubId,
      status: group.status,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt
    })
  })
  
  // Search for similar IDs (in case of typos)
  const partialId = bookingId.substring(0, 8) // First 8 characters
  console.log(`\n3. Searching for similar IDs starting with "${partialId}"...`)
  
  const similarBookings = await prisma.booking.findMany({
    where: {
      id: {
        startsWith: partialId
      }
    },
    select: {
      id: true,
      playerName: true,
      clubId: true,
      status: true,
      checkedIn: true
    }
  })
  
  const similarGroups = await prisma.bookingGroup.findMany({
    where: {
      id: {
        startsWith: partialId
      }
    },
    select: {
      id: true,
      playerName: true,
      clubId: true,
      status: true
    }
  })
  
  console.log('Similar bookings:', similarBookings)
  console.log('Similar booking groups:', similarGroups)
  
  // Check recent bookings with player name "Leticia Garcia"
  console.log('\n4. Searching by player name "Leticia Garcia"...')
  
  const byPlayerBookings = await prisma.booking.findMany({
    where: {
      playerName: {
        contains: 'Leticia',
        mode: 'insensitive'
      }
    },
    select: {
      id: true,
      playerName: true,
      clubId: true,
      status: true,
      paymentStatus: true,
      checkedIn: true,
      createdAt: true
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 5
  })
  
  const byPlayerGroups = await prisma.bookingGroup.findMany({
    where: {
      playerName: {
        contains: 'Leticia',
        mode: 'insensitive'
      }
    },
    select: {
      id: true,
      playerName: true,
      clubId: true,
      status: true,
      createdAt: true
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 5
  })
  
  console.log('Recent Leticia bookings:', byPlayerBookings)
  console.log('Recent Leticia booking groups:', byPlayerGroups)
  
  await prisma.$disconnect()
}

findBookingComprehensive().catch(console.error)