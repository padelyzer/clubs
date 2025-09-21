import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testConflicts() {
  console.log('\n⚠️ ESCENARIO 3: CONFLICTOS Y VALIDACIONES')
  console.log('=' .repeat(50))
  
  try {
    // Get club and player
    const club = await prisma.club.findFirst()
    if (!club) throw new Error('No club found')
    
    const player = await prisma.player.findFirst({
      where: { clubId: club.id }
    })
    
    if (!player) {
      throw new Error('No hay jugadores disponibles')
    }
    
    // Get court
    const court = await prisma.court.findFirst({
      where: { clubId: club.id }
    })
    
    if (!court) {
      throw new Error('No hay canchas disponibles')
    }
    
    // Test 3.1: Crear reserva base para conflicto
    console.log('\n3.1 Creando reserva base (15:00 - 16:00)...')
    const baseBooking = await prisma.booking.create({
      data: {
        clubId: club.id,
        courtId: court.id,
        date: new Date('2025-08-28'),
        startTime: '15:00',
        endTime: '16:00',
        playerName: player.name,
        playerPhone: player.phone,
        playerEmail: player.email,
        status: 'CONFIRMED',
        paymentStatus: 'pending',
        paymentType: 'ONSITE',
        price: 40000,
        type: 'REGULAR',
        duration: 60,
        totalPlayers: 2
      }
    })
    console.log(`  ✅ Reserva base creada: ${baseBooking.id}`)
    console.log(`     - Cancha: ${court.name}`)
    console.log(`     - Horario: ${baseBooking.startTime} - ${baseBooking.endTime}`)
    
    // Test 3.2: Intentar crear reserva conflictiva (mismo horario)
    console.log('\n3.2 Intentando crear reserva con conflicto (mismo horario)...')
    try {
      // Primero verificar si existe conflicto
      const conflict = await prisma.booking.findFirst({
        where: {
          courtId: court.id,
          date: new Date('2025-08-28'),
          status: 'CONFIRMED',
          OR: [
            {
              AND: [
                { startTime: { lte: '15:00' } },
                { endTime: { gt: '15:00' } }
              ]
            },
            {
              AND: [
                { startTime: { lt: '16:00' } },
                { endTime: { gte: '16:00' } }
              ]
            },
            {
              AND: [
                { startTime: { gte: '15:00' } },
                { endTime: { lte: '16:00' } }
              ]
            }
          ]
        }
      })
      
      if (conflict) {
        console.log(`  ⚠️ Conflicto detectado: La cancha ya está reservada en ese horario`)
        console.log(`     - Reserva existente: ${conflict.playerName}`)
      } else {
        await prisma.booking.create({
          data: {
            clubId: club.id,
            courtId: court.id,
            date: new Date('2025-08-28'),
            startTime: '15:00',
            endTime: '16:00',
            playerName: 'Otro Jugador',
            playerPhone: '5559999999',
            status: 'CONFIRMED',
            paymentStatus: 'pending',
            paymentType: 'ONSITE',
            price: 40000,
            type: 'REGULAR',
            duration: 60,
            totalPlayers: 2
          }
        })
        console.log(`  ❌ Error: Se permitió crear una reserva conflictiva`)
      }
    } catch (error) {
      console.log(`  ✅ Conflicto correctamente rechazado`)
    }
    
    // Test 3.3: Intentar crear reserva con solapamiento parcial
    console.log('\n3.3 Verificando solapamiento parcial (14:30 - 15:30)...')
    const overlapCheck = await prisma.booking.findFirst({
      where: {
        courtId: court.id,
        date: new Date('2025-08-28'),
        status: 'CONFIRMED',
        OR: [
          {
            AND: [
              { startTime: { lte: '14:30' } },
              { endTime: { gt: '14:30' } }
            ]
          },
          {
            AND: [
              { startTime: { lt: '15:30' } },
              { endTime: { gte: '15:30' } }
            ]
          }
        ]
      }
    })
    
    if (overlapCheck) {
      console.log(`  ⚠️ Solapamiento detectado con reserva de ${overlapCheck.playerName}`)
    } else {
      console.log(`  ✅ No hay solapamiento, horario disponible`)
    }
    
    // Test 3.4: Crear reserva antes (sin conflicto)
    console.log('\n3.4 Creando reserva antes (13:00 - 14:00)...')
    const beforeBooking = await prisma.booking.create({
      data: {
        clubId: club.id,
        courtId: court.id,
        date: new Date('2025-08-28'),
        startTime: '13:00',
        endTime: '14:00',
        playerName: 'Jugador Antes',
        playerPhone: '5558888888',
        status: 'CONFIRMED',
        paymentStatus: 'pending',
        paymentType: 'ONSITE',
        price: 40000,
        type: 'REGULAR',
        duration: 60,
        totalPlayers: 2
      }
    })
    console.log(`  ✅ Reserva antes creada sin conflicto: ${beforeBooking.id}`)
    
    // Test 3.5: Crear reserva después (sin conflicto)
    console.log('\n3.5 Creando reserva después (16:00 - 17:00)...')
    const afterBooking = await prisma.booking.create({
      data: {
        clubId: club.id,
        courtId: court.id,
        date: new Date('2025-08-28'),
        startTime: '16:00',
        endTime: '17:00',
        playerName: 'Jugador Después',
        playerPhone: '5557777777',
        status: 'CONFIRMED',
        paymentStatus: 'pending',
        paymentType: 'ONSITE',
        price: 40000,
        type: 'REGULAR',
        duration: 60,
        totalPlayers: 2
      }
    })
    console.log(`  ✅ Reserva después creada sin conflicto: ${afterBooking.id}`)
    
    // Test 3.6: Verificar agenda del día
    console.log('\n3.6 Agenda del día para la cancha...')
    const daySchedule = await prisma.booking.findMany({
      where: {
        courtId: court.id,
        date: new Date('2025-08-28'),
        status: 'CONFIRMED'
      },
      orderBy: {
        startTime: 'asc'
      }
    })
    
    console.log(`  📅 Reservas del 28/08 en ${court.name}:`)
    daySchedule.forEach(booking => {
      console.log(`     - ${booking.startTime} - ${booking.endTime}: ${booking.playerName}`)
    })
    
    // Test 3.7: Intentar reserva en otra cancha (mismo horario)
    console.log('\n3.7 Verificando disponibilidad en otra cancha...')
    const otherCourt = await prisma.court.findFirst({
      where: { 
        clubId: club.id,
        id: { not: court.id }
      }
    })
    
    if (otherCourt) {
      const otherCourtBooking = await prisma.booking.create({
        data: {
          clubId: club.id,
          courtId: otherCourt.id,
          date: new Date('2025-08-28'),
          startTime: '15:00',
          endTime: '16:00',
          playerName: 'Jugador Otra Cancha',
          playerPhone: '5556666666',
          status: 'CONFIRMED',
          paymentStatus: 'pending',
          paymentType: 'ONSITE',
          price: 40000,
          type: 'REGULAR',
          duration: 60,
          totalPlayers: 2
        }
      })
      console.log(`  ✅ Reserva creada en ${otherCourt.name}: ${otherCourtBooking.id}`)
      console.log(`     - Mismo horario pero diferente cancha`)
    } else {
      console.log(`  ℹ️ No hay otra cancha disponible para probar`)
    }
    
    console.log('\n✅ PRUEBAS DE CONFLICTOS COMPLETADAS')
    
  } catch (error) {
    console.error('❌ Error en pruebas:', error)
    throw error
  }
}

testConflicts()
  .catch(console.error)
  .finally(() => prisma.$disconnect())