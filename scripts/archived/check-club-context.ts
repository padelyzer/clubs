import { prisma } from '../lib/config/prisma'

async function checkClubContext() {
  console.log('🏢 Checking club context and users...')
  
  // Get all clubs
  const clubs = await prisma.club.findMany({
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          Booking: true,
          BookingGroup: true
        }
      }
    }
  })
  
  console.log('\n📋 All clubs:')
  clubs.forEach(club => {
    console.log(`   ${club.name} (${club.id})`)
    console.log(`      Bookings: ${club._count.Booking}, Groups: ${club._count.BookingGroup}`)
  })
  
  // Get all users
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      clubId: true,
      Club: {
        select: {
          name: true
        }
      }
    }
  })
  
  console.log('\n👤 All users:')
  users.forEach(user => {
    console.log(`   ${user.email} -> Club: ${user.Club?.name} (${user.clubId})`)
  })
  
  // Check what bookings exist in each club today
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  console.log('\n📅 Today\'s bookings by club:')
  for (const club of clubs) {
    const todayBookings = await prisma.booking.findMany({
      where: {
        clubId: club.id,
        date: {
          gte: today,
          lt: tomorrow
        }
      },
      select: {
        id: true,
        playerName: true,
        status: true,
        checkedIn: true,
        Court: {
          select: { name: true }
        }
      }
    })
    
    const todayGroups = await prisma.bookingGroup.findMany({
      where: {
        clubId: club.id,
        date: {
          gte: today,
          lt: tomorrow
        }
      },
      select: {
        id: true,
        playerName: true,
        status: true
      }
    })
    
    console.log(`\n   ${club.name}:`)
    console.log(`     Individual bookings: ${todayBookings.length}`)
    todayBookings.forEach(booking => {
      console.log(`       ${booking.playerName} - ${booking.Court?.name} - ${booking.status} - CheckedIn: ${booking.checkedIn}`)
      console.log(`       ID: ${booking.id}`)
    })
    
    console.log(`     Group bookings: ${todayGroups.length}`)
    todayGroups.forEach(group => {
      console.log(`       ${group.playerName} - ${group.status}`)
      console.log(`       ID: ${group.id}`)
    })
  }
  
  await prisma.$disconnect()
}

checkClubContext().catch(console.error)