import { prisma } from '../lib/config/prisma'

async function listRecentBookings() {
  console.log('🔍 Listing recent bookings and booking groups...')
  
  // Get recent regular bookings
  console.log('\n📋 Recent regular bookings:')
  const recentBookings = await prisma.booking.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      playerName: true,
      status: true,
      paymentStatus: true,
      checkedIn: true,
      createdAt: true,
      Court: {
        select: { name: true }
      }
    }
  })
  
  recentBookings.forEach((booking, i) => {
    console.log(`${i + 1}. ID: ${booking.id}`)
    console.log(`   Player: ${booking.playerName}`)
    console.log(`   Court: ${booking.Court?.name}`)
    console.log(`   Status: ${booking.status} | Payment: ${booking.paymentStatus}`)
    console.log(`   Checked in: ${booking.checkedIn}`)
    console.log(`   Created: ${booking.createdAt.toISOString()}`)
    console.log('')
  })
  
  // Get recent booking groups
  console.log('\n📋 Recent booking groups:')
  const recentBookingGroups = await prisma.bookingGroup.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      playerName: true,
      status: true,
      createdAt: true,
      bookings: {
        select: {
          Court: {
            select: { name: true }
          }
        }
      }
    }
  })
  
  recentBookingGroups.forEach((group, i) => {
    console.log(`${i + 1}. ID: ${group.id}`)
    console.log(`   Player: ${group.playerName}`)
    console.log(`   Courts: ${group.bookings?.map(b => b.Court?.name).join(', ')}`)
    console.log(`   Status: ${group.status}`)
    console.log(`   Created: ${group.createdAt.toISOString()}`)
    console.log('')
  })
  
  // Check for partial ID matches
  const partialId = '505630'
  console.log(`\n🔍 Searching for bookings starting with "${partialId}"...`)
  
  const partialBookings = await prisma.booking.findMany({
    where: {
      id: {
        startsWith: partialId
      }
    },
    select: {
      id: true,
      playerName: true,
      status: true
    }
  })
  
  const partialGroups = await prisma.bookingGroup.findMany({
    where: {
      id: {
        startsWith: partialId
      }
    },
    select: {
      id: true,
      playerName: true,
      status: true
    }
  })
  
  console.log('Partial matches in bookings:', partialBookings)
  console.log('Partial matches in booking groups:', partialGroups)
  
  await prisma.$disconnect()
}

listRecentBookings().catch(console.error)