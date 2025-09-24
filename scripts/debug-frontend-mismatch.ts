import { prisma } from '../lib/config/prisma'

async function debugFrontendMismatch() {
  console.log('🔍 Investigando por qué el frontend muestra reservas diferentes...')
  
  // Check if there are multiple clubs with similar names
  const allClubs = await prisma.club.findMany({
    select: {
      id: true,
      name: true,
      slug: true
    }
  })
  
  console.log('\n🏢 Todos los clubes en la base de datos:')
  allClubs.forEach(club => {
    console.log(`   ${club.id} - ${club.name} (${club.slug})`)
  })
  
  // Check all bookings for any club with "demo" or "padelyzer" in the name
  const demoClubs = allClubs.filter(club => 
    club.name.toLowerCase().includes('demo') || 
    club.name.toLowerCase().includes('padelyzer')
  )
  
  console.log('\n🎯 Clubes demo/padelyzer encontrados:')
  for (const club of demoClubs) {
    console.log(`\n📍 ${club.name} (${club.id}):`)
    
    // Get all bookings for this club (any date)
    const bookings = await prisma.booking.findMany({
      where: { clubId: club.id },
      include: { Court: true },
      orderBy: { date: 'desc' }
    })
    
    const groups = await prisma.bookingGroup.findMany({
      where: { clubId: club.id },
      orderBy: { date: 'desc' }
    })
    
    console.log(`   Reservas individuales: ${bookings.length}`)
    console.log(`   Grupos: ${groups.length}`)
    
    if (bookings.length > 0) {
      console.log('\n   📋 Reservas individuales:')
      bookings.forEach(booking => {
        console.log(`      ${booking.playerName} - ${booking.date.toLocaleDateString()} ${booking.startTime}`)
      })
    }
    
    if (groups.length > 0) {
      console.log('\n   📋 Grupos:')
      groups.forEach(group => {
        console.log(`      ${group.playerName} - ${group.date.toLocaleDateString()} ${group.startTime}`)
      })
    }
  }
  
  // Also check for any bookings with names like "Jaime Alcázar"
  console.log('\n🔍 Buscando reservas de "Jaime Alcázar" en TODOS los clubes...')
  const jaimeBookings = await prisma.booking.findMany({
    where: {
      playerName: {
        contains: 'Jaime',
        mode: 'insensitive'
      }
    },
    include: {
      Court: {
        include: {
          Club: true
        }
      }
    }
  })
  
  const jaimeGroups = await prisma.bookingGroup.findMany({
    where: {
      playerName: {
        contains: 'Jaime',
        mode: 'insensitive'
      }
    },
    include: {
      Club: true
    }
  })
  
  if (jaimeBookings.length > 0) {
    console.log('\n   📋 Reservas de Jaime encontradas:')
    jaimeBookings.forEach(booking => {
      console.log(`      ${booking.playerName} - Club: ${booking.Court?.Club?.name} (${booking.clubId})`)
      console.log(`      Fecha: ${booking.date.toLocaleDateString()} ${booking.startTime}`)
      console.log(`      ID: ${booking.id}`)
    })
  } else {
    console.log('   ❌ No se encontraron reservas de Jaime')
  }
  
  if (jaimeGroups.length > 0) {
    console.log('\n   📋 Grupos de Jaime encontrados:')
    jaimeGroups.forEach(group => {
      console.log(`      ${group.playerName} - Club: ${group.Club?.name} (${group.clubId})`)
      console.log(`      Fecha: ${group.date.toLocaleDateString()} ${group.startTime}`)
      console.log(`      ID: ${group.id}`)
    })
  } else {
    console.log('   ❌ No se encontraron grupos de Jaime')
  }
  
  await prisma.$disconnect()
}

debugFrontendMismatch().catch(console.error)