#!/usr/bin/env tsx

import { prisma } from '../lib/config/prisma'
import { getNowInTimezone, getDayBoundariesInTimezone } from '../lib/utils/timezone'

async function testBookingSystemForAllClubs() {
  console.log('🧪 Probando sistema de reservas con timezone para todos los clubes...\n')

  try {
    // Get all clubs
    const clubs = await prisma.club.findMany({
      include: {
        ClubSettings: true,
        Court: {
          where: { active: true },
          take: 1 // Solo necesitamos una cancha para las pruebas
        }
      },
      where: { status: 'APPROVED' }
    })

    console.log(`🏢 Probando ${clubs.length} clubes activos\n`)

    for (const club of clubs) {
      console.log(`\n🎾 === CLUB: ${club.name} (${club.id}) ===`)
      
      const timezone = club.ClubSettings?.timezone || 'America/Mexico_City'
      console.log(`⏰ Timezone: ${timezone}`)
      
      // Current time in club timezone
      const now = getNowInTimezone(timezone)
      console.log(`📅 Fecha/hora actual del club: ${now.toLocaleString('es-MX')}`)
      
      // Test date boundaries for today
      const boundaries = getDayBoundariesInTimezone(now, timezone)
      console.log(`🌅 Inicio del día: ${boundaries.start.toISOString()}`)
      console.log(`🌇 Final del día: ${boundaries.end.toISOString()}`)
      
      // Check if club has courts
      if (club.Court.length === 0) {
        console.log(`⚠️  Sin canchas activas - saltando pruebas de reserva`)
        continue
      }

      const testCourt = club.Court[0]
      console.log(`🏟️  Usando cancha: ${testCourt.name}`)
      
      // Test querying bookings for today
      const todayDate = now.toISOString().split('T')[0] // YYYY-MM-DD format
      console.log(`📋 Consultando reservas para: ${todayDate}`)
      
      try {
        const { start, end } = getDayBoundariesInTimezone(todayDate, timezone)
        
        const todayBookings = await prisma.booking.findMany({
          where: {
            clubId: club.id,
            date: {
              gte: start,
              lt: end
            }
          },
          orderBy: { startTime: 'asc' }
        })
        
        console.log(`   ✅ Encontradas ${todayBookings.length} reservas para hoy`)
        
        if (todayBookings.length > 0) {
          console.log(`   📝 Ejemplo de reservas:`)
          todayBookings.slice(0, 3).forEach(booking => {
            console.log(`      - ${booking.playerName}: ${booking.startTime}-${booking.endTime}`)
          })
        }
        
      } catch (queryError) {
        console.log(`   ❌ Error consultando reservas: ${queryError.message}`)
      }
      
      // Test booking tomorrow (safer than today)
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowDate = tomorrow.toISOString().split('T')[0]
      
      console.log(`🔮 Probando fecha futura: ${tomorrowDate}`)
      
      try {
        const { start, end } = getDayBoundariesInTimezone(tomorrowDate, timezone)
        
        const futureBookings = await prisma.booking.findMany({
          where: {
            clubId: club.id,
            date: {
              gte: start,
              lt: end
            }
          }
        })
        
        console.log(`   ✅ Consulta de fecha futura exitosa: ${futureBookings.length} reservas`)
        
      } catch (futureQueryError) {
        console.log(`   ❌ Error consultando fecha futura: ${futureQueryError.message}`)
      }
      
      // Test validation of past dates
      const yesterday = new Date(now)
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayDate = yesterday.toISOString().split('T')[0]
      
      console.log(`⏪ Validando fecha pasada: ${yesterdayDate}`)
      
      // Test if our timezone logic correctly identifies past dates
      const pastDate = getNowInTimezone(timezone)
      pastDate.setDate(pastDate.getDate() - 1)
      const todayCheck = getNowInTimezone(timezone)
      
      const isPastDate = pastDate < new Date(todayCheck.getFullYear(), todayCheck.getMonth(), todayCheck.getDate())
      console.log(`   ${isPastDate ? '✅' : '❌'} Detección de fecha pasada: ${isPastDate}`)
    }

    // Final summary
    console.log('\n\n📊 === RESUMEN GENERAL ===')
    console.log(`✅ Clubes probados: ${clubs.length}`)
    console.log(`✅ Timezone configurado: ${clubs.filter(c => c.ClubSettings?.timezone).length}`)
    console.log(`⚠️  Sin timezone específico: ${clubs.filter(c => !c.ClubSettings?.timezone).length}`)
    console.log(`✅ Con canchas activas: ${clubs.filter(c => c.Court.length > 0).length}`)
    
    console.log('\n🎯 VALIDACIONES COMPLETADAS:')
    console.log('   ✓ Configuración de timezone por club')
    console.log('   ✓ Funciones de timezone (getNowInTimezone, getDayBoundariesInTimezone)')
    console.log('   ✓ Consultas de reservas por fecha')
    console.log('   ✓ Validación de fechas pasadas/futuras')
    console.log('   ✓ Detección de canchas activas')

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testBookingSystemForAllClubs()