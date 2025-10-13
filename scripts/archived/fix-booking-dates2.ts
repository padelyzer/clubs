import { prisma } from '../lib/config/prisma'

async function fixBookingDates() {
  console.log('🔧 Corrigiendo fechas de reservas en Club Demo Padelyzer...')
  
  // Set correct date - start of day in Mexico timezone
  const correctDate = new Date('2025-09-23T06:00:00.000Z') // Start of day UTC for 2025-09-23
  
  console.log(`Fecha correcta: ${correctDate.toISOString()}`)
  
  // Update all bookings
  const updatedBookings = await prisma.booking.updateMany({
    where: {
      clubId: 'club-demo-001',
      date: new Date('2025-09-23T10:00:00.000Z') // Old incorrect date
    },
    data: {
      date: correctDate
    }
  })
  
  // Update all booking groups
  const updatedGroups = await prisma.bookingGroup.updateMany({
    where: {
      clubId: 'club-demo-001',
      date: new Date('2025-09-23T10:00:00.000Z') // Old incorrect date
    },
    data: {
      date: correctDate
    }
  })
  
  console.log(`✅ Actualizadas ${updatedBookings.count} reservas individuales`)
  console.log(`✅ Actualizados ${updatedGroups.count} grupos de reservas`)
  
  // Verify the fix
  console.log('\n🔍 Verificando las fechas corregidas...')
  
  const bookings = await prisma.booking.findMany({
    where: {
      clubId: 'club-demo-001'
    },
    select: {
      playerName: true,
      date: true,
      startTime: true,
      Court: {
        select: { name: true }
      }
    }
  })
  
  const groups = await prisma.bookingGroup.findMany({
    where: {
      clubId: 'club-demo-001'
    },
    select: {
      playerName: true,
      date: true,
      startTime: true
    }
  })
  
  console.log('\n📋 Reservas corregidas:')
  bookings.forEach(booking => {
    console.log(`   ${booking.playerName} - ${booking.Court?.name} - ${booking.date.toISOString()} - ${booking.startTime}`)
  })
  
  console.log('\n📋 Grupos corregidos:')
  groups.forEach(group => {
    console.log(`   ${group.playerName} (GROUP) - ${group.date.toISOString()} - ${group.startTime}`)
  })
  
  await prisma.$disconnect()
}

fixBookingDates().catch(console.error)