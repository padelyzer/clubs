import { prisma } from '../lib/config/prisma'

async function checkAllClubBookings() {
  console.log('🔍 Revisando TODAS las reservas en Club Demo Padelyzer...')
  
  // Get ALL bookings in Club Demo Padelyzer (any date)
  const allBookings = await prisma.booking.findMany({
    where: {
      clubId: 'club-demo-001'
    },
    include: {
      Court: true
    },
    orderBy: {
      date: 'desc'
    }
  })
  
  // Get ALL booking groups in Club Demo Padelyzer (any date)
  const allGroups = await prisma.bookingGroup.findMany({
    where: {
      clubId: 'club-demo-001'
    },
    include: {
      bookings: {
        include: {
          Court: true
        }
      }
    },
    orderBy: {
      date: 'desc'
    }
  })
  
  console.log(`\n📊 Total en base de datos:`)
  console.log(`   Reservas individuales: ${allBookings.length}`)
  console.log(`   Grupos de reservas: ${allGroups.length}`)
  
  console.log(`\n📅 Todas las reservas individuales:`)
  allBookings.forEach((booking, i) => {
    const dateStr = booking.date.toLocaleDateString('es-MX')
    const dateISO = booking.date.toISOString()
    console.log(`${i + 1}. ${booking.playerName} - ${booking.Court?.name}`)
    console.log(`   ID: ${booking.id}`)
    console.log(`   Fecha: ${dateStr} (${dateISO})`)
    console.log(`   Horario: ${booking.startTime} - ${booking.endTime}`)
    console.log(`   Status: ${booking.status}`)
    console.log(`   Payment: ${booking.paymentStatus}`)
    console.log(`   Group ID: ${booking.bookingGroupId}`)
    console.log('')
  })
  
  console.log(`\n📅 Todos los grupos de reservas:`)
  allGroups.forEach((group, i) => {
    const dateStr = group.date.toLocaleDateString('es-MX')
    const dateISO = group.date.toISOString()
    console.log(`${i + 1}. [GRUPO] ${group.playerName}`)
    console.log(`   ID: ${group.id}`)
    console.log(`   Fecha: ${dateStr} (${dateISO})`)
    console.log(`   Horario: ${group.startTime} - ${group.endTime}`)
    console.log(`   Status: ${group.status}`)
    console.log(`   Canchas: ${group.bookings?.map(b => b.Court?.name).join(', ')}`)
    console.log('')
  })
  
  // Check for any bookings with the IDs we saw in the frontend logs
  const problemIds = [
    '50563039-1de9-416d-9fe8-696c0af1b6a2', // Leticia Garcia
    // Add any other IDs you've seen
  ]
  
  console.log(`\n🔍 Buscando IDs problemáticos de los logs del frontend...`)
  for (const id of problemIds) {
    const booking = await prisma.booking.findUnique({ where: { id } })
    const group = await prisma.bookingGroup.findUnique({ where: { id } })
    
    console.log(`ID ${id}:`)
    console.log(`   Booking: ${booking ? `${booking.playerName} (${booking.clubId})` : 'NO ENCONTRADO'}`)
    console.log(`   Group: ${group ? `${group.playerName} (${group.clubId})` : 'NO ENCONTRADO'}`)
  }
  
  await prisma.$disconnect()
}

checkAllClubBookings().catch(console.error)